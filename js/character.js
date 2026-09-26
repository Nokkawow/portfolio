/* ============================================================
   CHARACTER — ฟิสิกส์ + กิมมิกฉาก 3
   · ตามองเมาส์ · หัวเอียงตาม · กะพริบตา · หายใจ · หางม้าเป็นสปริง
   · หยิบปากกาปาได้ (โดนตัว = กระเด็นแบบ ragdoll แล้วลุกกลับมานั่ง)
   · จับหัว / ตัว / หางม้า แล้วดึงได้
   · ขีดเขียนบนหนังสือได้
   ทุกอย่างคำนวณในพิกัดฉาก (1920×1080) — ใช้ได้ทุกระดับซูม
   ============================================================ */
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DESK_Y = 676, DESK_X0 = 494, DESK_X1 = 1346;
  const GRAVITY = 2600;

  window.initCharacter = function (S, api) {
    const P = window.CHAR_POS;
    const svg = S.svg;
    const deskEl = document.getElementById('desk');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- สถานะสปริง ---------- */
    const body = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, tx: 0, ty: 0, tr: 0, free: false, freeUntil: 0, softUntil: 0 };
    const head = { r: 0, vr: 0, tr: 0, x: 0, vx: 0 };
    const tail = { a: 0, v: 0, target: null };
    const arms = S.arms.map(() => ({ r: 0, v: 0 }));
    let tilt = 0, time = 0;
    let grab = null;       // { part, start, ... }
    let drawing = null;    // path ที่กำลังเขียนบนหนังสือ

    const pens = S.pens.map((p) => ({ ...p, x: p.home.x, y: p.home.y, r: p.home.r, vx: 0, vy: 0, vr: 0, mode: 'rest', hist: [] }));
    const penHome = S.el('g', { id: 'pens-home' });
    pens[0].g.parentNode.insertBefore(penHome, pens[0].g);

    /* ---------- สีหน้า ---------- */
    const MOUTH = {
      normal: 'M-10,74 C-6,67 -2,69 0,72 C2,69 6,67 10,74',
      surprised: 'M-7,73 C-7,63 7,63 7,73 C7,83 -7,83 -7,73 Z',
      dizzy: 'M-15,74 C-10,67 -5,81 0,74 C5,67 10,81 15,74'
    };
    let face = 'normal', faceTimer = null;
    function setFace(f, holdFor) {
      face = f;
      S.mouth.setAttribute('d', MOUTH[f]);
      if (S.mouthPatch) { // ริกภาพ: ปกติใช้ปากในภาพ · ตกใจ/มึนค่อยแปะปากใหม่
        const show = f === 'normal' ? 'none' : 'inline';
        S.mouthPatch.setAttribute('display', show);
        S.mouth.setAttribute('display', show);
      }
      S.mouth.setAttribute('fill', f === 'surprised' ? '#111' : 'none');
      // ตกใจ = ลูกตาหดเล็กลง (ไม่ขยายทั้งดวง ซึ่งทำให้ตาหลุดออกนอกเบ้า)
      gsap.to(S.eyes.map((e) => e.pupil.firstChild), { scale: f === 'surprised' ? 0.72 : 1, transformOrigin: '50% 50%', duration: 0.15, overwrite: 'auto' });
      if (S.browL && S.browR) gsap.to([S.browL, S.browR], { y: f === 'surprised' ? -7 : f === 'dizzy' ? 3 : 0, duration: 0.15, overwrite: 'auto' });
      if (faceTimer) faceTimer.kill();
      if (holdFor) faceTimer = gsap.delayedCall(holdFor, () => setFace('normal'));
    }

    /* ---------- กะพริบตา ---------- */
    // หนังตาสีผิวเลื่อนลงมาปิดตาขาว พร้อมเส้นขนตาที่ขอบ แล้วเปิดขึ้น
    function blinkEyes() {
      const tl = gsap.timeline();
      S.eyes.forEach((e) => {
        if (!e.lid) return;
        const st = { p: 0 };
        const draw = () => {
          const h = e.h * st.p;
          e.lid.setAttribute('height', h);
          e.lash.setAttribute('y', e.top + h - 1.4);
          e.lash.setAttribute('opacity', st.p > 0.05 ? 1 : 0);
        };
        tl.to(st, { p: 1, duration: 0.07, ease: 'power2.in', onUpdate: draw }, 0)
          .to(st, { p: 0, duration: 0.12, ease: 'power2.out', onUpdate: draw }, 0.09);
      });
      return tl;
    }
    if (!reduce) {
      (function blink() {
        gsap.delayedCall(gsap.utils.random(2.2, 5.5), () => {
          if (face === 'normal') {
            blinkEyes();
          }
          blink();
        });
      })();
    }

    /* ---------- ตามองเมาส์ ---------- */
    const eyeMovers = S.eyes.map((e) => ({
      e,
      x: gsap.quickTo(e.pupil, 'x', { duration: 0.2, ease: 'power3' }),
      y: gsap.quickTo(e.pupil, 'y', { duration: 0.2, ease: 'power3' })
    }));

    /* ---------- เอฟเฟกต์โดนปา ---------- */
    function burst(x, y) {
      const g = S.el('g', { transform: `translate(${x},${y})` }, S.fx);
      let d = '';
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2, r = i % 2 ? 22 : 58;
        d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1);
      }
      S.el('path', { d: d + 'Z', fill: '#fff', stroke: '#111', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      const t = S.el('text', { x: 0, y: 10, 'text-anchor': 'middle', 'font-family': 'Noto Sans Thai, sans-serif', 'font-weight': 900, 'font-size': 30, fill: '#7b1fa2', stroke: '#111', 'stroke-width': 1.2 }, g);
      t.textContent = 'ปั๊ก!';
      gsap.fromTo(g, { scale: 0.2, rotation: gsap.utils.random(-20, 20), transformOrigin: '50% 50%' },
        { scale: 1.1, duration: 0.18, ease: 'back.out(3)' });
      gsap.to(g, { opacity: 0, scale: 1.3, delay: 0.45, duration: 0.3, onComplete: () => g.remove() });
    }

    // ดาววนหัวตอนมึน
    function dizzyStars() {
      const g = S.el('g', {}, S.fx);
      const stars = [0, 1, 2].map(() => {
        const s = S.el('path', { d: 'M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3 Z', fill: '#fff', stroke: '#111', 'stroke-width': 2.5 }, g);
        return s;
      });
      const o = { t: 0 };
      gsap.to(o, {
        t: 1, duration: 1.8, ease: 'none',
        onUpdate() {
          const cx = P.x + body.x, cy = P.y + body.y - 190;
          stars.forEach((s, i) => {
            const a = o.t * Math.PI * 4 + (i * Math.PI * 2) / 3;
            s.setAttribute('transform', `translate(${cx + Math.cos(a) * 110},${cy + Math.sin(a) * 26})`);
          });
          g.setAttribute('opacity', o.t > 0.8 ? (1 - o.t) * 5 : 1);
        },
        onComplete: () => g.remove()
      });
    }

    /* ---------- โดนปา ---------- */
    function hitTest(x, y) {
      const bx = P.x + body.x, by = P.y + body.y;
      if (Math.hypot(x - (bx + head.x), y - (by - 40)) < 170) return 'head';
      if (Math.abs(x - bx) < 205 && y > by + 110 && y < DESK_Y - 30) return 'body';
      return null;
    }

    function knock(part, vx, vy, x, y) {
      const speed = Math.hypot(vx, vy);
      const f = part === 'head' ? 1 : 0.7;
      burst(x, y);
      Sound.play('bonk');
      head.vr += vx * 0.06 * f;
      arms.forEach((a, i) => (a.v += (i ? -1 : 1) * gsap.utils.random(70, 150)));
      if (speed > 1600) {
        // กระเด็น (ragdoll) แล้วลุกกลับมานั่ง
        body.free = true;
        body.freeUntil = time + 1.15;
        body.vx = vx * 0.45;
        body.vy = Math.min(-500, vy * 0.25 - 650);
        body.vr = clamp(vx * 0.14, -420, 420);
        deskEl.parentNode.insertBefore(S.armsG, deskEl); // แขนไปอยู่หลังโต๊ะตอนล้ม
        setFace('surprised');
        gsap.delayedCall(0.9, () => { setFace('dizzy', 1.6); dizzyStars(); });
      } else {
        body.vx += vx * 0.16 * f;
        body.vy += vy * 0.06;
        body.vr += vx * 0.02 * f;
        setFace('surprised', 0.8);
      }
    }

    /* ---------- ปากกา ---------- */
    function penTransform(p) { p.g.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${p.r})`); }
    function returnPen(p, delay = 0) {
      p.mode = 'return';
      const lift = Math.min(p.y, p.home.y) - 120;
      const o = { t: 0 }, sx = p.x, sy = p.y, sr = p.r;
      gsap.to(o, {
        t: 1, delay, duration: 0.75, ease: 'power2.inOut',
        onUpdate() {
          const t = o.t;
          p.x = sx + (p.home.x - sx) * t;
          p.y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * lift + t * t * p.home.y;
          p.r = sr + (p.home.r - sr) * t;
          penTransform(p);
        },
        onComplete() {
          p.mode = 'rest';
          penHome.parentNode.insertBefore(p.g, penHome.nextSibling);
          Sound.play('tick');
        }
      });
    }

    function updatePens(dt) {
      pens.forEach((p) => {
        if (p.mode !== 'fly') return;
        const py = p.y;
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (!p.hit) {
          const part = hitTest(p.x, p.y);
          if (part) {
            knock(part, p.vx, p.vy, p.x, p.y);
            p.hit = true;
            p.vx *= -0.35; p.vy = -Math.abs(p.vy) * 0.3 - 320; p.vr *= -1.3;
          }
        }
        // ตกลงบนโต๊ะ
        if (p.vy > 0 && py <= DESK_Y && p.y > DESK_Y && p.x > DESK_X0 && p.x < DESK_X1) {
          p.y = DESK_Y; p.vy = -p.vy * 0.3; p.vx *= 0.6; p.vr *= 0.4;
          Sound.play('tick');
          if (Math.abs(p.vy) < 160) { p.mode = 'settled'; p.vy = 0; returnPen(p, 0.9); }
        }
        if (p.y > 1500 || p.x < -600 || p.x > 2500) returnPen(p, 0.5);
        penTransform(p);
      });
    }

    /* ---------- อินพุต ---------- */
    function onDown(e) {
      if (!api.canInteract(e)) return;
      const t = e.target;
      const pt = api.toScene(e.clientX, e.clientY);
      const penEl = t.closest('#pen1, #pen2');
      if (penEl) {
        const p = pens.find((q) => q.g === penEl);
        if (p.mode === 'return') return;
        gsap.killTweensOf(p);
        p.mode = 'held';
        p.hit = false;
        p.hist = [{ x: pt.x, y: pt.y, t: performance.now() }];
        S.fx.appendChild(p.g);
        grab = { part: 'pen', pen: p };
        Sound.play('grab');
      } else if (t.closest('#char-ponytail')) {
        grab = { part: 'tail', start: pt };
      } else if (t.closest('#char-head')) {
        grab = { part: 'head', start: pt };
      } else if (t.closest('#char-torso, #char-arms')) {
        grab = { part: 'body', start: pt };
      } else if (t.closest('#book')) {
        drawing = S.el('path', { d: `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, fill: 'none', stroke: '#111', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, S.bookInk);
        drawing._last = pt;
      } else return;

      if (grab && grab.part !== 'pen') {
        body.free = false;
        setFace('surprised');
        Sound.play('grab');
      }
      e.preventDefault();
      svg.setPointerCapture(e.pointerId);
      api.onInteractStart();
    }

    function onMove(e) {
      if (!grab && !drawing) return;
      const pt = api.toScene(e.clientX, e.clientY);
      if (drawing) {
        const l = drawing._last;
        if (Math.hypot(pt.x - l.x, pt.y - l.y) > 1.2) {
          drawing.setAttribute('d', drawing.getAttribute('d') + ` L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
          drawing._last = pt;
          Sound.play('squeak', 0.07);
        }
        return;
      }
      if (grab.part === 'pen') {
        const p = grab.pen;
        const now = performance.now();
        p.hist.push({ x: pt.x, y: pt.y, t: now });
        while (p.hist.length > 2 && now - p.hist[0].t > 90) p.hist.shift();
        const f = p.hist[0];
        const vx = (pt.x - f.x) / Math.max(0.016, (now - f.t) / 1000);
        p.x = pt.x; p.y = pt.y;
        p.r += (clamp(-30 + vx * 0.012, -80, 40) - p.r) * 0.3;
        penTransform(p);
        return;
      }
      const dx = pt.x - grab.start.x, dy = pt.y - grab.start.y;
      if (grab.part === 'tail') {
        const tp0 = S.tailPivot || [14, -180];
        const tieX = P.x + body.x + tp0[0], tieY = P.y + body.y + tp0[1];
        const ang = Math.atan2(pt.y - tieY, pt.x - tieX) * 180 / Math.PI;
        tail.target = S.tailPivot ? clamp(ang + 60, -14, 14) : clamp(ang + 35, -80, 80); // ริกภาพ: หางม้าชี้ขึ้น-ขวา ~60°, แกว่งได้ไม่เกิน 14° กันรอยต่อ
        head.tr = clamp(dx * 0.04, -14, 14);
        body.tx = clamp(dx * 0.15, -60, 60); body.ty = clamp(dy * 0.1, -40, 30);
      } else {
        const k = grab.part === 'head' ? 0.75 : 0.6;
        const len = Math.hypot(dx, dy) || 1, max = 230;
        const s = Math.min(1, max / (len * k));
        body.tx = dx * k * s; body.ty = clamp(dy * k * s, -260, 120);
        body.tr = clamp(dx * 0.035, -20, 20);
        head.tr = grab.part === 'head' ? clamp(dx * 0.05, -16, 16) : 0;
      }
    }

    function onUp(e) {
      if (drawing) { drawing = null; api.onInteractEnd(); return; }
      if (!grab) return;
      if (grab.part === 'pen') {
        const p = grab.pen;
        const now = performance.now();
        const f = p.hist[0];
        const dt = Math.max(0.016, (now - f.t) / 1000);
        let vx = (p.x - f.x) / dt, vy = (p.y - f.y) / dt;
        const sp = Math.hypot(vx, vy), MAX = 4800;
        if (sp > MAX) { vx *= MAX / sp; vy *= MAX / sp; }
        p.vx = vx; p.vy = vy; p.vr = clamp(vx * 0.5, -900, 900);
        p.mode = 'fly';
        if (sp > 400) Sound.play('whoosh', 0.2);
      } else {
        body.tx = body.ty = body.tr = 0;
        head.tr = 0;
        tail.target = null;
        Sound.play('boing');
        setFace('normal');
      }
      grab = null;
      api.onInteractEnd();
    }

    svg.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    /* ---------- ลูปหลัก ---------- */
    function spring(o, key, vkey, target, k, c, dt) {
      const a = -k * (o[key] - target) - c * o[vkey];
      o[vkey] += a * dt;
      o[key] += o[vkey] * dt;
    }

    gsap.ticker.add((_, dtMs) => {
      const dt = Math.min(0.033, dtMs / 1000);
      time += dt;
      const ptr = api.pointerScene();

      // ตา
      eyeMovers.forEach(({ e, x, y }) => {
        const dx = ptr.x - (e.cx + body.x), dy = ptr.y - (e.cy + body.y);
        const d = Math.hypot(dx, dy) || 1, f = Math.min(1, d / 60);
        if (face === 'dizzy') { x(Math.cos(time * 14) * 6); y(Math.sin(time * 14) * 3); }
        else { x((dx / d) * 7 * f); y((dy / d) * 4 * f); }
      });

      // ตัว
      if (body.free) {
        body.vy += GRAVITY * 0.8 * dt;
        body.x += body.vx * dt; body.y += body.vy * dt; body.r += body.vr * dt;
        body.vx *= 0.99; body.vr *= 0.985;
        if (body.y > 520) { // ล้มลงไปหลังโต๊ะ
          if (body.vy > 300) Sound.play('thud', 0.3);
          body.y = 520; body.vy *= -0.2; body.vx *= 0.6;
        }
        if (time > body.freeUntil) { body.free = false; body.softUntil = time + 1.6; }
      } else {
        const soft = time < body.softUntil;
        const k = soft ? 26 : 120, c = soft ? 8 : 11;
        spring(body, 'x', 'vx', body.tx, k, c, dt);
        spring(body, 'y', 'vy', body.ty, k, c, dt);
        spring(body, 'r', 'vr', body.tr, soft ? 30 : 140, soft ? 7 : 10, dt);
        if (!soft && S.armsG.parentNode && S.armsG.nextSibling !== document.getElementById('qmark')) {
          svg.insertBefore(S.armsG, document.getElementById('qmark')); // แขนกลับมาไว้หน้าโต๊ะ
        }
      }
      body.r = clamp(body.r, -200, 200);

      // หัว + เอียงตามเมาส์
      const hx = clamp((ptr.x - (P.x + body.x)) / 500, -1, 1);
      tilt += ((grab ? 0 : hx * 4) - tilt) * Math.min(1, dt * 4);
      spring(head, 'r', 'vr', head.tr, 220, 12, dt);
      head.x += ((grab ? 0 : hx * 5) - head.x) * Math.min(1, dt * 4);

      // หางม้า
      const headVel = head.vr * 0.02 + body.vr * 0.03 + body.vx * 0.004;
      const tailTarget = tail.target !== null ? tail.target : (reduce ? 0 : Math.sin(time * 1.6) * 2.5);
      spring(tail, 'a', 'v', tailTarget, tail.target !== null ? 260 : 60, 9, dt);
      tail.v -= headVel * 2;

      // แขน
      arms.forEach((a) => spring(a, 'r', 'v', 0, 160, 9, dt));

      // หายใจ
      const br = reduce ? 0 : Math.sin(time * 2.6);
      const s = 1 + 0.006 * (1 + br);

      // วาด
      const T = `translate(${P.x + body.x},${P.y + body.y}) rotate(${body.r} 0 300)`;
      S.char.setAttribute('transform', T);
      S.armsG.setAttribute('transform', T);
      S.head.setAttribute('transform', `translate(${head.x},${br * -2.5}) rotate(${tilt + head.r} 0 90)`);
      S.torso.setAttribute('transform', `translate(0 ${320 * (1 - s)}) scale(1 ${s})`);
      const tp = S.tailPivot || [14, -180];
      const lim = S.tailPivot ? 14 : 85;
      S.tail.setAttribute('transform', `rotate(${clamp(tail.a, -lim, lim)} ${tp[0]} ${tp[1]})`);
      S.arms.forEach((g, i) => g.setAttribute('transform', `rotate(${clamp(arms[i].r, -25, 25)} -140 165)`));

      updatePens(dt);
    });
  };
})();
