/* ============================================================
   CONTENT — แก้ข้อความ/รูป/ลิงก์ทั้งเว็บได้ที่ไฟล์นี้ไฟล์เดียว
   ใช้ <em>คำ</em> เพื่อทำคำนั้นเป็นสีม่วง (จุดดึงสายตา)
   ใช้ <br> เพื่อขึ้นบรรทัดใหม่
   ⚠️ = ข้อความ/ลิงก์ชั่วคราว รอของจริง
   ============================================================ */
window.CONTENT = {
  // ฉาก Opening (เล่าแบบ Heal) ⚠️
  opening: [
    'ผมเคยเป็นแค่เด็กคนหนึ่ง<br>ที่นั่งเล่นเกมอยู่หน้าจอ.',
    'จนวันหนึ่ง<br>ในคาบเรียนธรรมดาๆ',
    'ผมเริ่ม<em>สงสัย</em>.'
  ],

  name: 'นายฐนน เพ็ญวิเชียร',
  pathLine: 'และนี่คือ<em>เส้นทาง</em>ของผม',
  scrollHint: 'เลื่อนลง',

  // กระดาน: คำถาม
  question: {
    text: 'จากคนที่เล่นเกมอยู่หน้าจอ<br>จะเป็น<em>คนที่สร้าง</em>ให้คนอื่นเล่นได้ไหม',
    imageNote: 'รูปเกมที่เคยเล่น<br>(รอรูปจริง)' // ⚠️
  },

  // ผลงาน — เรียงจากอดีต → ปัจจุบัน (เพิ่มชิ้นใหม่ต่อท้ายได้เลย)
  // ช่องไหนเว้นว่าง ('') จะไม่แสดงบนเว็บ
  projects: [
    {
      id: 'tookajok',
      title: 'Too Ka Jok (ห้ามพวน)',
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
      date: '4 ก.ย. 2569',
      duration: '4 ชั่วโมง 30 นาที',
      award: 'WINNER • Mini Game Jam 2026 KMITL',
      awardSub: 'รางวัลชนะเลิศ อันดับ 1',
      about: 'เกมที่<em>ทุกอย่างเป็นศัพท์ไอที</em> ทั้งตัวละคร แมพ และองค์ประกอบในเกม',
      why: 'ไฮไลต์: เมื่อตาย ผู้เล่นจะเกิด<em>ร่างเงา</em>ที่ทำตามที่เราเล่นไว้ก่อนตาย — ต้องคิดเผื่อว่าก่อนตาย จะทำประโยชน์อะไรให้ตัวเองในอนาคต',
      goal: 'ทำมาเพื่อแข่งขัน และให้ความรู้ศัพท์ไอทีไปในตัว',
      team: 'ไซเบอร์บิด (Cyber Bites)',
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

  // เมนูทางลัด
  nav: [
    { label: 'ห้องเรียน', target: 'start' },
    { label: 'คำถาม', target: 'question' },
    { label: 'ผลงาน', target: 'project-0' },
    { label: 'ติดต่อ', target: 'contact' }
  ]
};
