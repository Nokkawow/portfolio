/* ห้องทำงานและพอร์ตในจอคอม — เนื้อหาดึงจาก CONTENT เท่านั้น */
(function () {
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.initWorkspace = function initWorkspace(content) {
    const track = document.getElementById('portfolio-track');
    const calendars = document.getElementById('calendar-stack');
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
        <div class="project-copy">
          ${p.award ? `<div class="winner-stamp">${esc(p.award)}</div>` : ''}
          <p class="project-date">${esc(p.date)} · ${esc(p.duration)}</p>
          <h2>${esc(p.title)}</h2>
          <div class="project-about">${p.about || ''}</div>
          <dl><div><dt>ทำไมถึงสร้าง</dt><dd>${p.why || '-'}</dd></div><div><dt>หน้าที่ของผม</dt><dd>${esc(p.role || '-')}</dd></div><div><dt>ทีม</dt><dd>${esc(p.team || '-')}</dd></div></dl>
          <div class="project-actions">${links || '<span class="coming-link">ลิงก์เกมกำลังเตรียมเผยแพร่</span>'}</div>
        </div>`;
      track.appendChild(panel);
    });

    const contact = document.createElement('article');
    contact.className = 'portfolio-panel monitor-contact';
    contact.innerHTML = `<div><p class="project-index">LET’S TALK</p><h2>${content.contact.title}</h2><p>${esc(content.contact.sub)}</p></div><div class="monitor-contact-list">${content.contact.items.map((x) => `<a href="${esc(x.href)}" ${x.type === 'email' || x.type === 'phone' ? `data-copy="${esc(x.value)}"` : 'target="_blank" rel="noopener"'}><small>${esc(x.label)}</small><strong>${esc(x.value)}</strong></a>`).join('')}</div>`;
    track.appendChild(contact);

    const thanks = document.createElement('article');
    thanks.className = 'portfolio-panel monitor-thanks';
    thanks.innerHTML = `<div><p class="project-index">THE END</p><h2>${content.thanks.title}</h2><p>${esc(content.thanks.sub)}</p><div class="mini-mascot" aria-hidden="true">?</div></div>`;
    track.appendChild(thanks);

    track.addEventListener('pointerover', (e) => {
      const photo = e.target.closest('.stack-photo');
      if (!photo) return;
      photo.parentElement.querySelectorAll('.stack-photo').forEach((p) => p.classList.toggle('active', p === photo));
    });
    track.addEventListener('click', async (e) => {
      const photo = e.target.closest('.stack-photo');
      if (photo) {
        photo.parentElement.querySelectorAll('.stack-photo').forEach((p) => p.classList.toggle('active', p === photo));
        photo.classList.toggle('full');
        return;
      }
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        e.preventDefault();
        try { await navigator.clipboard.writeText(copy.dataset.copy); copy.classList.add('copied'); copy.querySelector('small').textContent = 'คัดลอกแล้ว ✓'; }
        catch (_) { window.location.href = copy.href; }
      }
    });

    return {
      panels: Array.from(track.children),
      calendarPages: Array.from(calendars.children),
      setX(percent) { gsap.set(track, { xPercent: percent }); },
      layout() { return Math.max(0, track.children.length - 1); }
    };
  };
})();
