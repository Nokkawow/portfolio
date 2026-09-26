/* ============================================================
   SCENE — ห้องเรียน + ตัวละคร (มาสคอต) แบบลายเส้นมังงะสะอาด
   พิกัดฉาก 1920×1080 · ตัวละครวาดในพิกัดของตัวเอง (0,0 = กลางหน้า)
   แยกเลเยอร์: หางม้า / ผมหลัง / หน้า / ตา×2 / ผมหน้า / ตัว / แขน
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#111';

  function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // เส้นหมึก
  const line = (p, d, w = 3.5, extra = {}) =>
    el('path', { d, fill: 'none', stroke: INK, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, p);
  // พื้น + ขอบหมึก
  const fillLine = (p, d, fill, w = 3.5, extra = {}) =>
    el('path', { d, fill, stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', ...extra }, p);

  // สร้างทรงผมฟูๆ ปลายแหลม: จุดสลับ ปลาย/โคน ต่อด้วยเส้นโค้งเว้าเข้าหาจุดกลาง
  function spiky(pts, center, bend = 0.14) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const cx = mx + (center[0] - mx) * bend, cy = my + (center[1] - my) * bend;
      d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx},${by}`;
    }
    return d + ' Z';
  }

  // ทรงผมเป็นกระจุก (tufts) รอบวงรี: ปลายแหลมเอียงตามทิศ (swirl) ให้ดูเป็นเส้นผมจริง
  function tufts(o) {
    const rad = (a) => (a * Math.PI) / 180;
    const pt = (a, k) => [o.cx + Math.cos(rad(a)) * o.rx * k, o.cy + Math.sin(rad(a)) * o.ry * k];
    const step = (o.to - o.from) / o.n;
    let d = `M${o.start[0]},${o.start[1]}`;
    let prev = o.start;
    for (let i = 0; i < o.n; i++) {
      const a = o.from + step * (i + 0.5);
      const wob = 1 + Math.sin(i * 2.7) * 0.07;
      const tip = pt(a + o.swirl, o.tip * wob);
      const valley = pt(o.from + step * (i + 1), o.valley);
      const next = i === o.n - 1 ? o.end : valley;
      // ขึ้นไปปลายแบบโค้งนูน แล้วลงโคนแบบโค้งเว้า
      const c1 = pt(a - step * 0.2, o.tip * 0.98);
      const c2 = pt(a + step * 0.35, o.valley * 1.02);
      d += ` Q${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)}`;
      d += ` Q${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
      prev = next;
    }
    return d + ' Z';
  }

  window.CHAR_POS = { x: 920, y: 400 }; // ตำแหน่งกลางหน้าในฉาก

  window.buildScene = function (svg, content) {
    /* ---------- defs ---------- */
    const defs = el('defs', {}, svg);
    const tone = el('pattern', { id: 'tone', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('circle', { cx: 4.5, cy: 4.5, r: 1.6, fill: INK }, tone);
    const toneFine = el('pattern', { id: 'tone-fine', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('circle', { cx: 3, cy: 3, r: 1, fill: INK }, toneFine);

    // ผม: ดำ → ม่วง ที่ปลาย (สีดึงสายตา)
    const hairG = el('linearGradient', { id: 'hair', gradientUnits: 'userSpaceOnUse', x1: 0, y1: -200, x2: 0, y2: 100 }, defs);
    [['0', '#140b1c'], ['0.45', '#231030'], ['0.75', '#6a1b9a'], ['1', '#9c3fc4']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, hairG));
    const tailG = el('linearGradient', { id: 'hair-tail', gradientUnits: 'userSpaceOnUse', x1: 0, y1: -180, x2: 120, y2: -300 }, defs);
    [['0', '#140b1c'], ['0.55', '#3a1450'], ['1', '#9c3fc4']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, tailG));
    // ม่านตา
    const irisG = el('linearGradient', { id: 'iris', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [['0', '#1a0826'], ['0.5', '#6a1b9a'], ['1', '#c28be0']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, irisG));

    const fadeUp = el('linearGradient', { id: 'fade-up', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': 0.9 }, fadeUp);
    el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': 0 }, fadeUp);
    const mDesk = el('mask', { id: 'm-desk', maskContentUnits: 'objectBoundingBox' }, defs);
    el('rect', { x: 0, y: 0, width: 1, height: 1, fill: 'url(#fade-up)' }, mDesk);

    const FACE = 'M-118,-30 C-120,-95 -75,-128 0,-128 C75,-128 120,-95 118,-30 C116,30 92,82 40,104 C20,112 -20,112 -40,104 C-92,82 -116,30 -118,-30 Z';
    el('path', { d: FACE }, el('clipPath', { id: 'face-clip' }, defs));

    const pos = window.CHAR_POS;
    const T = `translate(${pos.x},${pos.y})`;

    /* ============================================================
       CHARACTER — ส่วนหลังโต๊ะ
       ============================================================ */
    const char = el('g', { id: 'char', transform: T }, svg);

    /* --- ตัว (ชุดนักเรียนบางกะปิ + ปีกขาวเอกลักษณ์มาสคอต) --- */
    const torso = el('g', { id: 'char-torso' }, char);
    // ฮู้ดด้านหลังคอ
    fillLine(torso, 'M-128,152 C-108,112 -46,100 0,103 C46,100 108,112 128,152 Z', '#1b1b1b', 3);
    // ตัวเสื้อคลุม
    fillLine(torso, 'M-210,320 C-206,222 -176,156 -112,134 C-74,122 -46,121 -30,125 L30,125 C46,121 74,122 112,134 C176,156 206,222 210,320 Z', '#fff', 3.5);
    // ลายขาววาฬ (ขอบหน้าเสื้อคลุม)
    fillLine(torso, 'M-104,142 C-128,176 -134,236 -122,320 L-86,320 C-94,250 -92,190 -78,146 Z', '#fff', 3);
    fillLine(torso, 'M104,142 C128,176 134,236 122,320 L86,320 C94,250 92,190 78,146 Z', '#fff', 3);
    el('path', { d: 'M-104,142 C-128,176 -134,236 -122,320 L-108,320 C-116,250 -114,190 -98,150 Z', fill: 'url(#tone)', opacity: 0.35 }, torso);
    // คอ
    fillLine(torso, 'M-26,96 L-24,132 C-10,140 10,140 24,132 L26,96 Z', '#fff', 3);
    el('path', { d: 'M-26,100 C-10,114 10,114 26,100 L25,118 C10,126 -10,126 -25,118 Z', fill: 'url(#tone-fine)', opacity: 0.55 }, torso);
    // สาบเสื้อนักเรียนแขนสั้น
    line(torso, 'M0,132 L0,320', 2.5);
    // ปกเสื้อ
    fillLine(torso, 'M-30,125 L-10,150 L-3,133 Z', '#fff', 2.4);
    fillLine(torso, 'M30,125 L10,150 L3,133 Z', '#fff', 2.4);
    fillLine(torso, 'M-186,154 C-220,166 -238,204 -230,238 L-168,246 L-142,170 Z', '#fff', 3);
    fillLine(torso, 'M186,154 C220,166 238,204 230,238 L168,246 L142,170 Z', '#fff', 3);
    [-1, 1].forEach(s => fillLine(torso, `M${s * 34},220 L${s * 108},220 L${s * 104},276 L${s * 36},276 Z`, '#fff', 2));
    [176, 218, 260, 302].forEach(y => el('circle', { cx: 0, cy: y, r: 3.2, fill: '#111' }, torso));

    // ป้ายชื่อ (จุดที่กล้องซูมเข้า)
    const badge = el('g', { id: 'char-badge', transform: 'rotate(-2 -84 205)' }, torso);
    fillLine(badge, 'M-148,190 L-22,190 L-22,224 L-148,224 Z', '#fff', 2.6);
    el('rect', { x: -148, y: 190, width: 7, height: 34, fill: '#7b1fa2' }, badge);
    const nameText = el('text', {
      id: 'char-name', x: -82, y: 211.5, 'text-anchor': 'middle',
      'font-family': 'Noto Sans Thai, sans-serif', 'font-weight': 800, 'font-size': 11.5, fill: INK,
      textLength: 108, lengthAdjust: 'spacingAndGlyphs'
    }, badge);
    nameText.textContent = content.name;
    const school = el('g', { transform: 'translate(72 185)' }, torso);
    el('path', { d: 'M0,0 L24,8 L20,36 L0,46 L-20,36 L-24,8 Z', fill: '#fff', stroke: INK, 'stroke-width': 3 }, school);
    const schoolText = el('text', { x: 0, y: 28, 'text-anchor': 'middle', 'font-family': 'Noto Sans Thai,sans-serif', 'font-size': 15, 'font-weight': 900, fill: '#7b1fa2' }, school);
    schoolText.textContent = 'บป.';

    /* --- หัว (ทั้งกลุ่มเอียงตามเมาส์ได้) --- */
    const head = el('g', { id: 'char-head' }, char);

    // หางม้า (แกว่งได้ — จุดหมุนที่ยางรัดผม)
    const tail = el('g', { id: 'char-ponytail' }, head);
    fillLine(tail, spiky([
      [0, -176], [-30, -214], [-12, -222], [-24, -262], [8, -250], [16, -292], [40, -262], [64, -304],
      [78, -266], [118, -296], [116, -258], [160, -270], [148, -238], [196, -236], [168, -214],
      [206, -196], [168, -188], [196, -158], [158, -164], [170, -128], [130, -160], [90, -168], [40, -170], [0, -176]
    ], [70, -210], 0.1), 'url(#hair-tail)', 3.4);
    line(tail, 'M20,-190 C40,-230 70,-262 104,-276', 2, { stroke: '#b776d6', opacity: 0.8 });
    line(tail, 'M40,-182 C80,-196 120,-206 160,-204', 1.8, { opacity: 0.6 });

    // ผมด้านหลัง
    fillLine(head, tufts({ cx: 0, cy: -44, rx: 168, ry: 150, from: 118, to: 422, n: 11, tip: 1.2, valley: 0.96, swirl: 7, start: [-122, 40], end: [122, 40] }), 'url(#hair)', 3.4);

    // ยางรัดผม
    el('ellipse', { cx: 14, cy: -180, rx: 19, ry: 11, fill: '#1a1a1a', stroke: INK, 'stroke-width': 2.4 }, head);
    el('ellipse', { cx: 8, cy: -184, rx: 6, ry: 3, fill: '#777' }, head);

    // หู + ต่างหู
    fillLine(head, 'M110,-8 C134,-22 150,4 140,28 C134,42 122,46 110,40 Z', '#fff', 3);
    line(head, 'M118,4 C130,4 134,20 124,30', 2);
    el('circle', { cx: 132, cy: 47, r: 5.5, fill: INK }, head);
    el('circle', { cx: 130.5, cy: 45.5, r: 1.5, fill: '#fff' }, head);

    // หน้า
    fillLine(head, FACE, '#fff', 3.6);
    // เงาผมบนหน้าผาก (สกรีนโทน)
    el('path', { d: 'M-120,-128 L120,-128 L120,-30 C60,-10 -60,-10 -120,-30 Z', fill: 'url(#tone-fine)', opacity: 0.35, 'clip-path': 'url(#face-clip)' }, head);

    // แก้มแดง (เส้นแรเงามังงะ)
    const blush = el('g', { opacity: 0.4 }, head);
    [[-80, 54], [-70, 55], [-60, 56], [54, 56], [64, 55], [74, 54]].forEach(([x, y]) => line(blush, `M${x},${y} l6,-9`, 2));

    // ตา (2 ข้าง, มองตามเมาส์ได้)
    function eye(side) {
      const s = side === 'L' ? -1 : 1;
      const g = el('g', { id: 'char-eye-' + side }, head);
      const cx = 54 * s, cy = 21;
      const sclera = side === 'L'
        ? 'M-90,16 C-74,3 -42,1 -20,9 C-26,25 -42,33 -60,32 C-75,31 -85,25 -90,16 Z'
        : 'M20,9 C42,1 74,3 90,16 C85,25 75,31 60,32 C42,33 26,25 20,9 Z';
      el('path', { d: sclera }, el('clipPath', { id: 'eye-clip-' + side }, defs));
      const blinkG = el('g', { class: 'blink' }, g);
      el('path', { d: sclera, fill: '#fff' }, blinkG);
      const inner = el('g', { 'clip-path': `url(#eye-clip-${side})` }, blinkG);
      const pupil = el('g', { class: 'pupil' }, inner);
      el('ellipse', { cx, cy: cy + 2, rx: 15, ry: 17, fill: 'url(#iris)', stroke: INK, 'stroke-width': 1.6 }, pupil);
      el('ellipse', { cx, cy: cy + 3, rx: 6.5, ry: 8, fill: '#12061b' }, pupil);
      el('circle', { cx: cx + 5 * -s, cy: cy - 3, r: 3.6, fill: '#fff' }, pupil);
      el('circle', { cx: cx - 5 * -s, cy: cy + 10, r: 1.7, fill: '#fff' }, pupil);
      // เงาเปลือกตาบน (ตาปรือ)
      el('path', { d: side === 'L' ? 'M-90,16 C-74,3 -42,1 -20,9 L-20,17 C-42,10 -74,11 -90,22 Z' : 'M20,9 C42,1 74,3 90,16 L90,22 C74,11 42,10 20,17 Z', fill: 'url(#tone-fine)', opacity: 0.8 }, inner);
      // เปลือกตาบน หนาแบบมาสคอต
      const lid = el('g', { class: 'lid' }, blinkG);
      el('path', { d: side === 'L' ? 'M-96,15 C-78,-2 -42,-4 -16,7 C-40,1 -74,4 -90,19 Z' : 'M16,7 C42,-4 78,-2 96,15 L90,19 C74,4 40,1 16,7 Z', fill: INK, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, lid);
      line(lid, side === 'L' ? 'M-94,15 L-102,11' : 'M94,15 L102,11', 3);
      line(g, side === 'L' ? 'M-72,33 C-58,36 -44,34 -34,29' : 'M34,29 C44,34 58,36 72,33', 2);
      return { g: blinkG, pupil, cx: pos.x + cx, cy: pos.y + cy };
    }
    const eyeL = eye('L');
    const eyeR = eye('R');

    // จมูก + ปาก (ปากยู่ๆ แบบมาสคอต)
    line(head, 'M3,50 L5,55', 2.2, { opacity: 0.7 });
    const mouth = line(head, 'M-10,74 C-6,67 -2,69 0,72 C2,69 6,67 10,74', 2.6);
    mouth.id = 'char-mouth';

    // ผมหน้า (ปลายแหลม ม่วงที่ปลาย)
    const bangs = el('g', { id: 'char-bangs' }, head);
    fillLine(bangs,
      'M-136,-36 C-142,-122 -80,-168 0,-168 C80,-168 146,-122 140,-36 ' +
      'C138,-10 136,8 132,24 C124,-6 112,-30 100,-48 ' +
      'C100,-30 96,-18 90,-6 C84,-34 72,-56 60,-70 ' +
      'C58,-52 54,-36 46,-22 C40,-50 28,-72 14,-84 ' +
      'C12,-60 8,-40 0,-24 C-6,-52 -18,-70 -34,-82 ' +
      'C-36,-64 -40,-48 -50,-34 C-58,-58 -74,-72 -86,-76 ' +
      'C-88,-56 -94,-36 -102,-18 C-108,-40 -118,-52 -126,-56 ' +
      'C-128,-30 -132,-6 -140,22 C-138,0 -136,-18 -136,-36 Z', 'url(#hair)', 3.4);
    // ลายเส้นผม + ไฮไลต์ม่วง
    ['M-20,-150 C-24,-122 -32,-100 -34,-82', 'M30,-152 C34,-120 40,-96 60,-70', 'M80,-138 C94,-112 100,-82 100,-48', 'M-70,-140 C-80,-116 -86,-96 -86,-76']
      .forEach(d => line(bangs, d, 1.8, { opacity: 0.7 }));
    ['M-66,-146 C-46,-156 -24,-158 -2,-156', 'M34,-152 C58,-148 80,-136 96,-120']
      .forEach(d => line(bangs, d, 3, { stroke: '#b776d6', opacity: 0.85 }));
    // ปอยผมพาดกลางหน้า (เอกลักษณ์มาสคอต)
    fillLine(bangs, 'M-14,-120 C-2,-70 10,-24 24,40 C26,18 22,-10 16,-40 C10,-70 4,-96 -2,-122 Z', 'url(#hair)', 2.6);
    // ผมข้างซ้ายยาว
    fillLine(bangs, 'M-120,-24 C-134,20 -132,62 -114,100 C-112,72 -104,42 -100,14 Z', 'url(#hair)', 3);

    // คิ้ว (วาดทับผมแบบมังงะ) — ขวายักขึ้นแบบสงสัย
    const browL = line(head, 'M-88,-14 C-72,-20 -50,-20 -30,-14', 3.6);
    const browR = line(head, 'M28,-18 C50,-28 72,-34 92,-32', 3.6);

    /* ============================================================
       DESK (ด้านหน้า หันเข้าหากล้อง)
       ============================================================ */
    const desk = el('g', { id: 'desk' }, svg);
    // ขาโต๊ะเหล็ก
    [[532, 520], [562, 552], [1308, 1318], [1278, 1288]].forEach(([a, b]) => line(desk, `M${a},780 L${b},1500`, 3));
    // ช่องใต้โต๊ะ
    fillLine(desk, 'M510,722 L1330,722 L1330,786 L510,786 Z', '#fff', 3.2);
    el('path', { d: 'M512,724 L1328,724 L1328,784 L512,784 Z', fill: 'url(#tone)', opacity: 0.45 }, desk);
    // ท็อปโต๊ะ
    fillLine(desk, 'M548,640 L1292,640 L1346,700 L494,700 Z', '#fff', 3.6);
    fillLine(desk, 'M494,700 L1346,700 L1346,722 L494,722 Z', '#fff', 3.4);
    ['M620,656 L1010,656', 'M1080,672 L1250,672', 'M580,686 L760,686'].forEach(d => line(desk, d, 1.4, { opacity: 0.35 }));

    /* --- หนังสือ (รอบ 2: ขีดเขียนได้) --- */
    const book = el('g', { id: 'book' }, svg);
    const PAGE_L = 'M798,692 C838,684 884,682 920,688 L920,652 C884,646 840,648 812,654 Z';
    const PAGE_R = 'M1042,692 C1002,684 956,682 920,688 L920,652 C956,646 1000,648 1028,654 Z';
    fillLine(book, PAGE_L, '#fff', 2.8);
    fillLine(book, PAGE_R, '#fff', 2.8);
    ['M826,664 C850,660 880,659 906,662', 'M822,674 C846,670 876,669 904,672', 'M934,662 C960,659 990,660 1014,664', 'M936,672 C962,669 992,670 1018,674']
      .forEach(d => line(book, d, 1.4, { opacity: 0.55 }));
    const bookClip = el('clipPath', { id: 'book-clip' }, defs);
    el('path', { d: PAGE_L }, bookClip);
    el('path', { d: PAGE_R }, bookClip);
    const bookInk = el('g', { id: 'book-ink', 'clip-path': 'url(#book-clip)' }, book);

    /* --- ปากกา (รอบ 2: หยิบปาได้) --- */
    function pen(id, x, y, rot) {
      const g = el('g', { id, transform: `translate(${x},${y}) rotate(${rot})` }, svg);
      fillLine(g, 'M-52,-5 L40,-5 L52,0 L40,5 L-52,5 C-56,5 -56,-5 -52,-5 Z', '#fff', 2.4);
      el('rect', { x: -52, y: -5, width: 22, height: 10, fill: '#111' }, g);
      line(g, 'M-44,-5 L-44,-10 L-20,-10', 2);
      return g;
    }
    const pens = [
      { g: pen('pen1', 1190, 676, -14), home: { x: 1190, y: 676, r: -14 } },
      { g: pen('pen2', 1220, 694, -6), home: { x: 1220, y: 694, r: -6 } }
    ];

    /* ============================================================
       CHARACTER — แขนวางบนโต๊ะ (อยู่หน้าโต๊ะ)
       ============================================================ */
    const arms = el('g', { id: 'char-arms', transform: T }, svg);
    function arm(side) {
      // แขนขวา = แขนซ้ายกลับด้าน
      const outer = el('g', side === 'R' ? { transform: 'scale(-1,1)' } : {}, arms);
      const g = el('g', { class: 'arm', id: 'char-arm-' + side }, outer);
      // แขนเสื้อทรงครีบวาฬ
      fillLine(g, 'M-150,160 C-196,188 -222,246 -214,300 L-138,300 C-140,256 -142,210 -128,168 Z', '#111', 3.4);
      fillLine(g, 'M-198,226 C-206,256 -202,280 -192,298 L-170,298 C-180,276 -182,252 -176,228 Z', '#fff', 2.6);
      // มือ (แบบมาสคอตเกาะขอบ)
      fillLine(g, 'M-200,292 C-208,306 -198,318 -180,318 C-160,318 -148,308 -152,292 Z', '#fff', 3);
      line(g, 'M-184,300 L-184,316', 2);
      line(g, 'M-168,300 L-168,316', 2);
      return g;
    }
    const armL = arm('L');
    const armR = arm('R');

    /* ============================================================
       ? (ขาวดำ + เงาสกรีนโทนที่ขยับได้)
       ============================================================ */
    const qWrap = el('g', { id: 'qmark' }, svg);
    const qPos = el('g', { transform: 'translate(40,20)' }, qWrap);
    const qFloat = el('g', { id: 'qmark-float' }, qPos);
    const qShadow = el('g', { id: 'qmark-shadow' }, qFloat);
    const qFront = el('g', {}, qFloat);
    const qHook = 'M1188,236 C1172,160 1230,114 1286,120 C1350,128 1372,190 1344,236 C1322,270 1280,264 1262,292';
    const qDot = 'M1232,342 m-17,0 a17,17 0 1,0 34,0 a17,17 0 1,0 -34,0';
    el('path', { d: qHook, fill: 'none', stroke: 'url(#tone)', 'stroke-width': 34, 'stroke-linecap': 'round' }, qShadow);
    el('path', { d: qDot, fill: 'url(#tone)' }, qShadow);
    el('path', { d: qHook, fill: 'none', stroke: INK, 'stroke-width': 30, 'stroke-linecap': 'round' }, qFront);
    el('path', { d: qDot, fill: INK }, qFront);
    el('path', { d: 'M1206,200 C1212,164 1240,140 1270,138', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.9 }, qFront);

    // เลเยอร์เอฟเฟกต์ (ปากกาที่ถูกหยิบ + ประกายตอนโดน) อยู่บนสุด
    const fx = el('g', { id: 'fx' }, svg);

    return {
      svg, defs, el, line,
      char, armsG: arms, head, tail, torso, arms: [armL, armR], bangs, browL, browR, mouth,
      eyes: [eyeL, eyeR],
      book, bookInk, pens, fx,
      qWrap, qFloat, qShadow,
      nameText
    };
  };

})();
