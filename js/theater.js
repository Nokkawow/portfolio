/* โรงหนังเปิดเรื่อง: ลาก/แตะเทป VHS เข้าเครื่อง แล้วซูมผ่านจอเข้าสู่กระดาษเปิดเรื่อง */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.initTheater = function initTheater() {
    const intro = document.getElementById('theater-intro');
    const tape = intro.querySelector('.vhs-cassette');
    const slot = intro.querySelector('.vcr-slot');
    let started = false, done = false, resolveDone;
    const ready = new Promise((resolve) => { resolveDone = resolve; });
    let drag = null;

    function insert() {
      if (done) return;
      done = true;
      tape.classList.remove('dragging');
      const tr = tape.getBoundingClientRect(), sr = slot.getBoundingClientRect();
      const dx = sr.left + sr.width / 2 - (tr.left + tr.width / 2);
      const dy = sr.top + sr.height / 2 - (tr.top + tr.height / 2);
      Sound.play('click', .35);
      gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .to(tape, { x: `+=${dx}`, y: `+=${dy}`, rotation: 0, scale: .72, duration: reduce ? .28 : .65 })
        .to(tape, { scaleY: .12, autoAlpha: 0, duration: reduce ? .18 : .38, ease: 'power2.in' })
        .add(() => { intro.classList.add('playing'); Sound.play('pop', .3); })
        .to('.theater-screen', { scale: 1.04, duration: reduce ? .25 : .55 }, '<')
        .to('.screen-paper', { autoAlpha: 1, duration: reduce ? .38 : .55 }, '+=.15')
        .to('.theater-screen', { scale: 6.4, duration: reduce ? .95 : 1.6, ease: 'power2.inOut' }, '<')
        .to(intro, { autoAlpha: 0, duration: reduce ? .55 : .95 }, '-=.3')
        .add(() => { intro.hidden = true; resolveDone(); });
    }

    tape.addEventListener('pointerdown', (e) => {
      if (!started || done) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
      tape.classList.add('dragging');
      try { tape.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    tape.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      gsap.set(tape, { x: `+=${dx}`, y: `+=${dy}`, rotation: gsap.utils.clamp(-8, 8, dx * .08) });
      drag.x = e.clientX; drag.y = e.clientY;
    });
    function release() {
      if (!drag) return;
      const sr = slot.getBoundingClientRect(), tr = tape.getBoundingClientRect();
      const overlaps = tr.right > sr.left && tr.left < sr.right && tr.bottom > sr.top - 45 && tr.top < sr.bottom + 45;
      const wasMoved = drag.moved;
      drag = null;
      tape.classList.remove('dragging');
      if (overlaps || !wasMoved) insert();
      else gsap.to(tape, { x: 0, y: 0, rotation: -5, duration: .45, ease: 'back.out(1.7)' });
    }
    tape.addEventListener('pointerup', release);
    tape.addEventListener('pointercancel', release);
    tape.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insert(); } });

    return {
      start() {
        started = true;
        intro.hidden = false;
        gsap.fromTo(intro, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? .05 : .45 });
        return ready;
      }
    };
  };
})();
