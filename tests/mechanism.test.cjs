const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context=vm.createContext({Math,console,params:{W:600,L:650,D:200,T:490}});
vm.runInContext(fs.readFileSync('dist/mechanism.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/upper-body.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/arm-analysis.js','utf8'),context);
vm.runInContext(fs.readFileSync('dist/battery-design.js','utf8'),context);
vm.runInContext(`function coordinates(){return{drive:{positions:[[0,245,100],[0,-245,100]]},caster:{positions:[[235,220,37.5],[235,-220,37.5]]},rear:{positions:[[-255,0,32.5]]}};}`,context);
const run=s=>vm.runInContext(s,context),near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
const poses=[[0,0,0,0,0],[-5,12,-7,0,0],[-60,135,-75,0,0],[20,35,-55,0,0],[-5,12,-7,12,45],[45,40,-85,20,60]];
for(const pose of poses){run('mechanism.angles='+JSON.stringify(pose));const f=run('waistFrames()'),pt=m=>[m[3],m[7],m[11]],dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));near(dist(pt(f.root),pt(f.j2)),360);near(dist(pt(f.j2),pt(f.j3)),300);const result=run('massAnalysis()');near(result.total,135);assert.equal(result.hull.length,5);
 // Independent work-energy check: gravity torque must equal -d(potential energy)/dq.
 for(let j=0;j<5;j++){const h=1e-4;run(`mechanism.angles[${j}]+=${h}`);const up=run('massAnalysis().entries.reduce((s,e)=>s+e.m*9.81*e.p[2]/1000,0)');run(`mechanism.angles[${j}]-=${2*h}`);const down=run('massAnalysis().entries.reduce((s,e)=>s+e.m*9.81*e.p[2]/1000,0)');run(`mechanism.angles[${j}]+=${h}`);const energyTorque=-(up-down)/(2*h*Math.PI/180);near(result.torques[j].gravity,energyTorque,1e-5);}
}
run('mechanism.angles=[0,0,0,0,0]');near(run('waistFrames().tip[11]'),1145);near(run('massAnalysis().torques[4].gravity'),0);assert.ok(run('massAnalysis().margin')>0);
run('mechanism.angles=[45,40,-85,0,0];mechanism.mPayload=20;mechanism.reach=600;mechanism.payloadMode="equivalent";');assert.ok(run('massAnalysis().margin')<0,'outside support polygon must be detected');
run('mechanism.angles=[0,0,0,0,0];mechanism.mPayload=10;mechanism.reach=250;mechanism.payloadMode="hands";');near(run('headTopZ()'),1760);
for(const side of[1,-1]){const a=run(`armFrames(waistFrames().tip,${side})`),p=m=>[m[3],m[7],m[11]],d=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));near(d(p(a.before[0]),p(a.before[3])),235);near(d(p(a.before[3]),p(a.before[4])),50);near(d(p(a.before[4]),p(a.before[5])),190);}
const initialCG=run('massAnalysis().cg[0]');
run('upperBody.left=[-65,10,0,-30,0,5,0];upperBody.right=[-65,-10,0,-30,0,5,0];');
assert.ok(run('massAnalysis().cg[0]')>initialCG+10,'reaching arms must move whole-body CG forward');
near(run('massAnalysis().cg[1]'),0);
run('upperBody.head=[30,30]');
const sampledHeadTop=run('Math.max(...Array.from({length:181},(_,j)=>Array.from({length:361},(_,i)=>mPoint(upperFrames().head,[66*Math.sin(j*Math.PI/180)*Math.cos(i*Math.PI/180),80*Math.sin(j*Math.PI/180)*Math.sin(i*Math.PI/180),105+105*Math.cos(j*Math.PI/180)])[2])).flat())');
near(run('headTopZ()'),sampledHeadTop,.01);
console.log('PASS: 6 waist poses; 30 independent gravity/work-energy checks; support hull; 1760 mm height; bilateral arm lengths; moving-arm CG; tilted-head envelope.');
