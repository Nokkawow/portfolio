/* ============================================================
   MASCOT — โผล่มาดูที่ขอบจอตอนแปรงลบกระดาน
   · จับแล้วยก/ลากไปไหนก็ได้ · สะบัดโยนได้ · เอาเมาส์ชนแรงๆ = ดันออก
   · ตกพื้น = นั่งยองกินเมล็ดทานตะวันรอ แล้วค่อยกลับไปแอบดู
   · ท่า: แอบดู = กอดอก / ถูกยก = ยืน / นั่งรอ = นั่งยอง
   ============================================================ */
(function () {
  const POSES = { cross: 'assets/mascot/cross.png', stand: 'assets/mascot/stand.png', squat: 'assets/mascot/squat.png' };
  Object.values(POSES).forEach((src) => { const i = new Image(); i.src = src; });

  window.initMascot = function (api) {
    const img = document.getElementById('mascot');
    const stage = img.parentElement;
    const m = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, state: 'hidden' };
    let want = false, backTimer = null, hist = [], grabOff = { x: 0, y: 0 };
    let lastPtr = null;

    const size = () => ({ w: img.offsetWidth, h: img.offsetHeight, W: stage.clientWidth, H: stage.clientHeight });
    function pose(p) { const src = POSES[p]; if (img.getAttribute('src') !== src) img.setAttribute('src', src); }
    function place() { gsap.set(img, { x: m.x, y: m.y, rotation: m.r }); }
    function peekPos() { const s = size(); return { x: s.W - s.w * 0.52, y: s.H - s.h * 0.86, r: -9 }; }
    function hidePos() { const s = size(); return { x: s.W + 30, y: s.H - s.h * 0.86, r: 0 }; }

    function goTo(target, state, dur = 0.7, ease = 'power3.out') {
      gsap.killTweensOf(m);
      m.state = state === 'peek' ? 'moving-peek' : 'moving';
      gsap.to(m, {
        ...target, duration: dur, ease, onUpdate: place,
        onComplete: () => { m.state = state; }
      });
    }

    function peek() { pose('cross'); goTo(peekPos(), 'peek', 0.8, 'back.out(1.4)'); Sound.play('pop'); }
    function hide() { goTo(hidePos(), 'hidden', 0.5, 'power2.in'); }

    function scheduleBack(delay) {
      if (backTimer) backTimer.kill();
      backTimer = gsap.delayedCall(delay, () => {
        if (m.state === 'held') return;
        if (want) peek(); else { pose('cross'); hide(); }
      });
    }

    // เริ่มต้นซ่อนไว้นอกจอ
    Object.assign(m, hidePos()); place();
    window.addEventListener('resize', () => {
      if (m.state === 'peek') Object.assign(m, peekPos());
      else if (m.state === 'hidden') Object.assign(m, hidePos());
      place();
    });

    /* ---------- จับ / ยก / โยน ---------- */
    img.addEventListener('pointerdown', (e) => {
      if (!api.canInteract(e)) return;
      gsap.killTweensOf(m);
      if (backTimer) backTimer.kill();
      m.state = 'held';
      pose('stand');
      const r = stage.getBoundingClientRect();
      grabOff = { x: e.clientX - r.left - m.x, y: e.clientY - r.top - m.y };
      hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
      img.setPointerCapture(e.pointerId);
      e.preventDefault();
      Sound.play('grab');
      api.onInteractStart();
    });
    img.addEventListener('pointermove', (e) => {
      if (m.state !== 'held') return;
      const r = stage.getBoundingClientRect();
      const now = performance.now();
      hist.push({ x: e.clientX, y: e.clientY, t: now });
      while (hist.length > 2 && now - hist[0].t > 90) hist.shift();
      const nx = e.clientX - r.left - grabOff.x;
      m.r += ((nx - m.x) * 0.9 - m.r) * 0.25; // เอียงตามทิศที่ลาก เหมือนห้อยอยู่
      m.x = nx; m.y = e.clientY - r.top - grabOff.y;
      place();
    });
    function release() {
      if (m.state !== 'held') return;
      const now = performance.now(), f = hist[0];
      const dt = Math.max(0.016, (now - f.t) / 1000);
      const last = hist[hist.length - 1];
      m.vx = (last.x - f.x) / dt; m.vy = (last.y - f.y) / dt; m.vr = m.vx * 0.05;
      m.state = 'free';
      if (Math.hypot(m.vx, m.vy) > 500) Sound.play('whoosh', 0.2);
      api.onInteractEnd();
    }
    img.addEventListener('pointerup', release);
    img.addEventListener('pointercancel', release);

    // ดัน: เอาเมาส์พุ่งชนแรงๆ ตอนแอบดู
    window.addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (lastPtr && m.state === 'peek') {
        const vx = (e.clientX - lastPtr.x) / Math.max(1, now - lastPtr.t) * 1000;
        const r = img.getBoundingClientRect();
        const inside = e.clientX > r.left + r.width * 0.2 && e.clientX < r.right && e.clientY > r.top + r.height * 0.1 && e.clientY < r.bottom;
        if (inside && Math.abs(vx) > 900) {
          gsap.killTweensOf(m);
          m.state = 'free';
          m.vx = vx * 0.7; m.vy = -Math.abs(vx) * 0.35; m.vr = vx * 0.06;
          pose('stand');
          Sound.play('bonk');
        }
      }
      lastPtr = { x: e.clientX, y: e.clientY, t: now };
    });

    /* ---------- ฟิสิกส์ตอนลอย ---------- */
    gsap.ticker.add((_, dtMs) => {
      if (m.state !== 'free') return;
      const dt = Math.min(0.033, dtMs / 1000);
      const s = size();
      m.vy += 2400 * dt;
      m.x += m.vx * dt; m.y += m.vy * dt; m.r += m.vr * dt;
      const floor = s.H - s.h * 0.98;
      if (m.y > floor) {
        m.y = floor;
        if (Math.abs(m.vy) > 350) Sound.play('thud', 0.2);
        m.vy *= -0.25; m.vx *= 0.7; m.vr *= 0.5;
        m.r *= 0.6;
        if (Math.abs(m.vy) < 120) {
          m.vy = 0;
          // ตกพื้นในจอ → นั่งยองรอ แล้วกลับไปแอบดู
          if (m.x > -s.w * 0.6 && m.x < s.W - s.w * 0.4) {
            m.state = 'resting';
            pose('squat');
            gsap.to(m, { r: 0, duration: 0.3, onUpdate: place });
            scheduleBack(3.5);
            place();
            return;
          }
        }
      }
      // หลุดขอบจอ → รอแล้วค่อยกลับมา
      if (m.x < -s.w * 1.2 || m.x > s.W + s.w * 0.4 || m.y < -s.h * 3) {
        m.state = 'gone';
        Object.assign(m, hidePos()); place();
        scheduleBack(2.5);
        return;
      }
      place();
    });

    return {
      setPeek(on) {
        want = on;
        if (on && (m.state === 'hidden' || m.state === 'moving')) peek();
        if (!on && (m.state === 'peek' || m.state === 'moving-peek')) hide();
      }
    };
  };
})();
