/* ระยะลึก 2D ตามเมาส์สำหรับห้องเรียนและห้องคอม */
(function () {
  window.initParallax = function initParallax(reduce) {
    if (reduce) return;
    const targets = [
      ['#classroom-furniture', -18, -10], ['#student-chair', -10, -5], ['#desk', 7, 4],
      ['.room-tone', -14, -8], ['#work-cpu', -7, -4], ['#work-papers', 9, 5]
    ].map(([selector, mx, my]) => {
      const el = document.querySelector(selector);
      return el && { el, mx, my, x: gsap.quickTo(el, 'x', { duration: .65, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: .65, ease: 'power3.out' }) };
    }).filter(Boolean);
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      targets.forEach((t) => { t.x(nx * t.mx * 2); t.y(ny * t.my * 2); });
    }, { passive: true });
  };
})();
