'use strict';
function handSegment(a,b,fn){const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<.001)return;const z=d.map(v=>v/len),seed=Math.abs(z[2])<.9?[0,0,1]:[0,1,0],cx=cross3(seed,z),n=Math.hypot(...cx),x=cx.map(v=>v/n),y=cross3(z,x);withTransform([x[0],y[0],z[0],a[0],x[1],y[1],z[1],a[1],x[2],y[2],z[2],a[2],0,0,0,1],()=>fn(len));}
function handTube(a,b,r,color,id){handSegment(a,b,len=>cylinder([0,0,len/2],r,len,'z',color,id,10));}
function drawHandCylinder(angle,j){const c=fingerCylinder(angle,j),id='fingerHydraulic',body=c.initial-3,piston=body-c.capacity-3+c.stroke;
 handSegment(c.a,c.b,len=>{const outer=handState.outer[j]/2,inner=handState.bore[j]/2,n=24;for(let i=0;i<n;i++){if(handState.section&&i<n/2)continue;const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;polygon([[outer*Math.cos(a),outer*Math.sin(a),0],[outer*Math.cos(b),outer*Math.sin(b),0],[outer*Math.cos(b),outer*Math.sin(b),body],[outer*Math.cos(a),outer*Math.sin(a),body]],'#82a6b0',id,.85);}annulus([0,0,1],outer,.8,2,'z','#8d9f95',id,16);annulus([0,0,body-1],outer,handState.rod/2,2,'z','#9eafa6',id,16);
  if(handState.section){cylinder([0,0,piston/2],inner-.2,Math.max(.2,piston-1),'z','#508ba1',id,16);cylinder([0,0,piston],inner-.1,2,'z','#b8c6bd',id,16);annulus([0,0,piston],inner+.05,inner-.45,.8,'z','#a56f4d',id,16);}
  cylinder([0,0,(piston+len)/2],handState.rod/2,len-piston,'z','#d4ded5',id,12);annulus([0,0,body-1.3],handState.rod/2+.5,handState.rod/2,.7,'z','#a56f4d',id,12);
 });
 for(const p of[c.a,c.b]){cylinder(p,1.5,14,'y','#bac5bd',id,12);for(const side of[-1,1])annulus([p[0],p[1]+side*5.5,p[2]],2.5,1.5,3,'y','#746952',id,12);}beamBetween([0,0,0],c.b,3,4,'#495d50',id);
 // Central coil fits between the knuckle cheeks. This is a spring envelope,
 // not a selected spring: the stiffness remains the explicit equivalent input.
 const turns=4,count=48,sides=5,rings=Array.from({length:count+1},(_,i)=>{const t=i/count,a=t*turns*2*Math.PI;return Array.from({length:sides},(_,j)=>{const b=j*2*Math.PI/sides;return[(3.5+.3*Math.cos(b))*Math.cos(a),-2+4*t+.3*Math.sin(b),(3.5+.3*Math.cos(b))*Math.sin(a)];});});for(let i=0;i<count;i++)for(let j=0;j<sides;j++)polygon([rings[i][j],rings[i+1][j],rings[i+1][(j+1)%sides],rings[i][(j+1)%sides]],'#b7aa80',id,.9);handTube([3.5,-2,0],[-3.5,-2,6],.3,'#b7aa80',id);handTube([3.5,2,0],mPoint(mRot('y',-angle),[-3.5,2,-6]),.3,'#b7aa80',id);
 if(handState.ports){const p=[c.a[0]-3,3,c.a[2]],q=[c.a[0]-7,3,c.a[2]+10];handTube(c.a,p,1.5,'#497f9f',id);handTube(p,q,handState.lineOD/2,'#5a9fb5',id);}
}

function buildDetailedHand(matrix,side){withTransform(matrix,()=>{
 const id='hands';annulus([0,0,-8],23,10,16,'z','#b7cbb8',id,16);
 for(const y of[-31,31])box([0,y,-43],[16,8,65],'#33453a',id);for(const z of[-15,-68])box([0,0,z],[16,64,8],'#33453a',id);
 if(handState.cover)box([0,0,-43],[25,70,72],'#dce0d6',id,.25);
 box([14,0,-43],[4,62,59],'#f0f0e5','tactile');
 for(let f=0;f<5;f++){
  const a=fingerFrames(f,side),root=a.root;
  withTransform(root,()=>{cylinder([-12,0,11],5.5,18,'x','#9d8e64','palmMotor',12);annulus([0,0,0],6,2.5,7,'x','#b49b63','palmMotor',12);if(f===0)cylinder([-12,side*12,18],5,16,'x','#b59d6e','palmMotor',12);});
  for(let j=0;j<a.before.length;j++){
   withTransform(a.before[j],()=>{for(const side of[-1,1])annulus([0,side*5.5,0],4.5,1.5,3,'y','#617466',id,12);cylinder([0,0,0],1.5,16,'y','#bec8c0',id,12);drawHandCylinder(a.angles[j],j);});
   withTransform(a.after[j],()=>{const len=a.lengths[j];for(const y of[-5.5,5.5])box([0,y,-len/2],[8,3,len-8],'#354a3e',id);box([0,0,-len+5],[8,12,5],'#34473b',id);box([7,0,-len/2],[3,14,len-6],'#f0f0e5','tactile');for(const z of[-8,-len+8])cylinder([0,7,z],1.4,2,'y','#597261',id,8);});
  }
 }
 });}
function buildHandDriveCassette(){for(const side of[-1,1])for(let row=0;row<7;row++)for(const col of[-1,1]){const y=side*75+col*17,z=99+row*23;box([-25,y,z],[45,12,15],'#3c6977','hydraulic',.45);cylinder([-4,y,z],handState.masterBore/2+2,18,'x','#83aeb2','hydraulic',10);cylinder([7,y,z],2,8,'x','#c3d5cd','hydraulic',8);}}
