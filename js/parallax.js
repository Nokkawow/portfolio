/* ระยะลึก 2D ตามเมาส์สำหรับห้องเรียนและห้องคอม */
(function () {
  window.initParallax = function initParallax(reduce) {
    // แม้ระบบตั้งลดการเคลื่อนไหว ยังให้พื้นหลังตอบสนองเบาๆ ตามที่เจ้าของต้องการ
    const strength = Math.min(reduce ? .4 : 1, innerWidth < 600 ? .3 : 1);
    const targets = [
      ['#classroom-bg', -22, -12], ['#student-chair', -8, -4], ['#desk', 6, 3],
      ['#workspace-bg', -20, -10], ['#work-cpu', -7, -4], ['#work-papers', 9, 5]
    ].map(([selector, mx, my]) => {
      const el = document.querySelector(selector);
      return el && { el, mx, my, x: gsap.quickTo(el, 'x', { duration: .65, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: .65, ease: 'power3.out' }) };
    }).filter(Boolean);
    window.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      targets.forEach((t) => { t.x(nx * t.mx * 2 * strength); t.y(ny * t.my * 2 * strength); });
    }, { passive: true });
  };
})();
