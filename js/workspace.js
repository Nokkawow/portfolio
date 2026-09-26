/* ============================================================
   WORKSPACE — ห้องทำงาน + จอคอม
   · ปฏิทินหลุด (วันเวลาผ่านไป)
   · กล้องซูมเข้า/ออกจากจอคอม (camera.p 0 = เห็นทั้งห้อง, 1 = เห็นคอมทั้งเครื่อง)
   · ในจอ = เบราว์เซอร์ "Nokkawow News": หน้าพาดหัวข่าว → กดข่าวเปิดเป็นแท็บใหม่ สลับ/ปิดแท็บได้
   · ฉากสุดท้าย: การ์ดติดต่อแบบบัตรขูด (โลโก้แอปจริง) + มาสคอตทักทาย/ขอบคุณ
   เนื้อหาทั้งหมดมาจาก CONTENT (js/content.js)
   ============================================================ */
(function () {
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // โลโก้แอปจริง (สีแบรนด์)
  const LOGOS = {
    instagram: '<svg viewBox="0 0 24 24"><defs><radialGradient id="lg-ig" cx="30%" cy="107%" r="150%"><stop offset="0" stop-color="#fdf497"/><stop offset=".05" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#lg-ig)"/><rect x="5" y="5" width="14" height="14" rx="4.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.3" cy="7.7" r="1.05" fill="#fff"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 24v-8.6h2.9l.45-3.4h-3.35V9.8c0-1 .3-1.6 1.7-1.6h1.8V5.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2.6H7v3.4h2.95V24z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#fff"/><path fill="#4285F4" d="M3.5 8v10a1.5 1.5 0 0 0 1.5 1.5h2.5v-8z"/><path fill="#34A853" d="M20.5 8v10a1.5 1.5 0 0 1-1.5 1.5h-2.5v-8z"/><path fill="#EA4335" d="M3.5 7.2L12 13.4l8.5-6.2V6.6c0-1.3-1.5-2-2.5-1.3L12 9.6 6 5.3C5 4.6 3.5 5.3 3.5 6.6z"/><path fill="#FBBC04" d="M16.5 11.5l4-3.3V6.6c0-1.3-1.5-2-2.5-1.3l-1.5 1.1z"/><path fill="#C5221F" d="M3.5 8.2l4 3.3V6.4L6 5.3C5 4.6 3.5 5.3 3.5 6.6z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#34C759"/><path fill="#fff" d="M8.4 5.3h2.1l1.1 3-1.5 1a7.6 7.6 0 0 0 4 4l1-1.5 3 1.1v2.1a1.4 1.4 0 0 1-1.5 1.4A11.4 11.4 0 0 1 7 6.8a1.4 1.4 0 0 1 1.4-1.5z"/></svg>'
  };

  window.initWorkspace = function initWorkspace(content) {
    const calendars = document.getElementById('calendar-stack');
    const shell = document.getElementById('monitor-shell');
    const stage = document.querySelector('.stage');

    /* ---------- กล้อง (ตำแหน่ง/ขนาดจอคอม) ---------- */
    const camera = { p: 0 };
    function layout() {
      const w = stage.clientWidth, h = stage.clientHeight, mobile = w < h;
      const margin = mobile ? 12 : Math.max(24, w * .035), top = mobile ? 90 : 100;
      // จบการซูม: เห็นคอมทั้งเครื่อง (กรอบจอครบ + ขาตั้ง + ที่ว่างรอบๆ)
      const avail = h - top - 24, standRatio = .16;
      const endW = mobile ? w - margin * 2 : Math.min(w * .74, (avail / (1 + standRatio)) * 1.72);
      const endH = mobile ? avail / (1 + standRatio) : endW / 1.72;
      const startW = mobile ? w * .6 : w * .44;
      const a = { x: mobile ? w * .2 : w * .42, y: mobile ? h * .2 : h * .18, w: startW, h: startW / 1.72 };
      const b = { x: (w - endW) / 2, y: top + (avail - endH * (1 + standRatio)) / 2, w: endW, h: endH };
      const p = camera.p;
      [['x', 'left'], ['y', 'top'], ['w', 'width'], ['h', 'height']].forEach(([k, prop]) => { shell.style[prop] = (a[k] + (b[k] - a[k]) * p) + 'px'; });
    }
    window.addEventListener('resize', layout);
    layout();

    /* ---------- ปฏิทิน ---------- */
    const dates = [
      ['26', 'กันยายน', '2566'], ['01', 'มกราคม', '2567'], ['14', 'มิถุนายน', '2567'],
      ['03', 'กุมภาพันธ์', '2568'], ['19', 'พฤศจิกายน', '2568'], ['27', 'กันยายน', '2569']
    ];
    dates.forEach((d, i) => {
      const page = document.createElement('div');
      page.className = 'calendar-page';
      page.innerHTML = `<b>${d[0]}</b><span>${d[1]}</span><small>${d[2]}</small>`;
      page.style.zIndex = dates.length - i;
      calendars.appendChild(page);
    });

    /* ============================================================
       เบราว์เซอร์ Nokkawow News
       ============================================================ */
    const site = content.newsSite;
    const browser = document.getElementById('browser');
    const tabsBar = browser.querySelector('.br-tabs');
    const urlBox = browser.querySelector('.br-url');
    const view = browser.querySelector('.br-view');
    const projects = content.projects.map((p, i) => ({ ...p, idx: i }));
    const newestFirst = [...projects].reverse();

    function gallery(p) {
      return `<div class="project-gallery" data-gallery>${(p.images || []).map((src, i) =>
        `<button class="stack-photo${i === 0 ? ' active' : ''}" data-image="${i}" aria-label="ดูภาพที่ ${i + 1}"><img src="${esc(src)}" alt="${esc(p.title)} ภาพที่ ${i + 1}"></button>`).join('')}</div>`;
    }
    const newsOf = (p) => p.news || { tag: 'ผลงาน', headline: p.title, deck: '' };

    // หน้าแรก: พาดหัวข่าว
    const home = document.createElement('section');
    home.className = 'br-page news-home';
    home.dataset.tab = 'home';
    const lead = newestFirst[0];
    home.innerHTML = `
      <header class="nw-mast"><h1>${esc(site.name)}</h1><p>${esc(site.tagline)}</p></header>
      <div class="nw-ticker"><b>ข่าวด่วน</b><div><span>${newestFirst.map((p) => esc(newsOf(p).headline)).join(' &nbsp;✦&nbsp; ')}</span></div></div>
      <article class="nw-lead" data-open="${lead.idx}" tabindex="0">
        <img src="${esc(lead.images[0])}" alt="">
        <div><span class="nw-tag">${esc(newsOf(lead).tag)}</span><h2>${esc(newsOf(lead).headline)}</h2><p>${esc(newsOf(lead).deck)}</p><em>อ่านต่อ →</em></div>
      </article>
      <div class="nw-list">${newestFirst.slice(1).map((p) => `
        <article class="nw-card" data-open="${p.idx}" tabindex="0">
          <img src="${esc(p.images[0])}" alt="">
          <div><span class="nw-tag">${esc(newsOf(p).tag)}</span><h3>${esc(newsOf(p).headline)}</h3><p>${esc(newsOf(p).deck)}</p></div>
        </article>`).join('')}</div>
      <footer class="nw-foot">คลิกข่าวเพื่อเปิดแท็บใหม่ · เลื่อนหน้าเว็บต่อเพื่อไปหน้าติดต่อ</footer>`;
    view.appendChild(home);

    const tabs = [{ id: 'home', title: site.name, page: home, url: site.url }];
    let active = 'home';
    function renderTabs() {
      tabsBar.innerHTML = tabs.map((t) => `
        <div class="br-tab${t.id === active ? ' active' : ''}" data-tab="${t.id}" role="tab" aria-selected="${t.id === active}" tabindex="0">
          <img src="assets/logo.webp" alt=""><span>${esc(t.title)}</span>${t.id === 'home' ? '' : `<button class="br-close" data-close="${t.id}" aria-label="ปิดแท็บ">✕</button>`}
        </div>`).join('');
    }
    function show(id) {
      active = id;
      tabs.forEach((t) => { t.page.hidden = t.id !== id; });
      const t = tabs.find((q) => q.id === id);
      urlBox.textContent = t.url;
      view.scrollTop = 0;
      renderTabs();
    }
    function openArticle(idx) {
      const id = 'p' + idx;
      if (!tabs.find((t) => t.id === id)) {
        const p = projects[idx], n = newsOf(p);
        const page = document.createElement('article');
        page.className = 'br-page news-article';
        const links = [
          p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">ดาวน์โหลด / เล่นเกม ↗</a>` : '',
          p.video ? `<a href="${esc(p.video)}" target="_blank" rel="noopener">ดูวิดีโอ ↗</a>` : ''
        ].filter(Boolean).join('') || '<span class="coming-link">ลิงก์เกมกำลังเตรียมเผยแพร่</span>';
        page.innerHTML = `
          <div class="na-gallery">${gallery(p)}${p.award ? `<span class="winner-stamp">${esc(p.award)}${p.awardSub ? ' · ' + esc(p.awardSub) : ''}</span>` : ''}</div>
          <div class="na-copy">
            <span class="nw-tag">${esc(n.tag)}</span>
            <h2>${esc(n.headline)}</h2>
            <p class="na-by">${esc(p.date)} · ใช้เวลา ${esc(p.duration)} · โดยกองบรรณาธิการ ${esc(site.name)}</p>
            <p class="na-deck">${esc(n.deck)}</p>
            <h3>${esc(p.title)}</h3>
            <p>${p.about || ''}</p>
            ${p.why ? `<p>${p.why}</p>` : ''}
            <dl><div><dt>หน้าที่ของผม</dt><dd>${esc(p.role || '-')}</dd></div><div><dt>ทีม</dt><dd>${esc(p.team || '-')}${p.teamSize ? ` · ${p.teamSize === 1 ? 'เกมเดี่ยว' : p.teamSize + ' คน'}` : ''}</dd></div></dl>
            ${p.goal ? `<blockquote>“${esc(p.goal)}”</blockquote>` : ''}
            <div class="project-actions">${links}</div>
          </div>`;
        page.hidden = true;
        view.appendChild(page);
        tabs.push({ id, title: p.short || p.title, page, url: `${site.url}/${p.id}` });
        layoutStack(page.querySelector('[data-gallery]'), 0, true);
        show(id);
        // ภาพขึ้นก่อน แล้วตัวอักษรตามมา
        if (!reduce) {
          gsap.fromTo(page.querySelectorAll('.stack-photo'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .08, ease: 'back.out(1.6)' });
          gsap.fromTo(page.querySelectorAll('.na-copy > *'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .4, stagger: .05, delay: .35 });
        }
        Sound.play('pop');
      } else show(id);
    }
    function closeTab(id) {
      const i = tabs.findIndex((t) => t.id === id);
      if (i < 1) return;
      tabs[i].page.remove();
      tabs.splice(i, 1);
      Sound.play('click');
      show(active === id ? tabs[Math.max(0, i - 1)].id : active);
    }
    renderTabs(); show('home');

    tabsBar.addEventListener('click', (e) => {
      const c = e.target.closest('.br-close');
      if (c) { e.stopPropagation(); closeTab(c.dataset.close); return; }
      const t = e.target.closest('.br-tab');
      if (t) { Sound.play('click'); show(t.dataset.tab); }
    });
    view.addEventListener('click', (e) => { const a = e.target.closest('[data-open]'); if (a) openArticle(+a.dataset.open); });
    view.addEventListener('keydown', (e) => { const a = e.target.closest('[data-open]'); if (a && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openArticle(+a.dataset.open); } });
    browser.querySelector('.br-home').addEventListener('click', () => show('home'));

    // ล้อเมาส์ในจอ: เลื่อนอ่านข่าวก่อน ถ้าเลื่อนสุดแล้วค่อยปล่อยให้เลื่อนเรื่องต่อ
    view.addEventListener('wheel', (e) => {
      const atTop = view.scrollTop <= 0, atEnd = view.scrollTop + view.clientHeight >= view.scrollHeight - 1;
      const pass = (e.deltaY < 0 && atTop) || (e.deltaY > 0 && atEnd);
      pass ? view.removeAttribute('data-lenis-prevent') : view.setAttribute('data-lenis-prevent', '');
    }, { capture: true, passive: true });

    /* ---------- กองภาพ: ชี้ภาพไหน ภาพนั้นออกมาหน้าสุด ภาพก่อนหน้าเก็บไปขอบซ้าย ---------- */
    function layoutStack(gal, act, instant) {
      if (!gal) return;
      const photos = [...gal.querySelectorAll('.stack-photo')];
      gal.dataset.active = act;
      photos.forEach((ph, i) => {
        const d = i - act;
        let v;
        if (d === 0) v = { xPercent: 0, yPercent: -3, rotation: 0, scale: 1.04, zIndex: 50 };
        else if (d < 0) v = { xPercent: -36 - (-d - 1) * 5, yPercent: 4 - d, rotation: -6 + d * 2, scale: 0.8, zIndex: 40 + d };
        else v = { xPercent: 6 * d, yPercent: 3 * d, rotation: d % 2 ? 3 + d : -2 - d, scale: 1 - 0.05 * d, zIndex: 40 - d };
        ph.classList.toggle('active', d === 0);
        ph.setAttribute('aria-pressed', d === 0);
        if (instant || reduce) gsap.set(ph, v);
        else gsap.to(ph, { ...v, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      });
    }
    let lastSwap = 0;
    function activatePhoto(photo) {
      const gal = photo.closest('[data-gallery]'), i = +photo.dataset.image;
      if (+gal.dataset.active === i) return false;
      lastSwap = performance.now();
      layoutStack(gal, i);
      Sound.play('tick', 0.05);
      return true;
    }
    view.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const photo = e.target.closest('.stack-photo');
      if (photo && performance.now() - lastSwap > 220) activatePhoto(photo);
    });

    /* ---------- ดูภาพขนาดใหญ่ ---------- */
    const box = document.createElement('div');
    box.id = 'photo-lightbox';
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('data-lenis-prevent', '');
    box.hidden = true;
    box.innerHTML = '<img alt=""><p></p><button type="button" aria-label="ปิด">✕</button>';
    document.body.appendChild(box);
    const boxImg = box.querySelector('img'), boxCap = box.querySelector('p');
    function openBox(photo) {
      const img = photo.querySelector('img'), all = photo.closest('[data-gallery]').querySelectorAll('.stack-photo');
      boxImg.src = img.src; boxImg.alt = img.alt;
      boxCap.textContent = `${img.alt} · ${+photo.dataset.image + 1} / ${all.length}`;
      box.hidden = false;
      if (!reduce) gsap.fromTo(boxImg, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      box.querySelector('button').focus();
    }
    box.addEventListener('click', () => { box.hidden = true; });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) box.hidden = true; });
    view.addEventListener('click', (e) => {
      const photo = e.target.closest('.stack-photo');
      if (photo && !activatePhoto(photo)) openBox(photo);
    });

    /* ============================================================
       ฉากสุดท้าย: บัตรขูดช่องทางติดต่อ + มาสคอตทักทาย
       ============================================================ */
    const fin = content.finale;
    const finCards = document.getElementById('fin-cards');
    finCards.innerHTML = `<h2>${esc(fin.cardsTitle)}</h2><p>${esc(fin.cardsSub)}</p><div class="sc-grid">${content.contact.items.map((c) => {
      const ext = /^https?:/.test(c.href);
      return `<div class="sc-card">
          <a class="sc-inner" href="${esc(c.href)}" ${ext ? 'target="_blank" rel="noopener"' : ''} aria-label="${esc(c.label)}: ${esc(c.value)}">
            <span class="sc-logo">${LOGOS[c.type] || ''}</span>
            <span class="sc-text"><small>${esc(c.label)}</small><b>${esc(c.value)}</b></span>
          </a>
          ${c.copy ? `<button class="sc-copy" data-copy="${esc(c.value)}">คัดลอก</button>` : ''}
          <canvas class="sc-cover" aria-label="ขูดเพื่อดู ${esc(c.label)}"></canvas>
        </div>`;
    }).join('')}</div><div class="toast" role="status" aria-live="polite"></div>`;
    document.querySelector('#fin-bubble .b1').textContent = fin.hello;
    document.querySelector('#fin-bubble .b2').textContent = fin.bye;
    document.getElementById('fin-thanks').innerHTML = content.thanks.title;

    // ชั้นเงินสำหรับขูด
    const covers = [...finCards.querySelectorAll('.sc-cover')].map((cv) => ({ cv, ctx: cv.getContext('2d'), done: false, last: null, moves: 0 }));
    function paintCover(c) {
      const r = c.cv.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      c.cv.width = r.width * dpr; c.cv.height = r.height * dpr;
      const x = c.ctx;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.globalCompositeOperation = 'source-over';
      const g = x.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#c9c9cf'); g.addColorStop(.45, '#f1f1f4'); g.addColorStop(.55, '#b9b9c1'); g.addColorStop(1, '#dedee3');
      x.fillStyle = g; x.fillRect(0, 0, r.width, r.height);
      x.fillStyle = 'rgba(17,17,17,.14)';
      for (let yy = 4; yy < r.height; yy += 6) for (let xx = (yy / 6 % 2) * 3 + 3; xx < r.width; xx += 6) { x.beginPath(); x.arc(xx, yy, .9, 0, 7); x.fill(); }
      x.fillStyle = '#111'; x.font = `800 ${Math.max(11, r.height * .2)}px "Noto Sans Thai", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('ขูดตรงนี้', r.width / 2, r.height / 2);
    }
    function paintAll() { covers.forEach((c) => { if (!c.done) paintCover(c); }); }
    document.fonts.ready.then(paintAll);
    window.addEventListener('resize', paintAll);

    function cleared(c) {
      const w = c.cv.width, h = c.cv.height, d = c.ctx.getImageData(0, 0, w, h).data;
      let clear = 0, n = 0;
      for (let y = 2; y < h; y += 8) for (let x = 2; x < w; x += 8) { n++; if (d[(y * w + x) * 4 + 3] < 40) clear++; }
      return clear / n;
    }
    function reveal(c) {
      c.done = true;
      gsap.to(c.cv, { autoAlpha: 0, duration: .45, onComplete: () => { c.cv.style.pointerEvents = 'none'; } });
      const card = c.cv.closest('.sc-card');
      card.classList.add('revealed');
      gsap.fromTo(card, { scale: .94 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
      Sound.play('pop');
      for (let k = 0; k < 8; k++) {
        const s = document.createElement('i'); s.className = 'sc-spark'; card.appendChild(s);
        gsap.fromTo(s, { left: '50%', top: '50%', scale: 0 }, { left: `${gsap.utils.random(-10, 110)}%`, top: `${gsap.utils.random(-30, 130)}%`, scale: gsap.utils.random(.6, 1.2), rotation: 180, duration: .7, ease: 'power2.out', onComplete: () => s.remove() });
      }
    }
    covers.forEach((c) => {
      const scratch = (e) => {
        if (c.done) return;
        const r = c.cv.getBoundingClientRect(), dpr = c.cv.width / r.width;
        const x = (e.clientX - r.left), y = (e.clientY - r.top);
        const ctx = c.ctx;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round'; ctx.lineWidth = Math.max(18, r.height * .32);
        ctx.beginPath();
        const l = c.last || { x, y };
        ctx.moveTo(l.x, l.y); ctx.lineTo(x, y); ctx.stroke();
        c.last = { x, y };
        Sound.rub(.18);
        if (++c.moves % 6 === 0 && cleared(c) > .5) { Sound.rub(0); reveal(c); }
      };
      let down = false;
      c.cv.addEventListener('pointerdown', (e) => { down = true; c.last = null; try { c.cv.setPointerCapture(e.pointerId); } catch (_) {} scratch(e); e.preventDefault(); });
      c.cv.addEventListener('pointermove', (e) => { if (down) scratch(e); });
      const up = () => { down = false; c.last = null; Sound.rub(0); };
      c.cv.addEventListener('pointerup', up); c.cv.addEventListener('pointercancel', up);
    });

    // ปุ่มคัดลอก (หลังขูดแล้ว)
    finCards.addEventListener('click', async (e) => {
      const b = e.target.closest('.sc-copy');
      if (!b) return;
      const toast = finCards.querySelector('.toast');
      let ok = true;
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch (_) { ok = false; }
      toast.textContent = ok ? `คัดลอก ${b.dataset.copy} แล้ว ✓` : b.dataset.copy;
      Sound.play('pop');
      gsap.killTweensOf(toast);
      gsap.timeline().fromTo(toast, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .25 }).to(toast, { autoAlpha: 0, duration: .3, delay: 1.6 });
    });

    /* ---------- เอกสารบนโต๊ะ: กดให้หล่นลงพื้น กดกองเพื่อเก็บกลับ ---------- */
    const paperWrap = document.getElementById('work-papers');
    const paperPile = document.getElementById('paper-pile');
    const papers = [...paperWrap.querySelectorAll('.work-paper')];
    let dropped = 0;
    function dropPaper(paper) {
      if (paper.classList.contains('dropped')) return;
      const r = paper.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const slot = dropped++;
      paper.classList.add('dropped');
      Sound.play('paper', .3);
      gsap.to(paper, {
        x: sr.left + sr.width * (.16 + slot * .035) - r.left,
        y: sr.bottom - Math.max(r.height, 70) - 38 - r.top + slot * 2,
        rotation: -14 + slot * 12,
        duration: reduce ? .01 : .72,
        ease: 'bounce.out',
        onComplete: () => paperPile.classList.add('has-paper')
      });
    }
    papers.forEach((paper) => paper.addEventListener('click', () => dropPaper(paper)));
    paperPile.addEventListener('click', () => {
      dropped = 0;
      Sound.play('paper', .25);
      papers.forEach((paper, i) => gsap.to(paper, {
        x: 0, y: 0, rotation: [-8, 3, 9][i], duration: reduce ? .01 : .55,
        delay: reduce ? 0 : i * .07, ease: 'back.out(1.7)',
        onComplete: () => paper.classList.remove('dropped')
      }));
      paperPile.classList.remove('has-paper');
    });

    /* ---------- ปุ่มคอม: คนดูกดปิด แล้วมาสคอตเอื้อมไปเปิดกลับ ---------- */
    const workspace = document.getElementById('workspace-layer');
    const power = document.getElementById('monitor-power');
    const chair = document.getElementById('work-chair');
    let powerOn = true, wakeTimer = null;
    function setPower(on, mascotAction) {
      powerOn = on;
      workspace.classList.toggle('computer-off', !on);
      power.setAttribute('aria-pressed', String(!on));
      power.setAttribute('aria-label', on ? 'ปิดคอมพิวเตอร์' : 'เปิดคอมพิวเตอร์');
      if (mascotAction) {
        chair.classList.remove('power-reaching');
        void chair.offsetWidth;
        chair.classList.add('power-reaching');
        setTimeout(() => chair.classList.remove('power-reaching'), reduce ? 30 : 1500);
      }
      Sound.play(on ? 'pop' : 'click', .35);
    }
    power.addEventListener('click', () => {
      if (wakeTimer) { clearTimeout(wakeTimer); wakeTimer = null; }
      if (!powerOn) { setPower(true, true); return; }
      setPower(false, false);
      // ปิดได้จริงชั่วครู่ จากนั้นน้องไม่ยอมให้งานดับและเอื้อมมาเปิดกลับเอง
      wakeTimer = setTimeout(() => { wakeTimer = null; setPower(true, true); }, reduce ? 250 : 1250);
    });

    return {
      calendarPages: Array.from(calendars.children),
      camera, renderCamera: layout, layout,
      repaintCovers: paintAll,
      cards: [...finCards.querySelectorAll('.sc-card')]
    };
  };
})();
