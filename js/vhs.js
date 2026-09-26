/* ============================================================
   VHS — ภาพเทปเก่า (เม็ด noise ขยับ + ภาพกระตุกเป็นระยะ)
   เปิด/ปิดด้วย autoAlpha ของ #vhs ในไทม์ไลน์หลัก (main.js)
   ============================================================ */
(function () {
  window.initVHS = function () {
    const box = document.getElementById('vhs');
    const cv = document.getElementById('vhs-noise');
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cv.width, cv.height);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(pointer: coarse)').matches;
    const layers = ['#opening', '#classroom', '#board-layer', '#time-layer'].map((s) => document.querySelector(s));
    let frame = 0, nextGlitch = performance.now() + 4000;

    function noise() {
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    }
    // ภาพกระตุก: ขยับซ้าย-ขวาเร็วๆ + เอียงนิดเดียว
    function glitch(strong) {
      const k = strong ? 2.2 : 1;
      const on = layers.filter((l) => l && getComputedStyle(l).visibility !== 'hidden');
      gsap.timeline()
        .to(on, { x: 7 * k, skewX: 2 * k, duration: 0.04, ease: 'none' })
        .to(on, { x: -5 * k, skewX: -1.5 * k, duration: 0.05, ease: 'none' })
        .to(on, { x: 3 * k, skewX: 0, duration: 0.04, ease: 'none' })
        .to(on, { x: 0, duration: 0.06, ease: 'none' });
    }

    gsap.ticker.add(() => {
      const visible = getComputedStyle(box).visibility !== 'hidden' && +getComputedStyle(box).opacity > 0.01;
      if (!visible || reduce) return;
      if (++frame % (mobile ? 3 : 2) === 0) noise();
      const now = performance.now();
      if (now > nextGlitch) { glitch(false); nextGlitch = now + 3500 + Math.random() * 4000; }
    });
    noise();
    return { glitch };
  };
})();
