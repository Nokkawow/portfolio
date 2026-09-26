/* ============================================================
   VHS — ภาพเทปเก่าแบบกล้องวิดีโอ (อ้างอิงภาพของเจ้าของ)
   · noise + เส้นเทปแนวนอนขยับทุกเฟรม · ภาพสั่นขึ้นลงเบาๆ · กระพริบ · กระตุกเป็นระยะ
   · HUD 4 มุม: PLAY ▶ / เวลาเทปเดินตามการเลื่อน / วันที่ตามเรื่อง (พ.ศ.) / TAPE ตามฉาก
   เปิด/ปิดด้วย autoAlpha ของ #vhs ในไทม์ไลน์หลัก (main.js) และ update(t) ทุกเฟรม
   ============================================================ */
(function () {
  const TH_MONTH = { 'มกราคม': 'JAN', 'กุมภาพันธ์': 'FEB', 'มีนาคม': 'MAR', 'เมษายน': 'APR', 'พฤษภาคม': 'MAY', 'มิถุนายน': 'JUN',
    'กรกฎาคม': 'JUL', 'สิงหาคม': 'AUG', 'กันยายน': 'SEP', 'ตุลาคม': 'OCT', 'พฤศจิกายน': 'NOV', 'ธันวาคม': 'DEC' };
  const MONTH_NO = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };

  window.initVHS = function (calendarPages) {
    const box = document.getElementById('vhs');
    const cv = document.getElementById('vhs-noise');
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cv.width, cv.height);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = matchMedia('(pointer: coarse)').matches;
    const layers = ['#opening', '#classroom', '#board-layer', '#time-layer'].map((s) => document.querySelector(s));
    const hud = { mode: document.getElementById('vhs-mode'), time: document.getElementById('vhs-time'),
      date: document.getElementById('vhs-date'), tape: document.getElementById('vhs-tape') };
    // วันที่จากหน้าปฏิทิน (เรียงตามลำดับที่หลุด)
    const dates = (calendarPages || []).map((p) => {
      const d = p.querySelector('b').textContent.trim(), m = TH_MONTH[p.querySelector('span').textContent.trim()] || 'SEP';
      return `${m} ${d}.${MONTH_NO[m]}.${p.querySelector('small').textContent.trim()}`;
    });
    let frame = 0, nextGlitch = performance.now() + 4000, on = true;

    function noise() {
      const d = img.data, W = cv.width;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
      }
      // เส้นเทปแนวนอนสว่าง/มืด สุ่มตำแหน่งทุกเฟรม
      for (let k = 0; k < 4; k++) {
        const y = Math.random() * cv.height | 0, bright = Math.random() < .6;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4, v = bright ? 235 : 20;
          d[i] = d[i + 1] = d[i + 2] = v;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    function visibleLayers() { return layers.filter((l) => l && getComputedStyle(l).visibility !== 'hidden'); }
    // กระตุก: ขยับซ้าย-ขวาเร็วๆ + เอียงนิดเดียว
    function glitch(strong) {
      const k = strong ? 2.2 : 1;
      const on = visibleLayers();
      gsap.timeline()
        .to(on, { x: 7 * k, skewX: 2 * k, duration: 0.04, ease: 'none' })
        .to(on, { x: -5 * k, skewX: -1.5 * k, duration: 0.05, ease: 'none' })
        .to(on, { x: 3 * k, skewX: 0, duration: 0.04, ease: 'none' })
        .to(on, { x: 0, duration: 0.06, ease: 'none' });
    }

    gsap.ticker.add(() => {
      on = getComputedStyle(box).visibility !== 'hidden' && +getComputedStyle(box).opacity > 0.01;
      if (!on || reduce) return;
      frame++;
      if (frame % (mobile ? 3 : 2) === 0) noise();
      // ภาพสั่นขึ้นลงเบาๆ แบบเทป
      if (frame % 3 === 0) gsap.set(visibleLayers(), { y: (Math.random() - .5) * 2.2 });
      const now = performance.now();
      if (now > nextGlitch) { glitch(false); nextGlitch = now + 3200 + Math.random() * 4000; }
    });
    noise();

    const pad = (n) => String(n).padStart(2, '0');
    let last = '';
    // เรียกทุกเฟรมจาก main.js: อัปเดต HUD ตามเวลาในไทม์ไลน์
    function update(t, L, calTimes) {
      if (!on) return;
      const sec = Math.floor(t * 47);
      const time = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;
      const rewinding = t >= L.workspace - 0.45;
      const mode = rewinding ? '◀◀ REWIND' : 'PLAY ▶';
      const tape = t < L.z1 - 1 ? 'TAPE 1' : t < L.whip ? 'TAPE 2' : 'TAPE 3';
      let di = 0;
      (calTimes || []).forEach((ct, i) => { if (t >= ct) di = i + 1; });
      const date = dates[Math.min(di, dates.length - 1)] || 'SEP 26.09.2566';
      const key = time + mode + tape + date;
      if (key === last) return;
      last = key;
      hud.time.textContent = time; hud.mode.textContent = mode; hud.tape.textContent = tape; hud.date.textContent = date;
      hud.mode.classList.toggle('blink', rewinding);
    }
    return { glitch, update };
  };
})();
