'use strict';
// Persistent GPU buffers. Model coordinates remain millimetres, +Z up.
class GPUViewport {
 constructor(canvas){
  this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:true,premultipliedAlpha:false});
  if(!this.gl)throw new Error('WebGL2 unavailable');
  const g=this.gl;
  const compile=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(s));return s;};
  const vertex=`#version 300 es
  precision highp float;
  in vec3 position;in vec4 color;in float part;
  uniform vec2 angle;uniform vec2 center;uniform vec2 viewport;uniform float scale;
  out vec4 shade;flat out float partId;
  void main(){float u=position.x*cos(angle.x)-position.y*sin(angle.x);float w=position.x*sin(angle.x)+position.y*cos(angle.x);float v=w*sin(angle.y)-position.z*cos(angle.y);float d=w*cos(angle.y)+position.z*sin(angle.y);
   gl_Position=vec4(-2.0*(u-center.x)*scale/viewport.x,-2.0*(v-center.y)*scale/viewport.y-0.02,-d/10000.0,1.0);shade=color;partId=part;}`;
  const fragment=`#version 300 es
  precision highp float;in vec4 shade;flat in float partId;uniform float selected;uniform bool edges;out vec4 pixel;
  void main(){if(edges){bool hit=abs(partId-selected)<0.1;pixel=partId<0.5?shade:(hit?vec4(0.84,0.92,0.74,0.85):vec4(0.06,0.11,0.08,0.30));}else pixel=shade;}`;
  this.program=g.createProgram();const vs=compile(g.VERTEX_SHADER,vertex),fs=compile(g.FRAGMENT_SHADER,fragment);g.attachShader(this.program,vs);g.attachShader(this.program,fs);g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(this.program));g.deleteShader(vs);g.deleteShader(fs);
  this.uniforms=Object.fromEntries(['angle','center','viewport','scale','selected','edges'].map(n=>[n,g.getUniformLocation(this.program,n)]));
  this.parts=new Map();this.faces=[];this.uploads=0;this.frames=0;this.lost=false;
  this.solid=this.buffer();this.lines=this.buffer();this.transparent=this.buffer();
  g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;canvas.dispatchEvent(new Event('renderer-lost'));});
 }
 buffer(){const g=this.gl,b={vao:g.createVertexArray(),buffer:g.createBuffer(),count:0};g.bindVertexArray(b.vao);g.bindBuffer(g.ARRAY_BUFFER,b.buffer);for(const[name,size,offset]of[['position',3,0],['color',4,12],['part',1,28]]){const a=g.getAttribLocation(this.program,name);g.enableVertexAttribArray(a);g.vertexAttribPointer(a,size,g.FLOAT,false,32,offset);}return b;}
 upload(buffer,values,dynamic=false){const g=this.gl;g.bindBuffer(g.ARRAY_BUFFER,buffer.buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array(values),dynamic?g.DYNAMIC_DRAW:g.STATIC_DRAW);buffer.count=values.length/8;}
 part(id){if(!this.parts.has(id))this.parts.set(id,this.parts.size+1);return this.parts.get(id);}
 rgba(f){const rgb=f.color.match(/[\d.]+/g).map(Number);return[rgb[0]/255,rgb[1]/255,rgb[2]/255,f.alpha];}
 triangles(f,out){const c=this.rgba(f),id=this.part(f.id);for(let i=1;i<f.verts.length-1;i++)for(const p of[f.verts[0],f.verts[i],f.verts[i+1]])out.push(...p,...c,id);}
 setGeometry(faces){this.faces=faces;this.parts.clear();const opaque=[],edges=[];this.translucent=[];
  for(const f of faces){if(f.alpha<0.999)this.translucent.push(f);else this.triangles(f,opaque);const c=this.rgba(f),id=this.part(f.id);for(let i=0;i<f.verts.length;i++)for(const p of[f.verts[i],f.verts[(i+1)%f.verts.length]])edges.push(...p,...c,id);}
  // The grid belongs to the depth-tested world, below the robot.
  for(let i=-700;i<=700;i+=100)for(const pair of[[[i,-700,-1],[i,700,-1]],[[-700,i,-1],[700,i,-1]]])for(const p of pair)edges.push(...p,0.17,0.23,0.17,1,0);
  this.upload(this.solid,opaque);this.upload(this.lines,edges);this.lastTransparentView='';this.uploads++;
 }
 render({width,height,dpr,yaw,elevation,center,scale,selected}){if(this.lost)throw new Error('WebGL context lost');const g=this.gl,w=Math.round(width*dpr),h=Math.round(height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}g.viewport(0,0,w,h);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);const u=this.uniforms;g.uniform2f(u.angle,yaw,elevation);g.uniform2f(u.center,...center);g.uniform2f(u.viewport,width,height);g.uniform1f(u.scale,scale);g.uniform1f(u.selected,this.parts.get(selected)||-1);
  const draw=(b,mode,edge)=>{g.uniform1i(u.edges,edge?1:0);g.bindVertexArray(b.vao);g.drawArrays(mode,0,b.count);};
  g.depthMask(true);g.enable(g.POLYGON_OFFSET_FILL);g.polygonOffset(1,1);draw(this.solid,g.TRIANGLES,false);g.disable(g.POLYGON_OFFSET_FILL);
  const key=yaw+':'+elevation;if(key!==this.lastTransparentView){const values=[],depth=f=>f.verts.reduce((sum,p)=>sum+(p[0]*Math.sin(yaw)+p[1]*Math.cos(yaw))*Math.cos(elevation)+p[2]*Math.sin(elevation),0)/f.verts.length;this.translucent.sort((a,b)=>depth(a)-depth(b));for(const f of this.translucent)this.triangles(f,values);this.upload(this.transparent,values,true);this.lastTransparentView=key;}
  g.depthMask(false);draw(this.transparent,g.TRIANGLES,false);draw(this.lines,g.LINES,true);g.depthMask(true);this.frames++;
 }
 pick(point,project,allowed){let best=null;for(const f of this.faces){if(!allowed.has(f.id))continue;const ps=f.verts.map(project);if(!GPUViewport.inside(point,ps))continue;const depth=ps.reduce((s,p)=>s+p.depth,0)/ps.length;if(!best||depth>best.depth)best={id:f.id,depth};}return best?.id;}
 static inside(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c;}return c;}
}
