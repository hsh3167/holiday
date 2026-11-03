'use strict';
function cameraRectFrame(x,w,h,t,color,id){for(const sign of[-1,1]){box([x,sign*(w/2-t/2),0],[5,t,h],color,id);box([x,0,sign*(h/2-t/2)],[5,w-2*t,t],color,id);}}
function buildBaseCameras(){const c=cameraDesign,lift=exploded?80:0;for(const f of cameraFrames()){
 const yawFrame=mMul(mTrans(f.origin[0],f.origin[1],f.origin[2]+lift),mRot('z',f.yaw));
 if(c.brackets)withTransform(yawFrame,()=>{
  // Mount top plane z193, bracket top197; camera pivot at configured lens height.
  const top=197-c.z;
  box([-40,0,187-c.z],[64,114,12],'#8fa89b','camera');
  box([-40,0,top-2],[64,114,4],'#b6c7b4','camera');
  for(const side of[-1,1]){box([-12,side*50,(top-4)/2],[84,4,top+8],'#96aaa2','camera');cylinder([0,side*53,0],4,9,'y','#cedbd1','camera',12);for(const x of[-61,-24])bolt([x,side*43,top+2],'z','camera',4);}
  // Adjustable pitch arcs and a fixed upper hard stop: proposed interfaces.
  for(const side of[-1,1]){for(let a=-20;a<=30;a+=5){const r=24,p=[r*Math.cos(a*Math.PI/180),side*53,-r*Math.sin(a*Math.PI/180)];cylinder(p,2.2,4,'y','#3b514b','camera',6);}box([-8,side*50,30],[10,8,5],'#a0b2a4','camera');}
 });
 const optic=mMul(mTrans(f.origin[0],f.origin[1],f.origin[2]+lift),mMul(mRot('z',f.yaw),mRot('y',c.down)));
 withTransform(optic,()=>{
  box([-20,0,0],[36,90,38],'#6c8c92','camera');
  cameraRectFrame(c.recess,128,64,6,'#b9c9bd','camera');cameraRectFrame(c.recess+2,c.windowW+8,c.windowH+8,4,'#203335','camera');
  box([-1,0,0],[2,90,34],'#182a2d','camera');
  // Optical aperture silhouettes only: not a claim of four cameras or a selected product.
  for(const y of[-30,30]){annulus([0,y,0],8,5.5,4,'x','#3d5961','camera',16);cylinder([2,y,0],5.3,1,'x','#9bbbc1','camera',16);}
  box([1,0,0],[2,15,8],'#456d73','camera');
  for(const y of[-39,39])for(const z of[-14,14])bolt([-1,y,z],'x','camera',3);
  if(c.brackets){cylinder([-40,0,0],5,6,'x','#3a5550','camera',12);const pts=Array.from({length:13},(_,i)=>{const a=i/12*Math.PI;return[-44-25*Math.sin(a),0,25*(1-Math.cos(a))];});for(let i=1;i<pts.length;i++)beamBetween(pts[i-1],pts[i],4,4,'#c4ad74','camera');box([-48,0,50],[12,17,7],'#83957c','camera');}
 });
}}
function drawCameraRays(){if(!scopeIncludes('camera')||!cameraDesign.rays)return;for(const f of cameraFrames()){
 const origin=f.origin.map((v,i)=>v+(i===2&&exploded?80:0));
 const end=origin.map((v,i)=>v+f.forward[i]*220);line(origin,end,'#8cdae4',2,[5,3]);const p=project(end);ctx.fillStyle='#b9e8e6';ctx.font='10px monospace';ctx.textAlign='center';ctx.fillText(`${f.side>0?'L':'R'} ${f.yaw>0?'+':''}${f.yaw}°`,p.x,p.y-6);
 if(fov){const depth=Math.min(cameraDesign.far,600),corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([h,v])=>mPoint(f.matrix,[depth,h*depth*Math.tan(cameraDesign.hfov*Math.PI/360),v*depth*Math.tan(cameraDesign.vfov*Math.PI/360)]).map((n,i)=>n+(i===2&&exploded?80:0)));for(const q of corners)line(origin,q,'#8bbacb66',1,[3,4]);path3([...corners,corners[0]],'#8bbacb66');}
}}
