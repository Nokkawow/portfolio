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
    Effects.splitWords(d.querySelector('.in')); // Text Generate: ค่อยๆ ชัดทีละคำ
  });
  Effects.flipWords($('#path-line'), C.pathLine);
  $('#scroll-hint-text').textContent = C.scrollHint;
  if (isTouch) $('#play-hint').textContent = 'กด ✏️ โหมดเล่น แล้วลองปาปากกา · เขียนหนังสือ · ดึงหัว';

  /* ---------- วาดฉาก ---------- */
  const svg = $('#scene');
  const S = window.buildScene(svg, C);

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
  const Workspace = window.initWorkspace(C);
  const VHS = window.initVHS(Workspace.calendarPages);
  Effects.tiltCards(document.getElementById('slides'));   // 3D Card
  Effects.sparkles(document.getElementById('slides'));    // Sparkles
  const Mascot = window.initMascot(api);

  /* ============================================================
     กล้องห้องเรียน (viewBox)
     ============================================================ */
  const SHOTS = [
    { x: 0,   y: -60, w: 1920, h: 1080, roi: [480, 1360] }, // ภาพ 1: ห้องเรียนมุมกว้าง (y ติดลบ = เว้นที่ให้ Nav)
    { x: 560, y: 20,  w: 960,  h: 540,  roi: [700, 1440] }, // ภาพ 2: ซูมเข้าหานักเรียน + ?
    { x: 600, y: 175, w: 880,  h: 495,  roi: [700, 1140], roiNarrow: [790, 1050] }  // ภาพ 3: หน้า + ป้ายชื่อ + หนังสือ
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
  gsap.set(['#time-layer', '#workspace-layer'], { autoAlpha: 0 });

  const cues = [];   // จุดที่ต้องสั่งงานตอนเลื่อนผ่าน (ไป/กลับ)
  const ranges = []; // ช่วงเวลา (เข้า/ออก)
  const UNIT = 0.95; // ความยาวการเลื่อนต่อ 1 หน่วยเวลา (เท่าของความสูงจอ)

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' }, paused: true });

  // 1) Opening แบบ Heal
  tl.addLabel('start', 0);
  tl.to('.scroll-hint', { autoAlpha: 0, duration: 0.3 }, 0);
  // เปิดเว็บ = กระดาษขาวเต็มจอ ต้องจุดไม้ขีดเผา (หรือเลื่อนลงแล้วไหม้เอง) ถึงเห็นจอดำเปิดเรื่อง
  const Matches = window.initMatches(lines, api);
  const bp = { p: 0 };
  tl.fromTo(bp, { p: 0 }, { p: 1, duration: 1.6, ease: 'none', immediateRender: false, onUpdate: () => Matches.setAuto(0, bp.p) }, 0.2);
  lines.forEach((line, i) => {
    if (i > 0) {
      // Text Generate: คำค่อยๆ ปรากฏจากเบลอ ทีละคำตามการเลื่อน
      const ws = line.querySelectorAll('.w');
      tl.set(line, { autoAlpha: 1, y: 0, filter: 'blur(0px)' });
      tl.fromTo(ws, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.35, stagger: 0.9 / ws.length, ease: 'none' });
    }
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

  // 6) ลบคำถามให้หมด → กริ่งเลิกเรียน → กระดานมืด
  const wipe = { p: 0 };
  tl.addLabel('erase-board');
  tl.fromTo(wipe, { p: 0 }, { p: 1, duration: 3, ease: 'none', immediateRender: false, onUpdate: () => Board.setWipe(wipe.p) }, 'erase-board');
  tl.fromTo('#chalk-dust', { autoAlpha: 0 }, { autoAlpha: .55, duration: 1.4, yoyo: true, repeat: 1 }, 'erase-board+=.4');
  ranges.push({ from: 'erase-board', offFrom: -0.2, to: 'erase-board', offTo: 3.1, on: () => Mascot.setPeek(true), off: () => Mascot.setPeek(false) });
  tl.addLabel('bell');
  tl.to(['#mascot','#eraser'],{autoAlpha:0,duration:.3},'bell');
  cues.push({ label: 'bell', fwd: () => Sound.play('bell', 1), back: () => {} });
  tl.to('#board-layer', { backgroundColor: '#000', duration: 1.1, ease: 'power2.in' }, 'bell');
  tl.to('#board', { autoAlpha: 0, scale: 1.03, duration: .75 }, 'bell+=.25');

  // 7) ปฏิทินหลุดจาก 26 ก.ย. 2566 ถึง 27 ก.ย. 2569
  tl.addLabel('time');
  tl.set('#time-layer', { autoAlpha: 1 }, 'time');
  Workspace.calendarPages.slice(0, -1).forEach((page, i) => {
    tl.to(page, { yPercent: 125, rotation: i % 2 ? 14 : -12, duration: .75, ease: 'power2.in' }, `time+=${i * .62}`);
    tl.set(page, { autoAlpha: 0 }, `time+=${i * .62 + .75}`);
  });
  tl.fromTo('.time-copy', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .8 }, 'time+=1.5');
  tl.to({}, { duration: .7 });

  // 8) ห้องทำงาน: เห็นด้านหลังก่อน แล้วหมุน 90° พร้อมซูมเข้าจอ
  tl.addLabel('workspace');
  // VHS: กรอเทป (เส้นวิ่งเร็ว + กระตุกแรง) แล้วตัดเข้าภาพชัดของปัจจุบัน
  tl.fromTo('.vhs-rewind', { autoAlpha: 0 }, { autoAlpha: 1, duration: .35, immediateRender: false }, 'workspace-=0.45');
  tl.to('#vhs', { autoAlpha: 0, duration: .3 }, 'workspace+=0.1');
  cues.push({ label: 'workspace', fwd: () => { VHS.glitch(true); Sound.play('whoosh', .3); }, back: () => VHS.glitch(true) });
  tl.fromTo('#workspace-layer', { autoAlpha: 0, xPercent: -8 }, { autoAlpha: 1, xPercent: 0, duration: 1.2, immediateRender: false }, 'workspace');
  tl.to('#time-layer', { autoAlpha: 0, duration: .7 }, 'workspace');
  tl.fromTo('.room-caption', { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: .9 }, 'workspace+=.35');
  tl.to({}, { duration: 1.2 });
  tl.addLabel('turn');
  if (reduceMotion) {
    tl.to('.work-back', { autoAlpha: 0, duration: .1 }, 'turn');
    tl.fromTo('.work-turned', { autoAlpha: 0 }, { autoAlpha: 1, duration: .1, immediateRender: false }, 'turn');
  } else {
    tl.to('.work-back', { rotationY: 88, scale: .96, duration: .55, ease: 'power2.in' }, 'turn');
    tl.set('.work-back', { autoAlpha: 0 }, 'turn+=.55');
    tl.fromTo('.work-turned', { autoAlpha: 1, rotationY: -88, scale: .96 }, { rotationY: 0, scale: 1, duration: .65, ease: 'back.out(1.4)', immediateRender: false }, 'turn+=.55');
  }
  tl.to(['.room-caption', '.turn-hint'], { autoAlpha: 0, duration: .5 }, 'turn+=.7');
  cues.push({ label: 'turn', fwd: () => Sound.play('whoosh', .5), back: () => Sound.play('whoosh', .5) });
  tl.to({}, {duration:1.1});
  tl.addLabel('monitor');
  tl.to(Workspace.camera, {p:1,duration:2.2,ease:'power3.inOut',onUpdate:Workspace.renderCamera},'monitor');
  tl.to('#monitor-idle', { autoAlpha: 0, duration: .5 }, 'monitor+=1.0');
  tl.to('#work-chair', {autoAlpha:0,xPercent:-15,duration:.8},'monitor');
  tl.to(['#work-desk', '.room-tone'], { autoAlpha: 0, duration: .8 }, 'monitor+=.5');
  tl.to({}, { duration: .5 });

  // 9) ในจอ = เบราว์เซอร์ Nokkawow News — กดอ่านข่าวได้อิสระ (ไม่กดก็เลื่อนผ่านได้)
  tl.fromTo('#browser', { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(1.5)' }, 'monitor+=1.2');
  tl.addLabel('news', 'monitor+=1.9');
  tl.to({}, { duration: 5 }, 'news');   // ค้างให้เลือกอ่านข่าว

  // 10) ซูมออกจากจอ → เจอมาสคอตนั่งหน้าคอม ทักทาย + บัตรขูดติดต่อ
  tl.addLabel('zoomout');
  tl.to(Workspace.camera, { p: 0, duration: 1.6, ease: 'power3.inOut', onUpdate: Workspace.renderCamera }, 'zoomout');
  tl.to(['#work-desk', '.room-tone'], { autoAlpha: 1, duration: .8 }, 'zoomout+=.4');
  tl.to('#work-chair', { autoAlpha: 1, xPercent: 0, duration: .8 }, 'zoomout+=.6');
  tl.addLabel('contact');
  tl.fromTo('#fin-bubble', { autoAlpha: 0, scale: .6, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(2)' }, 'contact');
  tl.fromTo('#fin-bubble .b1', { autoAlpha: 1 }, { autoAlpha: 1, duration: .01 }, 'contact');
  tl.fromTo('#fin-cards > h2, #fin-cards > p', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .1 }, 'contact+=.2');
  Workspace.cards.forEach((c, k) => {
    tl.fromTo(c, { autoAlpha: 0, y: -50, rotation: k % 2 ? 14 : -14, scale: 1.15 },
      { autoAlpha: 1, y: 0, rotation: [-2, 2, 1.5, -1.5][k % 4], scale: 1, duration: .5, ease: 'back.out(2)' }, 'contact+=' + (0.4 + k * .15));
  });
  tl.set('#fin-cards', { autoAlpha: 1 }, 'contact');
  cues.push({ label: 'contact', fwd: () => { document.body.classList.add('finale'); Workspace.repaintCovers(); Sound.play('pop'); }, back: () => document.body.classList.remove('finale') });
  tl.to({}, { duration: 3.5 });
  tl.addLabel('thanks');
  tl.to('#fin-bubble .b1', { autoAlpha: 0, duration: .25 }, 'thanks');
  tl.fromTo('#fin-bubble .b2', { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, immediateRender: true }, 'thanks+=.2');
  tl.fromTo('#fin-thanks', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, 'thanks+=.3');
  tl.fromTo('.work-turned', { y: 0 }, { y: -14, duration: .2, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, 'thanks+=.3');
  tl.to({}, { duration: 2.5 });

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
    onRefresh: () => { Board.layout(); Workspace.layout(); }
  });
  Board.onManualComplete(() => {
    if (tl.time() >= tl.labels['erase-board'] - .2 && tl.time() < tl.labels.bell) scrollToLabel('bell', .9);
  });

  // ตรวจจุด cue/range ทุกเฟรมจากเวลาจริงของไทม์ไลน์ (ถูกต้องทั้งไปและกลับ)
  const cueTimes = () => cues.forEach((c) => (c.time = tl.labels[c.label]));
  cueTimes();
  ranges.forEach((r) => { r.a = tl.labels[r.from] + r.offFrom; r.b = tl.labels[r.to] + r.offTo; r.in = false; });
  // เวลาที่หน้าปฏิทินแต่ละหน้าหลุดเสร็จ (ใช้เปลี่ยนวันที่บน HUD เทป)
  const calTimes = Workspace.calendarPages.slice(0, -1).map((_, i) => tl.labels.time + i * .62 + .75);

  /* ---------- เคอร์เซอร์เปลี่ยนตามฉาก: ดินสอ (ห้องเรียน) / ชอล์ก (กระดาน) / เมาส์คอม (ห้องทำงาน) ---------- */
  const CURSORS = {
    pencil: ["<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><g stroke='#111' stroke-width='1.6' stroke-linejoin='round'><path d='M3 29l2-7L22 5l5 5-17 17z' fill='#fff'/><path d='M22 5l3-3 5 5-3 3z' fill='#7b1fa2'/><path d='M3 29l2-7 5 5z' fill='#f2d7b5'/><path d='M3 29l1-3.4 2.4 2.4z' fill='#111'/><path d='M8.5 19.5l4 4' fill='none'/></g></svg>", 3, 29],
    chalk: ["<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M5 27l2-6L23 6l4 4-15 15z' fill='#fff' stroke='#111' stroke-width='1.6' stroke-linejoin='round'/><path d='M19 10l3 3' stroke='#bbb' stroke-width='1.2'/><circle cx='3' cy='29' r='1.2' fill='#999'/><circle cx='7' cy='30' r='.9' fill='#bbb'/><circle cx='2' cy='25' r='.8' fill='#bbb'/></svg>", 4, 28],
    arrow: ["<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M5 3v22l6-5.5 4 9 4-1.8-4-8.7h8z' fill='#fff' stroke='#111' stroke-width='1.8' stroke-linejoin='round'/><path d='M7 8v12' stroke='#7b1fa2' stroke-width='1.6'/></svg>", 5, 3]
  };
  Object.entries(CURSORS).forEach(([k, [svgStr, x, y]]) =>
    document.documentElement.style.setProperty('--cur-' + k, `url("data:image/svg+xml,${encodeURIComponent(svgStr)}") ${x} ${y}, auto`));
  let sceneName = '';
  function setScene(t) {
    const Lb = tl.labels;
    const n = t < Lb.whip ? 'class' : t < Lb.bell ? 'board' : t < Lb.workspace ? 'time' : 'work';
    if (n !== sceneName) { sceneName = n; document.body.dataset.scene = n; }
  }

  gsap.ticker.add(() => {
    const t = tl.time();
    setScene(t);
    VHS.update(t, tl.labels, calTimes);
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
    updateNav(t);
  });

  /* ============================================================
     NAV BAR ด้านบน = เส้นทาง (แทนไทม์ไลน์แนวตั้งเดิม)
     ห้องเรียน → คำถาม → ผลงานแต่ละชิ้น → ติดต่อ · กดเพื่อกระโดดไปได้
     เส้นม่วง + หัวแสง (Tracing Beam) วิ่งตามการเลื่อน ถึงจุดไหน = อยู่ช่วงนั้น
     ============================================================ */
  const NAV = [
    { label: C.nav.start, target: 'start' },
    { label: C.nav.question, target: 'question' },
    { label: C.nav.workspace, target: 'workspace' },
    { label: C.nav.news, target: 'news' },
    ...C.projects.map((p, i) => ({ label: p.short || p.title, target: 'project-' + i })),
    { label: C.nav.contact, target: 'contact' }
  ].filter((n) => n.target === 'start' || tl.labels[n.target] !== undefined)
   .map((n) => ({ ...n, time: n.target === 'start' ? 0 : tl.labels[n.target] }));

  const navList = $('#nav-items'), navTrack = $('#nav-track'), navFill = $('#nav-fill'), navDot = $('#nav-dot');
  NAV.forEach((n, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button data-target="${n.target}"><i></i><span>${n.label}</span></button>`;
    navList.appendChild(li);
    n.el = li;
  });
  let navX = [], navW = 1, activeNav = -1;
  function measureNav() {
    const tr = navTrack.getBoundingClientRect();
    navW = tr.width || 1;
    navX = NAV.map((n) => {
      const r = n.el.querySelector('i').getBoundingClientRect();
      return r.width ? r.left + r.width / 2 - tr.left : null;
    });
  }
  function updateNav(t) {
    const dur = tl.duration();
    let k = 0;
    while (k < NAV.length - 1 && t >= NAV[k + 1].time) k++;
    let x;
    if (navX.some((v) => v === null)) {
      x = (t / dur) * navW; // จอแคบ: แสดงแค่ช่วงปัจจุบัน → ใช้สัดส่วนรวม
    } else if (k < NAV.length - 1) {
      const f = (t - NAV[k].time) / (NAV[k + 1].time - NAV[k].time);
      x = navX[k] + (navX[k + 1] - navX[k]) * f;
    } else {
      x = navX[k] + (navW - navX[k]) * ((t - NAV[k].time) / Math.max(0.001, dur - NAV[k].time));
    }
    navFill.style.width = Math.max(0, x) + 'px';
    navDot.style.transform = `translateX(${x}px)`;
    if (k !== activeNav) {
      activeNav = k;
      NAV.forEach((n, i) => {
        n.el.classList.toggle('active', i === k);
        n.el.classList.toggle('passed', i < k);
      });
    }
  }
  navList.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-target]');
    if (b) { Sound.play('click'); scrollToLabel(b.dataset.target); }
  });
  window.addEventListener('resize', measureNav);
  document.fonts.ready.then(measureNav);
  measureNav();

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
  NAV.forEach((n) => {
    const li = document.createElement('li');
    li.innerHTML = `<button data-target="${n.target}">${n.label}</button>`;
    $('#menu-list').appendChild(li);
  });
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
    open ? openNav() : closeNav();
  }
  menuBtn.addEventListener('click', () => { setMenu(!menu.classList.contains('open')); Sound.play('click'); });
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-target]');
    if (b) { setMenu(false); scrollToLabel(b.dataset.target); }
    else if (e.target === menu) setMenu(false);
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Nav ซ่อนได้: ปกติเห็นแค่ลูกศร ▼ · ชี้/แตะแล้ว Nav + โลโก้ + ปุ่มเสียงเลื่อนลงมา ---------- */
  const navToggle = $('#nav-toggle');
  const navZone = ['#nav-toggle', '#topnav', '#logo-btn', '#top-right'].map($);
  let navCloseT = null;
  function openNav() {
    clearTimeout(navCloseT);
    if (!document.body.classList.contains('nav-open')) {
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(measureNav);
    }
  }
  function closeNav(delay = 1000) {
    clearTimeout(navCloseT);
    navCloseT = setTimeout(() => {
      if (menu.classList.contains('open')) return;
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }, delay);
  }
  navZone.forEach((el) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') openNav(); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') closeNav(); });
    el.addEventListener('focusin', openNav);
    el.addEventListener('focusout', () => closeNav(300));
  });
  navToggle.addEventListener('click', () => {
    Sound.play('click');
    document.body.classList.contains('nav-open') ? closeNav(0) : openNav();
  });

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
  // โหลดภาพหลักๆ ไว้ก่อน % จะได้สะท้อนการโหลดจริง
  const preload = ['assets/characters/student-front.webp', 'assets/characters/student-back.webp', 'assets/characters/student-turn.webp']
    .map((src) => { const im = new Image(); im.src = src; return loaded(im); });
  const tasks = [
    document.fonts.ready,
    loaded($('.loader-mascot')),
    ...preload,
    new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r)))
  ];
  let done = 0;
  tasks.forEach((t) => t.then(() => done++));
  const num = $('#loader-num'), fill = $('#loader-fill');
  const t0 = performance.now(), MIN = 1400, st0 = { p: 0 };
  function tick() {
    const target = Math.min(done / tasks.length, (performance.now() - t0) / MIN);
    st0.p += (target - st0.p) * 0.12;
    if (target >= 1 && st0.p > 0.995) st0.p = 1;
    num.textContent = Math.round(st0.p * 100);
    fill.style.width = st0.p * 100 + '%';
    if (st0.p === 1) { gsap.ticker.remove(tick); finishLoading(); }
  }
  gsap.ticker.add(tick);

  function finishLoading() {
    ScrollTrigger.refresh();
    Board.layout(); Workspace.layout();
    gsap.timeline({ delay: 0.25 })
      .to('.loader-mascot', { y: -30, duration: 0.25, ease: 'power2.out' })          // กระโดดดีใจ
      .to('.loader-scene', { y: 60, scale: 0.8, autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
      .to(['.loader-pct', '.loader-bar'], { autoAlpha: 0, duration: 0.3 }, '<')
      .to('#loader', { autoAlpha: 0, duration: 0.5 })
      .add(() => { document.body.classList.remove('is-loading'); lenis.start(); })
      .from(lines[0].querySelectorAll('.w'), { opacity: 0, filter: 'blur(10px)', duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.2')
      .add(() => Matches.walkIn(), '<')
      .from('.scroll-hint', { autoAlpha: 0, duration: 0.6 }, '-=0.3')
      .to('.ui', { autoAlpha: 1, duration: 0.6 }, '<');
  }

  // สำหรับทดสอบ
  window.__debug = { tl, st, lenis, Board, Mascot, Workspace, Matches, scrollToLabel };
})();
