(()=>{
 const settings=[['battery-x','x'],['battery-y','y'],['battery-z','z'],['battery-mass','massEach']];
 window.renderBatteryReview=()=>{for(const[id,key]of settings)$(id).value=batteryDesign[key];$('battery-lift').value=batteryDesign.lift;$('battery-lift-out').textContent=batteryDesign.lift+' mm';$('battery-service').checked=batteryDesign.service;for(const[i,id]of[[0,'battery-installed-left'],[1,'battery-installed-right']])$(id).checked=batteryDesign.installed[i];
 const base=baseMassProperties(),a=massAnalysis(),c=batteryCenters()[0];$('battery-analysis').textContent=`B1 중심 XYZ ${c.join(', ')} mm / 외형 ${batteryDesign.size.join(' × ')} mm (추정). 장착 ${batteryDesign.installed.filter(Boolean).length}/2팩 · AMR ${base.mass.toFixed(1)} kg · 전체 ${a.total.toFixed(1)} kg · CG X/Y ${a.cg[0].toFixed(1)} / ${a.cg[1].toFixed(1)} mm.`;
 $('battery-clearances').innerHTML=batteryClearances().map(c=>`<div class="${c.value<c.required?'warn':'ok'}">${c.name}<b>${c.value.toFixed(0)} mm</b></div>`).join('');};
 function refresh(){checkClearance();window.renderMechanismReview();inspector();draw();}
 for(const[id,key]of settings)$(id).addEventListener('input',()=>{const el=$(id),v=+el.value,valid=el.value!==''&&Number.isFinite(v)&&v>=+el.min&&v<=+el.max;el.classList.toggle('error-input',!valid);if(valid){batteryDesign[key]=v;refresh();}});
 $('battery-lift').addEventListener('input',()=>{batteryDesign.lift=+$('battery-lift').value;refresh();});$('battery-service').addEventListener('change',()=>{batteryDesign.service=$('battery-service').checked;refresh();});
 for(const[i,id]of[[0,'battery-installed-left'],[1,'battery-installed-right']])$(id).addEventListener('change',()=>{batteryDesign.installed[i]=$(id).checked;refresh();});
 function focus(view){mechanism.scope='base';window.renderMechanismReview();select('battery');setView(view);$('model').scrollIntoView({block:'center'});}
 $('battery-focus').addEventListener('click',()=>focus('iso'));$('battery-top').addEventListener('click',()=>focus('top'));$('battery-extract').addEventListener('click',()=>{batteryDesign.lift=250;refresh();focus('iso');});$('battery-seated').addEventListener('click',()=>{batteryDesign.lift=0;refresh();focus('iso');});
 window.renderMechanismReview();select('battery');
})();
