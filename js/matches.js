/* ============================================================
   MATCHES — ฉากเปิด: กระดาษมังงะปิดข้อความ ต้องจุดไม้ขีดเผาถึงจะอ่านได้
   · มาสคอตเดินเข้ามาถือกล่องไม้ขีด
   · หยิบไม้ขีด → ขูดกับแถบข้างกล่อง (ลากผ่านเร็วๆ) → ไฟติด → ลากไปปล่อยบนกระดาษ
   · ไฟลามจากจุดที่วาง ขึ้นจากขอบล่างไปขอบบน ขอบไหม้ดำ มีเปลวไฟ + ขี้เถ้า
   · ไม่เผาเองก็ได้: เลื่อนต่อแล้วกระดาษไหม้ตามการเลื่อน (setAuto จาก main.js)
   ============================================================ */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.initMatches = function (lines, api) {
    const kit = document.getElementById('match-kit');
    const box = kit.querySelector('.matchbox');
    const striker = kit.querySelector('.striker');
    const hint = kit.querySelector('.match-hint');
    const layer = document.getElementById('opening');
    let match = null;

    /* ---------- กระดาษแต่ละแผ่น ---------- */
    const MARGIN = 46; // พื้นที่รอบกระดาษให้ไฟ/ขี้เถ้าล้นออกได้
    const sheets = lines.map((line, i) => {
      const cv = document.createElement('canvas');
      cv.className = 'paper';
      line.appendChild(cv);
      return { i, line, cv, ctx: cv.getContext('2d'), paper: null, W: 0, H: 0, dpr: 1,
        manual: 0, auto: 0, ox: 0.5, seed: Math.random() * 1000, parts: [], last: -1 };
    });

    function drawPaper(s) {
      const text = s.line.querySelector('.in').getBoundingClientRect();
      const pw = Math.max(260, text.width + 90), ph = Math.max(120, text.height + 70);
      s.W = pw; s.H = ph;
      s.dpr = Math.min(2, devicePixelRatio || 1);
      const cw = pw + MARGIN * 2, ch = ph + MARGIN * 2;
      s.cv.width = cw * s.dpr; s.cv.height = ch * s.dpr;
      s.cv.style.width = cw + 'px'; s.cv.style.height = ch + 'px';
      const lr = s.line.getBoundingClientRect();
      s.cv.style.left = (text.left - lr.left + text.width / 2) + 'px';
      s.cv.style.top = (text.top - lr.top + text.height / 2) + 'px';
      // เก็บภาพกระดาษไว้ในแคนวาสแยก
      const off = document.createElement('canvas');
      off.width = s.cv.width; off.height = s.cv.height;
      const o = off.getContext('2d');
      o.scale(s.dpr, s.dpr); o.translate(MARGIN, MARGIN);
      o.fillStyle = '#f6f3ec'; o.fillRect(0, 0, pw, ph);
      // สกรีนโทนมุมกระดาษ
      o.fillStyle = 'rgba(17,17,17,.18)';
      for (let y = 6; y < ph; y += 7) for (let x = 6; x < pw; x += 7) {
        const d = Math.min(x + y, (pw - x) + (ph - y));
        if (d < 70) { o.beginPath(); o.arc(x, y, 1.3 * (1 - d / 70) + .3, 0, 7); o.fill(); }
      }
      o.strokeStyle = '#111'; o.lineWidth = 3; o.strokeRect(1.5, 1.5, pw - 3, ph - 3);
      o.fillStyle = '#7b1fa2'; o.font = '800 14px "Noto Sans Thai", sans-serif'; o.textAlign = 'center';
      o.fillText('จุดไฟเผาเพื่ออ่าน', pw / 2, ph / 2 + 5);
      o.fillStyle = 'rgba(17,17,17,.35)'; o.font = '700 11px "Noto Sans Thai", sans-serif';
      o.fillText(`ม้วนที่ ${s.i + 1}`, pw / 2, ph - 14);
      s.paper = off; s.last = -1;
      render(s, true);
    }

    // ขอบไฟ: ความสูงที่ไหม้ (จากล่าง) ของแต่ละแนว x
    function burnedAt(s, x, p) {
      const n = Math.sin(x * 0.045 + s.seed) * 0.5 + Math.sin(x * 0.13 + s.seed * 2) * 0.3 + Math.sin(x * 0.31 + s.seed * 3) * 0.2;
      const spread = p * (s.H * 1.45 + s.W * 0.55) - Math.abs(x - s.ox * s.W) * 0.55;
      return Math.max(0, Math.min(s.H + 30, spread + n * s.H * 0.09));
    }

    function render(s, force) {
      const p = Math.max(s.manual, s.auto);
      const alive = s.parts.length > 0;
      if (!force && p === s.last && !alive) return;
      s.last = p;
      const c = s.ctx, W = s.W, H = s.H;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, s.cv.width, s.cv.height);
      if (p >= 1 && !alive) return;
      c.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      if (p < 1) {
        c.drawImage(s.paper, 0, 0, s.cv.width / s.dpr, s.cv.height / s.dpr);
        c.translate(MARGIN, MARGIN);
        if (p > 0) {
          const pts = [];
          for (let x = -2; x <= W + 2; x += 4) pts.push([x, H - burnedAt(s, x, p)]);
          // รอยไหม้ดำ (ถ่าน) เหนือขอบไฟ
          const band = (off, color) => {
            c.beginPath(); c.moveTo(-2, H + 2);
            pts.forEach(([x, y]) => c.lineTo(x, y - off));
            c.lineTo(W + 2, H + 2); c.closePath(); c.fillStyle = color; c.fill();
          };
          c.globalCompositeOperation = 'source-atop'; // รอยไหม้ติดเฉพาะบนเนื้อกระดาษ
          band(26, 'rgba(120,80,40,.28)');
          band(12, 'rgba(45,25,12,.92)');
          // ลบส่วนที่ไหม้แล้ว
          c.globalCompositeOperation = 'destination-out';
          band(0, '#000');
          c.globalCompositeOperation = 'source-over';
          // ขอบไฟที่กำลังลุก
          c.save();
          c.beginPath(); c.rect(-4, -4, W + 8, H + 8); c.clip();
          c.shadowColor = '#ffb347'; c.shadowBlur = 14;
          c.strokeStyle = '#ff7a1a'; c.lineWidth = 3; c.lineJoin = 'round';
          c.beginPath();
          let pen = false;
          pts.forEach(([x, y]) => {
            if (y > 0 && y < H) { pen ? c.lineTo(x, y) : c.moveTo(x, y); pen = true; } else pen = false;
          });
          c.stroke(); c.restore();
          // เปลวไฟ + ขี้เถ้าเกิดตามขอบ
          if (!reduce && p < 1 && Math.random() < 0.9) {
            for (let k = 0; k < 3; k++) {
              const q = pts[(Math.random() * pts.length) | 0];
              if (q[1] > 0 && q[1] < H) {
                s.parts.push({ x: q[0], y: q[1], vx: (Math.random() - .5) * 20, vy: -40 - Math.random() * 60, life: 0, max: .5 + Math.random() * .4, r: 3 + Math.random() * 5, ash: Math.random() < .25 });
              }
            }
            if (Math.random() < .08) Sound.play('crackle', 0.07);
          }
        }
      } else {
        c.translate(MARGIN, MARGIN);
      }
      // วาดอนุภาค
      const dt = 1 / 60;
      s.parts = s.parts.filter((a) => (a.life += dt) < a.max * (a.ash ? 3 : 1));
      s.parts.forEach((a) => {
        a.x += a.vx * dt; a.y += a.vy * dt;
        const t = a.life / (a.max * (a.ash ? 3 : 1));
        if (a.ash) {
          a.vx += (Math.random() - .5) * 8;
          c.fillStyle = `rgba(30,30,30,${(1 - t) * .8})`;
          c.fillRect(a.x, a.y, 3, 2);
        } else {
          c.globalCompositeOperation = 'lighter';
          c.fillStyle = t < .4 ? `rgba(255,214,110,${1 - t})` : `rgba(255,110,20,${(1 - t) * .9})`;
          c.beginPath(); c.arc(a.x, a.y, a.r * (1 - t * .6), 0, 7); c.fill();
          c.globalCompositeOperation = 'source-over';
        }
      });
    }

    function layout() { sheets.forEach(drawPaper); }
    document.fonts.ready.then(layout);
    window.addEventListener('resize', layout);
    gsap.ticker.add(() => sheets.forEach((s) => render(s)));

    function ignite(s, clientX) {
      if (s.manual > 0 || Math.max(s.manual, s.auto) >= 1) return;
      const r = s.cv.getBoundingClientRect();
      s.ox = Math.min(1, Math.max(0, (clientX - r.left - MARGIN) / s.W));
      Sound.play('whoosh', 0.2);
      gsap.to(s, { manual: 1, duration: reduce ? 0.4 : 2.4, ease: 'power1.in' });
      if (hint) gsap.to(hint, { autoAlpha: 0, duration: .3 });
    }

    /* ---------- ไม้ขีด ---------- */
    function newMatch() {
      match = document.createElement('div');
      match.className = 'match';
      match.innerHTML = '<i class="flame"></i>';
      box.appendChild(match);
      match.addEventListener('pointerdown', grab);
    }
    let drag = null;
    function grab(e) {
      e.preventDefault();
      const m = match;
      const r = m.getBoundingClientRect();
      document.body.appendChild(m);
      m.classList.add('held');
      drag = { m, lit: false, hist: [{ x: e.clientX, t: performance.now() }], dx: e.clientX - r.left, dy: e.clientY - r.top };
      place(e.clientX, e.clientY);
      try { m.setPointerCapture(e.pointerId); } catch (_) {}
      m.addEventListener('pointermove', move);
      m.addEventListener('pointerup', drop);
      m.addEventListener('pointercancel', drop);
      Sound.play('grab');
      api.onInteractStart();
    }
    function place(x, y) { gsap.set(drag.m, { x: x - drag.dx, y: y - drag.dy, rotation: -35, transformOrigin: `${drag.dx}px ${drag.dy}px` }); }
    function move(e) {
      if (!drag) return;
      place(e.clientX, e.clientY);
      const now = performance.now();
      drag.hist.push({ x: e.clientX, t: now });
      while (drag.hist.length > 2 && now - drag.hist[0].t > 80) drag.hist.shift();
      if (!drag.lit) {
        const sr = striker.getBoundingClientRect();
        const pad = 14;
        const over = e.clientX > sr.left - pad && e.clientX < sr.right + pad && e.clientY > sr.top - pad && e.clientY < sr.bottom + pad;
        const f = drag.hist[0];
        const speed = Math.abs(e.clientX - f.x) / Math.max(1, now - f.t) * 1000;
        if (over) { striker.classList.add('rub'); Sound.play('tick', 0.06); }
        if (over && speed > 220) {
          drag.lit = true;
          drag.m.classList.add('lit');
          striker.classList.remove('rub');
          Sound.play('strike', 0.2);
          if (hint) hint.textContent = 'ติดแล้ว! เอาไปวางบนกระดาษ';
        }
      }
    }
    function drop(e) {
      if (!drag) return;
      const { m, lit } = drag;
      drag = null;
      striker.classList.remove('rub');
      m.style.visibility = 'hidden';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      m.style.visibility = '';
      const cv = under && under.closest && under.closest('canvas.paper');
      const s = cv && sheets.find((q) => q.cv === cv);
      if (lit && s && getComputedStyle(s.line).visibility !== 'hidden') {
        ignite(s, e.clientX);
        gsap.to(m, { scale: .4, autoAlpha: 0, duration: .5, onComplete: () => m.remove() });
      } else {
        gsap.to(m, { autoAlpha: 0, y: '+=40', duration: .35, onComplete: () => m.remove() });
      }
      gsap.delayedCall(.4, newMatch);
      api.onInteractEnd();
    }
    newMatch();

    /* ---------- มาสคอตเดินเข้ามา (เรียกหลังโหลดเสร็จ) ---------- */
    function walkIn() {
      if (reduce) return;
      gsap.fromTo(kit, { xPercent: 120 }, { xPercent: 0, duration: 1.8, ease: 'power2.out' });
      gsap.fromTo(kit.querySelector('.kit-mascot'), { y: 0 }, { y: -8, duration: .22, yoyo: true, repeat: 7, ease: 'sine.inOut' });
      gsap.fromTo(hint, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5, delay: 1.9 });
    }

    return {
      setAuto(i, p) { if (sheets[i]) sheets[i].auto = p; },
      burned: (i) => sheets[i] && Math.max(sheets[i].manual, sheets[i].auto) >= 1,
      walkIn, layout
    };
  };
})();
