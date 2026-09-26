/* ============================================================
   EFFECTS — เอฟเฟกต์ที่ยืมไอเดียจาก Aceternity UI แล้วเขียนใหม่ด้วย GSAP
   ปรับสีเป็นธีมมังงะขาวดำ + ม่วง · ปิดเองเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว
   1. Text Generate  — ตัดคำไว้ให้ประโยคเปิดเรื่องค่อยๆ ชัดขึ้นทีละคำ
   2. Flip Words     — คำกลางประโยคฉาก 3 สลับไปมา
   3. 3D Card        — รูปผลงานเอียงตามเมาส์
   4. Sparkles       — ประกายรอบตราประทับรางวัล
   5. Tracing Beam   — แสงวิ่งบนแท่งไทม์ไลน์ (อัปเดตจาก main.js)
   ============================================================ */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const segWord = window.Intl && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
  const segChar = window.Intl && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'grapheme' }) : null;
  const words = (t) => (segWord ? [...segWord.segment(t)].map((s) => s.segment) : t.split(/(\s+)/));
  const chars = (t) => (segChar ? [...segChar.segment(t)].map((s) => s.segment) : [...t]);

  /* ---------- 1. Text Generate: ห่อทุกคำด้วย <span class="w"> ---------- */
  function splitWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      words(n.textContent).forEach((w) => {
        if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = w;
        frag.appendChild(s);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return el.querySelectorAll('.w');
  }

  /* ---------- 2. Flip Words ---------- */
  function flipWords(el, cfg) {
    el.innerHTML = `${cfg.before}<span class="flip"><em class="flip-word"></em></span>${cfg.after}`;
    const holder = el.querySelector('.flip');
    const word = el.querySelector('.flip-word');
    let i = 0;
    const render = (w) => { word.innerHTML = chars(w).map((c) => `<span class="fc">${c}</span>`).join(''); };
    render(cfg.words[0]);

    // กันประโยคกระตุก: จองความกว้างเท่าคำที่ยาวที่สุด
    function reserve() {
      let max = 0;
      cfg.words.forEach((w) => { word.textContent = w; max = Math.max(max, word.offsetWidth); });
      holder.style.minWidth = max + 'px';
      render(cfg.words[i]);
    }
    document.fonts.ready.then(reserve);
    window.addEventListener('resize', reserve);

    if (reduce || cfg.words.length < 2) return;
    function next() {
      const old = word.querySelectorAll('.fc');
      gsap.to(old, {
        y: -18, opacity: 0, filter: 'blur(6px)', duration: 0.3, stagger: 0.02, ease: 'power2.in',
        onComplete: () => {
          i = (i + 1) % cfg.words.length;
          render(cfg.words[i]);
          gsap.fromTo(word.querySelectorAll('.fc'),
            { y: 14, opacity: 0, filter: 'blur(6px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.35, stagger: 0.04, ease: 'power2.out' });
        }
      });
    }
    setInterval(() => { if (!document.hidden) next(); }, 2600);
  }

  /* ---------- 3. 3D Card: รูปเอียงตามเมาส์ ---------- */
  function tiltCards(root) {
    if (reduce || !fine) return;
    root.querySelectorAll('.photo.main').forEach((fig) => {
      gsap.set(fig, { transformPerspective: 900 });
      const rx = gsap.quickTo(fig, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(fig, 'rotationY', { duration: 0.5, ease: 'power3' });
      const img = fig.querySelector('img');
      const ix = gsap.quickTo(img, 'x', { duration: 0.5, ease: 'power3' });
      const iy = gsap.quickTo(img, 'y', { duration: 0.5, ease: 'power3' });
      fig.addEventListener('pointermove', (e) => {
        const r = fig.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 16); rx(-py * 12);
        ix(px * -8); iy(py * -6); // รูปด้านในขยับสวนนิดหน่อย ให้ดูมีความลึก
      });
      fig.addEventListener('pointerleave', () => { rx(0); ry(0); ix(0); iy(0); });
    });
  }

  /* ---------- 4. Sparkles รอบตราประทับ ---------- */
  function sparkles(root) {
    if (reduce) return;
    root.querySelectorAll('.stamp').forEach((stamp) => {
      const box = document.createElement('span');
      box.className = 'sparkles';
      box.setAttribute('aria-hidden', 'true');
      stamp.appendChild(box);
      for (let k = 0; k < 12; k++) {
        const s = document.createElement('i');
        s.className = k % 3 === 0 ? 'ink' : '';
        box.appendChild(s);
        const place = () => gsap.set(s, {
          left: gsap.utils.random(-12, 112) + '%',
          top: gsap.utils.random(-40, 140) + '%',
          scale: 0, rotation: gsap.utils.random(0, 90)
        });
        place();
        gsap.timeline({ repeat: -1, delay: gsap.utils.random(0, 2), repeatDelay: gsap.utils.random(0.2, 1.4), onRepeat: place })
          .to(s, { scale: gsap.utils.random(0.6, 1.2), rotation: '+=45', duration: 0.35, ease: 'power2.out' })
          .to(s, { scale: 0, rotation: '+=45', duration: 0.45, ease: 'power2.in' });
      }
    });
  }

  window.Effects = { splitWords, flipWords, tiltCards, sparkles, reduce };
})();
