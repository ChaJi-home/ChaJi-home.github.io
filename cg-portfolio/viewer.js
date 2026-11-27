const viewer = document.querySelector('dialog');
const media = document.querySelector('#media');
const title = document.querySelector('#viewer-title');
const controls = document.querySelector('#controls');
const shots = Array.from(document.querySelectorAll('.shot'));
let visibleShots = shots;
let current = 0;
function showImage(index) {
  current = (index + visibleShots.length) % visibleShots.length;
  const shot = visibleShots[current];
  const image = new Image();
  image.src = shot.dataset.image;
  image.alt = title.textContent = shot.dataset.title;
  media.replaceChildren(image);
  controls.children[1].textContent = (current + 1) + ' / ' + visibleShots.length;
}
if (shots.length) {
  controls.innerHTML = '<button>← 上一张</button><span></span><button>下一张 →</button>';
  controls.firstElementChild.onclick = () => showImage(current - 1);
  controls.lastElementChild.onclick = () => showImage(current + 1);
  shots.forEach(shot => shot.onclick = () => {
    visibleShots = shots.filter(item => !item.closest('[hidden],.editor-hidden'));
    showImage(visibleShots.indexOf(shot)); viewer.showModal();
  });
  viewer.onkeydown = event => {
    if (event.key === 'ArrowLeft') showImage(current - 1);
    if (event.key === 'ArrowRight') showImage(current + 1);
  };
}
document.querySelector('#close').onclick = () => viewer.close();
viewer.onclose = () => media.replaceChildren();
