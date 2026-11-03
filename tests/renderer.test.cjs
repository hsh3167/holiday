const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
let uploads=0;const gl=new Proxy({createShader:()=>({}),createProgram:()=>({}),createVertexArray:()=>({}),createBuffer:()=>({}),getShaderParameter:()=>true,getProgramParameter:()=>true,getAttribLocation:()=>0,getUniformLocation:()=>({}),bufferData:()=>uploads++},{get:(o,k)=>k in o?o[k]:k===k.toUpperCase()?1:()=>{}});
const noop=()=>{},gradient={addColorStop:noop},ctx=new Proxy({createRadialGradient:()=>gradient},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
const elements=new Map(),raf=[];
function element(id=''){const el={id,value:({mass:135,slope:3,accel:.4}[id]||0),min:0,max:1000,checked:true,clientWidth:960,clientHeight:500,width:0,height:0,textContent:'',style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,dispatchEvent:noop,setAttribute:noop,append:noop,before:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0}),getContext:type=>type==='2d'?ctx:gl};el.querySelector=()=>element();el.parentElement={append:noop};return el;}
const document={addEventListener:noop,getElementById:id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},querySelectorAll:()=>[],createElement:()=>element()};
const c={console,Math,performance,document,localStorage:{getItem:()=>null,setItem:noop},ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},requestAnimationFrame:f=>raf.push(f),setTimeout:()=>1,clearTimeout:noop,Event:class{},URL:{},Blob:class{}};c.window=c;c.devicePixelRatio=1;vm.createContext(c);
const run=code=>vm.runInContext(code,c),json=code=>JSON.parse(run('JSON.stringify('+code+')'));
for(const f of['mechanism','belt-design','belt-geometry','hand-design','upper-body','hand-geometry','arm-analysis','battery-design','camera-design','camera-geometry','ride-design','ride-geometry','gpu-viewer','app'])run(fs.readFileSync('dist/'+f+'.js','utf8'));
function flush(){while(raf.length)raf.shift()();}
flush();assert.equal(run('!!gpu'),true);assert.equal(json('viewerStats').geometryBuilds,1);
const before=uploads;run('for(let i=0;i<20;i++)draw()');assert.equal(raf.length,1,'requests coalesce into one frame');flush();assert.equal(uploads,before,'idle view reuses all GPU buffers');
for(let i=0;i<60;i++){run('yaw+=0.01;draw()');flush();}assert.equal(json('viewerStats').geometryBuilds,1,'rotation must not rebuild model');assert.equal(run('gpu.uploads'),1);
for(const scope of['base','waist','upper','hand','full']){run(`mechanism.scope='${scope}';draw()`);flush();assert.ok(run('faces.length')>0);assert.ok(run('sceneCache.corners.flat().every(Number.isFinite)'));assert.ok(run('gpu.solid.count')>0);}
run('cameraDesign.yaw+=1;draw()');flush();const builds=run('viewerStats.geometryBuilds');run("selected='camera';draw()");flush();assert.equal(run('viewerStats.geometryBuilds'),builds,'selection only changes uniforms');
run('params.W+=10;draw()');flush();assert.equal(run('viewerStats.geometryBuilds'),builds+1,'dimensions invalidate cache');
for(const change of['mechanism.angles[0]+=1','upperBody.left[0]+=1','batteryDesign.lift+=10','rideDesign.terrain[2]+=1']){const n=run('viewerStats.geometryBuilds');run(change+';draw()');flush();assert.equal(run('viewerStats.geometryBuilds'),n+1,'pose/support invalidation: '+change);}
for(const q of['speed','auto','high']){run(`quality='${q}';draw()`);flush();assert.ok(run('canvas.width*canvas.height')<=6000001);}
// Independently compare shader clip-to-pixel projection with overlay coordinates.
for(const yaw of[0,.95,1.7])for(const elevation of[.03,.48,Math.PI/2])for(const p of[[0,0,0],[325,300,1760],[-320,-240,100]]){
 run(`yaw=${yaw};elevation=${elevation};renderFrame()`);const actual=json(`project(${JSON.stringify(p)})`),center=json('projectionCenter'),scale=run('scale'),w=run('cw'),h=run('ch');
 const u=p[0]*Math.cos(yaw)-p[1]*Math.sin(yaw),depth=p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw),v=depth*Math.sin(elevation)-p[2]*Math.cos(elevation),clip=[-2*(u-center[0])*scale/w,-2*(v-center[1])*scale/h-.02];
 assert.ok(Math.abs(actual.x-(clip[0]+1)*w/2)<1e-8);assert.ok(Math.abs(actual.y-(1-clip[1])*h/2)<1e-8);
}
assert.equal(run('GPUViewport.inside({x:1,y:1},[{x:0,y:0},{x:3,y:0},{x:0,y:3}])'),true);
// Exercise CPU fallback with the same cached geometry and all annotations.
run('gpu=null;draw()');flush();assert.ok(run('picks.length')>0);console.log('PASS: all scopes, pose invalidation, coalesced frames, persistent buffers, 27 shader/overlay projection pairs and Canvas fallback');console.log(JSON.stringify(json('viewerStats')));
