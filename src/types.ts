/**
 * Types and Sample Data for Thai Village Complaint Platform
 */

export type CategoryType = 'road' | 'electricity' | 'water' | 'waste' | 'security' | 'other';

export type StatusType = 'pending' | 'in-progress' | 'resolved' | 'rejected' | 'flagged';

export interface Complaint {
  id: string; // tracking code (e.g. SAEN-2026-XXXX)
  title: string;
  description: string;
  category: CategoryType;
  location: string;
  status: StatusType;
  date: string; // ISO format (YYYY-MM-DD)
  photo: string; // Data URL or Unsplash image
  isAnonymous: boolean;
  informerName?: string;
  informerPhone?: string;
  adminNotes?: string;
  flagReasons?: string[];
}

export const CATEGORIES: Record<CategoryType, { label: string; icon: string; bg: string; text: string }> = {
  road: { label: 'ถนน / ทางเท้า', icon: 'milestone', bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-700 dark:text-teal-400' },
  electricity: { label: 'ไฟฟ้าสาธารณะ', icon: 'lightbulb', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
  water: { label: 'น้ำประปา / ท่อน้ำ', icon: 'droplet', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400' },
  waste: { label: 'ขยะมูลฝอย / ความสะอาด', icon: 'trash-2', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400' },
  security: { label: 'เสียงรบกวน / ความปลอดภัย', icon: 'shield-alert', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400' },
  other: { label: 'อื่นๆ', icon: 'help-circle', bg: 'bg-slate-50 dark:bg-slate-805', text: 'text-slate-700 dark:text-slate-400' },
};

export const STATUSES: Record<StatusType, { label: string; bg: string; text: string; icon: string }> = {
  pending: { label: 'รอดำเนินการ', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', icon: 'clock' },
  'in-progress': { label: 'กำลังดำเนินงาน', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-300', icon: 'wrench' },
  resolved: { label: 'แก้ไขเสร็จสิ้น', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', icon: 'check-circle' },
  rejected: { label: 'ไม่อนุมัติ/ตีกลับ', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900', text: 'text-rose-800 dark:text-rose-400', icon: 'x-circle' },
  flagged: { label: 'อยู่ระหว่างตรวจสอบ', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-850', text: 'text-orange-800 dark:text-orange-400', icon: 'alert-triangle' },
};

export const SUSPICIOUS_WORDS = [
  'พรรคการเมือง', 'นักการเมือง', 'โกงกิน', 'สารเลว', 'ขี้คุก', 'ไอ้', 'มั่วสุมเสพยา', 'เล่นพนัน', 'ชั่วช้า', 'สลิ่ม', 'ควายแดง', 'ล้มล้าง', 'รัฐบาลสกปรก'
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'SAEN-2026-0001',
    category: 'road',
    title: 'ถนนคอนกรีตกลางซอย 4 ชำรุดเป็นบ่อลึก ทรัพย์สินเสียหาย',
    description: 'ถนนทรุดตัวเป็นโพรงขนาดใหญ่หน้าบ้านเลขที่ 12 รถจักรยานยนต์ล้มบาดเจ็บแล้วหลายราย ขอความอนุเคราะห์ซ่อมสร้างด่วนครับ ก่อนที่จะเกิดอุบัติเหตุรุนแรงกว่านี้',
    location: 'หน้าบ้านเลขที่ 12 ซอย 4',
    status: 'pending',
    date: '2026-05-18',
    photo: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
    isAnonymous: false,
    informerName: 'สมชาย แสนดี',
    informerPhone: '081-234-5678',
  },
  {
    id: 'SAEN-2026-0002',
    category: 'waste',
    title: 'กองขยะส่งกลิ่นเหม็นหน้าหมู่บ้าน ปล่อยปละละเลยหลายวัน',
    description: 'ถังขยะส่วนกลางล้นทะลัก ไม่มีเจ้าหน้าที่มาเก็บขยะเลยเกือบ 1 สัปดาห์ ส่งกลิ่นเหม็นรบกวนบ้านเรือนและคนผ่านไปมา มีสุนัขจรจัดมาคุ้ยเขี่ยจนเลอะเทอะไปหมด',
    location: 'ทางเข้าหลักหมู่บ้านแสนสุข',
    status: 'in-progress',
    date: '2026-05-15',
    photo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    isAnonymous: true,
  },
  {
    id: 'SAEN-2026-0003',
    category: 'electricity',
    title: 'ไฟถนนดับสนิทช่วงโค้งอันตราย ใกล้ศาลากลางหมู่บ้าน',
    description: 'หลอดไฟกิ่งที่เสาไฟสว่างดับมา 3 คืนแล้ว บริเวณโค้งหักศอกมืดมาก เสี่ยงต่อการเกิดอุบัติเหตุและการลักขโมยช่วงเวลากลางคืนครับ',
    location: 'เสาไฟต้นที่ 15 บริเวณทางโค้งใกล้ศาลาอเนกประสงค์',
    status: 'resolved',
    date: '2026-05-12',
    photo: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&q=80&w=600',
    isAnonymous: false,
    informerName: 'สุนทร ปัญญาภิวัฒน์',
    informerPhone: '089-876-5432',
    adminNotes: 'เจ้าหน้าที่จากกองช่างทำการเปลี่ยนหลอดไฟฟ้ากิ่ง LED ขนาด 50W เรียบร้อยแล้ว พร้อมใช้งานได้อย่างสว่างไสวเป็นระเบียบเรียบร้อย',
  },
  {
    id: 'SAEN-2026-0004',
    category: 'water',
    title: 'น้ำประปาขุ่นสีแดงดินลูกรังและไหลช้ามาก ซักผ้าไม่ได้เลย',
    description: 'น้ำประปาในหมู่บ้านตั้งแต่ช่วงเช้ามีตะกอนขุ่นแดงมาก เหมือนดินปะปน ไหลเอื่อยมาก ดึงเข้าเครื่องซักผ้าไม่ได้เลย รบกวนช่วยตรวจสอบระบบกรองน้ำหมู่บ้านด้วยครับ',
    location: 'บ้านเลขที่ 45/1 ถึง 45/10 ท้ายซอย 2',
    status: 'pending',
    date: '2026-05-19',
    photo: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600',
    isAnonymous: false,
    informerName: 'มุกดา สุขสำราญ',
    informerPhone: '086-555-4321',
  },
  {
    id: 'SAEN-2026-0005',
    category: 'security',
    title: 'สุนัขจรจัดและเสียงสุนัขบ้านใกล้เรือนเคียงเห่าเสียงดังไม่หยุดหย่อน',
    description: 'มีกลุ่มสุนัขแถวท้ายซอยเห่ากระโชกเสียงดัง รบกวนเวลาพักผ่อนของผู้สูงอายุและเด็กๆ ช่วงกลางคืนเป็นประจำ ตั้งแต่เวลา 23.00 น. ถึงช่วงเช้ามืด นอนไม่หลับเลย',
    location: 'บริเวณท้ายซอย 3 หลังหมู่บ้าน',
    status: 'resolved',
    date: '2026-05-10',
    photo: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600',
    isAnonymous: true,
    adminNotes: 'ฝ่ายรักษาความสงบร่วมกับคณะกรรมการเข้าเจรจากับเจ้าของสุนัขเรียบร้อย และประสานงานปศุสัตว์ในการตรวจสอบสุนัขจรจัดชั่วคราวแล้ว',
  },
  {
    id: 'SAEN-2026-0006',
    category: 'other',
    title: 'กิ่งไม้แห้งขนาดใหญ่หักพาดสายไฟและขวางถนนทางเดิน',
    description: 'ต้นกิ่งไม้ผุพังหักพาดลงมา พาดสายอินเทอร์เน็ตและล้ำลงมาในช่องทางจราจรทางเข้าออกซอย 1 รถยนต์บัสหรือกระบะสูงๆ วิ่งผ่านไม่ได้เพราะจะชนสายไฟและกิ่งไม้',
    location: 'ปากทางเข้าซอย 1',
    status: 'in-progress',
    date: '2026-05-17',
    photo: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
    isAnonymous: false,
    informerName: 'ประจักษ์ โพธิ์ทอง',
    informerPhone: '082-111-2222',
  },
  {
    id: 'SAEN-2026-0007',
    category: 'other',
    title: 'พวกนักการเมืองท้องถิ่นมันโกงกินเงินหลวง ไม่ยอมเอาเงินมาช่วยซ่อมถนนเลย',
    description: 'ไอ้ผู้แทนพรรคการเมืองสารเลวมันเอาแต่โกงกิน ปล่อยให้ถนนเน่าแบบนี้ คอยดูเถอะจะฟ้องให้พรรคพังให้หมด เงินงบประมาณหมู่บ้านหายไปเข้ากระเป๋าใครหมด',
    location: 'หน้าบ้านนายสมคิด',
    status: 'flagged',
    date: '2026-05-19',
    photo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600',
    isAnonymous: true,
    flagReasons: ['มีเนื้อหาพาดพิงการเมืองหรือมีการกล่าวหาโจมตีบุคคลโดยเว้นหลักฐาน'],
  },
  {
    id: 'SAEN-2026-0008',
    category: 'security',
    title: 'อัปเปหิบ้านท้ายซอย มั่วสุมเสพยา เล่นพนันเสียงดัง ทำลายชุมชน',
    description: 'บ้านเลขที่ 99 มันชอบตั้งวงซ่องสุมพวกขี้คุกมาเสพยาและเล่นไฮโลตอนดึกๆ ส่งเสียงดังน่ารำคาญ ชั่วช้าสวรรค์เบี่ยง เป็นพวกกากเดนสังคมขอให้ไล่ออกจากหมู่บ้านไปด่วนที่สุด!',
    location: 'บ้านเลขที่ 99 ท้ายซอย',
    status: 'flagged',
    date: '2026-05-20',
    photo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600',
    isAnonymous: false,
    informerName: 'ผู้ไม่ประสงค์ดีรังเกียจคนชั่ว',
    informerPhone: '084-333-5555',
    flagReasons: ['มีถ้อยคำรุนแรง อคติ และประสงค์ร้ายชัดเจน ระบุบ้านเลขที่ชัดแจ้งทางลบ'],
  },
];
