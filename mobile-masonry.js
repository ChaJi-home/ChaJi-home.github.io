/* Mobile waterfall: consume saved mobile order (DOM order by default), filling the next available slot.
   Shared by public pages and the editor iframe; never rewrites saved content. */
(() => {
  'use strict';
  function orderedCards(grid) {
    return [...grid.children].map((card,index)=>({card,rank:card.style.getPropertyValue('--mobile-order').trim(),index}))
      .sort((a,b)=>(a.rank===''?1e6+a.index:Number(a.rank))-(b.rank===''?1e6+b.index:Number(b.rank))).map(item=>item.card);
  }
  function saveOrder(cards) { cards.forEach((card,index)=>card.style.setProperty('--mobile-order',String(index))); }
  function mount(doc) {
    const win = doc.defaultView;
    if (!win || !win.matchMedia) return () => {};
    const grids = [...doc.querySelectorAll('.featured-masonry,.collection-grid')];
    if (!grids.length) return () => {};
    const mobile = win.matchMedia('(max-width:680px)');
    const observed = new Set();
    let pending = 0, stopped = false;
    const set = (el, name, value) => {
      if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
    };
    function clear(grid) {
      grid.classList.remove('mobile-waterfall');
      grid.style.removeProperty('--waterfall-height');
      grid.style.removeProperty('--waterfall-width');
      for (const card of grid.children) {
        card.style.removeProperty('--waterfall-x');
        card.style.removeProperty('--waterfall-y');
      }
    }
    function layout() {
      pending = 0;
      for (const grid of grids) {
        if (!mobile.matches) { clear(grid); continue; }
        const width = grid.clientWidth;
        if (!width) continue;
        const style = win.getComputedStyle(grid);
        const columns = Math.max(1, Math.min(3, parseInt(style.getPropertyValue('--editor-mobile-columns')) || 2));
        const requestedGap = parseFloat(style.getPropertyValue('--editor-gap'));
        const gap = Math.max(0, Math.min(12, Number.isFinite(requestedGap) ? requestedGap : 24));
        set(grid, '--waterfall-width', `${(width - gap * (columns - 1)) / columns}px`);
        grid.classList.add('mobile-waterfall');
        const heights = Array(columns).fill(0);
        for (const card of orderedCards(grid)) {
          if (resize && !observed.has(card)) { resize.observe(card); observed.add(card); }
          if (card.hidden || win.getComputedStyle(card).display === 'none') continue;
          // A left-hand tie gives the first row the first N saved works.
          // Shortest-column placement keeps subsequent tops in reading order.
          let column = 0;
          for (let i = 1; i < columns; i++) if (heights[i] < heights[column] - 0.5) column = i;
          set(card, '--waterfall-x', `${column * (width + gap) / columns}px`);
          set(card, '--waterfall-y', `${heights[column]}px`);
          heights[column] += card.getBoundingClientRect().height + 16;
        }
        set(grid, '--waterfall-height', `${Math.max(0, ...heights) > 0 ? Math.max(...heights) - 16 : 0}px`);
      }
    }
    function schedule() {
      if (!stopped && !pending) pending = win.requestAnimationFrame(layout);
    }
    const resize = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
    const mutations = new win.MutationObserver(schedule);
    for (const grid of grids) {
      resize?.observe(grid);
      // Our position styles are intentionally excluded to avoid observer loops.
      mutations.observe(grid, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['hidden','class']});
      grid.addEventListener('load', schedule, true);
      grid.addEventListener('error', schedule, true);
    }
    win.addEventListener('resize', schedule);
    doc.fonts?.ready.then(schedule);
    layout();
    return () => {
      stopped = true;
      win.cancelAnimationFrame(pending);
      resize?.disconnect(); mutations.disconnect();
      win.removeEventListener('resize', schedule);
      for (const grid of grids) {
        grid.removeEventListener('load', schedule, true);
        grid.removeEventListener('error', schedule, true);
        clear(grid);
      }
    };
  }
  window.PortfolioMasonry = {mount, orderedCards, saveOrder};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(document), {once:true});
  else mount(document);
})();
