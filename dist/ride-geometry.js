'use strict';
function buildRideCaster(index,id){if(rideDesign.bogie&&index!==4){buildBogieCaster(index,id);return;}const state=rideCasterState(index),front=index!==4,r=front?37.5:32.5,trail=front?20:16,spindle=[front?params.L/2-70:-params.L/2+54,front?(index===2?1:-1)*(params.W/2-80):0],d=state.delta;
 withTransform(mMul(mTrans(...spindle,0),mRot('z',state.yaw)),()=>{
  cylinder([-trail,0,r+d],r,26,'y','#242d27',id,24);
  for(const s of[-1,1]){cylinder([-trail,s*14,r+d],r*.6,3,'y',colors[id],id,18);box([-trail/2,s*20,r+21+d],[front?42:38,7,front?44:38],'#c9cfbf',id);}
 });
 const[x,y]=spindle;
 if(front){const a=rideAnalysis().current,row=a.ok?a.rows[index]:null,spring=rideSpring(),stroke=row?row.spring:0,bottom=169-(rideDesign.freeLength-spring.preCompression-stroke);
  cylinder([x,y,90+d],20,12,'z','#bac5b2',id,18);
  const guideBottom=82+d;cylinder([x,y,(guideBottom+170)/2],8,Math.max(5,170-guideBottom),'z','#e4e7df',id,16);
  cylinder([x,y,bottom-6],25,9,'z','#acb6a1',id);
  const zeroSeat=169-rideDesign.freeLength+spring.preCompression-6;annulus([x,y,zeroSeat+rideDesign.travel+7],16,8.5,5,'z','#bc9464',id,16);annulus([x,y,zeroSeat-7],12,8.5,5,'z','#6d8a80',id,16);
  coilSpring(x,y,Math.min(bottom,165),169);cylinder([x,y,178],29,16,'z','#202923',id);
  for(const s of[-1,1])box([x+s*34,y,149],[12,62,78],'#cbd1c1',id);
  cylinder([x,y,185],33,8,'z','#bcc6b1',id,20);
 }else{cylinder([x,y,78],20,12,'z','#bac5b2',id,18);cylinder([x,y,92],8,18,'z','#e4e7df',id,16);cylinder([x,y,101],25,8,'z','#bcc6b1',id,20);}
}
function buildRideGround(){if(!rideDesign.enabled)return;const a=rideAnalysis().current;if(!a.ok)return;for(const r of a.rows){const z=r.ground-(r.bodyDelta||0);box([r.point[0],r.point[1],z-2],[90,80,4],r.ground>=0?'#7d8d67':'#6c8084','terrain',.65);}}
function drawRideOverlay(){if(!rideDesign.enabled||!scopeIncludes('caster'))return;const a=rideAnalysis().current;if(!a.ok)return;path3(a.hull.map(p=>[...p,2]),'#dbb16e','#ccac5b0c',1,[5,4]);
 for(const r of a.rows){const z=r.ground-(r.bodyDelta||0)+3,p=project([r.point[0],r.point[1],z]),end=[r.point[0],r.point[1],z+Math.min(75,r.force*.12)];if(r.contact)line([r.point[0],r.point[1],z],end,'#9fcda2',2);else{ctx.strokeStyle='#e69b72';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-6,p.y-6);ctx.lineTo(p.x+6,p.y+6);ctx.moveTo(p.x+6,p.y-6);ctx.lineTo(p.x-6,p.y+6);ctx.stroke();}ctx.fillStyle=r.contact?'#c9dfb0':'#edb58b';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(`${r.name.split(' ')[0]} ${r.force.toFixed(0)} N`,p.x,p.y+17);}
 ctx.textAlign='left';ctx.fillStyle='#b0c49e';ctx.font='10px monospace';ctx.fillText(rideDesign.bogie?'좌우 보기 링크 / 구동휠·모터·캐스터 동반 회전 · 차체 고정 기준':'독립 수직현가 비교 / 차체 고정 표시 · 평지 대비 현가 변위',20,ch-69);
}

function buildBogieCaster(index,id){const side=index===2?1:-1,L=bogieLayout(),x=L.front,y=side*L.y,a=rideAnalysis(),ref=a.baseline.ok?a.baseline.bogies[index-2].stroke:0,s=rideSpring(),bottom=169-rideDesign.freeLength+s.preCompression+ref,transform=rideBogieTransform(side);
 withTransform(transform,()=>{withTransform(mMul(mTrans(x,y,0),mRot('z',rideDesign.swivel[index-2])),()=>{
  cylinder([-20,0,37.5],37.5,26,'y','#242d27',id,24);
  for(const sign of[-1,1]){cylinder([-20,sign*14,37.5],22.5,3,'y',colors.caster,id,18);box([-10,sign*20,58.5],[42,7,44],'#c9cfbf',id);}
 });cylinder([x,y,90],20,12,'z','#bac5b2',id,18);cylinder([x,y,99],25,6,'z','#cbd2bf',id,20);cylinder([x,y,bottom-5],25,8,'z','#d0b880','bogie',20);});
 // An articulated coil strut avoids imposing a fixed vertical prismatic guide
 // on the front end of a rigid rotating arm. End bearings are reservations.
 const low=mPoint(transform,[x,y,bottom]),top=[x,y,169],v=top.map((n,i)=>n-low[i]),length=Math.hypot(...v),z=v.map(n=>n/length),axis=[z[2],0,-z[0]],n=Math.hypot(...axis),ex=axis.map(x=>x/n),ey=[0,1,0],m=[ex[0],ey[0],z[0],low[0],ex[1],ey[1],z[1],low[1],ex[2],ey[2],z[2],low[2],0,0,0,1];
 withTransform(m,()=>{coilSpring(0,0,0,length);cylinder([0,0,length/2],6,Math.max(2,length),'z','#c8d1c1','bogie',16);});
 cylinder(low,7,52,'y','#d5c49a','bogie',16);cylinder(top,7,52,'y','#d5c49a','bogie',16);cylinder([x,y,178],29,16,'z','#202923',id,20);cylinder([x,y,185],33,8,'z','#bcc6b1',id,20);
}
function buildRideBogies(){if(!rideDesign.enabled||!rideDesign.bogie)return;const L=bogieLayout();for(const side of[1,-1]){const py=side*(params.T/2-75),my=side*(params.T/2-67.5),cy=side*L.y,T=rideBogieTransform(side);
 // The wheel and motor housing share this same rigid transform in app.js.
 withTransform(T,()=>{box([74,my,params.D/2],[8,80,104],'#bca47a','bogie');for(const d of[-13,13]){const a=[78,my+d,122],b=[L.px,py+d,L.pz],c=[L.front,cy+d,96];beamBetween(a,b,9,30,'#d1b57e','bogie');beamBetween(b,c,9,30,'#d1b57e','bogie');}annulus([L.px,py,L.pz],25,10,70,'y','#cbb385','bogie',24);box([L.front,cy,98],[52,64,10],'#bda676','bogie');});
 cylinder([L.px,py,L.pz],10,96,'y','#8ca899','bogie',20);
 for(const d of[-32,32]){box([L.px,py+d,(L.pz+185)/2],[40,8,185-L.pz+24],'#91a58e','bogie');annulus([L.px,py+d,L.pz],20,10,8,'y','#d6dfca','bogie',20);bolt([L.px,py+d,184],'z','bogie',8);}
 }}
