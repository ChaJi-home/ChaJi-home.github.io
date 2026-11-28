'use strict';
(() => {
 const svg=document.getElementById('feather-param-preview');if(!svg)return;
 const controls=['barb-count','barb-span','barb-sweep'].map(id=>document.getElementById(id));
 function draw(){
  const [count,span,sweep]=controls.map(el=>Number(el.value));
  controls.forEach(el=>document.querySelector(`output[for="${el.id}"]`).textContent=el.value);
  const ns='http://www.w3.org/2000/svg';svg.replaceChildren();
  function line(points,shaft=false){const p=document.createElementNS(ns,'polyline');p.setAttribute('points',points.map(v=>v.join(',')).join(' '));p.setAttribute('fill','none');p.setAttribute('stroke',shaft?'#d4e6b2':'#c7d0c0');p.setAttribute('stroke-width',shaft?'2':'0.8');p.setAttribute('opacity',shaft?'1':'.75');svg.append(p);}
  line([[200,385],[200,25]],true);
  for(let i=0;i<count;i++){
   const t=.05+.92*i/(count-1),width=span*Math.pow(Math.sin(Math.PI*t),.72);
   for(const side of [-1,1]){const pts=[];for(let j=0;j<=16;j++){const u=j/16;pts.push([200+side*width*u,385-360*t-sweep*width*Math.pow(u,1.35)]);}line(pts);}
  }
 }
 controls.forEach(el=>el.addEventListener('input',draw));draw();
})();
