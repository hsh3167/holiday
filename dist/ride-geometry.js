'use strict';
function buildRideCaster(index,id){const state=rideCasterState(index),front=index!==4,r=front?37.5:32.5,trail=front?20:16,spindle=[front?params.L/2-70:-params.L/2+54,front?(index===2?1:-1)*(params.W/2-80):0],d=state.delta;
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
 ctx.textAlign='left';ctx.fillStyle='#b0c49e';ctx.font='10px monospace';ctx.fillText('독립 수직현가 가설 / 차체 고정 표시 · 평지 대비 현가 변위',20,ch-69);
}
