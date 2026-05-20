import React, { useState } from 'react';
import { Complaint, CategoryType, StatusType, CATEGORIES, STATUSES } from '../types';
import { 
  Lock, CheckCircle, Clock, Wrench, XCircle, Layers, Filter, Eye, Search, LogOut, Check, X, ShieldAlert, Calendar, MapPin, User, Phone, CheckCircle2 
} from 'lucide-react';

interface AdminPanelProps {
  complaints: Complaint[];
  onUpdateComplaintStatus: (id: string, newStatus: StatusType, notes?: string) => void;
  onApproveFlaggedComplaint: (id: string) => void;
  onRejectFlaggedComplaint: (id: string) => void;
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminPanel({
  complaints,
  onUpdateComplaintStatus,
  onApproveFlaggedComplaint,
  onRejectFlaggedComplaint,
  toast,
}: AdminPanelProps) {
  // Authentication states
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });

  // Filter and view states
  const [activeTab, setActiveTab] = useState<'all' | 'flagged'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal detail display
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState<StatusType>('pending');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      toast('ยินดีต้อนรับคณะกรรมการหมู่บ้าน!', 'success');
      setPin('');
    } else {
      toast('รหัสผ่าน PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง (ทดสอบใช้งานใช้ PIN: 1234)', 'error');
      setPin('');
    }
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    toast('ออกจากระบบผู้ดูแลเรียบร้อยแล้ว', 'info');
  };

  const handlePinCodeInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  // KPI Calculations
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in-progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const flaggedCount = complaints.filter(c => c.status === 'flagged').length;

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    // Hidden flagged from general tab unless selected
    if (activeTab === 'all' && c.status === 'flagged') return false;
    if (activeTab === 'flagged' && c.status !== 'flagged') return false;

    // Search term check
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter Check
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    // Status filter check (only applicable in general list)
    const matchesStatus = activeTab === 'flagged' || statusFilter === 'all' || c.status === statusFilter;

    // Date range filter Check
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && c.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && c.date <= endDate;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Category counts representation for bar graph
  const cats: { key: CategoryType; label: string; color: string }[] = [
    { key: 'road', label: 'ถนน/เท้า', color: '#0F766E' },
    { key: 'electricity', label: 'ไฟฟ้า', color: '#D97706' },
    { key: 'water', label: 'น้ำประปา', color: '#2563EB' },
    { key: 'waste', label: 'ขยะฝอย', color: '#10B981' },
    { key: 'security', label: 'ความปลอดภัย', color: '#7C3AED' },
    { key: 'other', label: 'อื่นๆ', color: '#64748B' },
  ];

  const catGraphData = cats.map(cat => {
    const count = complaints.filter(c => c.category === cat.key).length;
    return { ...cat, count };
  });

  const maxCount = Math.max(...catGraphData.map(d => d.count), 1);

  // Modal actions
  const openDetailModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setAdminNote(comp.adminNotes || '');
    setUpdateStatus(comp.status);
  };

  const closeDetailModal = () => {
    setSelectedComplaint(null);
  };

  const handleUpdateStatusAndNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedComplaint) {
      onUpdateComplaintStatus(selectedComplaint.id, updateStatus, adminNote.trim());
      closeDetailModal();
    }
  };

  const getStatusLabelText = (st: StatusType) => {
    return STATUSES[st]?.label || st;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in" id="adminLoginCard">
        <div className="bg-[#0F766E] text-white p-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold">แผงควบคุมคณะกรรมการหมู่บ้าน</h2>
          <p className="text-xs text-teal-100/90 mt-1">กรุณาระบุรหัส PIN 4 หลักเพื่อเข้าสู่ระบบการทำงาน</p>
        </div>

        <form onSubmit={handlePinSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <input
              type="password"
              value={pin}
              readOnly
              className="w-48 tracking-[1em] text-center text-2xl font-black py-2.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-[#0F766E]"
              placeholder="••••"
            />
            <span className="block text-[11px] text-slate-400 mt-2">PIN สาธิตสำหรับคณะกรรมการคือ: <strong className="text-amber-600 font-bold font-mono">1234</strong></span>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                id={`admin_pin_btn_${num}`}
                onClick={() => handlePinCodeInput(num)}
                className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              id="admin_pin_btn_clear"
              onClick={() => setPin('')}
              className="h-12 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center"
            >
              ล้าง
            </button>
            <button
              type="button"
              id="admin_pin_btn_0"
              onClick={() => handlePinCodeInput('0')}
              className="h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              type="submit"
              id="admin_pin_btn_submit"
              className="h-12 bg-[#0F766E] hover:bg-teal-850 text-white rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center"
            >
              ตกลง
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-full uppercase inline-block mb-1.5 shadow-sm">
            บทบาท: ผู้ประสานงานสภาแสนสุข (Admin Mode)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            ระบบบริหารจัดการปัญหาชาวแสนสุข หมู่ 4
          </h3>
          <p className="text-xs text-slate-400 mt-1">ใช้ตรวจสอบประเด็นวิเคราะห์ความเดือดร้อน จัดสรรขบวนการแก้คดี และตรวจสอบความสุภาพข้อมูลแจ้งเบาะแส</p>
        </div>
        
        <button
          onClick={logoutAdmin}
          id="logoutAdminBtn"
          className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 dark:bg-slate-850 dark:border-rose-950 dark:hover:bg-rose-950/20 dark:text-rose-400 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
          style={{ minHeight: '44px' }}
        >
          <LogOut className="w-4 h-4" /> ออกจากระบบแอดมิน
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">เรื่องทั้งหมด</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">รอดำเนินการ</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">{pendingCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">กำลังแก้ไข</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-300">{inProgressCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">แก้ไขแล้ว</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{resolvedCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-orange-500 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">ต้องสงสัย (Moderation)</span>
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">{flaggedCount}</span>
            <span className="text-[10px] text-slate-400 ml-1">เรื่องรอคิว</span>
          </div>
        </div>
      </div>

      {/* MULTI-TAB SWITCHER COMPONENT */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
          className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'border-[#0F766E] text-[#0F766E] dark:text-teal-400 bg-teal-50/10'
              : 'border-transparent text-slate-500 hover:text-slate-705 dark:hover:text-slate-300 hover:bg-slate-100/50'
          }`}
          style={{ minHeight: '44px' }}
          id="admin_all_tab"
        >
          <Layers className="w-4 h-4" />
          รายการร้องเรียนปกติ
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'flagged'
              ? 'border-orange-505 border-b-orange-600 text-orange-600 dark:text-orange-400 bg-orange-50/10'
              : 'border-transparent text-slate-500 hover:text-slate-705 dark:hover:text-slate-300 hover:bg-slate-105/50'
          }`}
          style={{ minHeight: '44px' }}
          id="admin_flagged_tab"
        >
          <ShieldAlert className="w-4 h-4" />
          เนื้อหาต้องสงสัย / ตรวจจับ AI
          {flaggedCount > 0 && (
            <span className="ml-1 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {flaggedCount}
            </span>
          )}
        </button>
      </div>

      {/* GRAPHS AND CONTROLS SPLIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: STYLISH CATEGORY BAR CHART (7 Units) */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
            📊 จำนวนเรื่องตามหมวดหมู่ปัญหาทั้งหมด (รายงานเปรียบเทียบ)
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
            {catGraphData.map((data, idx) => {
              const pct = (data.count / maxCount) * 100;
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between items-center text-center">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">{data.label}</span>
                  
                  {/* Custom Minimalist Visual Scale Bar */}
                  <div className="w-12 h-24 bg-slate-200 dark:bg-slate-800/80 rounded-b-lg relative overflow-hidden flex items-end">
                    <div 
                      className="w-full rounded-b-lg transition-all duration-1000" 
                      style={{ 
                        height: `${pct}%`, 
                        backgroundColor: data.color,
                        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)'
                      }}
                    ></div>
                  </div>

                  <div className="mt-2">
                    <span className="text-lg font-black block" style={{ color: data.color }}>{data.count}</span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">เรื่อง</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FEED AND COMPLAINT LIST (12 Units) */}
        <div className="lg:col-span-12 space-y-4">
          
          {/* BAR ROW FILTERING AND SEARCHING */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
            <span className="text-xs font-bold text-slate-400 block">ตัวเลือกตัวกรองค้นหา คดีร้องทุกข์แสนสุข:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              
              {/* Search text */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  id="adminSearchInput"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาตามชื่อ, รหัส, สถานที่ หรืออาการ..."
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  style={{ minHeight: '44px' }}
                />
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-2.5 relative">
                <select
                  value={categoryFilter}
                  id="adminCategoryFilter"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  style={{ minHeight: '44px' }}
                >
                  <option value="all">ทุกหมวดทุกเหตุ</option>
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter (only active in ALL Tab) */}
              {activeTab === 'all' && (
                <div className="sm:col-span-2 relative">
                  <select
                    value={statusFilter}
                    id="adminStatusFilter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-505"
                    style={{ minHeight: '44px' }}
                  >
                    <option value="all">ทุกระดับสถานะ</option>
                    {Object.entries(STATUSES).filter(([k]) => k !== 'flagged').map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filters Range */}
              <div className={`grid grid-cols-2 gap-2 h-11 ${activeTab === 'all' ? 'sm:col-span-3.5' : 'sm:col-span-5.5'}`}>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-705 px-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 mr-1 shrink-0">เริ่ม:</span>
                  <input
                    type="date"
                    value={startDate}
                    id="adminStartDate"
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-[10px] bg-transparent text-slate-800 dark:text-white focus:outline-none w-full"
                  />
                </div>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-705 px-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 mr-1 shrink-0">สิ้นสุด:</span>
                  <input
                    type="date"
                    value={endDate}
                    id="adminEndDate"
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-[10px] bg-transparent text-slate-800 dark:text-white focus:outline-none w-full"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* LIST CONTAINER FEED */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-450">
                <XCircle className="w-12 h-12 text-slate-320 mx-auto mb-3" />
                <span className="font-bold text-sm block text-slate-700 dark:text-slate-300">ไม่พบเรื่องร้องเรียนที่ตรงกับเงื่อนไขการกรอง</span>
                <p className="text-xs text-slate-400 mt-1">ท่านสามารถปรับเปลี่ยนคำค้นหรือหมวดเกณฑ์การคัดเลือก เพื่อแสดงประเด็นหมู่บ้านอื่นๆ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredComplaints.map((comp) => {
                  const cat = CATEGORIES[comp.category] || CATEGORIES.other;
                  const st = STATUSES[comp.status] || STATUSES.pending;
                  
                  return (
                    <div 
                      key={comp.id}
                      id={`complaintCard_${comp.id}`}
                      onClick={() => openDetailModal(comp)}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between cursor-pointer border-t-4 border-t-[#0F766E] duration-200 active:scale-[0.98]"
                    >
                      {/* Badge Top Info */}
                      <div>
                        <div className="h-44 bg-slate-105 dark:bg-slate-950 relative overflow-hidden">
                          <img
                            src={comp.photo}
                            alt="Damage Location"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest font-mono">
                            {comp.id}
                          </span>
                          
                          <div className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}>
                            {st.label}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex gap-2.5 items-center">
                            <span className={`inline-block text-[10px] font-bold px-2.5 py-1.5 rounded-full ${cat.bg} ${cat.text}`}>
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5" /> {comp.date}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                            {comp.title}
                          </h5>
                          
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed h-8">
                            {comp.description}
                          </p>

                          <div className="text-[11px] font-bold text-slate-450 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                            <span className="truncate">{comp.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Flag Details for Suspicious Tabs */}
                      {comp.status === 'flagged' && (
                        <div className="px-4 pb-2 border-t border-slate-100 dark:border-slate-800/80 pt-2 bg-orange-50/20">
                          <span className="text-[10px] font-black text-orange-700 block mb-0.5">⚠️ เหตุผลที่ถ้อยคำต้องสงสัย:</span>
                          <p className="text-[10px] text-orange-600 truncate">{comp.flagReasons?.join(', ')}</p>
                          
                          {/* QUICK ACTION BUTTONS IN CARD FOOTER FOR MODERATION QUEUE */}
                          <div className="grid grid-cols-2 gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                onApproveFlaggedComplaint(comp.id);
                                toast(`อนุมัติเรื่อง ${comp.id} คืนสู่สารบบปกติเรียบร้อย`, 'success');
                              }}
                              id={`approve_flagged_btn_${comp.id}`}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all"
                              style={{ minHeight: '32px' }}
                            >
                              <Check className="w-3.5 h-3.5" /> อนุมัติการแจ้ง
                            </button>
                            <button
                              onClick={() => {
                                onRejectFlaggedComplaint(comp.id);
                                toast(`ปฏิเสธข้อร้องเรียน ${comp.id} ออกจากระบบแล้ว`, 'error');
                              }}
                              id={`reject_flagged_btn_${comp.id}`}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all"
                              style={{ minHeight: '32px' }}
                            >
                              <X className="w-3.5 h-3.5" /> ปฏิเสธความจริง
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* DETAIL AND STATUS UPDATE MODAL COMPONENT */}
      {selectedComplaint && (
        <div id="complaintDetailModal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-fade-in text-left">
            <div className="bg-[#0F766E] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-2 bg-white/10 rounded-full block w-fit mb-1 leading-tight">
                  เลขรับร้องเรียน: {selectedComplaint.id}
                </span>
                <h4 className="font-extrabold text-base">รายละเอียดและสถานะความคืบหน้าคดี</h4>
              </div>
              <button 
                onClick={closeDetailModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition-all"
                style={{ minHeight: '32px' }}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Photo Large Display */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 bg-slate-105">
                <img
                  src={selectedComplaint.photo}
                  alt="Damage Large Reference"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informer identification info blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#0F766E]" /> ผู้แจ้งเหตุประชากร:
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedComplaint.isAnonymous ? 'ไม่ระบุชื่อ (ผู้แจ้งประสงค์ปกปิดตัวตน 🤫)' : selectedComplaint.informerName}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#0F766E]" /> ข้อมูลเบอร์ติดต่อกลับ:
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {selectedComplaint.isAnonymous ? 'ความลับความปลอดภัย' : selectedComplaint.informerPhone}
                  </span>
                </div>
              </div>

              {/* Title, Category and Status Details */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORIES[selectedComplaint.category]?.bg} ${CATEGORIES[selectedComplaint.category]?.text}`}>
                    {CATEGORIES[selectedComplaint.category]?.label}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUSES[selectedComplaint.status]?.bg} ${STATUSES[selectedComplaint.status]?.text}`}>
                    {getStatusLabelText(selectedComplaint.status)}
                  </span>
                  <span className="text-xs text-slate-400 font-bold ml-1 flex items-center gap-1">
                    📅 รับเรื่องเมื่อ: {selectedComplaint.date}
                  </span>
                </div>

                <h5 className="text-lg font-black text-[#0F766E] dark:text-teal-400">
                  {selectedComplaint.title}
                </h5>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase block mb-1">คำอธิบายเหตุความเดือดร้อน:</span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="bg-orange-50/40 dark:bg-orange-950/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/40 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                    <strong>สถานที่:</strong> {selectedComplaint.location}
                  </span>
                </div>
              </div>

              {/* UPDATE STATUS ACTION FORM */}
              <form onSubmit={handleUpdateStatusAndNotes} className="bg-[#0F766E]/5 dark:bg-teal-950/20 p-5 rounded-2xl border border-[#0F766E]/20 space-y-4">
                <span className="font-extrabold text-xs text-[#0F766E] dark:text-teal-400 block border-b border-[#0F766E]/10 pb-2 flex items-center gap-1">
                  <Wrench className="w-4 h-4" /> บันทึกและปรับปรุงสถานะ (สำหรับคณะกรรมการ):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select status */}
                  <div>
                    <label htmlFor="update_status_sel" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      ปรับเปลี่ยนสเตตัสความคืบหน้า:
                    </label>
                    <select
                      id="update_status_sel"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value as StatusType)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-705 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-teal-500"
                      style={{ minHeight: '40px' }}
                    >
                      <option value="pending">รอดำเนินการ (Pending)</option>
                      <option value="in-progress">กำลังดำเนินการ (In-Progress)</option>
                      <option value="resolved">แก้ไขสัมฤทธิ์ผล (Resolved)</option>
                      <option value="rejected">ปัดคำร้องสิทธิ์/ตีกลับ (Rejected)</option>
                    </select>
                  </div>
                  
                  {/* Notes text info */}
                  <div className="sm:col-span-2">
                    <label htmlFor="admin_note_area" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                      รายละเอียดบันทึกการปรับปรุงบำรุง (เช่น วันที่แล้วเสร็จ, นามคณะช่างซ่อม):
                    </label>
                    <textarea
                      id="admin_note_area"
                      rows={2.5}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="เขียนระบุรายละเอียดความร่วมมือ เช่น โยธาท้องถิ่นเสร็จภารกิจวันที่ 25 มกราคม เป็นต้น..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-705 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="px-4 py-2 bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-extrabold rounded-lg transition-all"
                    style={{ minHeight: '36px' }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    id="save_admin_update_btn"
                    className="px-5 py-2 bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-extrabold rounded-lg transition-all shadow-sm"
                    style={{ minHeight: '36px' }}
                  >
                    บันทึกอัปเดตสถานะ
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
