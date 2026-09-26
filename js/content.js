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
    imageNote: 'รูปเกมที่เคยเล่น<br>(รอรูปจริง)' // ⚠️
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
        headline: 'เพนกวินหนึ่งตัว น้ำแข็งละลายทุกวินาที: เกมแรกที่เปลี่ยนคำว่า "ชอบ" ให้กลายเป็น "หลงใหล"',
        deck: 'Penguin Five Days เกมเอาชีวิตรอดจาก Game Jam X ของ Hamster Hub ทีม 4 คนปั้นเสร็จใน 72 ชั่วโมง เล่าเรื่องโลกร้อนผ่านสายตาเพนกวินตัวน้อย'
      },
      date: '24–27 เม.ย. 2569',
      duration: '72 ชั่วโมง (3 วัน)',
      about: 'คุณคือ<em>เพนกวินหนึ่งตัว</em> บ้านของคุณคือน้ำแข็งที่ละลายลงไปเรื่อยๆ ภารกิจมีข้อเดียว — อยู่รอดให้ได้ เกมที่ชวนมองภาวะโลกร้อนจากมุมของคนที่กำลังจะไม่มีบ้าน',
      why: 'ไฮไลต์: เกมแรกหลังเข้า Hamster Hub ถึงจะไม่ผ่านเข้ารอบ แต่ 3 วันนั้นทำให้การทำเกมเปลี่ยนจาก "ชอบ" กลายเป็น<em>ความหลงใหล</em>',
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
        headline: 'หุ่นยนต์ที่ถูกทิ้งลุกขึ้นทวงคืน: Humanoid A เกมที่ต้องถอดชิ้นส่วนตัวเองเพื่อไปต่อ',
        deck: 'ทำคนเดียวทุกส่วนใน 3–4 วัน ตั้งแต่คิดไอเดียจนเล่นได้ — เกมที่ชวนถามว่ามนุษย์ทิ้งของที่ยังใช้ได้ไปมากแค่ไหน'
      },
      date: '',                     // ⚠️ เจ้าของจำวันที่ไม่ได้ (ว่าง = ไม่แสดง) · ลำดับอยู่ระหว่าง Penguin กับ Too Ka Jok
      duration: '3–4 วัน',
      about: 'คุณคือ<em>หุ่นยนต์ที่ถูกทิ้ง</em> ต้องฝ่าทีละด่านขึ้นไปล้างแค้นมนุษย์ แต่ยิ่งเล่นลึกเท่าไร ก็ยิ่งเข้าใจว่าทำไมหุ่นตัวนี้ถึงแค้นได้ขนาดนั้น — การเดินทางตามหา<em>ความเป็นตัวเอง</em>ของหุ่นยนต์ตัวหนึ่ง',
      why: 'ไฮไลต์: ระบบ<em>ถอด-เปลี่ยนชิ้นส่วน</em> หัว แขน ขา ถอดออกได้หมด แล้วเก็บชิ้นส่วนใหม่ที่มีความสามารถต่างกันมาใส่แทน เพื่อผ่านด่านที่ร่างเดิมไปไม่ถึง',
      goal: 'อยากให้เห็นว่ามนุษย์ทิ้งของที่ยังใช้ได้อยู่มากแค่ไหน โดยเล่าผ่านหุ่นยนต์ที่ถูกทิ้ง',
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
      title: 'Too Ka Jok (ห้ามพวน)',
      short: 'Too Ka Jok',          // ชื่อสั้นบน Nav Bar
      news: {
        tag: 'เกมเดี่ยว',
        headline: 'ห้อยตัวกลางฟ้า เช็ดกระจกตึกสูง: เด็ก ม.ปลายปั้นเกมจำลองอาชีพคนเดียวใน 7 วัน',
        deck: 'Too Ka Jok (ห้ามพวน) ทำเองทุกส่วน เพราะอยากให้คนรู้จักอาชีพที่ต้องทำงานอยู่ข้างตึกสูงหลายสิบชั้น'
      },
      date: '6–13 ส.ค. 2569',
      duration: '1 สัปดาห์',
      about: 'เกม<em>จำลองอาชีพคนเช็ดกระจกตึกสูง</em> อาชีพที่เราเห็นห้อยอยู่ข้างตึกบ่อยๆ แต่แทบไม่เคยลองนึกว่าเขาทำงานกันยังไง',
      why: 'ทำเพื่อฝึกฝีมือ และอยากให้คนรู้จักอาชีพที่ต้องทำงานอยู่กลางฟ้ามากขึ้น',
      goal: 'ทำเพราะอยากทำล้วนๆ — เกมที่สนองนีดตัวเองเต็มที่',
      team: 'Nok Make Game',
      teamSize: 1,                  // 1 = เกมเดี่ยว
      role: 'ทำทุกส่วนของเกม',
      images: [
        'assets/projects/tookajok/shot1.jpg',
        'assets/projects/tookajok/shot2.jpg',
        'assets/projects/tookajok/shot3.jpg',
        'assets/projects/tookajok/shot4.jpg'
      ],
      link: '',                     // ยังไม่ได้อัปโหลด — ใส่ลิงก์ itch.io เมื่อพร้อม
      linkLabel: 'เล่นบน itch.io',
      uploadedBy: '',               // ถ้าเพื่อน/ทีมเป็นคนอัปโหลด ใส่ชื่อที่นี่
      award: ''                     // รางวัล (ถ้ามี) — ขึ้นเป็นตราประทับสีม่วง
    },
    {
      id: 'lookup',
      title: "Look Up, Don't let go",
      short: 'Look Up',
      news: {
        tag: 'รางวัล',
        headline: 'ปวดท้องแค่ไหนก็ห้ามพลาด! Look Up, Don\'t let go คว้าอันดับ 3 Game Rainy Jam',
        deck: 'เกมสุดฮาจากทีม 4 คน ทำเสร็จใน 72 ชั่วโมง: แหงนมองฟ้าเพื่อลืมอาการปวดท้อง แต่บนฟ้ากลับมีบางอย่างผิดปกติ — ถ่ายรูปมันไว้ให้ได้ก่อนจะกลั้นไม่ไหว'
      },
      date: '31 ก.ค. – 2 ส.ค. 2569',
      duration: '72 ชั่วโมง (3 วัน)',
      award: 'อันดับ 3 • Game Rainy Jam',
      about: 'คุณกำลัง<em>ปวดท้องสุดขีด</em>และต้องกลั้นไว้ให้ได้ วิธีคลายเครียดคือแหงนมองท้องฟ้า… แต่ดันเห็น<em>สิ่งผิดปกติ</em>ลอยอยู่ ต้องสังเกตให้ดีแล้วถ่ายรูปเก็บไว้ ก่อนความกังวลจะทำให้ "แตก" ซะก่อน',
      why: 'ไฮไลต์: ดูแลระบบเกมทั้งหมด พร้อมเทสต์และไล่แก้บั๊กไปในตัว — และนี่คือ<em>เกมแรกที่ได้รางวัล</em>',
      goal: 'เปลี่ยนความเครียดเล็กๆ ในชีวิตให้กลายเป็นเสียงหัวเราะ',   // เขียนโดย Claude (เจ้าของให้เขียนแทน)
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
        headline: 'ข่าวด่วน! ทีม Cyber Bit คว้าแชมป์ Mini Game Jam 2026 KMITL ด้วยเกมที่ทำเสร็จใน 4 ชั่วโมงครึ่ง',
        deck: 'ใน 404 : REBORN ทุกอย่างคือศัพท์ไอที และทุกครั้งที่ตาย คุณจะทิ้ง "ร่างเงา" ไว้ช่วยตัวเองในรอบหน้า'
      },
      date: '4 ก.ย. 2569',
      duration: '4 ชั่วโมง 30 นาที',
      award: 'WINNER • Mini Game Jam 2026 KMITL',
      awardSub: 'รางวัลชนะเลิศ อันดับ 1',
      about: 'โลกที่<em>ทุกอย่างคือศัพท์ไอที</em> ตั้งแต่ตัวละคร แมพ ยันของทุกชิ้นในด่าน เล่นไปก็ได้ศัพท์ไปแบบไม่รู้ตัว',
      why: 'ไฮไลต์: ตายแล้วไม่เสียเปล่า! ทุกครั้งที่ตายจะเกิด<em>ร่างเงา</em>ที่ทำซ้ำทุกอย่างที่เราเล่นไว้ ผู้เล่นเลยต้องคิดว่า "ก่อนตายรอบนี้ จะทิ้งอะไรไว้ช่วยตัวเองรอบหน้า"',
      goal: 'ทำมาแข่ง และแอบสอนศัพท์ไอทีไปในตัว',
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
