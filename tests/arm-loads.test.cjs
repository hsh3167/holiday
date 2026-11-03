const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({Math,console,params:{W:600,L:650,D:200,T:490}});
for(const f of['mechanism','upper-body','arm-analysis','battery-design'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),ctx);
vm.runInContext(`function coordinates(){return{drive:{positions:[[0,245,100],[0,-245,100]]},caster:{positions:[[235,220,37.5],[235,-220,37.5]]},rear:{positions:[[-255,0,32.5]]}}}`,ctx);
const run=s=>vm.runInContext(s,ctx),near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
const postures=[{w:[0,0,0,0,0],l:[0,0,0,0,0,0,0],r:[0,0,0,0,0,0,0]}, {w:[-5,12,-7,0,0],l:[-65,10,0,-30,0,5,0],r:[-35,-15,-10,-70,10,15,0]}, {w:[-60,135,-75,0,0],l:[-50,35,25,-95,-30,20,15],r:[15,-55,50,-65,45,40,-15]}, {w:[-5,12,-7,20,65],l:[20,100,-60,-85,65,-35,40],r:[-80,-45,75,-20,-90,30,-50]}];
let checks=0;
for(const p of postures){run(`mechanism.angles=${JSON.stringify(p.w)};upperBody.left=${JSON.stringify(p.l)};upperBody.right=${JSON.stringify(p.r)};mechanism.leftShare=.7`);
 const upperMass=run('upperMassParts(waistFrames().tip).reduce((s,e)=>s+e.m,0)');near(upperMass,25);near(run('payloadEntries().reduce((s,e)=>s+e.m,0)'),10);near(run('massAnalysis().total'),135);
 const rows=run('armLoadAnalysis()');for(let side=0;side<2;side++)for(let j=0;j<7;j++){
  const key=side===0?'left':'right',h=1e-4,energy='[...upperMassParts(waistFrames().tip),...payloadEntries()].reduce((s,e)=>s+e.m*9.81*e.p[2]/1000,0)';
  run(`upperBody.${key}[${j}]+=${h}`);const up=run(energy);run(`upperBody.${key}[${j}]-=${2*h}`);const down=run(energy);run(`upperBody.${key}[${j}]+=${h}`);
  near(rows[side].rows[j].gravity,-(up-down)/(2*h*Math.PI/180));checks++;
 }
 near(rows.reduce((s,a)=>s+a.force,0),(12+10)*9.81);
}
// Independent closed form: horizontal 540 mm chain + 80 mm load offset, all load on left.
run('mechanism.angles=[0,0,0,0,0];upperBody.left=[-90,0,0,0,0,0,0];mechanism.leftShare=1;');
near(run('armLoadAnalysis()[0].rows[0].payload'),10*9.81*.620);
near(run('armLoadAnalysis()[1].payloadMass'),0);
run('actuators.factor=2;actuators.ratios[0]=100;actuators.efficiency=.8');near(run('armLoadAnalysis()[0].rows[0].motor'),run('Math.abs(armLoadAnalysis()[0].rows[0].gravity)')*2/80);
run('mechanism.payloadMode="equivalent"');near(run('armLoadAnalysis().reduce((s,a)=>s+a.payloadMass,0)'),0);near(run('massAnalysis().total'),135);
const samples=run('workspaceSamples()');assert.equal(samples.length,2);for(const a of samples){assert.equal(a.points.length,480);assert.ok(a.points.flat().every(Number.isFinite));}
console.log(`PASS: ${checks} independent arm gravity/work-energy comparisons; mass/payload conservation; shoulder force balance; 620 mm analytic load lever; motor conversion; equivalent mode; workspace samples.`);
