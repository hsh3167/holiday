const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,params:{W:600,L:650,D:200,T:490}});
for(const f of['mechanism','camera-design','ride-design'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),c);
vm.runInContext('function massAnalysis(){return {total:135,cg:[-11.8,0,527.47]}}',c);
const run=s=>vm.runInContext(s,c),json=s=>JSON.parse(run('JSON.stringify('+s+')')),near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} / ${b}`);
// Direct force law, independent of branch enumeration.
function force(d,w,k,preload,travel){if(d<=0)return 0;if(!w.front)return w.tire*d;const atRebound=preload/w.tire,atBump=travel+(preload+k*travel)/w.tire;if(d<atRebound)return d*w.tire;if(d>atBump)return(d-travel)*w.tire;return(d+preload/k)/(1/k+1/w.tire);}
let solved=0,energyChecks=0;
for(let n=0;n<50;n++){
 const h=n===0?[0,0,0,0,0]:Array.from({length:5},(_,i)=>Math.sin((n+1)*(i+2)*1.77)*28),yaw=[(n*13)%360,(n*23)%360,(n*7+180)%360],ax=Math.sin(n)*1.5;
 run(`rideDesign={...freshRide(),terrain:${JSON.stringify(h)},swivel:${JSON.stringify(yaw)},ax:${ax}}`);
 const a=json('rideAnalysis().current'),s=json('({k:rideSpring().k})');assert.ok(a.ok);solved++;
 near(a.rows.reduce((sum,r)=>sum+r.force,0),a.total*9.81);near(a.rows.reduce((sum,r)=>sum+r.force*r.point[0],0),a.total*9.81*a.xEffective,1e-5);near(a.rows.reduce((sum,r)=>sum+r.force*r.point[1],0),0,1e-5);
 for(const r of a.rows){assert.ok(r.force>=0);near(r.force,force(r.deflection,r,s.k,60,35));assert.ok(r.spring>=0&&r.spring<=35);if(r.contact)near(r.deflection,r.spring+r.tireDeflection);else near(r.force,0);}
 // Numerical integration gives support energy; its gradient must balance external work.
 const potential=q=>{let U=a.total*9.81*(q[0]+q[1]*a.xEffective/300);for(const r of a.rows){const d=r.offset+h[r.index]-(q[0]+q[1]*r.point[0]/300+q[2]*r.point[1]/300);if(d<=0)continue;const split=r.front?[0,60/r.tire,35+(60+s.k*35)/r.tire,d]:[0,d],bounds=[...new Set(split.filter(v=>v>=0&&v<=d))].sort((u,v)=>u-v);if(bounds.at(-1)!==d)bounds.push(d);for(let j=1;j<bounds.length;j++){const lo=bounds[j-1],hi=bounds[j];U+=(force(lo,r,s.k,60,35)+force(hi,r,s.k,60,35))*(hi-lo)/2;}}return U;};
 for(let j=0;j<3;j++){const up=[...a.q],down=[...a.q],e=1e-4;up[j]+=e;down[j]-=e;near((potential(up)-potential(down))/(2*e),0,1e-4);energyChecks++;}
}
run('rideDesign=freshRide()');const improved=json('rideAnalysis().current');assert.equal(improved.rows.filter(r=>r.contact).length,5);assert.ok(improved.rows.every(r=>r.state!=='bump-stop'));assert.ok(run('rideCameraClearances().every(r=>r.clear)'));
run('cameraDesign.z=135');assert.ok(run('rideCameraClearances().some(r=>r.overlap)'),'35mm full-travel reservation must flag old camera height');
run('rideDesign.travel=25;rideDesign.freeLength=75');const old=json('rideAnalysis().current');assert.equal(old.rows[0].force,0);assert.equal(old.rows[2].state,'bump-stop');assert.ok(old.rows[2].stopForce>0);
run('rideDesign=freshRide();rideDesign.terrain=[0,0,-40,0,0]');assert.equal(run('rideAnalysis().current.rows[2].contact'),false);
run('rideDesign=freshRide();rideDesign.terrain=[0,0,0,0,0];rideDesign.ax=0');const symmetric=json('rideAnalysis().current');near(symmetric.rows[0].force,symmetric.rows[1].force);near(symmetric.rows[2].force,symmetric.rows[3].force);near(symmetric.roll,0);
run('rideDesign.ax=-1.2');assert.ok(run('rideAnalysis().current.xEffective')>symmetric.xEffective,'braking shifts equivalent load forward');assert.ok(run('rideAnalysis().current.tractionRequired')>0);
const unsupported=json('solveRide(rideDesign,params,{total:135,cg:[900,0,527]})');assert.equal(unsupported.ok,false);
run('rideDesign=freshRide();rideDesign.travel=45;rideDesign.freeLength=65');assert.ok(run('rideSpring().maxStrokeBeforeSolid-rideDesign.travel')<0,'impossible full-stroke spring must be detectable');
// Full-swivel contact XY stays on the specified trail circle.
for(let degrees=0;degrees<360;degrees+=5){run(`rideDesign.swivel=[${degrees},${degrees},${degrees}]`);const p=json('rideLocations()');near(Math.hypot(p[2][0]-255,p[2][1]-220),20);near(Math.hypot(p[4][0]+271,p[4][1]),16);}
// Geometry remains finite and restores its transform in rebound and compression.
run('rideDesign=freshRide();var colors={caster:"#aaa",rear:"#bbb"};function box(p,s){if(!p.concat(s).every(Number.isFinite)||s.some(n=>n<=0))throw Error("box");}function cylinder(p,r,h){if(!p.concat(r,h).every(Number.isFinite)||h<=0)throw Error("cylinder");}function coilSpring(){}function annulus(){}');vm.runInContext(fs.readFileSync('dist/ride-geometry.js','utf8'),c);
for(const heights of[[0,0,15,0,0],[0,0,-40,0,0],[20,0,0,20,0]]){run('rideDesign.terrain='+JSON.stringify(heights));run('buildRideCaster(2,"caster");buildRideCaster(3,"caster");buildRideCaster(4,"rear");buildRideGround()');assert.equal(run('geometryMatrix'),null);}
console.log(`PASS: ${solved} unilateral equilibria; ${energyChecks} independent potential-energy gradients; load/moment balance; rebound/bump/lift; candidate improvement; camera swept reservation; trail circles and finite moving geometry.`);
