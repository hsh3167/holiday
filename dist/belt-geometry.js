'use strict';
function buildBeltStage(){if(!beltDesign.enabled)return;const c=beltDesign,a=beltAnalysis(),id='belt',q=mechanism.angles[4];
 // Fixed yaw bearing support; output table and lower pitch yoke rotate above it.
 annulus([0,0,c.z-18],99,60,14,'z','#7b8982',id,48);annulus([0,0,c.z+20],100,60,12,'z','#b8c5b6',id,48);
 for(const p of a.circles){withTransform(mTrans(p.x,p.y,c.z),()=>{const angle=q*(p.id==='output'?1:c.outputTeeth/p.teeth);withTransform(mRot('z',angle),()=>{annulus([0,0,0],p.r-.6,p.id==='output'?60:15,c.width,'z','#6c7770',id,48);for(const side of[-1,1])annulus([0,0,side*(c.width/2+1.5)],p.r+2,p.id==='output'?60:15,2,'z','#aeb8ae',id,48);for(let i=0;i<p.teeth;i++)withTransform(mRot('z',i*360/p.teeth),()=>box([p.r,0,0],[1.7,c.pitch*.46,c.width],'#414c45',id));if(mechanism.details)boltCircle([0,0,c.width/2+4],p.r*.7,'z',id,p.id==='output'?8:4,4);});if(p.id!=='output'){cylinder([0,0,-30],15,80,'z','#a6b2a8',id);for(const z of[-15,-55])annulus([0,0,z],31,15,16,'z','#859788',id,24);box([0,0,-29],[72,72,10],'#a7b6a4',id);for(const y of[-26,26])for(const x of[-23,23])bolt([x,y,-22],'z',id,5);}});}
 // Slot direction and paired clamp screws are reservation geometry, not released machining.
 const idler=a.circles[2];for(const y of[-25,25])box([idler.x,idler.y+y,c.z-22],[24,5,3],'#35483d',id);
 cylinder([c.centerX,-c.centerY,c.z-115],24,60,'z','#4a6959',id);box([c.centerX,-c.centerY,c.z-158],[56,56,18],'#7d927f',id);
 for(let i=0;i<a.path.length;i++){const p=a.path[i],n=a.path[(i+1)%a.path.length];beamBetween([...p,c.z],[...n,c.z],2.4,c.width,'#252c29',id);}
 if(c.cover)box([63,0,c.z+31],[350,224,5],'#aebfa7',id,.25);
}
