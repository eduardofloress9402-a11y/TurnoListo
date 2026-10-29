import {DAYS,CLOSING,dateAt,shiftLabel,personTotal,hoursLabel} from './model.js';
export function csvFor(week,people){const cell=value=>{let text=String(value);if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};const rows=[['Empleado',...DAYS,'Horas definidas','Turnos pendientes'],...people.map(p=>{const total=personTotal(week,p.id);return [p.name,...week.shifts[p.id].map((s,d)=>shiftLabel(s,d)),hoursLabel(total.minutes),total.pending];})];return '\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n');}
export function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
export async function scheduleImage(week,people){
 const canvas=document.createElement('canvas');canvas.width=1480;canvas.height=280+people.length*66+(week.note?100:0);
 const ctx=canvas.getContext('2d');ctx.fillStyle='#f6f8f4';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#123d33';ctx.fillRect(0,0,1480,104);ctx.fillStyle='#fff';ctx.font='bold 32px Arial';ctx.fillText('TurnoListo',36,47);ctx.font='18px Arial';ctx.fillText(`Semana del ${dateAt(week.id).split('-').reverse().join('/')} al ${dateAt(week.id,6).split('-').reverse().join('/')}`,36,79);
 const x0=36,y0=125,nameWidth=145,colWidth=160,rowHeight=66,totalWidth=145;
 ctx.fillStyle='#e2e9e4';ctx.fillRect(x0,y0,1408,58);ctx.fillStyle='#304c43';ctx.font='bold 16px Arial';ctx.fillText('EQUIPO',x0+12,y0+33);
 DAYS.forEach((day,d)=>{ctx.fillText(`${day} ${Number(dateAt(week.id,d).slice(-2))}`,x0+nameWidth+d*colWidth+8,y0+24);ctx.font='12px Arial';ctx.fillText('Cierre '+CLOSING[d],x0+nameWidth+d*colWidth+8,y0+44);ctx.font='bold 16px Arial';});ctx.fillText('HORAS',x0+nameWidth+7*colWidth+8,y0+33);
 const colors={close:'#dceee3',fixed:'#e5e6f4',off:'#fff0c7',leave:'#f9dfe0',opening:'#ffe4ce'};
 function clipped(text,x,y,width){while(ctx.measureText(text).width>width&&text.length>2)text=text.slice(0,-2)+'…';ctx.fillText(text,x,y);}
 people.forEach((p,i)=>{const y=y0+58+i*rowHeight;ctx.fillStyle='#fff';ctx.fillRect(x0,y,1408,rowHeight-2);ctx.fillStyle='#183d31';ctx.font='bold 20px Arial';clipped(p.name,x0+12,y+38,nameWidth-20);
 week.shifts[p.id].forEach((s,d)=>{const x=x0+nameWidth+d*colWidth;ctx.fillStyle=colors[s.kind];ctx.fillRect(x+2,y+3,colWidth-4,rowHeight-8);ctx.fillStyle='#263d31';ctx.font='bold 15px Arial';const label=shiftLabel(s,d,true);if(label.includes('falta')){ctx.fillText('Apertura 13:00',x+8,y+27);ctx.font='12px Arial';ctx.fillText('Salida sin definir',x+8,y+47);}else clipped(label,x+8,y+36,colWidth-15);});
 const total=personTotal(week,p.id);ctx.fillStyle='#183d31';ctx.font='bold 17px Arial';ctx.fillText(hoursLabel(total.minutes),x0+nameWidth+7*colWidth+8,y+28);if(total.pending){ctx.font='12px Arial';ctx.fillStyle='#9a5c15';ctx.fillText(`+ ${total.pending} sin definir`,x0+nameWidth+7*colWidth+8,y+48);}});
 const bottom=y0+58+people.length*rowHeight;ctx.font='14px Arial';ctx.fillStyle='#66786c';ctx.fillText('Los cierres de madrugada corresponden al día siguiente. Los turnos sin salida definida no se suman.',36,bottom+26);
 if(week.note){ctx.fillStyle='#233f32';ctx.font='16px Arial';let words=week.note.split(/\s+/),line='',lineY=bottom+62;for(const word of words){if(ctx.measureText(line+word).width>1380){ctx.fillText(line,36,lineY);line='';lineY+=22;}line+=word+' ';}ctx.fillText(line,36,lineY);}
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('No se pudo generar la imagen.')),'image/png'));
}
