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
  // ลำดับไทม์ไลน์ (เจ้าของกำหนด): Penguin Five Days → Humannoid a → Too Ka Jok → Look Up, Don't let go → 404 Reborn → Hide The Cloth
  projects: [
    {
      id: 'penguin',
      title: 'Penguin Five Days',
      short: 'Penguin Five Days',
      news: {
        tag: 'Game Jam',
        headline: 'เพนกวินหนึ่งตัวกับน้ำแข็งที่กำลังละลาย: เกมแรกที่จุดไฟความหลงใหลในการทำเกม',
        deck: 'Penguin Five Days เกมเอาชีวิตรอด 72 ชั่วโมงจาก Game Jam X โดย Hamster Hub ที่เล่าเรื่องโลกร้อนผ่านสายตาเพนกวิน'
      },
      date: '24–27 เม.ย. 2569',
      duration: '72 ชั่วโมง (3 วัน)',
      about: 'เกมที่สะท้อน<em>ภาวะโลกร้อน</em>ผ่านสายตาของเพนกวิน ที่ต้องเอาชีวิตรอดขณะที่น้ำแข็งกำลังละลายจนไม่มีที่อยู่',
      why: 'ไฮไลต์: ผลงานเกมแรกหลังเข้ามาที่ Hamster Hub แม้ไม่ผ่านเข้ารอบ แต่เปลี่ยนจาก "ชอบ" ให้กลายเป็น<em>ความหลงใหล</em>ในการทำเกม',
      goal: '',
      team: 'เพนกวินกินกล้วย',
      teamSize: 0,                  // ⚠️ ยังไม่ทราบจำนวนคน (0 = ไม่แสดง)
      role: 'ระบบเกม · UI/UX · ดีไซน์',
      award: '',
      images: [
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
      id: 'tookajok',
      title: 'Too Ka Jok (ห้ามพวน)',
      short: 'Too Ka Jok',          // ชื่อสั้นบน Nav Bar
      // หน้าข่าว Nokkawow News (พาดหัวเขียนโดย Claude — แก้ได้)
      news: {
        tag: 'เกมเดี่ยว',
        headline: 'เด็ก ม.ปลายทำเกมจำลองอาชีพ "คนเช็ดกระจกตึกสูง" เสร็จในสัปดาห์เดียว',
        deck: 'Too Ka Jok (ห้ามพวน) ทำคนเดียวทุกส่วน เพราะอยากให้คนรู้จักอาชีพที่ต้องห้อยตัวอยู่กลางฟ้า'
      },
      date: '6–13 ส.ค. 2569',
      duration: '1 สัปดาห์',
      about: 'เกม<em>จำลองอาชีพคนเช็ดกระจกตึกสูง</em>',
      why: 'ทำเพื่อฝึกฝีมือ และอยากให้คนรู้จักอาชีพคนเช็ดกระจกตึกสูง',
      goal: 'เป็นเกมที่ทำมาเพื่อสนองนีทตัว',
      team: 'Nok Make Game',
      teamSize: 1,                  // 1 = เกมเดี่ยว
      role: 'ทำทุกส่วนของเกม',
      images: [                     // รูปแรก = รูปหลัก
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
      id: '404reborn',
      title: '404 : REBORN',
      short: '404 : REBORN',
      news: {
        tag: 'รางวัล',
        headline: 'ข่าวด่วน! ทีม Cyber Bit คว้าชนะเลิศ Mini Game Jam 2026 KMITL ด้วยเกมที่ทำเสร็จใน 4 ชั่วโมงครึ่ง',
        deck: '404 : REBORN เกมที่ทุกอย่างคือศัพท์ไอที และทุกครั้งที่ตาย คุณจะกลายเป็นร่างเงาที่ช่วยตัวเองในอนาคต'
      },
      date: '4 ก.ย. 2569',
      duration: '4 ชั่วโมง 30 นาที',
      award: 'WINNER • Mini Game Jam 2026 KMITL',
      awardSub: 'รางวัลชนะเลิศ อันดับ 1',
      about: 'เกมที่<em>ทุกอย่างเป็นศัพท์ไอที</em> ทั้งตัวละคร แมพ และองค์ประกอบในเกม',
      why: 'ไฮไลต์: เมื่อตาย ผู้เล่นจะเกิด<em>ร่างเงา</em>ที่ทำตามที่เราเล่นไว้ก่อนตาย — ต้องคิดเผื่อว่าก่อนตาย จะทำประโยชน์อะไรให้ตัวเองในอนาคต',
      goal: 'ทำมาเพื่อแข่งขัน และให้ความรู้ศัพท์ไอทีไปในตัว',
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
