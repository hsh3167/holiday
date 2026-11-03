(()=>{
 const names=['어깨 피치 Y','어깨 롤 X','상완 회전 Z','팔꿈치 Y','전완 회전 Z','손목 피치 Y','손목 롤 X'],ranges=[[-120,80],[-140,140],[-150,150],[-135,40],[-160,160],[-100,100],[-90,90]],presets={neutral:{left:[-3,8,0,-12,0,15,0],right:[-3,-8,0,-12,0,15,0],head:[0,0]},reach:{left:[-65,10,0,-30,0,5,0],right:[-65,-10,0,-30,0,5,0],head:[0,10]},carry:{left:[-35,15,10,-70,-10,15,0],right:[-35,-15,-10,-70,10,15,0],head:[0,8]},raise:{left:[-10,125,0,-45,0,30,0],right:[-3,-8,0,-12,0,15,0],head:[-20,0]}};
 for(const side of['left','right'])$('arm-'+side+'-controls').innerHTML=names.map((name,i)=>`<label>A${i+1} ${name}<output id="arm-${side}-${i}-out"></output><input id="arm-${side}-${i}" type="range" min="${ranges[i][0]}" max="${ranges[i][1]}" step="1" value="${upperBody[side][i]}"></label>`).join('');
 const coord=p=>p.map(n=>n.toFixed(0)).join(', ');
 window.renderUpperReview=()=>{for(const side of['left','right'])for(let i=0;i<7;i++){$(`arm-${side}-${i}`).value=upperBody[side][i];$(`arm-${side}-${i}-out`).textContent=upperBody[side][i]+'°';}for(const[id,v]of[['neck-yaw',upperBody.head[0]],['neck-pitch',upperBody.head[1]],['hand-grip',Math.round(upperBody.grip*100)]]){$(id).value=v;$(id+'-out').textContent=v+(id==='hand-grip'?'%':'°');}$('upper-covers').checked=upperBody.covers;$('upper-axes').checked=upperBody.axes;$('upper-service').checked=upperBody.service;
 const f=upperFrames();$('head-top').textContent=headTopZ(f.head).toFixed(0)+' mm';$('hand-left-position').textContent=coord(mPoint(f.left.tool,[0,0,0]));$('hand-right-position').textContent=coord(mPoint(f.right.tool,[0,0,0]));$('upper-cg-position').textContent=coord(upperMassCenter(f.tip));
 $('arm-register').innerHTML=[['L',f.left,upperBody.left],['R',f.right,upperBody.right]].flatMap(([label,a,angles])=>a.before.map((m,i)=>`<tr><td>${label} A${i+1}</td><td>${names[i]}</td><td>${angles[i]}°</td><td>${coord(mPoint(m,[0,0,0]))}</td></tr>`)).join('');
 document.querySelectorAll('[data-upper-pose]').forEach(b=>{const p=presets[b.dataset.upperPose],on=['left','right','head'].every(key=>p[key].every((v,i)=>upperBody[key][i]===v));b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});if(window.renderArmReview)window.renderArmReview();if(window.renderHandReview)window.renderHandReview();
 };
 function refresh(){window.renderMechanismReview();inspector();draw();}
 for(const side of['left','right'])for(let i=0;i<7;i++)$(`arm-${side}-${i}`).addEventListener('input',()=>{upperBody[side][i]=+$(`arm-${side}-${i}`).value;refresh();});
 for(const[id,index]of[['neck-yaw',0],['neck-pitch',1]])$(id).addEventListener('input',()=>{upperBody.head[index]=+$(id).value;refresh();});
 $('hand-grip').addEventListener('input',()=>{upperBody.grip=+$('hand-grip').value/100;applyHandGrip(upperBody.grip);refresh();});
 for(const[id,key]of[['upper-covers','covers'],['upper-axes','axes'],['upper-service','service']])$(id).addEventListener('change',()=>{upperBody[key]=$(id).checked;draw();});
 document.querySelectorAll('[data-upper-pose]').forEach(b=>b.addEventListener('click',()=>{const p=presets[b.dataset.upperPose];for(const k of['left','right','head'])upperBody[k]=[...p[k]];refresh();}));
 window.renderMechanismReview();select('torso');
})();
