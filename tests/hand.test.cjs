const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,console});for(const f of ['mechanism','hand-design'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),c);
const run=s=>vm.runInContext(s,c),near=(a,b,e=1e-6)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
let leverChecks=0,loadChecks=0;
for(let j=0;j<3;j++)for(const q of[0,5,15,30,45,60,75,80,Math.min(85,[85,95,80][j])]){const eps=1e-4,derivative=(run(`fingerCylinder(${q+eps},${j}).length`)-run(`fingerCylinder(${q-eps},${j}).length`))/(2*eps*Math.PI/180),a=run(`fingerCylinder(${q},${j})`);near(a.lever,derivative);assert.ok(a.lever>.5);near(run(`inverseFingerStroke(${a.stroke},${j})`),q);leverChecks++;}
for(let f=0;f<5;f++)for(const q of[[15,20,30,20],[-10,45,55,35],[5,70,80,55]]){
 run(`handState.finger=${f};handState.q[${f}]=${JSON.stringify(f===0?[15,-25,q[2],q[3]]:q)};`);const result=run('handFingerAnalysis()'),force=result.force,offset=f===0?2:1;
 for(let j=0;j<result.rows.length;j++){const h=1e-4;run(`handState.q[${f}][${offset+j}]+=${h}`);const up=run(`mPoint(fingerFrames(${f}).tip,[0,0,0])`);run(`handState.q[${f}][${offset+j}]-=${2*h}`);const down=run(`mPoint(fingerFrames(${f}).tip,[0,0,0])`);run(`handState.q[${f}][${offset+j}]+=${h}`);const required=-force.reduce((s,F,i)=>s+F*(up[i]-down[i])/1000,0)/(2*h*Math.PI/180);near(result.rows[j].loadTorque,required);loadChecks++;}
}
run('handState=freshHand()');const a=run('handFingerAnalysis()');assert.ok(a.allWithin);assert.ok(a.rows.every(r=>r.masterReal>=r.masterIdeal&&Number.isFinite(r.returnTime)));near(run('handMassBudget().total'),500);
const R=run('lineResistance()');run('handState.lineID*=2');near(run('lineResistance()'),R/16,.01);run('handState.lineLength*=2');near(run('lineResistance()'),R/8,.01);
run('handState=freshHand();handState.load=40');assert.ok(!run('handFingerAnalysis().allWithin'),'overpressure must be detected');run('handState=freshHand();handState.springPreload=.005');assert.ok(!Number.isFinite(run('handFingerAnalysis().rows[0].returnTime')),'weak spring must expose stiction');
run('handState=freshHand()');near(run('inverseFingerStroke(100,0)'),85);near(run('inverseFingerStroke(-5,0)'),0);
// Geometry smoke check: no invalid dimensions/positions in either mirrored hand.
vm.runInContext(`let geometryCalls=0;function verify(a){if(!a.every(Number.isFinite))throw Error('Invalid geometry '+a);geometryCalls++;}function box(c,s){verify([...c,...s]);}function cylinder(c,r,h){verify([...c,r,h]);}function polygon(p){for(const v of p)verify(v);}`,c);vm.runInContext(fs.readFileSync('dist/hand-geometry.js','utf8'),c);
for(const pose of[0,.5,1]){run(`applyHandGrip(${pose});buildDetailedHand(mIdentity(),1);buildDetailedHand(mIdentity(),-1);`);assert.equal(run('geometryMatrix'),null);}
console.log(`PASS: ${leverChecks} cylinder virtual-work derivatives/inverses; ${loadChecks} independent fingertip Jacobian/work checks; pressure limit; return stiction; hose resistance scaling; mass budget; mirrored geometry.`);
