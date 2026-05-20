import React, { useState, useEffect } from 'react';
import { Complaint, INITIAL_COMPLAINTS, StatusType } from './types';
import VillagerForm from './components/VillagerForm';
import AdminPanel from './components/AdminPanel';
import HeadmanSummary from './components/HeadmanSummary';

import { 
  FileText, LayoutDashboard, Award, Sun, Moon, Megaphone, PhoneCall, HeartPulse, CheckSquare, Bell
} from 'lucide-react';

interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // 1. Theme Configuration
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // default light theme as requested
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 2. Global State for Complaints synced with LocalStorage
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('village_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse complaints', e);
      }
    }
    return INITIAL_COMPLAINTS;
  });

  useEffect(() => {
    localStorage.setItem('village_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // 3. Navigation State (Bottom Tab bar with 3 tabs)
  const [activeTab, setActiveTab] = useState<'villager' | 'admin' | 'headman'>('villager');

  // 4. Toast Notification Manager
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToastHandler = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    
    // Auto remove after 5.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  // State Updates handler
  const handleAddComplaint = (newComplaint: Complaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const handleUpdateComplaintStatus = (id: string, newStatus: StatusType, notes?: string) => {
    setComplaints(prev => 
      prev.map(c => c.id === id ? { ...c, status: newStatus, adminNotes: notes } : c)
    );
    showToastHandler(`ปรับปรุงสถานะเรื่องคดีหมายเลข ${id} สำเร็จ!`, 'success');
  };

  const handleApproveFlaggedComplaint = (id: string) => {
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'pending', flagReasons: undefined } : c)
    );
    showToastHandler(`เรื่องร้องเรียน ${id} ผ่านการตรวจสอบถ้อยคำและเปิดใช้งานสากลแล้ว`, 'success');
  };

  const handleRejectFlaggedComplaint = (id: string) => {
    setComplaints(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c)
    );
    showToastHandler(`เรื่องร้องเรียน ${id} ได้รับการปัดปฏิเสธออกจากคิวถ้อยคำสบประมาท`, 'info');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col justify-between pb-24 transition-colors duration-200">
      
      {/* 1. TOP LOGO AND EMBLEM HEADER FOR THE VILLAGE */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm sticky top-0 z-30 transition-colors duration-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* National emblem seal simulation for official trustworthy look */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-[#D97706] bg-[#0F766E] flex items-center justify-center shadow-inner shrink-0 text-white select-none">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 14s1-3 7-3 7 3 7 3m-14 4s1-3 7-3 7 3 7 3"></path>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-[#0F766E] dark:text-teal-400 flex items-center gap-1.5">
                  ระบบร้องเรียนชุมชน <span className="text-[10px] bg-[#D97706] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">แสนสุขพัฒนา</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">หมู่บ้านแสนสุข หมู่ที่ 4 ต.แสนสุข อ.เมืองแสนสุข</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleTheme} 
                id="themeToggleBtn_App"
                className="p-2 w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-705 text-slate-800 dark:text-slate-200 flex items-center justify-center shadow-sm transition-all"
                title="สลับโหมดกลางวัน/กลางคืน"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. EMERGENCY HELPLINE BANNER */}
      <div className="bg-teal-50 border-b border-teal-100 text-[#0F766E] px-4 py-2.5 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-teal-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-bold gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 select-none" />
            <span>มีเหตุเภทภัยฉุกเฉินด่วนทางกายภาพหรือชีวิต? โทรประสานงานหน่วยกู้ภัยได้ทันที ตลอด 24 ชม.</span>
          </div>
          <div className="flex gap-4">
            <a href="tel:191" className="hover:underline flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> ตำรวจจับผู้ร้าย 191
            </a>
            <a href="tel:1669" className="hover:underline flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5" /> เจ็บไข้ฉุกเฉิน 1669
            </a>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKPLACE VIEWS CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-5 flex-grow">
        
        {/* VIEW ROUTER */}
        {activeTab === 'villager' && (
          <div className="animate-fade-in text-center" id="villagerViewBlock">
            {/* HERO PROMOTIONAL BANNER */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white rounded-2.5xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 relative overflow-hidden text-left mb-6">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-black text-amber-400">“แสนสุขพัฒนา ร่วมสร้างชุมชนน่าอยู่ โปร่งใส ปลอดภัย”</h2>
                <p className="text-xs sm:text-sm mt-2 text-teal-150 leading-relaxed font-bold">
                  ระบบรับแจ้งเรื่องความพังชำรุด ปัญหาขยะ น้ำเสีย หรือสิ่งแวดล้อมเสื่อมโทรม เพื่อช่วยคณะผู้ใหญ่บ้านจัดสรรช่างดำเนินการก่อสร้างแก้ไขได้อย่างรวดเร็ว โปร่งใส ตรวจสอบสถานะจริงได้ด้วยตนเอง
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <span className="inline-flex items-center px-3 py-1 bg-teal-900/40 border border-teal-700/60 rounded-full text-[10px] text-amber-300 font-bold">
                    <CheckSquare className="w-3.5 h-3.5 mr-1 text-amber-400" /> อัตราแก้สำเร็จเสร็จสิ้น: 96.5%
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-teal-900/40 border border-teal-700/60 rounded-full text-[10px] text-teal-200 font-bold">
                    <Bell className="w-3.5 h-3.5 mr-1 text-amber-400" /> เชื่อต่อส่วนกลาง เรียลไทม์
                  </span>
                </div>
              </div>
            </div>

            <VillagerForm onAddComplaint={handleAddComplaint} toast={showToastHandler} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fade-in" id="adminViewBlock">
            <AdminPanel 
              complaints={complaints} 
              onUpdateComplaintStatus={handleUpdateComplaintStatus}
              onApproveFlaggedComplaint={handleApproveFlaggedComplaint}
              onRejectFlaggedComplaint={handleRejectFlaggedComplaint}
              toast={showToastHandler}
            />
          </div>
        )}

        {activeTab === 'headman' && (
          <div className="animate-fade-in" id="headmanViewBlock">
            <HeadmanSummary complaints={complaints} toast={showToastHandler} />
          </div>
        )}

      </main>

      {/* 4. THE 3-VIEW BOTTOM NAVIGATION TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2.5 px-4 shadow-xl z-40 no-print" id="bottomNavBar">
        <div className="max-w-md mx-auto flex justify-around items-center">
          
          {/* TAB 1: ร้องเรียน (Form Icon) */}
          <button
            onClick={() => setActiveTab('villager')}
            id="tab_villager_btn"
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'villager'
                ? 'text-[#0F766E] dark:text-teal-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'
            }`}
            style={{ minWidth: '72px', minHeight: '48px' }}
          >
            <FileText className={`w-5.5 h-5.5 mb-1 ${activeTab === 'villager' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-extrabold tracking-tight">ร้องเรียน</span>
          </button>

          {/* TAB 2: แดชบอร์ด (Chart/Admin Icon) */}
          <button
            onClick={() => setActiveTab('admin')}
            id="tab_admin_btn"
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-[#0F766E] dark:text-teal-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'
            }`}
            style={{ minWidth: '72px', minHeight: '48px' }}
          >
            <LayoutDashboard className={`w-5.5 h-5.5 mb-1 ${activeTab === 'admin' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-extrabold tracking-tight">แดชบอร์ด-กรรมการ</span>
          </button>

          {/* TAB 3: สรุป (Report/Headman Icon) */}
          <button
            onClick={() => setActiveTab('headman')}
            id="tab_headman_btn"
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'headman'
                ? 'text-[#0F766E] dark:text-teal-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-650'
            }`}
            style={{ minWidth: '72px', minHeight: '48px' }}
          >
            <Award className={`w-5.5 h-5.5 mb-1 ${activeTab === 'headman' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-[10px] font-extrabold tracking-tight">สรุป-ผู้ใหญ่บ้าน</span>
          </button>

        </div>
      </nav>

      {/* 5. TOAST NOTIFICATION CORNER PANEL */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 gap-2 flex flex-col max-w-sm pointer-events-none z-50 no-print" id="toastContainer_App">
        {toasts.map((t) => {
          let bg = 'bg-teal-800 text-white border-teal-700';
          if (t.type === 'error') bg = 'bg-rose-700 text-white border-rose-600';
          if (t.type === 'info') bg = 'bg-slate-800 text-white border-slate-700';

          return (
            <div
              key={t.id}
              className={`${bg} flex items-center p-3.5 px-4 rounded-xl shadow-lg border pointer-events-auto gap-2.5 max-w-[320px] transition-all duration-300 animate-slide-up leading-tight`}
              style={{ minHeight: '48px' }}
            >
              <span className="text-xs font-bold leading-snug">{t.msg}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
