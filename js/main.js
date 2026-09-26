/* ============================================================
   MAIN — Loading, Smooth scroll, ไทม์ไลน์หลัก (ผูกกับการเลื่อนทั้งเว็บ)
   ลำดับ: Opening → ห้องเรียน → ซูม → ฉากชื่อ → หันไปกระดาน (whip pan)
          → คำถาม → [แปรงลบ → ผลงาน] × N → แปรงลบ → ขอบคุณ
   ============================================================ */
(function () {
  const C = window.CONTENT;
  const $ = (s) => document.querySelector(s);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;

  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- Smooth scroll ---------- */
  const lenis = new Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ---------- ข้อความ ---------- */
  const linesWrap = $('#opening-lines');
  C.opening.forEach((html) => {
    const d = document.createElement('div');
    d.className = 'line';
    d.innerHTML = `<p class="in">${html}</p>`;
    linesWrap.appendChild(d);
  });
  $('#path-line').innerHTML = C.pathLine;
  $('#scroll-hint-text').textContent = C.scrollHint;
  if (isTouch) $('#play-hint').textContent = 'กด ✏️ โหมดเล่น แล้วลองปาปากกา · เขียนหนังสือ · ดึงหัว';

  /* ---------- วาดฉาก ---------- */
  const svg = $('#scene');
  const S = window.buildScene(svg, C);
  $('#tl-shape-clip').setAttribute('d', window.TIMELINE_SHAPE);
  $('#tl-outline').setAttribute('d', window.TIMELINE_SHAPE);
  gsap.set('#tl-fill', { scaleY: 0, transformOrigin: '50% 0%' });

  /* ---------- ตัวชี้ (เมาส์/นิ้ว) ---------- */
  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 };
  window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
  const onTouch = (e) => { const t = e.touches[0]; if (t) { pointer.x = t.clientX; pointer.y = t.clientY; } };
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });

  const pt = svg.createSVGPoint();
  function toScene(x, y) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    pt.x = x; pt.y = y;
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  /* ---------- โหมดเล่น (มือถือ: แตะแล้วเล่นกิมมิกได้โดยไม่เลื่อนจอ) ---------- */
  let playMode = false, interacting = false;
  const playBtn = $('#play-btn');
  if (isTouch) document.body.classList.add('touch');
  playBtn.addEventListener('click', () => {
    playMode = !playMode;
    playBtn.setAttribute('aria-pressed', playMode);
    playBtn.querySelector('span').textContent = playMode ? 'เลื่อนต่อ' : 'โหมดเล่น';
    document.body.classList.toggle('playing', playMode);
    playMode ? lenis.stop() : lenis.start();
    Sound.play('click');
  });

  const api = {
    toScene,
    pointerScene: () => toScene(pointer.x, pointer.y),
    canInteract: (e) => e.pointerType !== 'touch' || playMode,
    onInteractStart: () => { interacting = true; document.body.classList.add('grabbing'); },
    onInteractEnd: () => { interacting = false; document.body.classList.remove('grabbing'); }
  };

  window.initCharacter(S, api);
  const Board = window.initBoard(C, api);
  const Mascot = window.initMascot(api);

  /* ============================================================
     กล้องห้องเรียน (viewBox)
     ============================================================ */
  const SHOTS = [
    { x: 0,   y: 0,   w: 1920, h: 1080, roi: [480, 1360] }, // ภาพ 1: ห้องเรียนมุมกว้าง
    { x: 560, y: 70,  w: 960,  h: 540,  roi: [700, 1440] }, // ภาพ 2: ซูมเข้าหานักเรียน + ?
    { x: 600, y: 222, w: 880,  h: 495,  roi: [700, 1140], roiNarrow: [790, 1050] }  // ภาพ 3: หน้า + ป้ายชื่อ + หนังสือ
  ];
  let boxes = [];
  function computeBoxes() {
    const r = svg.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : window.innerWidth / window.innerHeight || 16 / 9;
    boxes = SHOTS.map((s) => {
      let cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      let h = s.h, w = h * a;
      if (w < s.w) {
        const roi = a < 1 && s.roiNarrow ? s.roiNarrow : s.roi; // จอแนวตั้ง: ครอปเข้าหน้าให้ใกล้ขึ้น
        const pad = 30, r0 = roi[0] - pad, r1 = roi[1] + pad;
        if (w < r1 - r0) { w = r1 - r0; h = w / a; }
        cx = Math.min(Math.max(cx, r1 - w / 2), r0 + w / 2);
      }
      return { cx, cy, w, h };
    });
  }
  const cam = { k: 0 };
  function applyCam() {
    const i = Math.min(boxes.length - 2, Math.floor(cam.k));
    const t = cam.k - i, A = boxes[i], B = boxes[i + 1];
    const w = Math.exp(Math.log(A.w) + (Math.log(B.w) - Math.log(A.w)) * t);
    const h = w * (A.h / A.w);
    const cx = A.cx + (B.cx - A.cx) * t, cy = A.cy + (B.cy - A.cy) * t;
    svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`);
  }
  computeBoxes(); applyCam();
  window.addEventListener('resize', () => { computeBoxes(); applyCam(); });

  /* ============================================================
     ไทม์ไลน์หลัก
     ============================================================ */
  const lines = gsap.utils.toArray('#opening-lines .line');
  gsap.set(lines[0], { autoAlpha: 1 });
  gsap.set('#board-layer', { xPercent: -100, autoAlpha: 0 });

  const cues = [];   // จุดที่ต้องสั่งงานตอนเลื่อนผ่าน (ไป/กลับ)
  const ranges = []; // ช่วงเวลา (เข้า/ออก)
  const UNIT = 0.95; // ความยาวการเลื่อนต่อ 1 หน่วยเวลา (เท่าของความสูงจอ)

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true });

  // 1) Opening แบบ Heal
  tl.addLabel('start', 0);
  tl.to('.scroll-hint', { autoAlpha: 0, duration: 0.3 }, 0);
  lines.forEach((line, i) => {
    if (i > 0) tl.fromTo(line, { autoAlpha: 0, y: 60, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6 });
    tl.to(line, { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, '+=0.7');
  });
  tl.to('#opening', { autoAlpha: 0, duration: 1, ease: 'none' });
  tl.to({}, { duration: 0.5 });

  // 2) ซูมเข้าหานักเรียน + ?
  tl.addLabel('z1');
  tl.to(cam, { k: 1, duration: 2, ease: 'power2.inOut', onUpdate: applyCam }, 'z1');
  tl.fromTo(S.qWrap, { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 60%' }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(2.2)' }, 'z1+=1.1');
  tl.to({}, { duration: 0.6 });

  // 3) ซูมเข้าชื่อ + ข้อความ + ไทม์ไลน์ + คำใบ้กิมมิก
  tl.addLabel('name');
  tl.to(cam, { k: 2, duration: 2, ease: 'power2.inOut', onUpdate: applyCam }, 'name');
  tl.to(S.qWrap, { autoAlpha: 0, scale: 1.5, duration: 0.6, ease: 'power2.in' }, 'name');
  tl.fromTo('.s3-text', { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.8 }, 'name+=1.5');
  tl.fromTo('#timeline', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 'name+=1.5');
  tl.fromTo('#play-hint', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 'name+=1.9');
  tl.to({}, { duration: 3 }); // ค้างไว้ให้เล่นกิมมิก

  // 4) หันไปหน้ากระดาน (whip pan ไปทางซ้าย)
  tl.addLabel('whip');
  tl.to(['.s3-text', '#play-hint'], { autoAlpha: 0, duration: 0.2 }, 'whip');
  tl.to('#classroom', { xPercent: 75, filter: 'blur(18px)', duration: 1, ease: 'power3.in' }, 'whip');
  tl.set('#board-layer', { autoAlpha: 1 }, 'whip+=0.35');
  tl.fromTo('#board-layer', { xPercent: -100, filter: 'blur(18px)' }, { xPercent: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', immediateRender: false }, 'whip+=0.35');
  tl.set('#classroom', { autoAlpha: 0 }, 'whip+=1.1');
  cues.push({ label: 'whip', fwd: () => Sound.play('whoosh', 0.3), back: () => Sound.play('whoosh', 0.3) });

  // 5) คำถามบนกระดาน
  tl.addLabel('question', '+=0.1');
  cues.push({ label: 'question', fwd: () => { Board.clearInk(); Board.show(0, true); }, back: () => Board.show(-1) });
  tl.to({}, { duration: 3 });

  // 6) แปรงลบ → สไลด์ถัดไป (ผลงานทีละชิ้น → ขอบคุณ)
  const targets = C.projects.map((_, i) => ({ label: 'project-' + i, slide: Board.projectSlide(i), hold: 4 }));
  targets.push({ label: 'contact', slide: Board.contactSlide, hold: 4 });
  targets.push({ label: 'thanks', slide: Board.thanksSlide, hold: 2.5 });
  let prevSlide = 0;
  targets.forEach((t, i) => {
    const wp = { p: 0 };
    const eraseLabel = 'erase-' + i;
    tl.addLabel(eraseLabel);
    tl.fromTo(wp, { p: 0 }, { p: 1, duration: 2.5, ease: 'none', immediateRender: false, onUpdate: () => Board.setWipe(wp.p) }, eraseLabel);
    ranges.push({ from: eraseLabel, offFrom: -0.3, to: eraseLabel, offTo: 3.3, on: () => Mascot.setPeek(true), off: () => Mascot.setPeek(false) });
    tl.addLabel(t.label);
    tl.set(wp, { p: 0, onUpdate: () => Board.setWipe(0) }, t.label);
    const from = prevSlide;
    cues.push({
      label: t.label,
      fwd: () => { Board.setWipe(0); Board.clearInk(); Board.show(t.slide, true); },
      back: () => { Board.show(from, false); Board.setWipe(wp.p); } // ใช้ค่าจริงของแปรง ณ ตำแหน่งที่ถอยไปถึง
    });
    prevSlide = t.slide;
    tl.to({}, { duration: t.hold });
  });

  /* ---------- ScrollTrigger ตัวเดียวคุมทั้งเว็บ ---------- */
  let lastTime = 0;
  const st = ScrollTrigger.create({
    trigger: '#story',
    start: 'top top',
    end: () => '+=' + window.innerHeight * tl.duration() * UNIT,
    pin: true,
    scrub: 1,
    animation: tl,
    invalidateOnRefresh: true,
    onRefresh: () => Board.layout()
  });

  // ตรวจจุด cue/range ทุกเฟรมจากเวลาจริงของไทม์ไลน์ (ถูกต้องทั้งไปและกลับ)
  const cueTimes = () => cues.forEach((c) => (c.time = tl.labels[c.label]));
  cueTimes();
  ranges.forEach((r) => { r.a = tl.labels[r.from] + r.offFrom; r.b = tl.labels[r.to] + r.offTo; r.in = false; });
  gsap.ticker.add(() => {
    const t = tl.time();
    if (t !== lastTime) {
      // ไปข้างหน้า: เรียงตามลำดับ / ถอยหลัง: เรียงย้อนกลับ (กันสไลด์ผิดตอนกระโดดข้ามหลายฉาก)
      if (t > lastTime) cues.forEach((c) => { if (lastTime < c.time && t >= c.time) c.fwd(); });
      else [...cues].reverse().forEach((c) => { if (lastTime >= c.time && t < c.time) c.back(); });
      lastTime = t;
    }
    ranges.forEach((r) => {
      const inR = t >= r.a && t <= r.b;
      if (inR !== r.in) { r.in = inR; inR ? r.on() : r.off(); }
    });
    gsap.set('#tl-fill', { scaleY: tl.progress() });
  });

  /* ---------- จุดบนไทม์ไลน์ (ช่วงชีวิต/ผลงาน) ---------- */
  const marks = $('#tl-marks');
  ['question', ...targets.map((t) => t.label)].forEach((l) => {
    const d = document.createElement('i');
    d.style.top = (tl.labels[l] / tl.duration()) * 100 + '%';
    marks.appendChild(d);
  });

  /* ---------- ? ลอย + เงาขยับ ---------- */
  if (!reduceMotion) {
    gsap.to(S.qFloat, { y: -14, rotation: 5, transformOrigin: '50% 50%', duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.fromTo(S.qShadow, { x: 6, y: 6 }, { x: 16, y: 14, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  } else {
    gsap.set(S.qShadow, { x: 10, y: 10 });
  }

  /* ============================================================
     UI: โลโก้ / เมนูทางลัด / เสียง
     ============================================================ */
  function scrollToLabel(label, dur = 1.8) {
    const t = label === 'start' ? 0 : tl.labels[label] + 0.05;
    const y = st.start + (t / tl.duration()) * (st.end - st.start);
    lenis.scrollTo(y, { duration: dur });
  }
  $('#logo-btn').addEventListener('click', () => scrollToLabel('start', 2.2));

  const menu = $('#menu'), menuBtn = $('#menu-btn');
  C.nav.forEach((n) => {
    if (n.target !== 'start' && tl.labels[n.target] === undefined) return;
    const li = document.createElement('li');
    li.innerHTML = `<button data-target="${n.target}">${n.label}</button>`;
    $('#menu-list').appendChild(li);
  });
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
  }
  menuBtn.addEventListener('click', () => { setMenu(!menu.classList.contains('open')); Sound.play('click'); });
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-target]');
    if (b) { setMenu(false); scrollToLabel(b.dataset.target); }
    else if (e.target === menu) setMenu(false);
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const soundBtn = $('#sound-btn');
  soundBtn.addEventListener('click', () => {
    const on = Sound.toggle();
    soundBtn.setAttribute('aria-pressed', on);
    soundBtn.setAttribute('aria-label', on ? 'ปิดเสียง' : 'เปิดเสียง');
    soundBtn.classList.toggle('is-on', on);
    Sound.play('click');
  });

  /* ============================================================
     0. LOADING
     ============================================================ */
  function loaded(img) { return new Promise((r) => (img.complete ? r() : (img.onload = img.onerror = r))); }
  const tasks = [
    document.fonts.ready,
    loaded($('.loader-logo')),
    new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r)))
  ];
  let done = 0;
  tasks.forEach((t) => t.then(() => done++));
  const num = $('#loader-num');
  const t0 = performance.now(), MIN = 1400, st0 = { p: 0 };
  function tick() {
    const target = Math.min(done / tasks.length, (performance.now() - t0) / MIN);
    st0.p += (target - st0.p) * 0.12;
    if (target >= 1 && st0.p > 0.995) st0.p = 1;
    num.textContent = Math.round(st0.p * 100);
    if (st0.p === 1) { gsap.ticker.remove(tick); finishLoading(); }
  }
  gsap.ticker.add(tick);

  function finishLoading() {
    ScrollTrigger.refresh();
    Board.layout();
    gsap.timeline({ delay: 0.25 })
      .to('.loader-logo', { scale: 0.85, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
      .to('.loader-pct', { autoAlpha: 0, duration: 0.3 }, '<')
      .to('#loader', { autoAlpha: 0, duration: 0.5 })
      .add(() => { document.body.classList.remove('is-loading'); lenis.start(); })
      .from(lines[0].querySelector('.in'), { y: 40, autoAlpha: 0, filter: 'blur(10px)', duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .from('.scroll-hint', { autoAlpha: 0, duration: 0.6 }, '-=0.3')
      .to('.ui', { autoAlpha: 1, duration: 0.6 }, '<');
  }

  // สำหรับทดสอบ
  window.__debug = { tl, st, lenis, Board, Mascot, scrollToLabel };
})();
