import React, { useState, useRef } from 'react';
import { Complaint, CategoryType, CATEGORIES, SUSPICIOUS_WORDS } from '../types';
import { Milestone, Lightbulb, Droplet, Trash2, ShieldAlert, HelpCircle, Image as ImageIcon, Camera, CheckCircle, Copy, AlertTriangle, Search } from 'lucide-react';

interface VillagerFormProps {
  onAddComplaint: (newComplaint: Complaint) => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onTrackComplaint?: (code: string) => void;
}

const MOCK_PHOTOS = [
  { label: 'ถนนเป็นหลุมขนมครก', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600' },
  { label: 'ขยะล้นเกลื่อนถนน', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600' },
  { label: 'เสาไฟฟ้าดับกลางซอย', url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&q=80&w=600' },
  { label: 'น้ำประปาเหลืองขุ่น', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600' },
];

export default function VillagerForm({ onAddComplaint, toast, onTrackComplaint }: VillagerFormProps) {
  // Form stats
  const [category, setCategory] = useState<CategoryType>('road');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [informerName, setInformerName] = useState('');
  const [informerPhone, setInformerPhone] = useState('');
  
  // Photo upload
  const [photo, setPhoto] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success screen state
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [wasFlagged, setWasFlagged] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhoto(e.target.result as string);
        toast('อัปโหลดรูปภาพสำเร็จ', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const selectMockPhoto = (url: string) => {
    setPhoto(url);
    toast('เลือกรูปภาพตัวอย่างปัญหาแล้ว', 'success');
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      toast('กรุณาอัปโหลดรูปภาพเพื่อเป็นหลักฐานจุดที่เกิดปัญหา (บังคับกรอก)', 'error');
      return;
    }

    if (!title.trim()) {
      toast('กรุณากรอกหัวข้อเรื่องร้องเรียน', 'error');
      return;
    }

    if (!description.trim()) {
      toast('กรุณากรอกรายละเอียดปัญหา', 'error');
      return;
    }

    if (!location.trim()) {
      toast('กรุณาระบุสถานที่หรือจุดสังเกต', 'error');
      return;
    }

    if (!isAnonymous) {
      if (!informerName.trim()) {
        toast('กรุณากรอกชื่อผู้แจ้ง หรือเลือกโหมดไม่ระบุตัวตน', 'error');
        return;
      }
      if (!informerPhone.trim()) {
        toast('กรุณากรอกเบอร์โทรศัพท์เพื่อการติดตามผล', 'error');
        return;
      }
    }

    // AI filter mechanism
    const fullText = `${title} ${description}`.toLowerCase();
    const flags = SUSPICIOUS_WORDS.filter(word => fullText.includes(word.toLowerCase()));
    
    const isSuspicious = flags.length > 0;
    const trackingCode = `SAEN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: Complaint = {
      id: trackingCode,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      status: isSuspicious ? 'flagged' : 'pending',
      date: new Date().toISOString().split('T')[0],
      photo,
      isAnonymous,
      informerName: isAnonymous ? undefined : informerName.trim(),
      informerPhone: isAnonymous ? undefined : informerPhone.trim(),
      flagReasons: isSuspicious ? flags.map(word => `ตรวจพบคีย์เวิร์ดเฝ้าระวัง: "${word}"`) : undefined,
    };

    onAddComplaint(newComplaint);
    setSubmittedCode(trackingCode);
    setWasFlagged(isSuspicious);
    setDetectedWords(flags);
    
    if (isSuspicious) {
      toast('ส่งเรื่องสำเร็จแล้ว (อยู่ระหว่างตรวจสอบความเหมาะสม)', 'info');
    } else {
      toast('ส่งเรื่องร้องเรียนสำเร็จแล้ว! ขอบคุณคณะแสนสุขพัฒนา', 'success');
    }
  };

  // Reset form
  const handleReset = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setPhoto('');
    setIsAnonymous(false);
    setInformerName('');
    setInformerPhone('');
    setSubmittedCode(null);
    setWasFlagged(false);
    setDetectedWords([]);
  };

  const copyCode = () => {
    if (submittedCode) {
      navigator.clipboard.writeText(submittedCode);
      toast('คัดลอกรหัสติดตามสำเร็จ', 'success');
    }
  };

  const getCatIconComponent = (catType: CategoryType) => {
    switch (catType) {
      case 'road': return <Milestone className="w-5 h-5" />;
      case 'electricity': return <Lightbulb className="w-5 h-5" />;
      case 'water': return <Droplet className="w-5 h-5" />;
      case 'waste': return <Trash2 className="w-5 h-5" />;
      case 'security': return <ShieldAlert className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  if (submittedCode) {
    return (
      <div id="successPanel" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 max-w-2xl mx-auto my-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-12 h-12" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-[#0F766E] dark:text-teal-400 mb-2">ส่งเรื่องร้องเรียนสำเร็จแล้ว!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          ขอบคุณท่านที่ร่วมรายงานปัญหา ระบบได้รับเรื่องและบันทึกลงในทะเบียนหมู่บ้านเรียบร้อยแล้ว
        </p>

        {wasFlagged && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 mb-6 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs text-orange-850 dark:text-orange-300 block">ประกาศความเหมาะสม: อยู่ระหว่างตรวจสอบคุณสมบัติ</span>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1 leading-relaxed">
                ระบบตรวจพบถ้อยคำทางการเมืองหรือข้อขัดแย้งเชิงบุคคล ({detectedWords.map(w => `"${w}"`).join(', ')}) เรื่องร้องเรียนเรื่องนี้จะถูกนำส่งเข้าคิวพิเศษของแผงผู้ดูแลเพื่อตรวจสอบความเหมาะสมทางถ้อยคำ ก่อนเปิดเป็นสาธารณะตามปกติ
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
          <span className="text-xs font-bold text-slate-400 block mb-1">รหัสสำหรับใช้ติดตามสถานะ</span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-mono font-black text-[#D97706] tracking-wider select-all">
              {submittedCode}
            </span>
            <button 
              onClick={copyCode} 
              id="copyCodeBtn"
              className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:text-[#0F766E] transition-all"
              title="คัดลอกรหัส"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            *กรุณาบันทึกหรือคัดลอกรหัสนี้ไว้ เพื่อใช้ติดตามขั้นตอนการดำเนินงานของผู้นำหมู่บ้าน
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReset}
            id="backToFormBtn"
            className="px-6 py-3 bg-[#0F766E] hover:bg-teal-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            style={{ minHeight: '48px' }}
          >
            ส่งเรื่องร้องเรียนเพิ่มเติม
          </button>
          {onTrackComplaint && (
            <button
              onClick={() => onTrackComplaint(submittedCode)}
              id="goToTrackBtn"
              className="px-6 py-3 bg-teal-50 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-[#0F766E] dark:text-teal-400 border border-[#0F766E]/20 font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              style={{ minHeight: '48px' }}
            >
              <Search className="w-4 h-4" />
              ติดตามสถานะของเรื่องนี้เลย
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto my-6">
      <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white p-6">
        <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-amber-300">
          <Milestone className="w-6 h-6 shrink-0 text-amber-400" />
          แจ้งเรื่องร้องเรียน & แจ้งเหตุชำรุด
        </h3>
        <p className="text-xs sm:text-sm text-teal-100/90 mt-1 font-medium">
          ระบบช่วยเหลือและประสานงาน คณะกรรมการหมู่บ้านแสนสุขพัฒนา หมู่ที่ 4 เพื่อแก้ปัญหาที่รวดเร็วและโปร่งใส
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        
        {/* PHOTO COMPONENT */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 justify-center sm:justify-start">
            <span className="text-rose-500 text-lg">*</span> 1. รูปถ่ายหลักฐานจุดที่เกิดปัญหา (บังคับอัปโหลด):
          </label>
          
          <div className="flex flex-col items-center justify-center py-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 w-full max-w-md ${
                photo 
                  ? '' 
                  : dragActive 
                    ? 'scale-105' 
                    : ''
              }`}
              id="dragDropZone"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept="image/*"
              />
              {photo ? (
                <div className="w-full relative group" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={photo}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="max-h-72 w-full object-cover rounded-2xl mx-auto border-2 border-slate-200 dark:border-slate-850 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>เปลี่ยนรูปภาพหลักฐาน</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Pulsing Outer Ring */}
                  <div className="relative group mb-4">
                    <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-400/15 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse" />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-teal-50 to-teal-100/40 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-[#0F766E] dark:border-teal-500/50 flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F766E] to-teal-700 dark:from-teal-600 dark:to-teal-800 shadow-md flex items-center justify-center text-white mb-1">
                        <Camera className="w-8 h-8" />
                      </div>
                      <span className="text-[10px] font-extrabold text-[#0F766E] dark:text-teal-400">กดเพื่อถ่ายรูป</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      หรือลากไฟล์ภาพมาที่นี่เพื่อแนบ
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      รองรับ JPEG, PNG (ไม่เกิน 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick choices for testing */}
          <div className="mt-3">
            <span className="text-xs text-slate-400 font-semibold block mb-1.5">ภาพตัวอย่างสำหรับทดสอบแบบเร็ว (กรณีไม่มีรูปบนเครื่อง):</span>
            <div className="flex flex-wrap gap-2">
              {MOCK_PHOTOS.map((mock, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`mockPhotoBtn_${idx}`}
                  onClick={() => selectMockPhoto(mock.url)}
                  className="text-[11px] font-bold px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-[#0F766E] dark:bg-slate-800 dark:hover:bg-teal-950/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-all text-slate-600 dark:text-slate-300"
                  style={{ minHeight: '32px' }}
                >
                  ⚡ {mock.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CATEGORY SELECTOR */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <span className="text-rose-500 text-lg">*</span> 2. เลือกประเภทของปัญหาที่ต้องการแจ้ง:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.entries(CATEGORIES) as [CategoryType, typeof CATEGORIES[CategoryType]][]).map(([key, value]) => {
              const isSelected = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  id={`formCategoryBtn_${key}`}
                  onClick={() => setCategory(key)}
                  className={`flex flex-col sm:flex-row items-center p-3.5 border-2 rounded-xl transition-all gap-2 text-center sm:text-left ${
                    isSelected
                      ? 'border-[#0F766E] bg-teal-50/40 dark:bg-teal-950/20 text-[#0F766E] dark:text-teal-300 shadow-inner'
                      : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'
                  }`}
                  style={{ minHeight: '52px' }}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#0F766E] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {getCatIconComponent(key)}
                  </div>
                  <span className="text-xs sm:text-sm font-bold leading-tight">{value.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TITLE COMPONENT WITH COUNTER */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="compTitle" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="text-rose-500 text-lg">*</span> 3. หัวข้อเรื่องร้องเรียน (พิมพ์สรุปเข้าใจง่าย):
            </label>
            <span className={`text-xs font-mono font-bold ${title.length > 80 ? 'text-rose-600' : 'text-slate-400'}`}>
              {title.length} / 80 ตัวอักษร
            </span>
          </div>
          <input
            id="compTitle"
            type="text"
            maxLength={80}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ตัวอย่าง: กิ่งไม้แห้งขวางเลนจราจรปากทางเข้าซอย 4 ท้ายหมู่บ้าน"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          />
        </div>

        {/* DESCRIPTION AREA WITH COUNTER */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="compDesc" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="text-rose-500 text-lg">*</span> 4. รายละเอียดของเหตุการณ์ / ปัญหาและผลกระทบ:
            </label>
            <span className={`text-xs font-mono font-bold ${description.length > 300 ? 'text-rose-600' : 'text-slate-400'}`}>
              {description.length} / 300 ตัวอักษร
            </span>
          </div>
          <textarea
            id="compDesc"
            maxLength={300}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="โปรดบรรยายอย่างละเอียด เช่น ปัญหานี้สร้างความเดือดร้อนแก่สัญจรคนแก่ช่วงค่ำอย่างไร เสี่ยงโจรขโมย หรือทำให้รถล้มบาดเจ็บกี่รายแล้ว..."
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-teal-500 focus:outline-none leading-relaxed"
            required
          />
        </div>

        {/* LOCATION FIELD */}
        <div>
          <label htmlFor="compLoc" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <span className="text-rose-500 text-lg">*</span> 5. สถานที่เกิดเหตุหรือจุดระบุให้เจ้าหน้าที่ลงพื้นที่ได้ถูก:
          </label>
          <input
            id="compLoc"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น หน้าบ้านเลขที่ 15/4 ซอยคุณตาแย้ม หรือ ช่วงโค้งขวาห่างจากคลองส่งน้ำ 50 เมตร"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          />
        </div>

        {/* ANONYMOUS TOGGLE */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="anonymousToggle"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 accent-[#0F766E] rounded-md pointer-events-auto"
            />
            <div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">ไม่ระบุข้อมูลตัวตน (แจ้งแบบไม่เผยนาม)</span>
              <p className="text-xs text-slate-400">ปิดบังชื่อและเบอร์โทรศัพท์ของคุณจากสังคมทั่วไป จะเห็นข้อมูลนี้เฉพาะกรรมการผู้ใหญ่บ้านผู้ไขคดีเท่านั้น</p>
            </div>
          </label>

          {/* Hidden fields details */}
          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
              <div>
                <label htmlFor="informerName" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  ชื่อ-นามสกุลผู้แจ้งเรื่อง:
                </label>
                <input
                  id="informerName"
                  type="text"
                  value={informerName}
                  onChange={(e) => setInformerName(e.target.value)}
                  placeholder="เช่น นายศักดิ์ดา รักดี"
                  className="w-full px-3.5 py-2.5 border border-slate-305 dark:border-slate-700 rounded-lg text-base bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="informerPhone" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  เบอร์โทรศัพท์สำหรับติดต่อกลับ:
                </label>
                <input
                  id="informerPhone"
                  type="tel"
                  value={informerPhone}
                  onChange={(e) => setInformerPhone(e.target.value)}
                  placeholder="เช่น 089-123-4567"
                  className="w-full px-3.5 py-2.5 border border-slate-305 dark:border-slate-700 rounded-lg text-base bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <button
            type="submit"
            id="submitComplaintBtn"
            className="w-full bg-[#0F766E] hover:bg-teal-850 text-white font-extrabold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
            style={{ minHeight: '52px' }}
          >
            <CheckCircle className="w-5 h-5 text-amber-300" /> ยืนยันเรื่องร้องเรียนและส่งเรื่องเข้าระบบ
          </button>
          <span className="text-[11px] text-slate-400 block text-center mt-2 leading-tight">
            เสร็จสิ้นการส่งเรื่อง ข้อมูลจะถูกเข้ารหัสสากลเพื่อความปลอดภัยของประชากรและสิทธิ์ส่วนบุคคล
          </span>
        </div>

      </form>
    </div>
  );
}
