/* Sequential waterfall: desktop homepage and mobile galleries share the same placement engine.
   Shared by public pages and the editor iframe; never rewrites saved content. */
(() => {
  'use strict';
  function orderedCards(grid, mode = 'mobile') {
    if (mode === 'desktop') return [...grid.children];
    const property = mode === 'tablet' ? '--tablet-order' : '--mobile-order';
    return [...grid.children].map((card,index)=>({card,rank:card.style.getPropertyValue(property).trim(),index}))
      .sort((a,b)=>(a.rank===''?1e6+a.index:Number(a.rank))-(b.rank===''?1e6+b.index:Number(b.rank))).map(item=>item.card);
  }
  function saveOrder(cards, mode = 'mobile') { const property = mode === 'tablet' ? '--tablet-order' : '--mobile-order'; cards.forEach((card,index)=>card.style.setProperty(property,String(index))); }
  function mount(doc) {
    const win = doc.defaultView;
    if (!win || !win.matchMedia) return () => {};
    const grids = [...doc.querySelectorAll('.featured-masonry,.collection-grid')];
    if (!grids.length) return () => {};
    const mobile = win.matchMedia('(max-width:680px)');
    const tablet = win.matchMedia('(max-width:1050px)');
    const observed = new Set();
    let pending = 0, stopped = false;
    const set = (el, name, value) => {
      if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
    };
    function clear(grid) {
      grid.classList.remove('sequential-waterfall');
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
        if (!mobile.matches && !grid.matches('.featured-masonry')) { clear(grid); continue; }
        const mode = mobile.matches ? 'mobile' : tablet.matches ? 'tablet' : 'desktop';
        const width = grid.clientWidth;
        if (!width) continue;
        const style = win.getComputedStyle(grid);
        const columnProperty = mode === 'mobile' ? '--editor-mobile-columns' : mode === 'tablet' ? '--editor-tablet-columns' : '--editor-columns';
        const columns = Math.max(1, Math.min(mode === 'mobile' ? 3 : 8, parseInt(style.getPropertyValue(columnProperty)) || (mode === 'desktop' ? 3 : 2)));
        const requestedGap = parseFloat(style.getPropertyValue('--editor-gap'));
        const gap = Math.max(0, Math.min(mode === 'mobile' ? 12 : 80, Number.isFinite(requestedGap) ? requestedGap : 24));
        const rowGap = mode === 'mobile' ? 16 : gap;
        set(grid, '--waterfall-width', `${(width - gap * (columns - 1)) / columns}px`);
        grid.classList.add('sequential-waterfall');
        const heights = Array(columns).fill(0);
        for (const card of orderedCards(grid, mode)) {
          if (resize && !observed.has(card)) { resize.observe(card); observed.add(card); }
          if (card.hidden || win.getComputedStyle(card).display === 'none') continue;
          // A left-hand tie gives the first row the first N saved works.
          // Shortest-column placement keeps subsequent tops in reading order.
          let column = 0;
          for (let i = 1; i < columns; i++) if (heights[i] < heights[column] - 0.5) column = i;
          set(card, '--waterfall-x', `${column * (width + gap) / columns}px`);
          set(card, '--waterfall-y', `${heights[column]}px`);
          heights[column] += card.getBoundingClientRect().height + rowGap;
        }
        set(grid, '--waterfall-height', `${Math.max(0, ...heights) > 0 ? Math.max(...heights) - rowGap : 0}px`);
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
