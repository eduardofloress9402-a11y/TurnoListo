export const DAYS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
export const MAX_SHIFT_MINUTES=540;
export const CLOSING=['01:00','01:00','01:00','01:00','03:00','03:00','01:00'];
export const seedPeople=['Persona A','Persona B','Persona C','Persona D','Persona E','Persona F','Persona G'].map((name,i)=>({id:'p'+i,name}));
const close=time=>({kind:'close',start:time,end:''});
const off=()=>({kind:'off',start:'',end:''});
const fixed=(start,end)=>({kind:'fixed',start,end});
export function initialState(){
 // Entirely fictional demonstration. Not a transcription of any real roster.
 const rows=[
 [fixed('13:00','21:00'),fixed('13:00','21:00'),off(),fixed('13:00','21:00'),close('18:00'),fixed('17:00','01:00'),fixed('14:00','22:00')],
 [close('17:00'),off(),close('17:00'),close('17:00'),close('19:00'),close('19:00'),close('17:00')],
 [off(),fixed('14:00','22:00'),fixed('14:00','22:00'),fixed('14:00','22:00'),fixed('16:00','00:00'),close('18:00'),fixed('16:00','00:00')],
 [fixed('14:00','22:00'),fixed('14:00','22:00'),close('17:00'),off(),close('18:00'),close('18:00'),fixed('14:00','22:00')],
 [close('17:00'),close('17:00'),close('17:00'),close('17:00'),close('19:00'),off(),close('17:00')],
 [fixed('13:00','21:00'),fixed('13:00','21:00'),fixed('13:00','21:00'),fixed('13:00','21:00'),off(),fixed('13:00','21:00'),fixed('13:00','21:00')],
 [fixed('13:00','17:00'),fixed('15:00','19:00'),{kind:'opening',start:'13:00',end:''},off(),fixed('17:00','21:00'),fixed('17:00','21:00'),fixed('13:00','17:00')]
 ];
 const shifts=Object.fromEntries(seedPeople.map((p,i)=>[p.id,rows[i]]));
 return {version:1,people:structuredClone(seedPeople),template:structuredClone(shifts),weeks:[{id:'2026-10-26',note:'',shifts}],selected:'2026-10-26'};
}
export function dateAt(start,offset=0){const d=new Date(start+'T12:00:00');d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function monday(date){const d=new Date(date+'T12:00:00');return dateAt(date,-((d.getDay()+6)%7));}
export function shiftMinutes(shift,day){if(!shift||['off','leave'].includes(shift.kind))return 0;const end=shift.kind==='close'?CLOSING[day]:shift.end;if(!shift.start||!end)return null;const n=t=>Number(t.slice(0,2))*60+Number(t.slice(3));let difference=n(end)-n(shift.start);if(difference<0)difference+=1440;return difference;}
export function hoursLabel(minutes){if(minutes===null)return 'Sin definir';const h=Math.floor(minutes/60),m=minutes%60;return m?`${h} h ${m} min`:`${h} h`;}
export function shiftLabel(s,day,short=false){if(!s)return 'Sin definir';if(s.kind==='off')return 'Franco';if(s.kind==='leave')return 'Licencia';if(s.kind==='opening')return s.end?`13:00 – ${s.end}`:'Apertura · falta salida';return s.kind==='close'?`${s.start} ${short?'→ cierre':'a cierre'}`:`${s.start} – ${s.end}`;}
export function personTotal(week,id){let minutes=0,pending=0;week.shifts[id].forEach((s,d)=>{const n=shiftMinutes(s,d);if(n===null)pending++;else minutes+=n;});return {minutes,pending};}
export function createWeek(state,date,from){const id=monday(date);if(state.weeks.some(w=>w.id===id))throw new Error('Ya existe una semana con esa fecha. Elegila desde el historial.');const shifts=structuredClone(from==='template'?state.template:state.weeks.find(w=>w.id===state.selected).shifts);const week={id,note:'',shifts};state.weeks.push(week);state.weeks.sort((a,b)=>b.id.localeCompare(a.id));state.selected=id;return week;}
export function validateState(state){
 if(!state||state.version!==1||!Array.isArray(state.people)||state.people.length<1||state.people.length>100||!Array.isArray(state.weeks)||!state.weeks.length||state.weeks.length>520)throw new Error('El respaldo no tiene un formato válido.');
 const ids=new Set();for(const p of state.people){if(typeof p.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(p.id)||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>60)throw new Error('Hay empleados inválidos en el respaldo.');ids.add(p.id);}
 const validTime=t=>typeof t==='string'&&(t===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(t));
 const check=shifts=>{if(!shifts||typeof shifts!=='object')throw new Error('Faltan turnos.');for(const id of ids){if(!Array.isArray(shifts[id])||shifts[id].length!==7)throw new Error('Cada empleado debe tener siete días.');for(const [day,s] of shifts[id].entries()){if(!s||!['fixed','close','off','leave','opening'].includes(s.kind)||!validTime(s.start)||!validTime(s.end)||(['fixed','close','opening'].includes(s.kind)&&!s.start)||(s.kind==='fixed'&&!s.end)||(s.kind==='opening'&&s.start!=='13:00'))throw new Error('Hay un horario inválido en el respaldo.');const minutes=shiftMinutes(s,day);if(minutes!==null&&(minutes>MAX_SHIFT_MINUTES||(minutes===0&&!['off','leave'].includes(s.kind))))throw new Error('Hay un turno de duración inválida o mayor a 9 horas.');}}};
 const dates=new Set();for(const w of state.weeks){if(typeof w.id!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(w.id)||dateAt(w.id)!==w.id||monday(w.id)!==w.id||dates.has(w.id)||typeof w.note!=='string'||w.note.length>300)throw new Error('Hay semanas inválidas en el respaldo.');dates.add(w.id);check(w.shifts);}if(!dates.has(state.selected))throw new Error('La semana seleccionada no existe.');check(state.template);return state;
}
