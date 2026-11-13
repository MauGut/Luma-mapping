const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../dist/core.js');
test('homografía reproduce las cuatro esquinas y mantiene rectas',()=>{
 const q=[{x:.1,y:.2},{x:.8,y:.1},{x:.9,y:.9},{x:.2,y:.7}],p=C.projective(q);
 [[0,0],[1,0],[1,1],[0,1]].forEach(([u,v],i)=>{assert.ok(Math.hypot(p(u,v).x-q[i].x,p(u,v).y-q[i].y)<1e-8);});
 const a=p(0,.5),b=p(.5,.5),c=p(1,.5);assert.ok(Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))<1e-8);
});
test('rechaza cuadriláteros cruzados y degenerados',()=>{
 assert.equal(C.validQuad([{x:0,y:0},{x:1,y:1},{x:1,y:0},{x:0,y:1}]),false);
 assert.equal(C.validQuad([{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:0,y:1}]),false);
 assert.equal(C.validQuad([{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]),true);
});
test('silueta aísla un rectángulo sin absorber el fondo',()=>{
 const w=40,h=30,data=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;data[i+3]=255;if(x>=8&&x<30&&y>=5&&y<25){data[i]=200;data[i+1]=100;}else data[i+2]=255;}
 const p=C.traceRegion(data,w,h,15,15,40);assert.equal(p.length,4);assert.equal(Math.min(...p.map(v=>v.x)),.2);assert.equal(Math.max(...p.map(v=>v.x)),.75);assert.equal(Math.min(...p.map(v=>v.y)),5/30);assert.equal(Math.max(...p.map(v=>v.y)),25/30);
});
test('silueta preserva concavidades y no selecciona transparencia',()=>{
 const w=40,h=40,data=new Uint8ClampedArray(w*h*4);for(let y=4;y<35;y++)for(let x=4;x<35;x++){if(x>12&&y<25)continue;const i=(y*w+x)*4;data[i]=255;data[i+3]=255;}
 assert.equal(C.traceRegion(data,w,h,38,38,40).length,0);const p=C.traceRegion(data,w,h,8,8,40);assert.ok(p.length>=6);assert.ok(p.some(v=>v.x>.3&&v.x<.4&&v.y>.5));
});
const fixture=()=>({format:'luma-workshop',version:1,name:'Prueba',media:[],photo:null,scenes:[],surfaces:[{id:'a',name:'A',media:'aurora',points:[{x:0,y:0},{x:1,y:0},{x:1,y:1}],holes:[],opacity:1,brightness:1,saturation:1,hue:0,blend:'source-over',visible:true}]});
test('proyecto guarda y recupera geometría, curvas y huecos',()=>{const p=fixture();p.surfaces[0].points[0].out={x:.2,y:0};p.surfaces[0].holes=[[{x:.2,y:.2},{x:.4,y:.2},{x:.4,y:.4}]];assert.deepEqual(C.validateProject(JSON.parse(JSON.stringify(p))),p);});
test('importación rechaza referencias perdidas, coordenadas inválidas y medios remotos',()=>{let p=fixture();p.surfaces[0].media='missing';assert.throws(()=>C.validateProject(p));p=fixture();p.surfaces[0].points[0].x=NaN;assert.throws(()=>C.validateProject(p));p=fixture();p.media=[{id:'bad',name:'bad',type:'image',data:'https://example.com/file.png'}];assert.throws(()=>C.validateProject(p));});
test('proyecto y escenas conservan colores independientes junto a fuentes de video',()=>{
 const p=fixture();p.surfaces[0].media='solid';p.surfaces[0].solidColor='#FF8040';
 const second=structuredClone(p.surfaces[0]);second.id='b';second.solidColor='#40c0ff';p.surfaces.push(second);
 p.scenes=[{id:'scene',name:'Colores',surfaces:structuredClone(p.surfaces)}];
 p.surfaces[0].media='aurora';
 const loaded=C.validateProject(JSON.parse(JSON.stringify(p)));
 assert.equal(loaded.surfaces[0].media,'aurora');assert.equal(loaded.surfaces[0].solidColor,'#FF8040');
 assert.equal(loaded.surfaces[1].solidColor,'#40c0ff');assert.equal(loaded.scenes[0].surfaces[0].media,'solid');
 assert.equal(loaded.media.length,0);
});
test('sólidos requieren un color hex válido también dentro de escenas',()=>{
 for(const value of [undefined,null,123,'red','#fff','#fffffff','#12GG00','url(https://example.com)']){
  const p=fixture();p.surfaces[0].media='solid';p.surfaces[0].solidColor=value;
  assert.throws(()=>C.validateProject(p));
  const sceneProject=fixture();sceneProject.scenes=[{id:'s',name:'Color inválido',surfaces:p.surfaces}];
  assert.throws(()=>C.validateProject(sceneProject));
 }
});
test('proyectos previos sin color siguen siendo válidos y solid es un id reservado',()=>{
 const p=fixture();assert.deepEqual(C.validateProject(p),p);
 p.media.push({id:'solid',name:'Conflicto',type:'image',data:'data:image/png;base64,AAAA'});
 assert.throws(()=>C.validateProject(p));
});
