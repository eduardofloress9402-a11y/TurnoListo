# TurnoListo

Primera versión móvil para organizar los horarios de un solo local. Implementación sin dependencias JavaScript externas.

## Ejecutar

Node.js 22 o superior:

```sh
npm start
```

Servidor de desarrollo en puerto 5180; se puede cambiar con PORT. `npm run build` comprueba sintaxis, no genera un bundle. `npm test` verifica cálculos y respaldo. Prueba opcional de navegador: `python3 scripts/check_app.py` con Python Playwright, Chromium en `/usr/bin/chromium` y servidor iniciado.

## Flujo

- Elegir un día y tocar un empleado para modificar entrada, salida, franco o licencia.
- Turno hasta el cierre: el horario de salida se obtiene automáticamente según el día.
- Máximo 9 horas por turno, confirmado por el usuario. No se asume un límite semanal.
- Duplicar la semana actual o crear desde una semana habitual reutilizable.
- Historial, cambios de fecha, notas, alta de empleados y corrección de nombres.
- Imagen PNG con la semana completa para descargar o compartir por el menú del teléfono si el navegador admite archivos. Compartir archivos requiere un contexto seguro HTTPS o localhost y soporte del navegador. No se envían mensajes automáticamente.
- Exportación CSV UTF-8 compatible con Excel (separador punto y coma), con neutralización de fórmulas en los nombres.
- Respaldo JSON y restauración validada con confirmación. Las semanas anteriores quedan conservadas.

## Datos ficticios de demostración y reglas

La demo pública usa siete personas ficticias (Persona A–G), turnos de muestra y una fecha editable. No contiene una transcripción de horarios de empleados reales. Una apertura sin salida definida demuestra el aviso de horas incompletas; se completa desde el editor.

El local de ejemplo abre a las 13:00 y cierra a la 01:00 del día siguiente de domingo a jueves, o a las 03:00 viernes/sábado. Máximo nueve horas por turno. Estos parámetros son configuraciones de la herramienta, no registros de asistencia. No se calculan sueldos ni se verifican convenios laborales.

Los nombres y turnos reales se cargan desde la interfaz y quedan en el navegador de quien la usa; no se envían al repositorio ni se sincronizan automáticamente. La persona que administra decide cuándo generar una imagen o un respaldo para compartir.

## Guardado y límites

Se guarda en localStorage de este navegador y este origen. No hay cuenta, servidor de datos, sincronización ni colaboración entre teléfonos; las copias de respaldo permiten mover/restaurar datos. Un fallo de almacenamiento muestra un aviso y no se anuncia como guardado. Borrar datos del navegador elimina los horarios si no existe respaldo. Compartir una imagen no comparte el espacio de edición.

No hay asignación automática de personal ni detección de falta de cobertura: no se informó cuántas personas se necesitan por turno. No hay notificaciones ni mensajes WhatsApp automáticos. Aún no tiene instalación PWA ni caché offline.

## Publicación

Sitio estático compatible con GitHub Pages: publicar `index.html` y `src/` desde la raíz del repositorio. Las rutas son relativas, por lo que admite `/TurnoListo/`. Activar Pages en `main` y `/ (root)`. El servidor Node es solo para desarrollo y no hace falta en Pages. La publicación y su URL deben verificarse después de configurar un repositorio remoto propio.

## Validación

Se probaron cálculos, cambios al cruzar medianoche, duplicación sin modificar historial/plantilla, límite de 9 horas, importación validada y protección CSV. Chromium verificó 320/390/430px, edición/persistencia, apertura con salida, licencia semanal, historial, PNG real de 1480px de ancho, CSV y respaldo/restauración. No se comprobó el menú nativo de compartir en un teléfono físico.
