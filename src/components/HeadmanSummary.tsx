import React, { useState } from 'react';
import { Complaint, CategoryType, CATEGORIES, STATUSES } from '../types';
import { 
  Lock, Award, TrendingUp, TrendingDown, CheckCircle, ChevronRight, Printer, LogOut, FileText, AlertCircle, Info, PieChart, Users, Star 
} from 'lucide-react';

interface HeadmanSummaryProps {
  complaints: Complaint[];
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function HeadmanSummary({ complaints, toast }: HeadmanSummaryProps) {
  // Authentication states
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('headman_authenticated') === 'true';
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '5678') {
      setIsAuthenticated(true);
      localStorage.setItem('headman_authenticated', 'true');
      toast('ยินดีต้อนรับท่านผู้ใหญ่บ้านแสนสุข!', 'success');
      setPin('');
    } else {
      toast('รหัสผ่าน PIN ผู้ใหญ่บ้านไม่ถูกต้อง (ทดสอบใช้งานใช้ PIN: 5678)', 'error');
      setPin('');
    }
  };

  const logoutHeadman = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('headman_authenticated');
    toast('ออกจากระบบรายงานผู้ใหญ่บ้านแล้ว', 'info');
  };

  const handlePinCodeInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  // 1. Dynamic Top 3 Category Calculations
  const categoryCounts = Object.keys(CATEGORIES).map(catKey => {
    const list = complaints.filter(c => c.category === catKey);
    return {
      key: catKey as CategoryType,
      label: CATEGORIES[catKey as CategoryType].label,
      count: list.length,
    };
  });

  // Sort descending
  const sortedCategories = [...categoryCounts].sort((a, b) => b.count - a.count);
  const top3 = sortedCategories.slice(0, 3);

  // Hardcode trend values or calculate them (mock trends for visual delight)
  const trends: Record<CategoryType, { arrow: 'up' | 'down'; color: string; desc: string }> = {
    road: { arrow: 'down', color: 'text-emerald-500', desc: '↘ ลดลง 15% เทียบกับเดือนก่อน' },
    electricity: { arrow: 'down', color: 'text-emerald-500', desc: '↘ ลดลง 24% ขยายเขตติดไฟกิ่งสำเร็จ' },
    water: { arrow: 'up', color: 'text-amber-500', desc: '↗ เพิ่มขึ้น 8% คลี่คลายเรื่องตะกอนประปาช้า' },
    waste: { arrow: 'down', color: 'text-emerald-500', desc: '↘ ลดลง 50% มีโครงการคัดแยกถัง' },
    security: { arrow: 'up', color: 'text-rose-500', desc: '↗ เพิ่มขึ้น 12% เหตุสุนัขเห่าเสียงดังช่วงค่ำ' },
    other: { arrow: 'down', color: 'text-emerald-500', desc: '↘ คงที่ ไม่มีรายงานประเด็นรุนแรงใหม่' },
  };

  // 2. Dynamic Resolution Rate Calculations for Custom Ring Donut Chart
  const total = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  // Donut SVG constants
  const radius = 50;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (resolutionRate / 100) * circumference;

  // 3. Recent 5 Resolved Complaints with Outcome Notes
  const recent5Resolved = complaints
    .filter(c => c.status === 'resolved')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const startPrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in" id="headmanLoginCard">
        <div className="bg-[#D97706] text-white p-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-7 h-7 text-yellow-300" />
          </div>
          <h2 className="text-xl font-bold">แผงรายงานสรุปผู้ใหญ่บ้าน</h2>
          <p className="text-xs text-amber-50 mt-1">กรุณาระบุรหัส PIN 4 หลัก เพื่อตรวจสอบรายงานภาครัฐมิติชุมชน</p>
        </div>

        <form onSubmit={handlePinSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <input
              type="password"
              value={pin}
              readOnly
              className="w-48 tracking-[1em] text-center text-2xl font-black py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#D97706]"
              placeholder="••••"
            />
            <span className="block text-[11px] text-slate-400 mt-2">PIN สาธิตสำหรับผู้ใหญ่บ้านคือ: <strong className="text-amber-600 font-bold font-mono">5678</strong></span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                id={`headman_pin_btn_${num}`}
                onClick={() => handlePinCodeInput(num)}
                className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center block"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              id="headman_pin_btn_clear"
              onClick={() => setPin('')}
              className="h-12 bg-rose-105 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center block"
            >
              ล้าง
            </button>
            <button
              type="button"
              id="headman_pin_btn_0"
              onClick={() => handlePinCodeInput('0')}
              className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center block"
            >
              0
            </button>
            <button
              type="submit"
              id="headman_pin_btn_submit"
              className="h-12 bg-[#D97706] hover:bg-amber-750 text-white rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center block"
            >
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 printable-area">
      
      {/* EXECUTIVE HEADER FOR PRINT & VIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs bg-[#D97706] text-white font-bold px-3 py-1 rounded-full uppercase">
              รายงานประจำเดือนสำหรับ ผู้ใหญ่บ้านแสนสุข หมู่ 4
            </span>
            <span className="text-xs font-bold text-slate-400 no-print">
              วิเคราะห์เรียลไทม์ 📊
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            แฟ้มประเมินดัชนีคุณความสะอาดและความปลอดภัยชุมชน
          </h3>
          <p className="text-xs text-slate-400 mt-1">รวบรวมข้อมูล ณ สรุปความก้าวหน้าโครงการพัฒนาหมู่บ้าน ต.แสนสุข อ.เมืองแสนสุข</p>
        </div>
        
        <div className="flex gap-2.5 w-full sm:w-auto no-print">
          <button
            onClick={startPrint}
            id="printSummaryBtn"
            className="px-4.5 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            style={{ minHeight: '44px' }}
          >
            <Printer className="w-4 h-4" /> พิมพ์สรุปรายงาน (Print)
          </button>
          <button
            onClick={logoutHeadman}
            id="logoutHeadmanBtn"
            className="px-4.5 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 dark:bg-slate-850 dark:border-rose-950 dark:hover:bg-rose-950/20 dark:text-rose-450 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            style={{ minHeight: '44px' }}
          >
            <LogOut className="w-4 h-4" /> ออกระบบ
          </button>
        </div>
      </div>

      {/* VILLAGE DEMOGRAPHICS & EXECUTIVE KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Registered Complaints */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-900 dark:to-teal-950/30 p-5 rounded-2xl border border-teal-200 dark:border-teal-900 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-[#0F766E] dark:text-teal-400 block mb-1">เรื่องร้องเรียนรับแจ้งทั้งหมด</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">{total} <span className="text-xs font-bold text-slate-500">เรื่อง</span></span>
            <span className="text-[10px] text-slate-400 block mt-1.5">รับเรื่องผ่านช่องทางดิจิทัลและแอปพลิเคชัน</span>
          </div>
          <div className="w-12 h-12 bg-[#0F766E]/10 rounded-full flex items-center justify-center text-[#0F766E]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Dynamic Resolution circular graph block (6 Units) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block mb-1">ประสิทธิภาพการฟื้นฟูแก้ไขปัญหา</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">{resolutionRate}%</span>
            <span className="text-[10px] text-slate-400 block mt-1.5">แก้ไขสัมฤทธิ์ผลแล้ว {resolvedCount} จากทั้งหมด {total} เรื่อง</span>
          </div>
          
          {/* Custom SVG Donut Chart */}
          <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back Circle */}
              <circle
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Foreground Circle representing Resolve Rate */}
              <circle
                className="text-emerald-600 dark:text-emerald-400 transition-all duration-1000"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 leading-none">{resolutionRate}%</span>
              <span className="text-[8px] text-slate-400 mt-0.5 font-bold leading-none">แก้ไขสำเร็จ</span>
            </div>
          </div>
        </div>

        {/* Community Trust Level Star Rating (Dynamic or visual gauge) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block mb-1">คะแนนความเชื่อมั่นต่อผู้นำ</span>
            <span className="text-3xl font-black text-[#D97706] block flex items-center gap-1">
              4.8 <span className="text-xs text-slate-400">/ 5.0</span>
            </span>
            <div className="flex gap-0.5 mt-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-current" />)}
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center text-[#D97706]">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* VIEW SPLIT GRID: TOP 3 PROBLEMS vs HISTORY OF RESOLVED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT (5 Units): TOP 3 PROBLEM CATEGORIES */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#D97706]" />
            3 หมวดหมู่ปัญหาที่ประชาชนแจ้งร้องเรียนบ่อยสุด
          </h4>

          <div className="space-y-4">
            {top3.map((cat, index) => {
              const trend = trends[cat.key] || { arrow: 'down', color: 'text-emerald-500', desc: '↘ แนวโน้มลดลงอย่างมีเสถียรภาพ' };
              const percentOfTotal = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              
              return (
                <div key={cat.key} className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-xl flex items-start gap-3 justify-between">
                  <div className="flex gap-3">
                    {/* Rank Number Icon */}
                    <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 dark:bg-teal-950/40 text-[#0F766E] font-black text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 block">{cat.label}</span>
                      <p className="text-[10px] text-slate-400 mt-1">รับเรื่องสะสมคดี: <strong className="text-[#0F766E] dark:text-teal-400">{cat.count} รายงาน</strong> ({percentOfTotal}%)</p>
                      <span className={`text-[10px] font-bold ${trend.color} block mt-1.5`}>
                        {trend.desc}
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual mini progress bar circle block */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold bg-[#0F766E] text-white px-2 py-0.5 rounded-full block w-fit ml-auto">
                      อันดับ {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-50/50 dark:bg-slate-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 leading-normal font-medium">
              *ข้อเสนอแนะ: ปัญหาหลักส่วนใหญ่เกี่ยวข้องกับสวัสดิภาพพื้นฐานถนนหนทางและระบบไฟส่องสว่าง แนะนำให้จัดสรรงบประมาณคงเหลือร้อยละ 15 เพื่อจัดระบบซ่อมแซมเชิงป้องกันก่อนฤดูฝนปกคลุม
            </p>
          </div>
        </div>

        {/* RIGHT COMPONENT (7 Units): TIMELINE OF 5 RECENT RESOLVED COMPLAINTS */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            รายงาน 5 ข้อยุติและคดีปรับปรุงช่วยเหลือแล้วเสร็จล่าสุด
          </h4>

          {recent5Resolved.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <span className="text-xs font-bold block">อยู่ระหว่างรายงานผลการปรับปรุงบำรุงเพิ่มเติม</span>
              <p className="text-[10px] text-slate-400 mt-1">เมื่อเจ้าหน้าที่แก้ไขและบันทึกปิดงานแล้ว ประวัติความก้าวหน้าจะถูกแสดงผลบนรายงานสรุปเวลานี้</p>
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-5 py-2">
              {recent5Resolved.map((comp) => {
                const cat = CATEGORIES[comp.category];
                return (
                  <div key={comp.id} className="relative group text-left">
                    {/* Circle timeline line pin */}
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-all"></div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 border border-slate-150 dark:border-slate-850 rounded-xl space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full select-all">
                          {comp.id}
                        </span>
                        <div className="flex gap-2 items-center text-[10px] text-slate-400 font-bold">
                          <span>📅 แก้เสร็จเมื่อ {comp.date}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${cat?.bg} ${cat?.text}`}>
                            {cat?.label}
                          </span>
                        </div>
                      </div>

                      <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {comp.title}
                      </h5>

                      {comp.adminNotes ? (
                        <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 border border-emerald-100 dark:border-emerald-900/40 rounded-lg">
                          <strong>บันทึกปิดงาน:</strong> {comp.adminNotes}
                        </div>
                      ) : (
                        <span className="block text-[10px] text-slate-400 font-bold">
                          *แก้ไขเสร็จสมบูรณ์แล้ว - ไม่มีบันทึกหมายเหตุเพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* PRINT BANNER ONLY SHOWN IN window.print() */}
      <div className="print-only hidden print:block pt-12 border-t border-slate-300 mt-12 text-center text-xs text-slate-450">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="block h-12 border-b border-dashed border-slate-400 max-w-[150px] mx-auto mb-1"></span>
            <span className="font-bold block text-[10px]">ผู้เขียนรายงาน (กรรมการผู้จัดการ)</span>
          </div>
          <div>
            <span className="block h-12 border-b border-dashed border-slate-400 max-w-[150px] mx-auto mb-1"></span>
            <span className="font-bold block text-[10px]">ผู้รับรองรายงาน (ผู้ใหญ่บ้านหมู่ 4)</span>
          </div>
          <div>
            <span className="block h-12 border-b border-dashed border-slate-400 max-w-[150px] mx-auto mb-1"></span>
            <span className="font-bold block text-[10px]">วันที่ลงนามปิดงาน</span>
          </div>
        </div>
        <div className="text-center mt-8 text-[9px] text-slate-440 font-mono">
          รายงานสารสรุปชุมชนจัดทำในระบบ SaaS แสนสุขพัฒนา (SaaS - Village Civic Engagements) ในเวลา: {new Date().toLocaleString('th-TH')}
        </div>
      </div>

    </div>
  );
}
