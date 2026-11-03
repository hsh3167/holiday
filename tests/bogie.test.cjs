const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,params:{W:600,L:650,D:200,T:490}});
for(const f of ['mechanism','camera-design','ride-design'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
vm.runInContext('var testLoad={total:135,cg:[-11.8,0,527.47]};function massAnalysis(){return testLoad}',c);
const run=s=>vm.runInContext(s,c),get=s=>JSON.parse(run('JSON.stringify('+s+')')),near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,`${a} vs ${b}`);
// Independent potential energy, using rigid lever arms, unilateral tires and
// preloaded coil work. The constrained gradient must satisfy the KKT signs.
function potential(q,design,load){
 const front=255,px=235*design.pivotPct/100,lever=front-px;
 const a=design.swivel.map(v=>v*Math.PI/180);
 const xy=[[0,245],[0,-245],[front-20*Math.cos(a[0]),220-20*Math.sin(a[0])],[front-20*Math.cos(a[1]),-220-20*Math.sin(a[1])],[-271-16*Math.cos(a[2]),-16*Math.sin(a[2])]];
 const W=load.total*9.81,xe=load.cg[0]-design.ax*load.cg[2]/9.81;
 let U=W*(q[0]+q[1]*xe/300+q[2]*load.cg[1]/300);
 const k=79000*design.wire**4/(8*design.mean**3*design.activeCoils);
 for(let side=0;side<2;side++)U+=design.preload*q[3+side]+.5*k*q[3+side]**2;
 xy.forEach(([x,y],i)=>{const r=i===4?0:(x-px)/lever,d=design.terrain[i]-(q[0]+q[1]*x/300+q[2]*y/300)-r*((q[3+i%2]||0)-design.extension),kt=i<2?design.driveK:i===4?design.rearK:design.frontTireK;U+=.5*kt*Math.max(0,d)**2;});
 return U;
}
let gradients=0,stops=0,air=0;
for(let n=0;n<60;n++){
 run(`rideDesign={...freshRide(),pivotPct:${30+n%31},terrain:${JSON.stringify(Array.from({length:5},(_,i)=>Math.sin((n+1)*(i+2)*1.77)*35))},swivel:[${n*17%360},${n*29%360},180],ax:${Math.sin(n)*1.2}};testLoad={total:${100+n%61},cg:[${-30+Math.sin(n)*20},${Math.cos(n)*8},527]};rideCache=null;`);
 const a=get('rideAnalysis().current'),d=get('rideDesign'),load=get('testLoad');assert.ok(a.ok,'equilibrium '+n);
 near(a.rows.reduce((s,r)=>s+r.force,0),load.total*9.81);
 near(a.rows.reduce((s,r)=>s+r.force*r.point[0],0),load.total*9.81*a.xEffective,1e-4);
 near(a.rows.reduce((s,r)=>s+r.force*r.point[1],0),load.total*9.81*load.cg[1],1e-4);
 for(const b of a.bogies){near(b.momentResidual,0);assert.ok(b.stroke>=-1e-6&&b.stroke<=d.travel+1e-6);if(b.state!=='spring')stops++;}
 air+=a.rows.filter(r=>!r.contact).length;
 for(let j=0;j<5;j++){const h=1e-4,up=[...a.q],down=[...a.q];up[j]+=h;down[j]-=h;const g=(potential(up,d,load)-potential(down,d,load))/(2*h);if(j<3||a.bogies[j-3].state==='spring')near(g,0,1e-4);else if(a.bogies[j-3].state==='droop-stop')assert.ok(g>=-1e-4);else assert.ok(g<=1e-4);gradients++;}
}
assert.ok(stops>0&&air>0,'must exercise hard stops and contact loss');
run('testLoad={total:135,cg:[-11.8,0,527.47]};rideDesign=freshRide();rideCache=null;');
const base=get('rideAnalysis().baseline');near(base.rows[0].force,base.rows[1].force);near(base.bogies[0].stroke,base.bogies[1].stroke);
run('rideDesign.terrain=[15,0,0,0,0];rideCache=null;');const raised=get('rideAnalysis().current');assert.ok(raised.bogies[0].stroke<base.bogies[0].stroke,'drive rise rotates front down');
run('rideDesign.terrain=[0,0,15,0,0];rideCache=null;');const bumped=get('rideAnalysis().current');assert.ok(bumped.bogies[0].stroke>base.bogies[0].stroke,'caster rise rotates drive down');
// One exact rigid transform for motor, drive and caster: distances stay fixed.
for(const side of[1,-1])for(const stroke of[0,10,20,35]){
 const T=get(`rideBogieTransform(${side},${stroke})`),pt=p=>[T[0]*p[0]+T[2]*p[2]+T[3],p[1],T[8]*p[0]+T[10]*p[2]+T[11]],D=[0,side*245,100],C=[235,side*220,37.5],M=[0,side*177.5,100],dist=(p,q)=>Math.hypot(...p.map((v,i)=>v-q[i]));near(dist(pt(D),pt(C)),dist(D,C));near(dist(pt(D),pt(M)),67.5);
 const L=get('bogieLayout()');near(dist(pt([L.px,side*170,L.pz]),[L.px,side*170,L.pz]),0);
}
// Independent dense sampling must lie in the analytic full-stroke enclosure.
for(const side of[1,-1]){const center=[255,side*220,48],size=[140,140,96],box=get(`bogieSweptBounds(${JSON.stringify(center)},${JSON.stringify(size)},${side})`);for(let u=0;u<=35;u+=.25){const T=get(`rideBogieTransform(${side},${u})`);for(const sx of[-1,1])for(const sz of[-1,1]){const p=[center[0]+sx*70,center[1],48+sz*48],x=T[0]*p[0]+T[2]*p[2]+T[3],z=T[8]*p[0]+T[10]*p[2]+T[11];assert.ok(Math.abs(x-box.center[0])<=box.size[0]/2+1e-6);assert.ok(Math.abs(z-box.center[2])<=box.size[2]/2+1e-6);}}}
run('testLoad={total:135,cg:[900,0,527]};rideCache=null');assert.equal(run('rideAnalysis().current.ok'),false);
console.log(`PASS: 60 coupled bogie equilibria, ${gradients} independent potential-energy/KKT gradients, ${stops} hard stops, ${air} unloaded contacts; force/moment balance, rigid motor-wheel-caster distances, analytic swept enclosure.`);
