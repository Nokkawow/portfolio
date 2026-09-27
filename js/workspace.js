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
    const cpu = document.getElementById('work-cpu');
    const stage = document.querySelector('.stage');

    /* ---------- กล้อง + จัดฉากโต๊ะทำงาน (คำนวณจากเส้นขอบโต๊ะเส้นเดียว ทุกชิ้นจึงสมส่วนกันทุกขนาดจอ) ----------
       จอคอมตั้งกลางโต๊ะ · มาสคอตนั่งหันหลังทำงานอยู่หน้าจอพอดี · CPU ตั้งข้างจอ · กองเอกสารอีกฝั่งของโต๊ะ */
    const camera = { p: 0 };
    const desk = document.getElementById('work-desk');
    const chairEl = document.getElementById('work-chair');
    const papersEl = document.getElementById('work-papers');
    const rageEl = document.getElementById('mascot-rage');
    const peekEl = document.getElementById('news-peek');
    const px = (el, box) => { for (const k in box) el.style[k] = box[k] + 'px'; };
    let stageBox = null;
    function layout() {
      const w = stage.clientWidth, h = stage.clientHeight, mobile = w < h;
      const margin = mobile ? 12 : Math.max(24, w * .035), top = mobile ? 90 : 100;
      // จบการซูม: เห็นคอมทั้งเครื่อง (กรอบจอครบ + ขาตั้ง + ที่ว่างรอบๆ)
      const avail = h - top - 24, standRatio = .16;
      const endW = mobile ? w - margin * 2 : Math.min(w * .74, (avail / (1 + standRatio)) * 1.72);
      const endH = mobile ? avail / (1 + standRatio) : endW / 1.72;
      // มุมกว้าง: ขอบโต๊ะอยู่ราว 2/3 ของจอ จอคอมวางบนโต๊ะ
      const deskTop = h * (mobile ? .6 : .67);
      const startW = mobile ? w * .52 : Math.min(w * .34, (deskTop - h * .14) / (1 + standRatio) * 1.72);
      const startH = startW / 1.72;
      const cx = w * (mobile ? .52 : .55);    // เยื้องขวานิดๆ เว้นมุมซ้ายบนให้กล่องข้อความ
      const a = { x: cx - startW / 2, y: deskTop - startH * (1 + standRatio) + h * .012, w: startW, h: startH };
      const b = { x: (w - endW) / 2, y: top + (avail - endH * (1 + standRatio)) / 2, w: endW, h: endH };
      const p = camera.p;
      const frame = {};
      [['x', 'left'], ['y', 'top'], ['w', 'width'], ['h', 'height']].forEach(([k, prop]) => {
        frame[k] = a[k] + (b[k] - a[k]) * p;
        shell.style[prop] = frame[k] + 'px';
      });
      // มาสคอตแอบดู: ซ่อนตัวครึ่งหนึ่งหลังขอบขวาของจอคอม (ขยับตามกล้อง)
      const peekH = Math.min(h * .52, frame.h * .8), peekW = peekH * 592 / 492;
      px(peekEl, { left: frame.x + frame.w - peekW * .3, top: h - peekH * .86, width: peekW, height: peekH });
      if (stageBox && stageBox.w === w && stageBox.h === h) return;   // ส่วนอื่นขยับเฉพาะตอนขนาดจอเปลี่ยน
      stageBox = { w, h };
      // โต๊ะ: กว้างเกือบเต็มฉาก หน้าโต๊ะหนาพอดีตา
      px(desk, { left: w * .05, top: deskTop, width: w * .9, height: h * (mobile ? .07 : .1) });
      desk.style.right = desk.style.bottom = 'auto';
      // CPU ตั้งบนโต๊ะข้างจอ (ขวา)
      const cpuW = Math.max(46, startW * (mobile ? .24 : .2)), cpuH = cpuW * 1.5;
      px(cpu, { left: a.x + startW + startW * .07, top: deskTop - cpuH + h * .012, width: cpuW, height: cpuH });
      // มาสคอตนั่งเก้าอี้ตรงหน้าจอ: หัวอยู่ราวครึ่งล่างของจอ ตัวบังโต๊ะนิดๆ เหมือนนั่งทำงานจริง
      const chairH = mobile ? h * .5 : h * .6, chairW = chairH * 720 / 1080;
      px(chairEl, { left: cx - chairW / 2, top: h - chairH - h * .01, width: chairW, height: chairH });
      chairEl.style.right = chairEl.style.bottom = 'auto';
      // กองเอกสาร: ฝั่งซ้ายของโต๊ะ (จอแนวตั้ง) / ขวาถัดจาก CPU (จอแนวนอน · เว้นมุมซ้ายบนให้ข้อความ)
      const pw = mobile ? w * .2 : Math.min(w * .1, startW * .3), ph = pw * 1.35;
      const paperLeft = mobile ? w * .03 : Math.min(w * .95 - pw, a.x + startW + startW * .07 + cpuW + w * .025);
      px(papersEl, { left: paperLeft, top: deskTop - ph + h * .012, width: pw, height: ph });
      papersEl.style.right = papersEl.style.bottom = 'auto';
      // ฟองคำพูดตอนโกรธ: เหนือหัวมาสคอต
      px(rageEl, { left: cx - chairW * .15, top: h - chairH - h * .1 });
    }
    window.addEventListener('resize', () => { stageBox = null; layout(); });
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
      const n = (p.images || []).length;
      return `<div class="polaroid-deck" data-gallery>${(p.images || []).map((src, i) =>
        `<div class="polaroid" role="button" data-image="${i}" aria-label="ภาพที่ ${i + 1} จาก ${n} · ลากปัดออกเพื่อดูภาพถัดไป กด Enter เพื่อดูภาพใหญ่"><img src="${esc(src)}" alt="${esc(p.title)} ภาพที่ ${i + 1}" draggable="false"><span class="pl-cap"><b>${esc(p.short || p.title)}</b><i>${i + 1}/${n}</i></span></div>`).join('')}</div>${n > 1 ? `
        <div class="deck-bar"><button type="button" data-deck="prev" aria-label="ภาพก่อนหน้า">‹</button><span class="deck-count">1 / ${n}</span><button type="button" data-deck="next" aria-label="ภาพถัดไป">›</button><small>ลากปัดภาพออกได้เลย</small></div>` : ''}`;
    }
    const newsOf = (p) => p.news || { tag: 'ผลงาน', headline: p.title, deck: '' };
    // ป้ายรางวัลใหญ่เหนือกองรูป (ให้เห็นเด่นตั้งแต่แวบแรก)
    const TROPHY = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 6h20v10a10 10 0 0 1-20 0z" fill="#ffd54a" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M14 10H7c0 7 3 10 8 11M34 10h7c0 7-3 10-8 11" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/><path d="M21 26h6v7h-6z" fill="#ffd54a" stroke="#111" stroke-width="3"/><path d="M14 33h20v8H14z" fill="#7b1fa2" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M19 11v6" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';
    const awardBanner = (p) => `<div class="award-banner"><span class="ab-icon">${TROPHY}</span><div><b>${esc(p.award)}</b>${p.awardSub ? `<small>${esc(p.awardSub)}</small>` : ''}</div><i aria-hidden="true">✦</i></div>`;
    const NEW_BADGE = '<span class="nw-new">NEW</span>';
    const hostBadge = (p) => p.host ? `<span class="host-badge" data-host="${esc(p.host.name)}" title="จัดโดย ${esc(p.host.name)}"><img src="${esc(p.host.logo)}" alt="จัดโดย ${esc(p.host.name)}"></span>` : '';
    // คลิป YouTube ดูได้ในหน้าข่าว: โชว์ภาพปกก่อน กดเล่นแล้วค่อยโหลดตัวเล่นจริง (หน้าเว็บจึงไม่หนัก)
    const ytId = (u) => { const m = String(u).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };
    function clipPlayer(p) {
      const vids = [].concat(p.video || []).map((v) => typeof v === 'string' ? { url: v, label: 'ดูวิดีโอ' } : v)
        .map((v) => ({ ...v, id: ytId(v.url) })).filter((v) => v.id);
      if (!vids.length) return '';
      const tabs = vids.length > 1 ? `<div class="clip-tabs" role="tablist">${vids.map((v, i) => `<button type="button" role="tab" data-clip="${v.id}" aria-selected="${!i}">${esc(v.label.replace(/^ดู/, ''))}</button>`).join('')}</div>` : '';
      return `<div class="clip-box">${tabs}<button type="button" class="clip-screen" data-yt="${vids[0].id}" aria-label="เล่นคลิป ${esc(vids[0].label)}"><img src="https://i.ytimg.com/vi/${vids[0].id}/hqdefault.jpg" alt="" loading="lazy"><span class="clip-play" aria-hidden="true">▶</span></button></div>`;
    }

    // หน้าแรก: พาดหัวข่าว
    const home = document.createElement('section');
    home.className = 'br-page news-home';
    home.dataset.tab = 'home';
    const lead = newestFirst[0];
    home.innerHTML = `
      <header class="nw-mast"><h1>${esc(site.name)}</h1><p>${esc(site.tagline)}</p></header>
      <div class="nw-ticker"><b>ข่าวด่วน</b><div><span>${newestFirst.map((p) => esc(newsOf(p).headline)).join(' &nbsp;✦&nbsp; ')}</span></div></div>
      <article class="nw-lead" data-open="${lead.idx}" tabindex="0">
        <figure class="nw-lead-img"><img src="${esc(lead.images[0])}" alt="">${NEW_BADGE}</figure>
        <div><span class="nw-tag">${esc(newsOf(lead).tag)}</span>${NEW_BADGE}<h2>${esc(newsOf(lead).headline)}</h2><p>${esc(newsOf(lead).deck)}</p><em>อ่านต่อ →</em></div>
      </article>
      <div class="nw-list">${newestFirst.slice(1).map((p) => `
        <article class="nw-card" data-open="${p.idx}" tabindex="0">
          <figure class="nw-card-img"><img src="${esc(p.images[0])}" alt="">${hostBadge(p)}</figure>
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
          ...[].concat(p.video || []).map((v) => typeof v === 'string' ? { url: v, label: 'ดูวิดีโอ' } : v).map((v) => `<a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.label || 'ดูวิดีโอ')} ↗</a>`)
        ].filter(Boolean).join('') || '<span class="coming-link">ลิงก์เกมกำลังเตรียมเผยแพร่</span>';
        page.innerHTML = `
          ${hostBadge(p)}
          <div class="na-media">${p.award ? awardBanner(p) : ''}<div class="na-gallery">${gallery(p)}</div>${clipPlayer(p)}</div>
          <div class="na-copy">
            <span class="nw-tag">${esc(n.tag)}</span>${p.idx === lead.idx ? NEW_BADGE : ''}
            <h2>${esc(n.headline)}</h2>
            <p class="na-by">${[p.date, p.duration && 'ใช้เวลา ' + p.duration, 'โดยกองบรรณาธิการ ' + site.name].filter(Boolean).map(esc).join(' · ')}</p>
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
        layoutStack(page.querySelector('[data-gallery]'), true);
        show(id);
        // ภาพขึ้นก่อน แล้วตัวอักษรตามมา
        if (!reduce) {
          gsap.from([...page.querySelectorAll('.polaroid')].reverse(), { autoAlpha: 0, y: -60, duration: .5, stagger: .07, ease: 'back.out(1.6)' });
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

    /* ---------- กองโพลารอยด์ (แบบ Draggable Card): ลากเอียงได้ · ปัดออกแล้วภาพจะมุดไปอยู่ล่างสุด · ปล่อยเบาๆ เด้งกลับ ---------- */
    // ตำแหน่งในกอง: k = 0 คือใบบนสุด ใบถัดไปเยื้องและเอียงสลับซ้ายขวาอย่างเป็นระเบียบ
    const TILT = [0, -4, 3.5, -2.5, 4.5, -3.5, 2.5];
    function stackPose(k) {
      if (k === 0) return { xPercent: 0, yPercent: 0, rotation: 0, scale: 1 };
      return { xPercent: (k % 2 ? -1 : 1) * (2 + k * 1.6), yPercent: k * 2.2, rotation: TILT[k % TILT.length], scale: 1 - k * 0.035 };
    }
    function markTop(cards, order) {
      order.forEach((ci, k) => {
        const c = cards[ci];
        c.style.zIndex = 50 - k;
        c.classList.toggle('top', k === 0);
        c.tabIndex = k === 0 ? 0 : -1;
        c.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
      });
    }
    function setCount(gal) {
      const n = gal.parentElement.querySelector('.deck-count');
      if (n) n.textContent = `${gal._order[0] + 1} / ${gal._order.length}`;
    }
    function layoutStack(gal, instant) {
      if (!gal) return;
      const cards = [...gal.querySelectorAll('.polaroid')];
      const order = gal._order || (gal._order = cards.map((_, i) => i));
      markTop(cards, order);
      order.forEach((ci, k) => {
        const v = { ...stackPose(k), x: 0, y: 0, rotationX: 0, rotationY: 0 };
        if (instant) gsap.set(cards[ci], v);
        else gsap.to(cards[ci], { ...v, duration: 0.55, ease: 'back.out(1.5)', overwrite: 'auto' });
      });
      setCount(gal);
    }
    // ปัดใบบนสุดออกไปทาง dir แล้วให้มุดกลับไปล่างกอง · back = ดึงใบล่างสุดกลับขึ้นมาบนสุด
    function cycle(gal, dir = { x: 1, y: 0 }, back = false) {
      const cards = [...gal.querySelectorAll('.polaroid')], order = gal._order;
      if (cards.length < 2) return;
      if (back) {
        order.unshift(order.pop());
        layoutStack(gal);
        Sound.play('tick', 0.05);
        return;
      }
      const c = cards[order[0]], w = gal.clientWidth;
      order.push(order.shift());
      Sound.play('whoosh', 0.04);
      markTop(cards, order);
      c.style.zIndex = 60;                       // ขณะบินออกยังลอยอยู่บนสุด
      setCount(gal);
      order.slice(0, -1).forEach((ci, k) => gsap.to(cards[ci], { ...stackPose(k), x: 0, y: 0, duration: 0.5, ease: 'back.out(1.5)', overwrite: 'auto' }));
      gsap.to(c, { x: dir.x * w * 0.95, y: dir.y * w * 0.6, rotation: (dir.x || 0.4) * 26, rotationX: 0, rotationY: 0, duration: 0.26, ease: 'power2.out', overwrite: true,
        onComplete: () => { c.style.zIndex = 50 - order.length + 1; layoutStack(gal); } });
    }

    let drag = null;
    view.addEventListener('pointerdown', (e) => {
      const c = e.target.closest('.polaroid.top');
      if (!c || e.button > 0) return;
      e.preventDefault();
      const now = performance.now();
      drag = { c, gal: c.closest('[data-gallery]'), x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t0: now, vx: 0, vy: 0, lx: e.clientX, ly: e.clientY, lt: now, id: e.pointerId };
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
      c.classList.add('dragging');
      gsap.killTweensOf(c);
    });
    view.addEventListener('pointermove', (e) => {
      if (drag && e.pointerId === drag.id) {
        const now = performance.now(), dt = Math.max(1, now - drag.lt);
        drag.vx = drag.vx * 0.6 + ((e.clientX - drag.lx) / dt) * 0.4;
        drag.vy = drag.vy * 0.6 + ((e.clientY - drag.ly) / dt) * 0.4;
        drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
        drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
        // เอียงตามความเร็วที่ลาก เหมือนการ์ดจริงที่ถูกเหวี่ยง
        gsap.set(drag.c, { x: drag.dx, y: drag.dy, rotation: drag.dx * 0.06, transformPerspective: 700,
          rotationY: gsap.utils.clamp(-22, 22, drag.vx * 14), rotationX: gsap.utils.clamp(-22, 22, -drag.vy * 14) });
        return;
      }
      // เมาส์ชี้ใบบนสุด: การ์ดเอียงตามตำแหน่งเมาส์
      if (e.pointerType !== 'mouse') return;
      const c = e.target.closest('.polaroid.top');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(c, { rotationY: px * 16, rotationX: -py * 16, transformPerspective: 700, duration: 0.3, overwrite: 'auto' });
    });
    view.addEventListener('pointerout', (e) => {
      const c = e.target.closest('.polaroid.top');
      if (c && !drag && !c.contains(e.relatedTarget)) gsap.to(c, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'elastic.out(1, .5)' });
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      d.c.classList.remove('dragging');
      const dist = Math.hypot(d.dx, d.dy), speed = Math.hypot(d.vx, d.vy);
      if (dist < 6 && performance.now() - d.t0 < 400) {                          // แตะเฉยๆ = ดูภาพใหญ่
        gsap.to(d.c, { x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, duration: 0.2 });
        openBox(d.c);
      } else if (dist > d.gal.clientWidth * 0.3 || (speed > 0.7 && dist > 20)) {   // ปัดออก
        const m = dist || 1;
        cycle(d.gal, { x: d.dx / m, y: d.dy / m });
      } else {                                                                      // เด้งกลับเข้ากอง
        gsap.to(d.c, { x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, duration: 0.9, ease: 'elastic.out(1, .45)' });
      }
    }
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', endDrag);
    const refocus = (gal) => requestAnimationFrame(() => gal.querySelector('.polaroid.top').focus({ preventScroll: true }));
    view.addEventListener('keydown', (e) => {
      const c = e.target.closest('.polaroid.top');
      if (!c) return;
      const gal = c.closest('[data-gallery]');
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(c); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); cycle(gal, { x: 1, y: 0 }); refocus(gal); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); cycle(gal, { x: -1, y: 0 }, true); refocus(gal); }
    });
    view.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-clip]');
      const screen = e.target.closest('.clip-screen');
      if (tab) {
        const box = tab.closest('.clip-box');
        box.querySelectorAll('[data-clip]').forEach((b) => b.setAttribute('aria-selected', String(b === tab)));
        const old = box.querySelector('.clip-screen, iframe');
        const s = document.createElement('button');
        s.type = 'button'; s.className = 'clip-screen'; s.dataset.yt = tab.dataset.clip; s.setAttribute('aria-label', 'เล่นคลิป');
        s.innerHTML = `<img src="https://i.ytimg.com/vi/${tab.dataset.clip}/hqdefault.jpg" alt=""><span class="clip-play" aria-hidden="true">▶</span>`;
        old.replaceWith(s);
        return;
      }
      if (screen) {
        const f = document.createElement('iframe');
        f.src = `https://www.youtube-nocookie.com/embed/${screen.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
        f.title = 'คลิปเกม'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
        f.className = 'clip-frame';
        screen.replaceWith(f);
        Sound.play('click', .2);
      }
    });
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-deck]');
      if (!b) return;
      const gal = b.closest('.na-gallery').querySelector('[data-gallery]');
      b.dataset.deck === 'next' ? cycle(gal, { x: 1, y: 0 }) : cycle(gal, { x: -1, y: 0 }, true);
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
      const img = photo.querySelector('img'), all = photo.closest('[data-gallery]').querySelectorAll('.polaroid');
      boxImg.src = img.src; boxImg.alt = img.alt;
      boxCap.textContent = `${img.alt} · ${+photo.dataset.image + 1} / ${all.length}`;
      box.hidden = false;
      if (!reduce) gsap.fromTo(boxImg, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      box.querySelector('button').focus();
    }
    box.addEventListener('click', () => { box.hidden = true; });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) box.hidden = true; });

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

    /* ---------- ฉากติดต่อ: ทางเดินภาพผลงานไหลเข้าหาคนดู (พอร์ตจาก Image Stream Hero ของ ruixen.ui เป็น JS ธรรมดา) ----------
       ภาพสองแถวเกิดที่จุดลับตาตรงกลาง แล้วพุ่งออกซ้าย-ขวาเข้าหาจอ · ขนาดเป็น cqw จึงคงสัดส่วนทุกขนาดจอ
       ทุกครั้งที่ภาพวิ่งครบรอบจะเปลี่ยนเป็นภาพถัดไป เลยวนครบทุกภาพของทุกเกม · เล่นเฉพาะตอนอยู่ในฉากติดต่อ */
    (function initStream() {
      const P = { perspective: 30, cardWidth: 18, cardHeight: 25, cardRadius: 0.4, birthHeight: 2.6, exitHeight: 46,
        railBirth: -11, railExit: 44, fan: 3.3, turnBirth: 6, turnExit: 28, stops: 24 };
      const CARDS = 9, SPEED = 22, AXIS = 44;
      // จุดลับตาอยู่ในช่องว่างระหว่างการ์ดติดต่อกับมาสคอต (จอแนวตั้งกลับมาอยู่กลาง)
      const CENTER = matchMedia('(max-aspect-ratio: 1/1)').matches ? 50 : 59;
      const imgs = content.projects.flatMap((p) => (p.images || []).map((src) => ({ src, alt: p.title })));
      if (!imgs.length) return;
      // สุ่มสลับลำดับครั้งเดียว ภาพจากเกมเดียวกันจะได้ไม่เรียงติดกัน
      for (let i = imgs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; }
      function keyframes(dir, name) {
        const steps = [];
        for (let s = 0; s <= P.stops; s++) {
          const u = s / P.stops;
          const scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, u);
          const z = P.perspective * (1 - 1 / scale);
          const rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - u, P.fan);
          const turn = P.turnBirth + (P.turnExit - P.turnBirth) * u;
          steps.push(`${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(2)}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`);
        }
        return `@keyframes ${name}{${steps.join('')}}`;
      }
      const wrap = document.createElement('div');
      wrap.id = 'fin-stream';
      wrap.setAttribute('aria-hidden', 'true');
      const style = document.createElement('style');
      style.textContent = keyframes(1, 'fs-right') + keyframes(-1, 'fs-left');
      document.head.appendChild(style);
      const scene = document.createElement('div');
      scene.className = 'fs-scene';
      scene.style.perspective = `${P.perspective}cqw`;
      scene.style.perspectiveOrigin = `${CENTER}% ${AXIS}%`;
      const rig = document.createElement('div');
      rig.className = 'fs-rig';
      ['fs-right', 'fs-left'].forEach((name, rail) => {
        for (let i = 0; i < CARDS; i++) {
          const card = document.createElement('div');
          card.className = 'fs-card';
          Object.assign(card.style, {
            left: `${CENTER}%`, top: `${AXIS}%`, width: `${P.cardWidth}cqw`, height: `${P.cardHeight}cqw`,
            marginLeft: `${-P.cardWidth / 2}cqw`, marginTop: `${-P.cardHeight / 2}cqw`, borderRadius: `${P.cardRadius}cqw`,
            animation: `${name} ${SPEED}s linear infinite`, animationDelay: `${-(i * SPEED) / CARDS}s`
          });
          // แถวขวาใช้ภาพลำดับคู่ แถวซ้ายใช้ลำดับคี่ · วิ่งครบรอบก็ขยับไปอีก 2×CARDS ภาพ
          let k = i * 2 + rail;
          const im = document.createElement('img');
          im.decoding = 'async'; im.draggable = false; im.alt = '';
          const put = () => { im.src = imgs[k % imgs.length].src; };
          put();
          card.addEventListener('animationiteration', () => { k += CARDS * 2; put(); });
          card.appendChild(im);
          rig.appendChild(card);
        }
      });
      scene.appendChild(rig);
      wrap.appendChild(scene);
      finCards.parentNode.insertBefore(wrap, finCards);
    })();
    document.querySelector('#fin-bubble .b1').textContent = fin.hello;
    document.querySelector('#fin-bubble .b2').textContent = fin.bye;
    document.getElementById('fin-thanks').innerHTML = content.thanks.title;
    /* ---------- มาสคอตหน้าติดต่อ: ลากได้ · ชี้แล้วเอียงตาม · จิ้มแล้วกระโดดพูดประโยคสุ่ม · ขูดการ์ดเปิดแล้วเชียร์ ---------- */
    const contactMascot = document.getElementById('contact-mascot');
    const mImg = contactMascot.querySelector('img');
    const bubbleText = document.querySelector('#fin-bubble .b1');
    const LINES = ['ขูดการ์ดดูสิ มีช่องทางติดต่อซ่อนอยู่นะ!', 'จิ้มผมทำไมเนี่ย ฮ่าๆ', 'ทักมาคุยเรื่องเกมกันได้เลยครับ!', 'อยากทำเกมด้วยกันไหม?', 'อย่าลืมไปลองเล่นเกมผมนะ!', 'ฮึบ! กระโดดสูงไหมครับ?', 'ขอบคุณที่ดูมาถึงตรงนี้นะครับ'];
    let lineIdx = -1, sayTimer = null, busy = false;
    function say(text, hold = 2600) {
      bubbleText.textContent = text;
      gsap.fromTo('#fin-bubble', { scale: .85 }, { scale: 1, duration: .45, ease: 'back.out(3)', overwrite: 'auto' });
      clearTimeout(sayTimer);
      sayTimer = setTimeout(() => { bubbleText.textContent = fin.hello; }, hold);
    }
    function popFx(icons, n = 6) {
      const r = contactMascot.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      for (let k = 0; k < n; k++) {
        const s = document.createElement('i');
        s.className = 'cm-fx'; s.textContent = icons[k % icons.length];
        s.style.left = (r.left - sr.left + r.width * (.3 + Math.random() * .4)) + 'px';
        s.style.top = (r.top - sr.top + r.height * .2) + 'px';
        contactMascot.parentNode.appendChild(s);
        gsap.to(s, { x: gsap.utils.random(-90, 90), y: gsap.utils.random(-130, -60), rotation: gsap.utils.random(-40, 40), autoAlpha: 0, duration: 1.1, ease: 'power2.out', onComplete: () => s.remove() });
      }
    }
    function hop(height = 60) {
      if (busy) return;
      busy = true;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(mImg, { scaleY: .9, scaleX: 1.06, transformOrigin: '50% 100%', duration: .12, ease: 'power2.out' })
        .to(mImg, { y: -height, scaleY: 1.06, scaleX: .96, duration: .28, ease: 'power2.out' })
        .to(mImg, { y: 0, scaleY: 1, scaleX: 1, duration: .32, ease: 'bounce.out' });
    }
    function mascotCheer() { hop(80); say('เย้! เปิดได้แล้ว ทักมาได้เลยนะ!'); popFx(['✦', '★', '♪'], 8); Sound.play('pop', .3); }
    let mascotDrag = null;
    contactMascot.addEventListener('pointerdown', (e) => {
      mascotDrag = { x: e.clientX, y: e.clientY, moved: 0 };
      try { contactMascot.setPointerCapture(e.pointerId); } catch (_) {}
      gsap.killTweensOf(mImg, 'x,y,rotation');
    });
    contactMascot.addEventListener('pointermove', (e) => {
      if (mascotDrag) {
        const dx = e.clientX - mascotDrag.x, dy = e.clientY - mascotDrag.y;
        mascotDrag.moved = Math.max(mascotDrag.moved, Math.hypot(dx, dy));
        const x = Math.max(-65, Math.min(65, dx * .42)), y = Math.max(-45, Math.min(45, dy * .35));
        gsap.set(mImg, { x, y, rotation: x * .08 });
        return;
      }
      if (e.pointerType !== 'mouse' || busy) return;
      // ชี้เมาส์: เอนตัวตามนิดๆ เหมือนหันมามอง
      const r = contactMascot.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      gsap.to(mImg, { rotation: px * 6, x: px * 10, duration: .4, overwrite: 'auto' });
    });
    contactMascot.addEventListener('pointerleave', () => { if (!mascotDrag && !busy) gsap.to(mImg, { rotation: 0, x: 0, duration: .6, ease: 'elastic.out(1,.5)' }); });
    const releaseMascot = () => {
      if (!mascotDrag) return;
      const tap = mascotDrag.moved < 6;
      mascotDrag = null;
      gsap.to(mImg, { x: 0, y: 0, rotation: 0, duration: .65, ease: 'elastic.out(1,.45)' });
      if (tap) {
        lineIdx = (lineIdx + 1) % LINES.length;
        say(LINES[lineIdx]);
        hop();
        popFx(['♪', '✦', '?'], 5);
        Sound.play('pop', .2);
      } else {
        say('เวียนหัวแล้วคร้าบ~', 1800);
      }
    };
    contactMascot.addEventListener('pointerup', releaseMascot);
    contactMascot.addEventListener('pointercancel', releaseMascot);
    contactMascot.setAttribute('role', 'button');
    contactMascot.tabIndex = 0;
    contactMascot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lineIdx = (lineIdx + 1) % LINES.length; say(LINES[lineIdx]); hop(); } });

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
      mascotCheer();
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

    /* ---------- กองเอกสารบนโต๊ะ ----------
       · หยิบแผ่นบนสุดแล้วปาได้: กระดาษพุ่งตามแรงเหวี่ยง พลิ้วไปมา แล้วปลิวหายไป
       · ดึงแผ่นฐาน (มีป้าย "ดึงฐาน"): ฐานหลุดออก กองล้มไปทางที่ดึง ทุกแผ่นร่วงแล้วปลิวหายไป
       · กระดาษหมดโต๊ะเมื่อไหร่ กองใหม่จะร่วงลงมาเรียงให้เล่นได้อีก (ไม่มีกระดาษค้างบนพื้น) */
    const paperWrap = document.getElementById('work-papers');
    const papers = [...paperWrap.querySelectorAll('.work-paper')];
    const onDesk = () => papers.filter((p) => !p.classList.contains('gone') && !p.classList.contains('flying'));
    const topPaper = () => onDesk().at(-1);
    let refillTimer = null;
    function refill() {
      refillTimer = null;
      papers.forEach((p) => { p.classList.remove('gone', 'flying', 'dragging'); gsap.killTweensOf(p); gsap.set(p, { clearProps: 'transform,opacity,visibility' }); });
      paperWrap.classList.remove('stack-dragging');
      markPapers();
      // กองใหม่ร่วงลงมาเรียงจากล่างขึ้นบน
      gsap.from(papers, { y: -stage.clientHeight * .45, rotation: () => gsap.utils.random(-25, 25), autoAlpha: 0, duration: .45, stagger: .045, ease: 'back.out(1.3)' });
      Sound.play('paper', .2);
    }
    function scheduleRefill() {
      if (!onDesk().length && !refillTimer) refillTimer = setTimeout(refill, 1500);
    }
    // ป้ายและ aria ตามหน้าที่ของแต่ละแผ่นตอนนี้
    function markPapers() {
      const desk = onDesk(), t = desk.at(-1), base = desk[0];
      papers.forEach((p) => {
        p.classList.toggle('is-top', p === t);
        p.classList.toggle('is-base', p === base && desk.length > 1);
        p.tabIndex = p === t || p === base ? 0 : -1;
        p.setAttribute('aria-label', p === t ? 'หยิบเอกสารแผ่นบนสุดมาปา' : p === base ? 'ดึงเอกสารแผ่นฐานให้กองล้ม' : 'เอกสารในกอง');
      });
    }
    // กระดาษพุ่งไปตามแรง แล้วพลิ้ว (พลิก 3 มิติ + ส่ายซ้ายขวา) ลอยลงและจางหาย
    function blowAway(paper, vx, vy, delay = 0) {
      paper.classList.add('flying');
      paper.classList.remove('dragging', 'is-top', 'is-base');
      paper.tabIndex = -1;
      const dir = Math.sign(vx) || (Math.random() < .5 ? -1 : 1);
      const W = stage.clientWidth, H = stage.clientHeight;
      const sway = gsap.utils.random(40, 90);
      gsap.timeline({ delay, onComplete: () => { paper.classList.add('gone'); scheduleRefill(); } })
        .to(paper, { x: `+=${gsap.utils.clamp(-W * .5, W * .5, vx * .32)}`, y: `+=${gsap.utils.clamp(-H * .4, H * .2, vy * .22) - 40}`,
          rotation: `+=${gsap.utils.clamp(-160, 160, vx * .12)}`, duration: .4, ease: 'power2.out' })
        .to(paper, { keyframes: [
          { x: `+=${dir * sway}`, y: `+=${H * .1}`, rotation: `+=${dir * 30}`, rotationX: 55, duration: .45, ease: 'sine.inOut' },
          { x: `+=${dir * sway * .4}`, y: `+=${H * .08}`, rotation: `-=${dir * 45}`, rotationX: -40, duration: .45, ease: 'sine.inOut' },
          { x: `+=${dir * sway * 1.4}`, y: `+=${H * .12}`, rotation: `+=${dir * 60}`, rotationX: 70, autoAlpha: 0, duration: .55, ease: 'sine.in' }
        ] });
    }
    function toppleStack(dir) {
      const stack = onDesk();
      if (!stack.length) return;
      Sound.play('paper', .3);
      paperWrap.classList.remove('stack-dragging');
      // ฐานหลุดก่อน แล้วแผ่นบนๆ ค่อยเอนตามและร่วงตามกัน (แผ่นสูงยิ่งเหวี่ยงไกล)
      stack.forEach((p, i) => {
        const k = i / Math.max(1, stack.length - 1);
        blowAway(p, dir * (380 + k * 900 + gsap.utils.random(-120, 120)), -120 - k * 260, .04 + i * .05);
      });
      markPapers();
    }
    papers.forEach((paper) => {
      let drag = null;
      paper.addEventListener('pointerdown', (e) => {
        if (paper.classList.contains('flying') || paper.classList.contains('gone')) return;
        const desk = onDesk();
        const isBase = paper === desk[0] && desk.length > 1, isTop = paper === desk.at(-1);
        if (!isBase && !isTop) return;
        e.preventDefault();
        drag = { base: isBase, x0: e.clientX, y0: e.clientY, px: e.clientX, py: e.clientY, t: performance.now(), vx: 0, vy: 0 };
        try { paper.setPointerCapture(e.pointerId); } catch (_) {}
        gsap.killTweensOf(paper);
        if (isBase) paperWrap.classList.add('stack-dragging'); else paper.classList.add('dragging');
      });
      paper.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const now = performance.now(), dt = Math.max(8, now - drag.t);
        drag.vx = drag.vx * .5 + (e.clientX - drag.px) / dt * 1000 * .5;
        drag.vy = drag.vy * .5 + (e.clientY - drag.py) / dt * 1000 * .5;
        const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
        drag.px = e.clientX; drag.py = e.clientY; drag.t = now;
        if (drag.base) {
          // ดึงฐาน: ฐานเลื่อนตามมือ กองด้านบนเอนตามนิดๆ พอดึงเกินระยะก็ล้มทันที
          const pulled = e.clientX - drag.x0;
          gsap.set(paper, { x: `+=${dx}` });
          onDesk().slice(1).forEach((p, i) => gsap.set(p, { rotation: gsap.utils.clamp(-14, 14, pulled * .05 * (1 + i * .08)), transformOrigin: pulled > 0 ? '100% 100%' : '0% 100%' }));
          if (Math.abs(pulled) > paper.offsetWidth * .35) { const d = Math.sign(pulled); drag = null; toppleStack(d); }
          return;
        }
        gsap.set(paper, { x: `+=${dx}`, y: `+=${dy}`, rotation: gsap.utils.clamp(-25, 25, drag.vx * .02) });
      });
      const release = () => {
        if (!drag) return;
        const d = drag; drag = null;
        paperWrap.classList.remove('stack-dragging');
        paper.classList.remove('dragging');
        const moved = Math.hypot(d.px - d.x0, d.py - d.y0);
        if (d.base) {
          if (Math.abs(d.vx) > 500) { toppleStack(Math.sign(d.vx)); return; }
          onDesk().forEach((p) => gsap.to(p, { x: 0, rotation: 0, duration: .5, ease: 'elastic.out(1,.5)' }));
          return;
        }
        if (moved < 6) { Sound.play('paper', .2); gsap.to(paper, { x: 0, y: 0, rotation: 0, duration: .3 }); return; }
        Sound.play('paper', .3);
        blowAway(paper, d.vx || (d.px - d.x0) * 6, d.vy || (d.py - d.y0) * 6);
        markPapers();
      };
      paper.addEventListener('pointerup', release);
      paper.addEventListener('pointercancel', release);
      // คีย์บอร์ด: Enter บนแผ่นบนสุด = ปาออก · บนแผ่นฐาน = ดึงให้ล้ม
      paper.addEventListener('click', (e) => {
        if (e.detail !== 0) return;
        const desk = onDesk();
        if (paper === desk[0] && desk.length > 1) toppleStack(1);
        else if (paper === desk.at(-1)) { blowAway(paper, 900, -200); markPapers(); }
      });
    });
    markPapers();

    /* ---------- มาสคอตแอบดูตอนอ่านข่าว: จิ้มแล้วพูดประโยคใหม่ ---------- */
    const PEEK_LINES = ['อ่านข่าวผมอยู่เหรอ?', 'ข่าวไหนเจ๋งสุด บอกหน่อย!', 'ลองปัดรูปดูสิ ปัดได้นะ', 'เกมนี้ผมภูมิใจมากเลย', 'แอบดูนิดนึงนะ ฮิๆ'];
    let peekIdx = 0;
    const peekBubble = peekEl.querySelector('.np-bubble');
    peekEl.addEventListener('click', () => {
      peekIdx = (peekIdx + 1) % PEEK_LINES.length;
      peekBubble.textContent = PEEK_LINES[peekIdx];
      gsap.fromTo(peekEl.querySelector('img'), { y: 0 }, { y: -18, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' });
      gsap.fromTo(peekBubble, { scale: .7 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
      Sound.play('pop', .2);
    });

    /* ---------- CPU: คนดูกดปิดคอม → จอดับ → มาสคอตหัวร้อน เอื้อมไปกดเปิดเอง → จอติดขึ้นมาทำงานต่อ ---------- */
    const workspace = document.getElementById('workspace-layer');
    const monitorPower = document.getElementById('monitor-power');
    const chair = document.getElementById('work-chair');
    let powerOn = true, gag = null;
    function setPower(on) {
      powerOn = on;
      workspace.classList.toggle('computer-off', !on);
      workspace.classList.toggle('computer-boot', on);
      if (on) setTimeout(() => workspace.classList.remove('computer-boot'), 700);
      cpu.setAttribute('aria-pressed', String(!on));
      cpu.setAttribute('aria-label', on ? 'แกล้งปิดคอมพิวเตอร์' : 'มาสคอตกำลังเปิดคอมพิวเตอร์');
      monitorPower.setAttribute('aria-pressed', String(!on));
      Sound.play(on ? 'pop' : 'click', .35);
    }
    cpu.addEventListener('click', () => {
      if (!powerOn || gag) return;              // กำลังเล่นมุกอยู่ รอให้จบก่อน
      setPower(false);
      workspace.classList.add('mascot-angry');
      // สั่นเพราะโกรธ → เอนตัวเอื้อมไปทาง CPU → กดเปิด → กลับมานั่งทำงานต่อ
      const reach = cpu.getBoundingClientRect().left - chair.getBoundingClientRect().right;
      gag = gsap.timeline({ onComplete: () => { gag = null; workspace.classList.remove('mascot-angry'); } })
        .to(chair, { keyframes: [{ x: -5, rotation: -1.5 }, { x: 5, rotation: 1.5 }, { x: -4, rotation: -1 }, { x: 4, rotation: 1 }, { x: 0, rotation: 0 }], duration: .5, ease: 'none' })
        .to(chair, { x: Math.max(30, reach * .6 + chair.offsetWidth * .2), y: -8, rotation: 9, transformOrigin: '50% 90%', duration: .38, ease: 'power2.out' })
        .add(() => setPower(true))
        .to(chair, { x: 0, y: 0, rotation: 0, duration: .55, ease: 'back.out(1.6)' }, '+=.12');
    });
    // ไฟบนกรอบจอเป็นเพียงสถานะ ปุ่มเล่นจริงอยู่ที่ CPU
    monitorPower.tabIndex = -1;
    monitorPower.setAttribute('aria-hidden','true');

    return {
      calendarPages: Array.from(calendars.children),
      camera, renderCamera: layout, layout,
      repaintCovers: paintAll,
      cards: [...finCards.querySelectorAll('.sc-card')]
    };
  };
})();
