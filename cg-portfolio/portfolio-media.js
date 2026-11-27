'use strict';
document.addEventListener('click', async event => {
 const cover=event.target.closest('.cover-play');
 if(cover){
  if(cover.disabled||!cover.dataset.src)return;
  const frame=document.createElement('iframe');frame.title=cover.dataset.title||'B 站视频';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;
  frame.src=cover.dataset.src.replace('autoplay=0','autoplay=1');document.querySelectorAll('video').forEach(v=>v.pause());cover.replaceWith(frame);return;
 }
 const button=event.target.closest('.local-play');if(!button)return;
 const video=button.parentElement.querySelector('video'),error=button.closest('.clip-card')?.querySelector('.play-error');if(!video)return;
 button.hidden=true;if(error)error.hidden=true;
 try{await video.play();}catch{button.hidden=false;if(error)error.hidden=false;}
});
document.querySelectorAll('video').forEach(video=>{
 const button=video.parentElement.querySelector('.local-play'),error=video.closest('.clip-card')?.querySelector('.play-error');
 video.addEventListener('play',()=>{if(button)button.hidden=true;if(error)error.hidden=true;document.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause();});});
 video.addEventListener('ended',()=>{if(button)button.hidden=false;});
 video.addEventListener('error',()=>{if(button)button.hidden=false;if(error)error.hidden=false;});
});
// Editing stays local; this entry is not shown on the public site.
if(location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname)){
 const footer=document.querySelector('footer .wrap');if(footer){const link=document.createElement('a');link.href='editor.html';link.textContent='编辑本地网站 ↗';footer.append(link);}
}
// Open the retained Bilibili examples when following a deep link from a concept page.
function revealTarget(){if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));const details=target?.closest('details');if(details){details.open=true;target.scrollIntoView();}}}
window.addEventListener('hashchange',revealTarget);revealTarget();
