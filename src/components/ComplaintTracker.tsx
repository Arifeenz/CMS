import React, { useState, useEffect } from 'react';
import { Complaint, CATEGORIES, STATUSES } from '../types';
import { Search, MapPin, Calendar, Clock, Wrench, CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ComplaintTrackerProps {
  complaints: Complaint[];
  initialSearchCode?: string;
  onNavigateToForm: () => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ComplaintTracker({ complaints, initialSearchCode = '', onNavigateToForm, toast }: ComplaintTrackerProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchCode);
  const [foundComplaint, setFoundComplaint] = useState<Complaint | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if initialSearchCode is provided
  useEffect(() => {
    if (initialSearchCode) {
      setSearchQuery(initialSearchCode);
      handleSearch(null, initialSearchCode);
    }
  }, [initialSearchCode, complaints]);

  const handleSearch = (e: React.FormEvent | null, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = (overrideQuery ?? searchQuery).trim().toUpperCase();

    if (!query) {
      toast('กรุณากรอกรหัสติดตามเรื่องร้องเรียน', 'error');
      return;
    }

    // Attempt to match:
    // 1. Exact ID (e.g., "SAEN-2026-0001")
    // 2. Contains (e.g. "0001" or "0003" or "2026-0001")
    const match = complaints.find(comp => {
      const compIdUpper = comp.id.toUpperCase();
      return compIdUpper === query || 
             compIdUpper.endsWith(query) || 
             compIdUpper.includes(query);
    });

    setFoundComplaint(match || null);
    setHasSearched(true);

    if (match) {
      toast('พบข้อมูลเรื่องร้องเรียนของท่านแล้ว 🔍', 'success');
    } else {
      toast('ไม่พบรหัสติดตามเรื่องร้องเรียนในระบบ', 'error');
    }
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'in-progress': return 2;
      case 'resolved': return 3;
      case 'rejected': return 3; // end point but invalid/rejected
      case 'flagged': return 1; // treating as submitted but pending review
      default: return 1;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-3xl mx-auto my-6 animate-fade-in" id="complaintTrackerPanel">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-850 p-6 text-white text-left">
        <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2 text-amber-300">
          <Search className="w-6 h-6 shrink-0 text-amber-400" />
          ติดตามสถานะเรื่องร้องเรียน
        </h3>
        <p className="text-xs sm:text-sm text-teal-100/90 mt-1 font-medium">
          ตรวจสอบความคืบหน้าการซ่อมบำรุงและอ่านบันทึกชี้แจงจากทีมงานผู้ใหญ่บ้านได้ทันที ไม่ต้องลงทะเบียนเข้าสู่ระบบ
        </p>
      </div>

      <div className="p-6">
        {/* Search Input Box */}
        <form onSubmit={(e) => handleSearch(e)} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-left">
              ระบุรหัสติดตามเรื่องร้องเรียนของคุณ (6 หลักท้าย หรือ รหัสเต็ม เช่น SAEN-2026-0003):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ตัวอย่างเช่น: 0003 หรือ SAEN-2026-0003"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono font-bold tracking-wider"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button
                type="submit"
                id="tracker_search_btn"
                className="px-6 py-3 bg-[#0F766E] hover:bg-teal-800 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 hover:scale-[1.01] active:scale-[0.99]"
                style={{ minHeight: '44px' }}
              >
                <Search className="w-5 h-5" />
                <span>ตรวจสอบข้อมูล</span>
              </button>
            </div>
          </div>
        </form>

        {/* Display Search Results */}
        {hasSearched ? (
          foundComplaint ? (
            <div className="space-y-6 text-left border-t border-slate-100 dark:border-slate-800/80 pt-6 animate-fade-in">
              {/* Main Card Result Head */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">
                    TRACKING NUMBER
                  </div>
                  <h4 className="text-xl font-mono font-black text-[#D97706] mt-0.5">
                    {foundComplaint.id}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                    วันที่ร้องเรียน: {foundComplaint.date} • หมวดหมู่: {CATEGORIES[foundComplaint.category]?.label || foundComplaint.category}
                  </p>
                </div>

                {/* Status Big Badge */}
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${STATUSES[foundComplaint.status]?.bg || 'bg-slate-100'} ${STATUSES[foundComplaint.status]?.text || 'text-slate-700'}`}>
                    {STATUSES[foundComplaint.status]?.label || foundComplaint.status}
                  </span>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="py-2">
                <span className="text-xs font-bold text-slate-400 block mb-3">
                  ลำดับขั้นตอนการตรวจสอบและการทำงาน:
                </span>
                
                {foundComplaint.status === 'rejected' ? (
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-extrabold text-rose-800 dark:text-rose-400 block">
                        เรื่องร้องเรียนนี้ไม่ได้รับการส่งเรื่องต่อ (ไม่อนุมัติ/ตีกลับ)
                      </span>
                      <p className="text-xs text-rose-600 dark:text-rose-400/85 mt-1 leading-relaxed">
                        จากการตรวจสอบถ้อยคำหรือสภาพความเป็นจริงของพื้นที่ ทางคณะกรรมการพบว่าข้อมูลไม่ถูกต้องตามระเบียบ หรือเนื้อหาก่อให้เกิดความเสียหายกับผู้อื่น
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center relative pt-4 pb-2">
                    {/* Background connector line */}
                    <div className="absolute top-8 left-[16%] right-[16%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-1" />
                    <div 
                      className="absolute top-8 left-[16%] h-0.5 bg-teal-600 dark:bg-teal-500 transition-all duration-500 -z-1" 
                      style={{ 
                        width: `${
                          getStatusStepIndex(foundComplaint.status) === 1 ? '0%' :
                          getStatusStepIndex(foundComplaint.status) === 2 ? '50%' : '68%'
                        }` 
                      }} 
                    />

                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStatusStepIndex(foundComplaint.status) >= 1
                          ? 'bg-teal-600 text-white shadow-md font-mono'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        1
                      </div>
                      <span className="text-[11px] font-black mt-2 text-slate-700 dark:text-slate-300">
                        รับแจ้งเรื่องเข้าคิว
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {foundComplaint.status === 'pending' ? 'รอกรรมการตรวจสอบ' : 'เรียบร้อย'}
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStatusStepIndex(foundComplaint.status) >= 2
                          ? 'bg-teal-600 text-white shadow-md font-mono'
                          : getStatusStepIndex(foundComplaint.status) === 1 && foundComplaint.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        2
                      </div>
                      <span className="text-[11px] font-black mt-2 text-slate-700 dark:text-slate-300">
                        กำลังดำเนินการบำรุง
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {foundComplaint.status === 'in-progress' ? 'ทีมช่างเข้าพื้นที่' : foundComplaint.status === 'resolved' ? 'เรียบร้อย' : 'คงคิวซ่อม'}
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        getStatusStepIndex(foundComplaint.status) >= 3
                          ? 'bg-emerald-600 text-white shadow-md font-mono'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        3
                      </div>
                      <span className="text-[11px] font-black mt-2 text-slate-700 dark:text-slate-300">
                        แก้ไขงานเสร็จสิ้น
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {foundComplaint.status === 'resolved' ? 'ปิดคดีอย่างสมบูรณ์' : 'รอดำเนินการ'}
                      </span>
                    </div>

                  </div>
                )}
              </div>

              {/* Details and Photo Gallery Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                {/* Text Content */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">หัวข้อเรื่องร้องเรียน:</span>
                    <p className="text-sm font-extrabold text-[#0f766e] dark:text-teal-400 mt-1 leading-snug">
                      {foundComplaint.title}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 block">รายละเอียดของปัญหา:</span>
                    <p className="text-xs font-medium text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">
                      {foundComplaint.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 block">บริเวณพิกัดจุดชำรุด:</span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-400 mt-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-205">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span>{foundComplaint.location}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 block">ผู้แจ้งความความเดือดร้อน:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-455 mt-1">
                      {foundComplaint.isAnonymous ? '❌ ไม่ประสงค์แสดงตัวตน (แจ้งแบบไม่ระบุตัวตน)' : `👤 คุณ${foundComplaint.informerName || 'ชาวบ้าน'} (เบอร์โทร: ${foundComplaint.informerPhone || 'ไม่ระบุ'})`}
                    </p>
                  </div>
                </div>

                {/* Photo Exhibit */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">ภาพหลักฐานที่ส่งเข้าระบบ:</span>
                    <div className="w-full h-44 rounded-xl border border-slate-205 dark:border-slate-800 overflow-hidden relative shadow-inner">
                      <img
                        src={foundComplaint.photo}
                        alt="Submitted Evidence"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  <div className="bg-amber-500/10 dark:bg-amber-400/5 border border-amber-350 dark:border-amber-900/40 rounded-xl p-4">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      บันทึกชี้แจงและการดำเนินการจากผู้บริหารหมู่บ้าน:
                    </span>
                    <div className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 font-semibold leading-relaxed">
                      {foundComplaint.adminNotes ? (
                        foundComplaint.adminNotes
                      ) : (
                        <span className="text-slate-400 italic font-normal">
                          ขณะนี้อยู่ระหว่างขั้นตอนรวบรวมช่างเทคนิคท้องถิ่น คณะทีมงานยังไม่มีการบันทึกชี้แจงเพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-450 animate-fade-in">
              <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <span className="font-extrabold text-sm block text-slate-700 dark:text-slate-300">
                ไม่พบข้อมูลรหัสติดตาม "{searchQuery}"
              </span>
              <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                เนื่องจากระบบไม่พบเลขติดตาม กรุณาตรวจสอบให้มั่นใจว่าสะกดถูกต้อง หรือหากพึ่งแจ้งข้อมูลเสร็จสิ้น ขอแนะนำให้คัดลอกรหัสบนหน้าจอและมาลองค้นหาอีกครั้ง
              </p>
            </div>
          )
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-slate-400">
            <FileText className="w-12 h-12 text-teal-600/50 mx-auto mb-3" />
            <span className="text-xs font-bold block text-slate-600 dark:text-slate-300">
              รอใส่ข้อมูลรหัสติดตาม 6 ตัวท้ายในฟอร์มด้านบน
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              หลังเกิดปัญหากลางแจ้ง และคุณได้ส่งคำร้องแล้ว นำรหัสที่ได้รับมาวางตรงนี้เพื่อรู้ความเคลื่อนไหวจากผู้นำหมู่บ้าน
            </p>
          </div>
        )}

        {/* Back and Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 pt-5 border-t border-slate-150 dark:border-slate-800/80">
          <button
            onClick={onNavigateToForm}
            type="button"
            className="px-6 py-2.5 border border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all"
            style={{ minHeight: '40px' }}
          >
            <span>ต้องการแจ้งเรื่องร้องเรียนเพิ่ม?</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
