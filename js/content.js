/* ============================================================
   CONTENT — แก้ข้อความ/รูป/ลิงก์ทั้งเว็บได้ที่ไฟล์นี้ไฟล์เดียว
   ใช้ <em>คำ</em> เพื่อทำคำนั้นเป็นสีม่วง (จุดดึงสายตา)
   ใช้ <br> เพื่อขึ้นบรรทัดใหม่
   ⚠️ = ข้อความ/ลิงก์ชั่วคราว รอของจริง
   ============================================================ */
window.CONTENT = {
  // ฉาก Opening (เล่าแบบ Heal) ⚠️
  opening: [
    // ข้อความจาก Build Spec 1.0 (ข้อเสนอของ AI อีกตัว) — แก้ได้ตามใจ
    'ก่อนที่ผมจะเริ่มสร้างเกม<br>ผมก็เป็นแค่เด็กคนหนึ่ง',
    'ที่ชอบใช้เวลาอยู่ใน<em>โลกของเกม</em>',
    'แต่วันหนึ่ง ระหว่างที่กำลังนั่งเรียน<br>ผมเกิด<em>คำถาม</em>ขึ้นมา...'
  ],

  name: 'นายฐนน เพ็ญวิเชียร',
  // ฉาก 3: คำตรงกลางสลับไปมา (Flip Words) — ⚠️ คำชั่วคราว แก้/เพิ่มได้
  pathLine: {
    before: 'และนี่คือ',
    words: ['เส้นทาง', 'ความฝัน', 'เรื่องราว'],
    after: 'ของผม'
  },
  scrollHint: 'เลื่อนลง',

  // กระดาน: คำถาม
  question: {
    text: 'จากคนที่เล่นเกมอยู่หน้าจอ<br>ผมจะสร้าง<em>โลกของตัวเอง</em><br>ให้คนอื่นเข้ามาเล่นได้ไหม?',
    imageNote: 'รูปเกมที่เคยเล่น',
    // คลังเกม Steam ของเจ้าของ (ตัดเฉพาะแผงปกเกม · เล่นไป-ย้อนกลับ จึงวนต่อกันเนียน)
    video: 'assets/video/steam-library.mp4',
    poster: 'assets/video/steam-library-poster.jpg',
    videoLabel: 'คลังเกมที่ผมเคยเล่น'
  },

  // ผลงาน — เรียงจากอดีต → ปัจจุบัน (เพิ่มชิ้นใหม่ต่อท้ายได้เลย)
  // ช่องไหนเว้นว่าง ('') จะไม่แสดงบนเว็บ
  // ลำดับไทม์ไลน์ (เจ้าของกำหนด): Penguin Five Days → Humanoid A → Too Ka Jok → Look Up, Don't let go → 404 Reborn → Hide The Cloth
  projects: [
    {
      id: 'penguin',
      title: 'Penguin Five Days',
      short: 'Penguin Five Days',
      // หน้าข่าว Nokkawow News (พาดหัวเขียนโดย Claude — แก้ได้)
      news: {
        tag: 'Game Jam',
        headline: 'น้ำแข็งละลาย บ้านก็หาย! Penguin Five Days เกมแรกที่ทำให้ผมติดใจการทำเกม',
        deck: 'ทำกับเพื่อน 4 คนใน 3 วัน ที่งาน Game Jam X ของ Hamster Hub เล่าเรื่องโลกร้อนผ่านเพนกวินตัวเล็กๆ'
      },
      date: '24–27 เม.ย. 2569',
      duration: '72 ชั่วโมง (3 วัน)',
      about: 'เราคือ<em>เพนกวินตัวหนึ่ง</em> บ้านเป็นน้ำแข็ง แต่น้ำแข็งกำลังละลายไปเรื่อยๆ ต้องหาทางรอดให้ได้ อยากให้คนเห็นว่า<em>โลกร้อน</em>ส่งผลกับสัตว์ยังไง',
      why: 'ไฮไลต์: เป็นเกมแรกตอนเข้า Hamster Hub ถึงจะไม่เข้ารอบ แต่หลังงานนี้ผมไม่ได้แค่ "ชอบ" ทำเกมแล้ว แต่<em>รักมันจริงๆ</em>',
      goal: '',
      team: 'เพนกวินกินกล้วย',
      teamSize: 4,
      role: 'ระบบเกม · UI/UX · ดีไซน์',
      award: '',
      images: [                     // รูปแรก = รูปหลัก
        'assets/projects/penguin/shot1.jpg',
        'assets/projects/penguin/shot2.jpg',
        'assets/projects/penguin/shot3.jpg',
        'assets/projects/penguin/shot4.jpg',
        'assets/projects/penguin/shot5.jpg'
      ],
      link: 'https://phoomloser.itch.io/peng',
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: 'เพื่อนในทีม',
      video: ''
    },
    {
      id: 'humanoid',
      title: 'Humanoid A',
      short: 'Humanoid A',
      news: {
        tag: 'เกมเดี่ยว',
        headline: 'หุ่นยนต์ถูกทิ้ง แต่ยังไม่ยอมแพ้! Humanoid A เกมที่ต้องถอดแขนขาตัวเองมาเปลี่ยน',
        deck: 'ทำคนเดียวทั้งเกมใน 3–4 วัน ชวนคิดว่าเราทิ้งของที่ยังใช้ได้ไปเยอะแค่ไหน'
      },
      date: '',                     // ⚠️ เจ้าของจำวันที่ไม่ได้ (ว่าง = ไม่แสดง) · ลำดับอยู่ระหว่าง Penguin กับ Too Ka Jok
      duration: '3–4 วัน',
      about: 'เราเล่นเป็น<em>หุ่นยนต์ที่ถูกทิ้ง</em> ต้องปีนขึ้นไปทีละด่านเพื่อแก้แค้นมนุษย์ แต่ยิ่งเล่นไป ก็ยิ่งเข้าใจว่าทำไมหุ่นตัวนี้ถึงโกรธขนาดนั้น',
      why: 'ไฮไลต์: ระบบ<em>ถอด-เปลี่ยนชิ้นส่วน</em> หัว แขน ขา ถอดได้หมด! เจอชิ้นใหม่ที่เก่งกว่าก็เอามาใส่แทน จะได้ผ่านด่านที่ตัวเดิมไปไม่ถึง',
      goal: 'อยากให้เห็นว่าคนเราทิ้งของที่ยังใช้ได้เยอะแค่ไหน ผ่านเรื่องของหุ่นยนต์ที่ถูกทิ้ง',
      team: 'Nokkawow',
      teamSize: 1,
      role: 'ทำทุกส่วน ตั้งแต่คิดไอเดียจนลงมือสร้าง',
      award: '',
      images: [
        'assets/projects/humanoid/shot1.jpg',
        'assets/projects/humanoid/shot2.jpg',
        'assets/projects/humanoid/shot3.jpg',
        'assets/projects/humanoid/shot4.jpg',
        'assets/projects/humanoid/shot5.jpg'
      ],
      link: '',                     // ยังไม่ได้อัปโหลด
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: '',
      video: ''
    },
    {
      id: 'tookajok',
      title: 'Too Ka Jok (ห้ามผวน)',
      short: 'Too Ka Jok',          // ชื่อสั้นบน Nav Bar
      news: {
        tag: 'เกมเดี่ยว',
        headline: 'ห้อยตัวกลางฟ้า มือก็สั่น! Too Ka Jok เกมเช็ดกระจกตึกสูงที่ยากกว่าที่คิด',
        deck: 'ทำคนเดียวทุกอย่างใน 7 วัน ให้ลองเป็นคนเช็ดกระจกที่ทำงานสูงเป็นสิบๆ ชั้น'
      },
      date: '',                     // เจ้าของจำวันที่ไม่ได้ (ว่าง = ไม่แสดง)
      duration: '1 สัปดาห์',
      about: 'เราคือ<em>คนเช็ดกระจกตึกสูง</em> ห้อยตัวอยู่ข้างตึก ต้องเช็ดกระจกให้สะอาดทีละบานก่อนหมดเวลา ลมก็แรง กดแรงไปกระจกก็แตก พลาดเมื่อไหร่ก็เหลือแค่สายเซฟตี้เส้นเดียว!',
      why: 'ไฮไลต์: <em>ฟิสิกส์ปั่นป่วน</em> กับ<em>มือที่บังคับยากสุดๆ</em> ตั้งใจทำให้ยากแบบนี้ เพราะอยากให้รู้ว่างานนี้ไม่ง่ายเลย',
      goal: 'อยากให้คนเข้าใจและเห็นใจคนที่ทำงานเสี่ยงๆ ในที่ที่ไม่ปลอดภัย',
      team: 'Nokkawow',
      teamSize: 1,                  // 1 = เกมเดี่ยว
      role: 'ทำทุกอย่าง ตั้งแต่ปั้นโมเดล สร้างแมพ จนวางระบบทั้งหมด',
      images: [                     // รูปแรก = รูปหลัก
        'assets/projects/tookajok/shot1.jpg',
        'assets/projects/tookajok/shot2.jpg',
        'assets/projects/tookajok/shot3.jpg',
        'assets/projects/tookajok/shot4.jpg',
        'assets/projects/tookajok/shot5.jpg'
      ],
      link: '',                     // ยังไม่ได้อัปโหลด — ใส่ลิงก์ itch.io เมื่อพร้อม
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: '',
      video: '',
      award: ''
    },
    {
      id: 'lookup',
      title: "Look Up, Don't let go",
      short: 'Look Up',
      news: {
        tag: 'รางวัล',
        headline: 'ปวดท้องจะแย่ แต่ห้ามพลาด! Look Up, Don\'t let go คว้าที่ 3 Game Rainy Jam',
        deck: 'เกมฮาๆ จากทีม 4 คน ทำเสร็จใน 3 วัน: มองฟ้าให้ลืมปวดท้อง แต่ดันเจอของแปลกบนฟ้า ต้องรีบถ่ายรูปไว้ก่อนจะกลั้นไม่ไหว'
      },
      date: '31 ก.ค. – 2 ส.ค. 2569',
      duration: '72 ชั่วโมง (3 วัน)',
      award: 'อันดับ 3 • Game Rainy Jam',
      about: 'เรา<em>ปวดท้องสุดๆ</em> แต่ต้องกลั้นไว้! วิธีคลายเครียดคือมองท้องฟ้า… แต่บนฟ้าดันมี<em>อะไรแปลกๆ</em> ต้องสังเกตดีๆ แล้วถ่ายรูปเก็บไว้ ก่อนจะเครียดจน "แตก" ซะก่อน',
      why: 'ไฮไลต์: ผมทำระบบเกมทั้งหมด แถมเทสต์และแก้บั๊กเองด้วย และนี่คือ<em>เกมแรกที่ได้รางวัล</em>!',
      goal: 'เปลี่ยนเรื่องเครียดเล็กๆ ให้กลายเป็นเรื่องขำ',   // เขียนโดย Claude (เจ้าของให้เขียนแทน)
      team: 'ฤดูร้อนไม่มีเธอ เหมือนก่อน เหมือนเก่า ขาดเธอเฮ้อเฮ้อเฮอเฮ้อเฮอ',
      teamSize: 4,
      role: 'Dev ระบบเกมทั้งหมด · Testing & Debugging',
      images: [
        'assets/projects/lookup/shot1.jpg',
        'assets/projects/lookup/shot2.jpg',     // ป้ายรางวัลอันดับ 3
        'assets/projects/lookup/shot3.jpg',
        'assets/projects/lookup/shot4.jpg',
        'assets/projects/lookup/shot5.jpg'
      ],
      link: 'https://tanny-th22.itch.io/look-up-dont-let-go',
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: 'เพื่อนในทีม',
      video: ''
    },
    {
      id: '404reborn',
      title: '404 : REBORN',
      short: '404 : REBORN',
      news: {
        tag: 'รางวัล',
        headline: 'ข่าวด่วน! ทีม Cyber Bit คว้าที่ 1 Mini Game Jam 2026 KMITL ทั้งที่มีเวลาแค่ 4 ชั่วโมงครึ่ง',
        deck: 'เกมที่ทุกอย่างเป็นศัพท์คอม และตายแล้วไม่เสียเปล่า เพราะจะเหลือ "ร่างเงา" ไว้ช่วยตัวเองรอบหน้า'
      },
      date: '4 ก.ย. 2569',
      duration: '4 ชั่วโมง 30 นาที',
      award: 'WINNER • Mini Game Jam 2026 KMITL',
      awardSub: 'รางวัลชนะเลิศ อันดับ 1',
      about: 'ในเกมนี้<em>ทุกอย่างคือศัพท์คอมพิวเตอร์</em> ทั้งตัวละคร ฉาก และของในด่าน เล่นไปเล่นมา ได้ศัพท์ติดหัวแบบไม่รู้ตัว',
      why: 'ไฮไลต์: ตายแล้วจะเกิด<em>ร่างเงา</em>ที่ทำซ้ำทุกอย่างที่เราเพิ่งทำ ก่อนตายเลยต้องคิดว่า "รอบนี้จะทิ้งอะไรไว้ช่วยตัวเองรอบหน้าดี?"',
      goal: 'ทำมาแข่ง และแอบสอนศัพท์คอมไปด้วย',
      team: 'ไซเบอร์บิด (Cyber Bit)',
      teamSize: 4,
      role: 'ระบบเกมทั้งหมด · แก้บั๊ก',
      images: [
        'assets/projects/404reborn/shot1.jpg',
        'assets/projects/404reborn/shot2.jpg',
        'assets/projects/404reborn/shot3.jpg',
        'assets/projects/404reborn/shot4.jpg',
        'assets/projects/404reborn/shot5.jpg'   // รูปรับรางวัล
      ],
      link: 'https://tanny-th22.itch.io/404reborn',
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: 'เพื่อนในทีม'
    },
    {
      id: 'hidecloth',
      title: 'Hide The Cloth (มอญซ่อนผ้า)',
      short: 'Hide The Cloth',
      news: {
        tag: 'แข่งขัน',
        headline: 'มอญซ่อนผ้าเวอร์ชันออนไลน์! ชวนเพื่อน 4–10 คนมาเล่นกลางดึก วิ่งให้ทันก่อนฟ้าสว่าง',
        deck: 'ทีม ProDuck เอาการละเล่นไทยที่เราเล่นกันตอนเด็ก มาทำเป็นเกมออนไลน์สุดลุ้น ส่งแข่งงาน TGTS'
      },
      date: '5–25 ก.ย. 2569',
      duration: '',                 // เจ้าของไม่แน่ใจ (ว่าง = ไม่แสดง)
      about: 'จำ<em>มอญซ่อนผ้า</em>ตอนเด็กได้ไหม? ตอนนี้กลายเป็นเกมออนไลน์ เล่นได้<em>4–10 คน</em>! ต้องรอดให้ถึง 6 โมงเช้า ฝั่งชาวบ้านต้องฟังดีๆ แล้วหันไปดูข้างหลังให้ทัน ฝั่งมอญต้องแอบวางผ้า แล้ววิ่งกลับที่นั่งก่อนโดนจับ',
      why: 'ไฮไลต์: ผมทำระบบเสริมในเกม และเป็น<em>หน่วยปราบบั๊ก</em>ของทีม ไล่เทสต์ ไล่แก้ Error ให้ทุกคนเล่นพร้อมกันได้ลื่นๆ',
      goal: 'อยากให้คนต่างชาติได้รู้จักการละเล่นไทย และให้เด็กรุ่นใหม่รู้จักด้วย',
      team: 'ProDuck',
      teamSize: 4,
      role: 'ส่วนเสริมระบบเกมเพลย์ · Testing & Debugging',
      award: '',
      images: [
        'assets/projects/hidecloth/shot1.jpg',
        'assets/projects/hidecloth/shot2.jpg',
        'assets/projects/hidecloth/shot3.jpg',
        'assets/projects/hidecloth/shot4.jpg'
      ],
      link: '',
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: '',
      // วิดีโอหลายคลิปได้: [{ label, url }] หรือใส่เป็นลิงก์เดียว (string) ก็ได้
      video: [
        { label: 'ดูเทรลเลอร์', url: 'https://www.youtube.com/watch?v=ZXX55d0YxIk' },
        { label: 'ดูเกมเพลย์', url: 'https://www.youtube.com/watch?v=14aTD-0QCpc' }
      ]
    }
  ],

  // หน้าติดต่อ (ก่อนหน้าสุดท้าย) — การ์ดแปะกระดาน กดแล้วเปิดช่องทาง / คัดลอกได้
  // type: instagram | facebook | email | phone  ·  ลบบรรทัดไหนออก การ์ดนั้นก็หายไป
  contact: {
    title: 'มา<em>คุยกัน</em>ไหม?',
    sub: 'สนใจร่วมงาน อยากคุยเรื่องเกม หรือแค่อยากทักทาย ติดต่อผมได้เลยครับ',
    items: [
      { type: 'instagram', label: 'Instagram', value: '@linin_zu', href: 'https://www.instagram.com/linin_zu/' },
      { type: 'facebook', label: 'Facebook', value: 'thanon.rainyhell', href: 'https://www.facebook.com/thanon.rainyhell' },
      { type: 'email', label: 'Email', value: 'Editzojinta@gmail.com', href: 'mailto:Editzojinta@gmail.com', copy: true },
      { type: 'phone', label: 'โทร', value: '095-091-9543', href: 'tel:0950919543', copy: true }
    ]
  },

  // ฉากจบ (ข้อความปิดท้าย)
  thanks: {
    title: 'Thank you for <em>watching</em>.',
    sub: 'ขอบคุณที่เดินทางมาด้วยกันจนถึงตรงนี้'
  },

  // ฉากสุดท้าย: ซูมออกจากจอ มาสคอตทักทาย + บัตรขูดช่องทางติดต่อ
  finale: {
    hello: 'สามารถติดต่อผมได้ทางนี้เลยครับ',
    bye: 'ขอบคุณที่รับชมและรับฟังนะครับ',
    cardsTitle: 'ติดต่อผม',
    cardsSub: 'ขูดการ์ดเพื่อดูช่องทาง'
  },

  // หน้าเว็บข่าวในจอคอม
  newsSite: { name: 'Nokkawow News', url: 'nokkawow.news', tagline: 'ข่าวเส้นทางนักพัฒนาเกม · ฉบับวันที่ 27 กันยายน 2569' },

  // ชื่อช่วงบน Nav Bar ด้านบน
  nav: { start: 'ห้องเรียน', question: 'คำถาม', workspace: '3 ปีต่อมา', news: 'ข่าวผลงาน', contact: 'ติดต่อ' }
};
