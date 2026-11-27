'use strict';
(() => {
 const toolbar=document.querySelector('[data-work-filters]');if(!toolbar)return;
 const buttons=[...toolbar.querySelectorAll('[data-kind]')],select=document.querySelector('#series-filter');
 const sections=[...document.querySelectorAll('.work-series')],counter=document.querySelector('#work-count'),empty=document.querySelector('#empty-works');
 const params=new URLSearchParams(location.search);let kind=['image','video'].includes(params.get('type'))?params.get('type'):'all';
 if([...select.options].some(o=>o.value===params.get('series')))select.value=params.get('series');
 function filter(){
  let total=0;
  for(const section of sections){
   let visible=0;
   for(const card of section.querySelector('.collection-grid').children){
    const type=card.matches('.clip-card')?'video':'image';
    const show=!card.classList.contains('editor-hidden')&&(select.value==='all'||select.value===section.dataset.series)&&(kind==='all'||kind===type);
    card.hidden=!show;if(show)visible++;else card.querySelectorAll('video').forEach(v=>v.pause());
   }
   section.hidden=visible===0;total+=visible;
  }
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
  counter.textContent=`${total} 件作品`;empty.hidden=total!==0;
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;filter();}));
 select.addEventListener('change',filter);
 document.querySelector('#reset-filters').addEventListener('click',()=>{kind='all';select.value='all';filter();});
 toolbar.hidden=false;filter();
})();
