const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({Math,params:{W:600,L:650,D:200,T:490}});
for(const f of['mechanism','camera-design'])vm.runInContext(fs.readFileSync(`dist/${f}.js`,'utf8'),c);
const run=s=>vm.runInContext(s,c),json=s=>JSON.parse(run(`JSON.stringify(${s})`)),near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} / ${b}`);
let checks=0;
for(const yaw of[0,15,25,50])for(const down of[-20,0,15,30]){
 run(`cameraDesign={...cameraDefaults,yaw:${yaw},down:${down}}`);
 const frames=json('cameraFrames()'),a=json('cameraAnalysis()');
 for(const f of frames){near(Math.hypot(...f.forward),1);near(f.forward[0],Math.cos(yaw*Math.PI/180)*Math.cos(down*Math.PI/180));near(f.forward[1],f.side*Math.sin(yaw*Math.PI/180)*Math.cos(down*Math.PI/180));near(f.forward[2],-Math.sin(down*Math.PI/180));near(f.forward.reduce((s,v,i)=>s+v*f.horizontal[i],0),0);}
 near(frames[0].origin[1],-frames[1].origin[1]);near(a.rows[0].forward[1],-a.rows[1].forward[1]);
 const left=a.rows[0].groundPolygon,right=a.rows[1].groundPolygon;
 for(const p of left){assert.ok(right.some(q=>Math.hypot(q[0]-p[0],q[1]+p[1])<1e-6));assert.ok(run(`cameraPointVisible(cameraFrames()[0],[${p[0]},${p[1]},0])`));}
 // Independent perspective projection and sampled visibility; checks clipping via polygon winding.
 const inPoly=(p,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))inside=!inside;}return inside;};
 for(const x of[400,700,1100,1700])for(const y of[-601,-203,101,503]){const f=frames[0],d=[x-f.origin[0],y-f.origin[1],-f.origin[2]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),depth=dot(d,f.forward),expected=depth>=50&&depth<=1500&&Math.abs(dot(d,f.horizontal))<depth*Math.tan(50*Math.PI/180)&&Math.abs(dot(d,f.vertical))<depth*Math.tan(30*Math.PI/180);assert.equal(inPoly([x,y],left),expected);checks++;}
 if(down>0){const hit=a.rows[0].axisGround;near(Math.hypot(hit[0]-305,hit[1]-130),150/Math.tan(down*Math.PI/180));near(hit[2],0);}else assert.equal(a.rows[0].axisGround,null);
}
run('cameraDesign={...cameraDefaults}');assert.ok(run('cameraAnalysis().centerlineFirst')>0);assert.ok(run('cameraWindowMargins().horizontal')>2);
assert.ok(run('cameraPackaging().every(p=>p.clear)'),'revised candidate must clear static caster reservations');
run('cameraDesign.spacing=160;cameraDesign.inset=35');assert.ok(run('cameraPackaging().every(p=>p.interference)'),'previous coordinates must reproduce interference');
run('cameraDesign={...cameraDefaults}');
run('cameraDesign.recess=25;cameraDesign.hfov=120');assert.ok(run('cameraWindowMargins().horizontal')<0,'deep recess must expose horizontal optical clipping');
run('cameraDesign={...cameraDefaults,down:-20,vfov:40}');assert.equal(run('cameraGroundPolygon(cameraFrames()[0]).length'),0,'horizon-only lower edge must not produce a false floor footprint');
// Geometry finite values, world transforms and lens-cylinder axis.
run('cameraDesign={...cameraDefaults};var axes=[];var boxes=[];var exploded=false;function box(p,s){if(s.some(n=>n<=0))throw Error("invalid box");boxes.push({p,s});}function cylinder(p,r,h,axis){axes.push(axis);}function annulus(p,r,ri,h,axis){axes.push(axis);}function bolt(){}function beamBetween(){}');
vm.runInContext(fs.readFileSync('dist/camera-geometry.js','utf8'),c);run('buildBaseCameras()');assert.equal(run('geometryMatrix'),null);assert.ok(run('axes.includes("x")'),'optical cylinders must use local optical +X');
for(const z of[90,135,170]){run(`cameraDesign.z=${z};buildBaseCameras()`);}assert.ok(run('boxes.every(b=>b.p.concat(b.s).every(Number.isFinite))'));
const base=run('cameraOBB(mIdentity(),[0,0,0],[10,10,10],"base")');c.base=base;near(run('cameraOBBGap(base,cameraOBB(mIdentity(),[20,0,0],[10,10,10],"clear"))'),10);near(run('cameraOBBGap(base,cameraOBB(mIdentity(),[10,0,0],[10,10,10],"touch"))'),0);assert.ok(run('cameraOBBGap(base,cameraOBB(mRot("z",45),[0,0,0],[10,10,10],"overlap"))')<0);
console.log(`PASS: ${checks} independent ground projection checks; 16 mirrored poses; ray/axis analytic intersections; aperture clipping and horizon limits; valid bracket geometry and optical +X.`);
