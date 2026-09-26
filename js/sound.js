/* ============================================================
   SOUND — เสียงสังเคราะห์ด้วย Web Audio (ไม่ต้องใช้ไฟล์)
   ⚠️ ชั่วคราว: เปลี่ยนเป็นไฟล์เสียงจริงได้ภายหลัง
   เสียงเริ่มต้น = ปิด (เบราว์เซอร์ไม่ให้เล่นเสียงก่อนผู้ใช้กด)
   ============================================================ */
(function () {
  let ctx = null, master = null, noiseBuf = null, ambient = null, rub = null;
  let enabled = false;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) { // pinkish noise
      const w = Math.random() * 2 - 1;
      last = (last + 0.04 * w) / 1.04;
      d[i] = last * 3.2 + w * 0.15;
    }
  }

  function noise(dur, { f = 1200, q = 1, type = 'bandpass', gain = 0.3, at = 0, attack = 0.005, sweepTo = null } = {}) {
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type = type; filt.frequency.value = f; filt.Q.value = q;
    if (sweepTo) filt.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(master);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  }

  function tone(freq, dur, { type = 'sine', gain = 0.3, to = null, at = 0 } = {}) {
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const SFX = {
    bonk() { tone(520, 0.18, { type: 'triangle', to: 180, gain: 0.35 }); noise(0.06, { f: 2500, gain: 0.2 }); },
    thud() { tone(140, 0.2, { to: 60, gain: 0.4 }); noise(0.08, { f: 400, type: 'lowpass', gain: 0.25 }); },
    tick() { noise(0.035, { f: 3200, q: 4, gain: 0.18 }); },
    pop() { tone(700, 0.08, { to: 1100, gain: 0.18, type: 'triangle' }); },
    whoosh() { noise(0.45, { f: 300, sweepTo: 3000, q: 0.7, gain: 0.35, attack: 0.08 }); },
    squeak() { tone(1500 + Math.random() * 500, 0.05, { type: 'sawtooth', gain: 0.025 }); noise(0.05, { f: 4000, q: 6, gain: 0.08 }); },
    grab() { tone(330, 0.1, { to: 520, gain: 0.15, type: 'triangle' }); },
    boing() { tone(220, 0.35, { to: 660, gain: 0.2, type: 'sine' }); },
    click() { noise(0.03, { f: 2000, q: 3, gain: 0.15 }); },
    strike() { noise(0.12, { f: 3500, q: 1.5, gain: 0.35, sweepTo: 1200 }); noise(0.5, { f: 900, type: 'lowpass', gain: 0.12, at: 0.08, attack: 0.05 }); },
    crackle() { noise(0.025, { f: 2500 + Math.random() * 2500, q: 5, gain: 0.12 }); },
    bell() {
      [880, 1174, 1397].forEach((f, i) => tone(f, 1.15, { type: 'sine', gain: 0.16 / (i + 1), at: i * 0.04 }));
      tone(440, 1.35, { type: 'triangle', gain: 0.12, at: 0.02 });
    }
  };

  function startAmbient() {
    if (ambient || !ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 1.5);
    src.connect(f).connect(g).connect(master);
    src.start();
    ambient = { src, g };
  }
  function stopAmbient() {
    if (!ambient) return;
    ambient.g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    ambient.src.stop(ctx.currentTime + 0.5);
    ambient = null;
  }

  // เสียงถูแปรงลบ: ต่อเนื่อง ดังตามความเร็ว
  function rubLevel(v) {
    if (!enabled || !ctx) return;
    if (!rub) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f).connect(g).connect(master);
      src.start();
      rub = { src, g, f };
    }
    const lvl = Math.min(0.35, v);
    rub.g.gain.setTargetAtTime(lvl, ctx.currentTime, 0.04);
    rub.f.frequency.setTargetAtTime(700 + lvl * 2000, ctx.currentTime, 0.05);
  }

  let lastPlay = {};
  window.Sound = {
    get enabled() { return enabled; },
    toggle() {
      init();
      enabled = !enabled;
      if (enabled) { ctx.resume(); startAmbient(); }
      else { stopAmbient(); if (rub) rub.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); }
      return enabled;
    },
    play(name, minGap = 0.04) {
      if (!enabled || !ctx || !SFX[name]) return;
      const now = ctx.currentTime;
      if (lastPlay[name] && now - lastPlay[name] < minGap) return;
      lastPlay[name] = now;
      SFX[name]();
    },
    rub: rubLevel
  };
})();
