from playwright.sync_api import sync_playwright
from pathlib import Path
import json
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1100},accept_downloads=True)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:5180/',wait_until='networkidle')
 assert page.locator('.employee').count()==7
 assert page.locator('.employee').evaluate_all('els=>els.every(e=>e.getBoundingClientRect().width>e.parentElement.getBoundingClientRect().width*.9)')
 assert '49 h' in page.locator('#totals').inner_text()
 assert '20 h + pendiente' in page.locator('#totals').inner_text()
 page.screenshot(path='/tmp/turnolisto-desktop.png',full_page=True)
 for width in [320,390,430]:
  page.set_viewport_size({'width':width,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  page.screenshot(path=f'/tmp/turnolisto-{width}.png',full_page=True)
 page.locator('.employee').first.click()
 page.locator('#shift-kind').select_option('fixed');page.locator('#shift-start').fill('13:00');page.locator('#shift-end').fill('23:00')
 page.locator('#edit-form button[type=submit]').click();assert '9 horas' in page.locator('#edit-error').inner_text()
 page.locator('#shift-start').fill('16:00');page.locator('#shift-end').fill('00:00');page.locator('#edit-form button[type=submit]').click()
 assert '16:00 – 00:00' in page.locator('.employee').first.inner_text()
 page.reload();assert '16:00 – 00:00' in page.locator('.employee').first.inner_text()
 # Fictional incomplete opening shift: complete it to verify editor and total.
 page.locator('.day-tab').nth(2).click();page.locator('.employee').last.click();assert page.locator('#shift-start').input_value()=='13:00'
 page.locator('#shift-end').fill('21:00');page.locator('#edit-form button[type=submit]').click()
 assert '28 h' in page.locator('#totals').inner_text();assert page.locator('#pending-notice').is_hidden()
 # bulk leave only on explicit check.
 page.locator('.employee').nth(3).click();page.locator('#shift-kind').select_option('leave');page.locator('#all-week').check();page.locator('#edit-form button[type=submit]').click()
 assert 'Licencia' in page.locator('.employee').nth(3).inner_text()
 page.locator('#new-week').click();page.locator('#copy-from').select_option('current');page.locator('#new-form button[type=submit]').click()
 assert 'Licencia' in page.locator('.employee').nth(3).inner_text()
 page.locator('#previous-week').click();assert 'Licencia' in page.locator('.employee').nth(3).inner_text()
 page.locator('#week-view').click();assert page.locator('#week-table tbody tr').count()==7
 # Download actual generated PNG and CSV.
 page.locator('#share').click();page.wait_for_function("document.querySelector('#share-preview').naturalWidth>0")
 assert page.locator('#share-preview').evaluate('e=>e.naturalWidth')==1480
 with page.expect_download() as d:page.locator('#download-image').click()
 image=d.value;image.save_as('/tmp/turnolisto-horarios.png');assert Path('/tmp/turnolisto-horarios.png').stat().st_size>10000
 with page.expect_download() as d:page.locator('#export-csv').click()
 csv=d.value;csv.save_as('/tmp/turnolisto-horarios.csv');assert 'Persona A' in Path('/tmp/turnolisto-horarios.csv').read_text()
 page.locator('[data-close=share-dialog]').click()
 # Back up and restore, validated round-trip.
 page.locator('#menu-button').click()
 with page.expect_download() as d:page.locator('#backup').click()
 d.value.save_as('/tmp/turnolisto-backup.json');backup=json.loads(Path('/tmp/turnolisto-backup.json').read_text());assert len(backup['weeks'])==2
 page.locator('#person-name').fill('Nueva persona');page.locator('#add-person button').click();assert page.locator('.employee').count()==8
 page.locator('#restore-file').set_input_files('/tmp/turnolisto-backup.json');page.locator('#confirm-dialog button[value=confirm]').click();assert page.locator('.employee').count()==7
 assert not errors,errors
 # Fresh context, sample to be shown to user stays unmodified.
 clean=browser.new_context(viewport={'width':390,'height':844});fresh=clean.new_page();fresh.goto('http://127.0.0.1:5180/');fresh.screenshot(path='/tmp/turnolisto-mobile-clean.png',full_page=True)
 browser.close()
 print('PASS: vista móvil 320/390/430, demo ficticia, límite 9h, edición, persistencia, apertura, licencia semanal, duplicación/historial, PNG, CSV y respaldo/restauración; sin errores JS.')
