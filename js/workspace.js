/* ห้องทำงานและพอร์ตในจอคอม — เนื้อหาดึงจาก CONTENT เท่านั้น */
(function () {
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.initWorkspace = function initWorkspace(content) {
    const track = document.getElementById('portfolio-track');
    const calendars = document.getElementById('calendar-stack');
    const shell = document.getElementById('monitor-shell');

    const stage = document.querySelector('.stage');
    const camera = { p: 0 };
    function layout() {
      const w=stage.clientWidth,h=stage.clientHeight,mobile=w<h;
      const margin=mobile?12:Math.max(24,w*.035), top=mobile?90:100;
      // จบการซูม: เห็นคอมทั้งเครื่อง (กรอบจอครบ + ขาตั้ง + ที่ว่างรอบๆ) ไม่ให้จอเต็มหน้า
      const avail=h-top-24, standRatio=.16;
      const endW=mobile?w-margin*2:Math.min(w*.74,(avail/(1+standRatio))*1.72);
      const endH=mobile?avail/(1+standRatio):endW/1.72;
      const startW=mobile?w*.6:w*.44;
      const a={x:mobile?w*.2:w*.42,y:mobile?h*.2:h*.18,w:startW,h:startW/1.72};
      const b={x:(w-endW)/2,y:top+(avail-endH*(1+standRatio))/2,w:endW,h:endH};
      const p=camera.p;
      Object.keys(a).forEach(k=>{const property={x:'left',y:'top',w:'width',h:'height'}[k];shell.style[property]=(a[k]+(b[k]-a[k])*p)+'px';});
    }
    window.addEventListener('resize',layout);
    layout();
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

    function gallery(project) {
      const imgs = (project.images || []).map((src, i) =>
        `<button class="stack-photo${i === 0 ? ' active' : ''}" data-image="${i}" aria-label="ดูภาพที่ ${i + 1}"><img src="${esc(src)}" alt="${esc(project.title)} ภาพที่ ${i + 1}"></button>`
      ).join('');
      return `<div class="project-gallery" data-gallery>${imgs}</div>`;
    }

    content.projects.forEach((p, index) => {
      const panel = document.createElement('article');
      panel.className = 'portfolio-panel project-panel';
      panel.dataset.project = index;
      const links = [
        p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">ดาวน์โหลด / เล่นเกม ↗</a>` : '',
        p.video ? `<a href="${esc(p.video)}" target="_blank" rel="noopener">ดูวิดีโอ ↗</a>` : ''
      ].filter(Boolean).join('');
      panel.innerHTML = `
        <div class="project-index">PROJECT 0${index + 1}</div>
        ${gallery(p)}
        <div class="project-copy" data-lenis-prevent>
          ${p.award ? `<div class="winner-stamp">${esc(p.award)}</div>` : ''}
          <p class="project-date">${esc(p.date)} · ${esc(p.duration)}</p>
          <h2>${esc(p.title)}</h2>
          <div class="project-about">${p.about || ''}</div>
          <dl><div><dt>ทำไมถึงสร้าง</dt><dd>${p.why || '-'}</dd></div><div><dt>หน้าที่ของผม</dt><dd>${esc(p.role || '-')}</dd></div><div><dt>ทีม</dt><dd>${esc(p.team || '-')}</dd></div></dl>
          <div class="project-actions">${links || '<span class="coming-link">ลิงก์เกมกำลังเตรียมเผยแพร่</span>'}</div>
        </div>`;
      track.appendChild(panel);
    });

    const ICONS = {
      instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" class="fill"/>',
      facebook: '<path class="fill" d="M13.5 21v-7.2h2.4l.4-2.9h-2.8V9.1c0-.8.3-1.4 1.4-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.2H8.2v2.9h2.4V21z"/>',
      email: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
      phone: '<path d="M6.5 3.5h3l1.6 4.3-2.2 1.4a11 11 0 0 0 5.9 5.9l1.4-2.2 4.3 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'
    };
    const cards = content.contact.items.map((c, i) => {
      const ext = /^https?:/.test(c.href);
      return `<div class="c-card" style="--r:${[-3, 2.5, 2, -2.5][i % 4]}deg">
          <a class="c-inner" href="${esc(c.href)}" ${ext ? 'target="_blank" rel="noopener"' : ''} aria-label="${esc(c.label)}: ${esc(c.value)}">
            <span class="c-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[c.type] || ''}</svg></span>
            <span class="c-text"><small>${esc(c.label)}</small><b>${esc(c.value)}</b></span>
            <span class="c-go" aria-hidden="true">↗</span>
          </a>
          ${c.copy ? `<button class="c-copy" data-copy="${esc(c.value)}" aria-label="คัดลอก ${esc(c.label)}">คัดลอก</button>` : ''}
        </div>`;
    }).join('');
    const contact = document.createElement('article');
    contact.className = 'portfolio-panel monitor-contact';
    contact.innerHTML = `<div class="ct-head"><p class="project-index">LET’S TALK</p><h2>${content.contact.title}</h2><p class="ct-sub">${esc(content.contact.sub)}</p></div>
      <div class="ct-cards">${cards}</div><div class="toast" role="status" aria-live="polite"></div>`;
    track.appendChild(contact);

    const thanks = document.createElement('article');
    thanks.className = 'portfolio-panel monitor-thanks';
    thanks.innerHTML = `<div><p class="project-index">THE END</p><h2>${content.thanks.title}</h2><p>${esc(content.thanks.sub)}</p><div class="mini-mascot" aria-hidden="true">?</div></div>`;
    track.appendChild(thanks);

    /* ---------- กองภาพ: ชี้ภาพไหน ภาพนั้นออกมาหน้าสุด ภาพก่อนหน้าเขยิบไปเก็บที่ขอบซ้าย ---------- */
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function layoutStack(gallery, active, instant) {
      const photos = [...gallery.querySelectorAll('.stack-photo')];
      gallery.dataset.active = active;
      photos.forEach((ph, i) => {
        const d = i - active;
        let v;
        if (d === 0) v = { xPercent: 0, yPercent: -3, rotation: 0, scale: 1.04, zIndex: 50 };                    // หน้าสุด
        else if (d < 0) v = { xPercent: -36 - (-d - 1) * 5, yPercent: 4 - d, rotation: -6 + d * 2, scale: 0.8, zIndex: 40 + d }; // เก็บที่ขอบซ้าย
        else v = { xPercent: 6 * d, yPercent: 3 * d, rotation: d % 2 ? 3 + d : -2 - d, scale: 1 - 0.05 * d, zIndex: 40 - d };    // ซ้อนรออยู่ด้านหลังขวา
        ph.classList.toggle('active', d === 0);
        ph.setAttribute('aria-pressed', d === 0);
        if (instant || reduce) gsap.set(ph, v);
        else gsap.to(ph, { ...v, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      });
    }
    track.querySelectorAll('[data-gallery]').forEach((g) => layoutStack(g, 0, true));

    let lastSwap = 0;
    function activate(photo) {
      const gallery = photo.closest('[data-gallery]');
      const i = +photo.dataset.image;
      if (+gallery.dataset.active === i) return false;
      lastSwap = performance.now();
      layoutStack(gallery, i);
      Sound.play('tick', 0.05);
      return true;
    }
    // เมาส์: ชี้แล้วสลับทันที (หน่วงนิดกันภาพสลับไปมาตอนภาพเลื่อนผ่านใต้เมาส์)
    track.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const photo = e.target.closest('.stack-photo');
      if (photo && performance.now() - lastSwap > 220) activate(photo);
    });

    /* ---------- ดูภาพขนาดใหญ่ ---------- */
    const box = document.createElement('div');
    box.id = 'photo-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('data-lenis-prevent', '');
    box.hidden = true;
    box.innerHTML = '<img alt=""><p></p><button type="button" aria-label="ปิด">✕</button>';
    document.body.appendChild(box);
    const boxImg = box.querySelector('img'), boxCap = box.querySelector('p');
    function openBox(photo) {
      const img = photo.querySelector('img');
      const all = photo.closest('[data-gallery]').querySelectorAll('.stack-photo');
      boxImg.src = img.src; boxImg.alt = img.alt;
      boxCap.textContent = `${img.alt} · ${+photo.dataset.image + 1} / ${all.length}`;
      box.hidden = false;
      if (!reduce) gsap.fromTo(boxImg, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.6)' });
      box.querySelector('button').focus();
    }
    function closeBox() { box.hidden = true; }
    box.addEventListener('click', closeBox);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) closeBox(); });

    track.addEventListener('click', async (e) => {
      const photo = e.target.closest('.stack-photo');
      if (photo) {
        // แตะภาพที่ยังไม่อยู่หน้าสุด = ดึงออกมาก่อน · กดภาพหน้าสุด = เปิดดูใหญ่
        if (!activate(photo)) openBox(photo);
        return;
      }
      const copy = e.target.closest('.c-copy');
      if (copy) {
        e.preventDefault();
        const toast = copy.closest('.portfolio-panel').querySelector('.toast');
        let ok = true;
        try { await navigator.clipboard.writeText(copy.dataset.copy); } catch (_) { ok = false; }
        toast.textContent = ok ? `คัดลอก ${copy.dataset.copy} แล้ว ✓` : copy.dataset.copy;
        Sound.play('pop');
        gsap.killTweensOf(toast);
        gsap.timeline()
          .fromTo(toast, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'back.out(2)' })
          .to(toast, { autoAlpha: 0, y: -8, duration: 0.3, delay: 1.6 });
      }
    });

    return {
      panels: Array.from(track.children),
      calendarPages: Array.from(calendars.children),
      camera, renderCamera: layout,
      setX(percent) { gsap.set(track, { xPercent: percent }); },
      layout
    };
  };
})();
