/* ============================================================
   BOARD — กระดานขาวขอบดำ
   · สไลด์: คำถาม → ผลงาน (เรียงอดีต→ปัจจุบัน) → ขอบคุณ
   · ข้อความเขียนขึ้นทีละตัว (ตัดตามพยางค์ไทยไม่ให้สระ/วรรณยุกต์แยก)
   · ผู้ใช้วาดบนกระดานได้ · ลากแปรงลบถูเองได้
   · แปรงลบอัตโนมัติตามการเลื่อน (setWipe)
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);

  window.initBoard = function (C, api) {
    const surface = $('#board-surface');
    const slidesWrap = $('#slides');
    const layer = $('#board-layer');
    const eraser = $('#eraser');
    const inkC = $('#board-ink'), wipeC = $('#board-wipe');
    const ink = inkC.getContext('2d'), wipe = wipeC.getContext('2d');

    /* ---------- สร้างสไลด์จาก content.js ---------- */
    const slides = [];
    function addSlide(cls, html) {
      const s = document.createElement('div');
      s.className = 'slide ' + cls;
      s.innerHTML = html;
      slidesWrap.appendChild(s);
      slides.push(s);
      return s;
    }

    addSlide('slide-question', `
      <p class="b-text b-big write">${C.question.text}</p>
      <figure class="photo placeholder pop"><span>${C.question.imageNote}</span></figure>
    `);

    C.projects.forEach((p) => {
      const thumbs = p.images.map((src, i) =>
        `<button class="thumb${i === 0 ? ' active' : ''}" data-src="${src}" aria-label="รูปที่ ${i + 1}"><img src="${src}" alt=""></button>`).join('');
      const meta = [p.date, p.duration && `ใช้เวลา <em>${p.duration}</em>`].filter(Boolean).join(' · ');
      const teamLine = p.teamSize === 1 ? `${p.team} · <b>เกมเดี่ยว</b>` : `${p.team} · ${p.teamSize} คน`;
      const link = p.link
        ? `<a class="itch pop" href="${p.link}" target="_blank" rel="noopener">${p.linkLabel} ↗</a>` +
          (p.uploadedBy ? `<small class="uploaded pop">อัปโหลดโดย ${p.uploadedBy}</small>` : '')
        : '';
      addSlide('slide-project', `
        <div class="p-left">
          <h2 class="b-title write">${p.title}</h2>
          ${meta ? `<p class="b-meta write">${meta}</p>` : ''}
          ${p.about ? `<p class="b-text write">${p.about}</p>` : ''}
        </div>
        <div class="p-center">
          <figure class="photo main pop"><img class="main-img" src="${p.images[0]}" alt="${p.title}">${
            p.award ? `<span class="stamp"><b>${p.award}</b>${p.awardSub ? `<small>${p.awardSub}</small>` : ''}</span>` : ''
          }</figure>
          <div class="thumbs pop">${thumbs}</div>
        </div>
        <div class="p-right">
          <div class="team-card pop">
            <span class="tc-label">ทีม</span><span>${teamLine}</span>
            <span class="tc-label">ผมทำ</span><span class="tc-role">${p.role}</span>
          </div>
          ${p.why ? `<p class="b-text write">${p.why}</p>` : ''}
          ${p.goal ? `<p class="b-note write">“${p.goal}”</p>` : ''}
          ${link}
        </div>
      `);
    });

    /* ---------- หน้าติดต่อ: การ์ดแปะกระดาน ---------- */
    const ICONS = {
      instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" class="fill"/>',
      facebook: '<path class="fill" d="M13.5 21v-7.2h2.4l.4-2.9h-2.8V9.1c0-.8.3-1.4 1.4-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.2H8.2v2.9h2.4V21z"/>',
      email: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
      phone: '<path d="M6.5 3.5h3l1.6 4.3-2.2 1.4a11 11 0 0 0 5.9 5.9l1.4-2.2 4.3 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'
    };
    const cards = C.contact.items.map((c, i) => {
      const external = /^https?:/.test(c.href);
      return `
        <div class="c-card" style="--r:${[-3, 2.5, 2, -2.5][i % 4]}deg">
          <a class="c-inner" href="${c.href}" ${external ? 'target="_blank" rel="noopener"' : ''} aria-label="${c.label}: ${c.value}">
            <span class="c-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[c.type] || ''}</svg></span>
            <span class="c-text"><small>${c.label}</small><b>${c.value}</b></span>
            <span class="c-go" aria-hidden="true">↗</span>
          </a>
          ${c.copy ? `<button class="c-copy" data-copy="${c.value}" aria-label="คัดลอก ${c.label}">คัดลอก</button>` : ''}
        </div>`;
    }).join('');
    addSlide('slide-contact', `
      <div class="ct-head">
        <h2 class="b-title b-huge write">${C.contact.title}</h2>
        <p class="b-text write">${C.contact.sub}</p>
      </div>
      <div class="ct-cards">${cards}</div>
      <div class="toast" role="status" aria-live="polite"></div>
    `);

    addSlide('slide-thanks', `
      <div class="t-main">
        <h2 class="b-title b-huge write">${C.thanks.title}</h2>
        <p class="b-text write">${C.thanks.sub}</p>
      </div>
      <img class="t-mascot pop" src="assets/mascot/stand.png" alt="">
    `);

    // คัดลอกอีเมล/เบอร์
    slidesWrap.addEventListener('click', async (e) => {
      const b = e.target.closest('.c-copy');
      if (!b) return;
      const toast = b.closest('.slide').querySelector('.toast');
      let ok = true;
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch (_) { ok = false; }
      toast.textContent = ok ? `คัดลอก ${b.dataset.copy} แล้ว ✓` : b.dataset.copy;
      Sound.play('pop');
      gsap.killTweensOf(toast);
      gsap.timeline()
        .fromTo(toast, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'back.out(2)' })
        .to(toast, { autoAlpha: 0, y: -8, duration: 0.3, delay: 1.6 });
    });

    /* ---------- แตกตัวอักษรสำหรับเขียนทีละตัว ---------- */
    const seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'grapheme' }) : null;
    function splitChars(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((n) => {
        const frag = document.createDocumentFragment();
        const parts = seg ? [...seg.segment(n.textContent)].map((s) => s.segment) : [...n.textContent];
        parts.forEach((ch) => {
          const sp = document.createElement('span');
          sp.className = 'ch';
          sp.textContent = ch;
          frag.appendChild(sp);
        });
        n.parentNode.replaceChild(frag, n);
      });
    }
    slides.forEach((s) => s.querySelectorAll('.write').forEach(splitChars));

    /* ---------- แสดงสไลด์ ---------- */
    let current = -1, writeTl = null;
    function show(i, animate) {
      if (writeTl) writeTl.kill();
      slides.forEach((s, k) => s.classList.toggle('on', k === i));
      current = i;
      const s = slides[i];
      if (!s) return;
      const chars = s.querySelectorAll('.ch');
      const pops = s.querySelectorAll('.pop');
      const cardsEl = [...s.querySelectorAll('.c-card')];
      const cardRot = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0;
      if (!animate) {
        gsap.set(chars, { opacity: 1 });
        gsap.set(pops, { opacity: 1, scale: 1, y: 0 });
        cardsEl.forEach((c) => gsap.set(c, { opacity: 1, y: 0, scale: 1, rotation: cardRot(c) }));
        return;
      }
      gsap.set(chars, { opacity: 0 });
      gsap.set(pops, { opacity: 0, scale: 0.9, y: 14 });
      cardsEl.forEach((c, i) => gsap.set(c, { opacity: 0, y: -70, scale: 1.25, rotation: i % 2 ? 22 : -22 }));
      let n = 0;
      writeTl = gsap.timeline()
        .to(chars, {
          opacity: 1, duration: 0.01, ease: 'none',
          stagger: { each: 0.035, onStart: () => { if (n++ % 3 === 0) Sound.play('squeak', 0.05); } }
        })
        .to(pops, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.8)', stagger: 0.12, onStart: () => Sound.play('pop') }, '-=0.3');
      // การ์ดติดต่อ: ลอยลงมาแปะกระดานทีละใบ
      cardsEl.forEach((c, i) => {
        writeTl.to(c, {
          opacity: 1, y: 0, scale: 1, rotation: cardRot(c), duration: 0.55, ease: 'back.out(2.2)',
          onStart: () => Sound.play('tick', 0.02)
        }, i === 0 ? '-=0.6' : '-=0.4');
      });
    }

    /* ---------- แกลเลอรี (แบบหน้าสินค้า: คลิกรูปเล็กเปลี่ยนรูปใหญ่) ---------- */
    slidesWrap.addEventListener('click', (e) => {
      const th = e.target.closest('.thumb');
      if (!th) return;
      const slide = th.closest('.slide');
      const main = slide.querySelector('.main-img');
      if (main.getAttribute('src') === th.dataset.src) return;
      slide.querySelectorAll('.thumb').forEach((t) => t.classList.toggle('active', t === th));
      Sound.play('click');
      gsap.timeline()
        .to(main, { opacity: 0, scale: 0.96, duration: 0.15 })
        .add(() => main.setAttribute('src', th.dataset.src))
        .to(main, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' });
    });

    /* ---------- Canvas ---------- */
    let W = 0, H = 0, dpr = 1;
    function resize() {
      const r = surface.getBoundingClientRect();
      if (!r.width) return;
      const old = document.createElement('canvas');
      old.width = inkC.width; old.height = inkC.height;
      if (inkC.width) old.getContext('2d').drawImage(inkC, 0, 0);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      [inkC, wipeC].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      ink.setTransform(dpr, 0, 0, dpr, 0, 0);
      wipe.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (old.width) ink.drawImage(old, 0, 0, W, H);
      drawWipe(lastWipe);
    }
    window.addEventListener('resize', resize);

    // เส้นทางถูอัตโนมัติ: ซิกแซก 5 แถว (พิกัด 0–1)
    const ROWS = 5;
    const zig = [];
    for (let i = 0; i < ROWS; i++) {
      const y = (i + 0.5) / ROWS;
      zig.push(i % 2 ? [0.95, y - 0.03] : [0.05, y - 0.03]);
      zig.push(i % 2 ? [0.05, y + 0.03] : [0.95, y + 0.03]);
    }
    const segLen = [];
    let total = 0;
    for (let i = 1; i < zig.length; i++) {
      const l = Math.hypot(zig[i][0] - zig[i - 1][0], zig[i][1] - zig[i - 1][1]);
      segLen.push(l); total += l;
    }
    function zigAt(p) {
      let d = p * total;
      for (let i = 0; i < segLen.length; i++) {
        if (d <= segLen[i]) {
          const t = d / segLen[i], a = zig[i], b = zig[i + 1];
          return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, i, dir: Math.sign(b[0] - a[0]) };
        }
        d -= segLen[i];
      }
      const l = zig[zig.length - 1];
      return { x: l[0], y: l[1], i: zig.length - 2, dir: 1 };
    }

    // ลายถูลบ (ขาว + ขอบฟุ้งเล็กน้อย)
    function wipeStroke(ctx, pts, w) {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = w;
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = w * 1.12;
      ctx.stroke();
      ctx.restore();
    }

    let lastWipe = 0;
    function drawWipe(p) {
      lastWipe = p;
      wipe.clearRect(0, 0, W, H);
      if (p <= 0 || !W) return;
      const pts = [];
      const end = zigAt(p);
      for (let i = 0; i <= end.i; i++) pts.push([zig[i][0] * W, zig[i][1] * H]);
      pts.push([end.x * W, end.y * H]);
      wipeStroke(wipe, pts, (H / ROWS) * 1.35);
      if (p >= 0.999) { wipe.fillStyle = '#fff'; wipe.fillRect(0, 0, W, H); }
    }

    /* ---------- แปรงลบ ---------- */
    let restPos = { x: 0, y: 0 };
    const er = { x: 0, y: 0, r: 0, held: false, auto: 0 };
    function eraserSize() { return eraser.getBoundingClientRect(); }
    function computeRest() {
      const lr = layer.getBoundingClientRect();
      const tray = $('#board-tray').getBoundingClientRect();
      const e = eraser.offsetWidth, eh = eraser.offsetHeight;
      restPos = { x: tray.left - lr.left + tray.width * 0.05, y: tray.top - lr.top - eh * 0.6 }; // วางบนรางซ้ายล่าง (มุมที่ว่างที่สุดของทุกสไลด์)
    }
    function placeEraser() {
      gsap.set(eraser, { x: er.x, y: er.y, rotation: er.r });
    }
    function surfaceOffset() {
      const lr = layer.getBoundingClientRect(), sr = surface.getBoundingClientRect();
      return { x: sr.left - lr.left, y: sr.top - lr.top };
    }
    function autoEraser(p) {
      er.auto = p;
      if (er.held) return;
      const o = surfaceOffset();
      const ew = eraser.offsetWidth, eh = eraser.offsetHeight;
      const IN = 0.07;
      if (p <= 0 || p >= 1) { er.x = restPos.x; er.y = restPos.y; er.r = 0; placeEraser(); return; }
      const a = zigAt(0), b = zigAt(1);
      let x, y, r;
      if (p < IN) {
        const t = gsap.parseEase('power2.inOut')(p / IN);
        x = restPos.x + (o.x + a.x * W - ew / 2 - restPos.x) * t;
        y = restPos.y + (o.y + a.y * H - eh / 2 - restPos.y) * t;
        r = -20 * t;
      } else if (p > 1 - IN) {
        const t = gsap.parseEase('power2.inOut')((p - (1 - IN)) / IN);
        x = o.x + b.x * W - ew / 2 + (restPos.x - (o.x + b.x * W - ew / 2)) * t;
        y = o.y + b.y * H - eh / 2 + (restPos.y - (o.y + b.y * H - eh / 2)) * t;
        r = -20 * (1 - t);
      } else {
        const q = zigAt((p - IN) / (1 - 2 * IN));
        x = o.x + q.x * W - ew / 2;
        y = o.y + q.y * H - eh / 2;
        r = -20 + q.dir * 6;
      }
      er.x = x; er.y = y; er.r = r;
      placeEraser();
    }
    function setWipe(p) {
      const q = p <= 0.07 ? 0 : p >= 0.93 ? 1 : (p - 0.07) / 0.86;
      drawWipe(q);
      autoEraser(p);
      if (p > 0.07 && p < 0.93) Sound.rub(0.12); else Sound.rub(0);
    }

    /* ---------- วาด / ถูลบ ด้วยมือผู้ใช้ ---------- */
    let mode = null, last = null, lastT = 0, grabOff = { x: 0, y: 0 };
    let manualDone = false, manualComplete = null;
    const erasedCells = new Set();
    function markErased(cx, cy, radius) {
      const cols = 12, rows = 7;
      const x0 = Math.max(0, Math.floor((cx - radius) / W * cols));
      const x1 = Math.min(cols - 1, Math.floor((cx + radius) / W * cols));
      const y0 = Math.max(0, Math.floor((cy - radius) / H * rows));
      const y1 = Math.min(rows - 1, Math.floor((cy + radius) / H * rows));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) erasedCells.add(`${x}:${y}`);
      if (!manualDone && erasedCells.size / (cols * rows) >= .62) {
        manualDone = true;
        Sound.play('bell', 1);
        if (manualComplete) manualComplete();
      }
    }
    function toSurface(e) {
      const r = surface.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    layer.addEventListener('pointerdown', (e) => {
      if (!api.canInteract(e)) return;
      if (e.target.closest('#eraser')) {
        mode = 'erase';
        er.held = true;
        const lr = layer.getBoundingClientRect();
        grabOff = { x: e.clientX - lr.left - er.x, y: e.clientY - lr.top - er.y };
        gsap.killTweensOf(er);
        Sound.play('grab');
      } else if (e.target.closest('#board-surface') && !e.target.closest('a, button')) {
        mode = 'draw';
      } else return;
      last = toSurface(e); lastT = performance.now();
      layer.setPointerCapture(e.pointerId);
      e.preventDefault();
      api.onInteractStart();
    });
    layer.addEventListener('pointermove', (e) => {
      if (!mode) return;
      const p = toSurface(e);
      const now = performance.now();
      if (mode === 'draw') {
        ink.strokeStyle = '#111'; ink.lineWidth = 4; ink.lineCap = 'round'; ink.lineJoin = 'round';
        ink.beginPath(); ink.moveTo(last.x, last.y); ink.lineTo(p.x, p.y); ink.stroke();
        Sound.play('squeak', 0.08);
      } else {
        const lr = layer.getBoundingClientRect();
        er.x = e.clientX - lr.left - grabOff.x;
        er.y = e.clientY - lr.top - grabOff.y;
        er.r += (-20 - er.r) * 0.2;
        placeEraser();
        // จุดกลางแปรง (ด้านสักหลาด) ในพิกัดกระดาน
        const o = surfaceOffset();
        const cx = er.x + eraser.offsetWidth / 2 - o.x, cy = er.y + eraser.offsetHeight * 0.75 - o.y;
        if (last.cx !== undefined) {
          const radius = eraser.offsetHeight * 0.48;
          wipeStroke(ink, [[last.cx, last.cy], [cx, cy]], radius * 2);
          wipeStroke(wipe, [[last.cx, last.cy], [cx, cy]], radius * 2);
          markErased(cx, cy, radius);
        }
        p.cx = cx; p.cy = cy;
        const v = Math.hypot(p.x - last.x, p.y - last.y) / Math.max(1, now - lastT);
        Sound.rub(Math.min(0.35, v * 0.2));
      }
      last = p; lastT = now;
    });
    function end() {
      if (!mode) return;
      if (mode === 'erase') {
        er.held = false;
        Sound.rub(0);
        // กลับไปที่เดิม (ถ้าแปรงอัตโนมัติกำลังทำงาน จะกลับไปวิ่งต่อ)
        const target = { x: er.x, y: er.y, r: er.r };
        gsap.to(target, {
          x: restPos.x, y: restPos.y, r: 0, duration: 0.5, ease: 'power2.inOut',
          onUpdate: () => { if (!er.held) { er.x = target.x; er.y = target.y; er.r = target.r; placeEraser(); } },
          onComplete: () => autoEraser(er.auto)
        });
      }
      mode = null;
      api.onInteractEnd();
    }
    layer.addEventListener('pointerup', end);
    layer.addEventListener('pointercancel', end);

    function clearInk() { ink.clearRect(0, 0, W, H); erasedCells.clear(); manualDone = false; }

    function layout() { resize(); computeRest(); autoEraser(er.auto); }
    window.addEventListener('resize', () => { computeRest(); autoEraser(er.auto); });

    return {
      count: slides.length,
      projectSlide: (i) => 1 + i,
      contactSlide: slides.length - 2,
      thanksSlide: slides.length - 1,
      show, setWipe, clearInk, layout,
      onManualComplete(fn) { manualComplete = fn; },
      get current() { return current; }
    };
  };
})();
