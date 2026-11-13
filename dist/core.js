(function(root){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function projective(q){
    const [a,b,c,d]=q, dx1=b.x-c.x,dx2=d.x-c.x,dx3=a.x-b.x+c.x-d.x,dy1=b.y-c.y,dy2=d.y-c.y,dy3=a.y-b.y+c.y-d.y;
    const det=dx1*dy2-dx2*dy1;
    let g=0,h=0;
    if(Math.abs(dx3)+Math.abs(dy3)>1e-9&&Math.abs(det)>1e-9){g=(dx3*dy2-dx2*dy3)/det;h=(dx1*dy3-dx3*dy1)/det;}
    return (u,v)=>{const z=g*u+h*v+1;return {x:((b.x-a.x+g*b.x)*u+(d.x-a.x+h*d.x)*v+a.x)/z,y:((b.y-a.y+g*b.y)*u+(d.y-a.y+h*d.y)*v+a.y)/z};};
  }
  function validQuad(q){if(q.length!==4)return false;let sign=0;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],c=q[(i+2)%4],cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);if(Math.abs(cross)<1e-7)return false;if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);}return true;}
  function distSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
  function simplify(points,eps){if(points.length<=2)return points;let max=0,index=0;for(let i=1;i<points.length-1;i++){const d=distSegment(points[i],points[0],points.at(-1));if(d>max){max=d;index=i;}}return max>eps?[...simplify(points.slice(0,index+1),eps).slice(0,-1),...simplify(points.slice(index),eps)]:[points[0],points.at(-1)];}
  function traceRegion(data,w,h,sx,sy,tolerance){
    sx=clamp(Math.floor(sx),0,w-1);sy=clamp(Math.floor(sy),0,h-1);const start=sy*w+sx,ref=start*4;if(data[ref+3]<10)return [];
    const visited=new Uint8Array(w*h),mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=1;queue[0]=start;visited[start]=1;
    while(head<tail){const i=queue[head++],j=i*4;if(data[j+3]<10||Math.hypot(data[j]-data[ref],data[j+1]-data[ref+1],data[j+2]-data[ref+2])>tolerance)continue;mask[i]=1;const x=i%w,y=(i/w)|0;for(const n of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1])if(n>=0&&!visited[n]){visited[n]=1;queue[tail++]=n;}}
    const edges=new Map(),key=(x,y)=>y*(w+1)+x,add=(x1,y1,x2,y2)=>{const a=key(x1,y1),b=key(x2,y2);if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;if(y===0||!mask[i-w])add(x,y,x+1,y);if(x===w-1||!mask[i+1])add(x+1,y,x+1,y+1);if(y===h-1||!mask[i+w])add(x+1,y+1,x,y+1);if(x===0||!mask[i-1])add(x,y+1,x,y);}
    let longest=[];while(edges.size){const first=edges.keys().next().value;let current=first;const loop=[];let budget=w*h*4;while(budget-->0){loop.push({x:current%(w+1),y:Math.floor(current/(w+1))});const ns=edges.get(current);if(!ns)break;const next=ns.pop();if(!ns.length)edges.delete(current);current=next;if(current===first)break;}if(loop.length>longest.length)longest=loop;}
    if(longest.length<4)return [];const half=Math.floor(longest.length/2);let result=[...simplify(longest.slice(0,half+1),1.5).slice(0,-1),...simplify([...longest.slice(half),longest[0]],1.5).slice(0,-1)];if(result.length>220){const stride=Math.ceil(result.length/220);result=result.filter((_,i)=>i%stride===0);}return result.map(p=>({x:p.x/w,y:p.y/h}));
  }
  function validateProject(p){
    const fail=()=>{throw new Error('El archivo no es un proyecto Luma válido.');};
    if(!p||p.format!=='luma-workshop'||p.version!==1||typeof p.name!=='string'||!Array.isArray(p.surfaces)||p.surfaces.length>100||!Array.isArray(p.media)||p.media.length>80||!Array.isArray(p.scenes)||p.scenes.length>50)fail();
    const point=a=>{if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y)||Math.abs(a.x)>10||Math.abs(a.y)>10)fail();for(const k of ['in','out'])if(a[k]&&(!Number.isFinite(a[k].x)||!Number.isFinite(a[k].y)||Math.abs(a[k].x)>10||Math.abs(a[k].y)>10))fail();};
    const mediaIds=new Set(['aurora','rays','grid']);
    for(const m of p.media){if(typeof m.id!=='string'||mediaIds.has(m.id)||typeof m.name!=='string'||!['image','video'].includes(m.type)||typeof m.data!=='string'||!/^data:(image\/(png|jpeg|webp)|video\/[a-zA-Z0-9.+-]+);base64,/.test(m.data)||m.data.length>60000000)fail();mediaIds.add(m.id);}
    const surfaces=ss=>{if(!Array.isArray(ss)||ss.length>100)fail();const ids=new Set();for(const s of ss){if(!s||typeof s.id!=='string'||ids.has(s.id)||typeof s.name!=='string'||!mediaIds.has(s.media)||!Array.isArray(s.points)||s.points.length<3||s.points.length>500||!Array.isArray(s.holes)||s.holes.length>50)fail();ids.add(s.id);s.points.forEach(point);s.holes.forEach(h=>{if(!Array.isArray(h)||h.length<3||h.length>500)fail();h.forEach(point);});for(const [key,min,max] of [['opacity',0,1],['brightness',0,2],['saturation',0,2],['hue',0,360]])if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)fail();if(!['source-over','screen','multiply','lighter'].includes(s.blend))fail();}};
    surfaces(p.surfaces);for(const s of p.scenes){if(typeof s.id!=='string'||typeof s.name!=='string')fail();surfaces(s.surfaces);}
    if(p.photo){if(typeof p.photo.data!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(p.photo.data)||p.photo.data.length>60000000||!Array.isArray(p.photo.quad)||!validQuad(p.photo.quad)||!Number.isFinite(p.photo.opacity)||p.photo.opacity<0||p.photo.opacity>1)fail();p.photo.quad.forEach(point);}
    return p;
  }
  const api={clamp,projective,validQuad,distSegment,traceRegion,validateProject};root.LumaCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
