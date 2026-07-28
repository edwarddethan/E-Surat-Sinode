import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Plus, 
  X, 
  Info, 
  Sparkles, 
  FileText, 
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { User, SuratMasuk, SuratKeluar, UserNotification, ManualReminder } from '../types';

interface NotificationCenterProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  currentUser: User;
  onNavigate: (tabId: string) => void;
  onSelectLetter?: (letter: SuratMasuk) => void;
}

export default function NotificationCenter({
  suratMasukList,
  suratKeluarList,
  currentUser,
  onNavigate,
  onSelectLetter
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [manualReminders, setManualReminders] = useState<ManualReminder[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [staffMemos, setStaffMemos] = useState<any[]>([]);
  
  // Custom reminder form state
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState('09:00');
  const [selectedSuratId, setSelectedSuratId] = useState('');

  // Storage keys
  const LOCAL_STORAGE_REMINDERS_KEY = `esurat_reminders_user_${currentUser.id}`;
  const LOCAL_STORAGE_READ_NOTIFS_KEY = `esurat_read_notifs_user_${currentUser.id}`;
  const LOCAL_STORAGE_DISMISSED_NOTIFS_KEY = `esurat_dismissed_notifs_user_${currentUser.id}`;

  // 1. Load manual reminders & read/dismissed states from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem(LOCAL_STORAGE_REMINDERS_KEY);
    if (savedReminders) {
      try {
        setManualReminders(JSON.parse(savedReminders));
      } catch (e) {
        console.error('Failed to parse reminders', e);
      }
    } else {
      setManualReminders([]);
    }

    const savedRead = localStorage.getItem(LOCAL_STORAGE_READ_NOTIFS_KEY);
    if (savedRead) {
      try { setReadIds(JSON.parse(savedRead)); } catch (e) {}
    } else {
      setReadIds([]);
    }

    const savedDismissed = localStorage.getItem(LOCAL_STORAGE_DISMISSED_NOTIFS_KEY);
    if (savedDismissed) {
      try { setDismissedIds(JSON.parse(savedDismissed)); } catch (e) {}
    } else {
      setDismissedIds([]);
    }
  }, [currentUser.id]);

  // Load and listen to staff memos
  useEffect(() => {
    const loadMemos = () => {
      const savedMemosStr = localStorage.getItem('esurat_staff_memos');
      if (savedMemosStr) {
        try {
          setStaffMemos(JSON.parse(savedMemosStr));
        } catch (e) {
          setStaffMemos([]);
        }
      } else {
        setStaffMemos([]);
      }
    };

    loadMemos();

    const handleStorageChange = () => {
      loadMemos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('staff_memos_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('staff_memos_updated', handleStorageChange);
    };
  }, []);

  // Save manual reminders helper
  const saveManualReminders = (items: ManualReminder[]) => {
    setManualReminders(items);
    localStorage.setItem(LOCAL_STORAGE_REMINDERS_KEY, JSON.stringify(items));
  };

  // 2. Compute live auto-generated notifications + trigger manual reminders
  useEffect(() => {
    const generated: UserNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date();

    // --- AUTO-GENERATION LOGIC BASED ON USER ROLE ---

    // A. For STAF: Disposisi alerts
    if (currentUser.role === 'STAF') {
      suratMasukList.forEach(sm => {
        if (sm.disposisi) {
          sm.disposisi.forEach(d => {
            if (d.penerimaId === currentUser.id) {
              const uniqueId = `auto-disp-${d.id}-${d.status}`;
              
              // 1. If status is BELUM_DIPROSES, show new disposition alert
              if (d.status === 'BELUM_DIPROSES') {
                generated.push({
                  id: `${uniqueId}-new`,
                  userId: currentUser.id,
                  title: 'Disposisi Baru Diterima 📥',
                  message: `Anda menerima disposisi baru perihal "${sm.perihal}". Instruksi: "${d.instruksi}"`,
                  type: 'DISPOSISI_BARU',
                  timestamp: d.tanggalDisposisi,
                  isRead: readIds.includes(`${uniqueId}-new`),
                  linkToTab: 'disposisi',
                  relatedId: sm.id
                });
              }

              // 2. Deadline alert (not completed yet)
              if (d.status !== 'SELESAI') {
                const deadlineDate = new Date(d.batasWaktu);
                const todayDate = new Date(todayStr);
                const diffTime = deadlineDate.getTime() - todayDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                  generated.push({
                    id: `${uniqueId}-overdue`,
                    userId: currentUser.id,
                    title: '⚠️ Disposisi Terlambat (Overdue)',
                    message: `Disposisi perihal "${sm.perihal}" telah melewati batas waktu (${d.batasWaktu}). Segera tindak lanjuti!`,
                    type: 'DISPOSISI_DEADLINE',
                    timestamp: d.batasWaktu,
                    isRead: readIds.includes(`${uniqueId}-overdue`),
                    linkToTab: 'disposisi',
                    relatedId: sm.id
                  });
                } else if (diffDays === 0) {
                  generated.push({
                    id: `${uniqueId}-today`,
                    userId: currentUser.id,
                    title: '⏰ Disposisi Jatuh Tempo Hari Ini!',
                    message: `Disposisi perihal "${sm.perihal}" harus diselesaikan hari ini.`,
                    type: 'DISPOSISI_DEADLINE',
                    timestamp: d.batasWaktu,
                    isRead: readIds.includes(`${uniqueId}-today`),
                    linkToTab: 'disposisi',
                    relatedId: sm.id
                  });
                } else if (diffDays <= 2) {
                  generated.push({
                    id: `${uniqueId}-warning`,
                    userId: currentUser.id,
                    title: '⏳ Batas Waktu Disposisi Mendekat',
                    message: `Disposisi perihal "${sm.perihal}" jatuh tempo dalam ${diffDays} hari (${d.batasWaktu}).`,
                    type: 'DISPOSISI_DEADLINE',
                    timestamp: d.batasWaktu,
                    isRead: readIds.includes(`${uniqueId}-warning`),
                    linkToTab: 'disposisi',
                    relatedId: sm.id
                  });
                }
              }
            }
          });
        }
      });
    }

    // B. For PIMPINAN: Letters awaiting disposition
    if (currentUser.role === 'PIMPINAN') {
      suratMasukList.forEach(sm => {
        const hasDisposisi = sm.disposisi && sm.disposisi.length > 0;
        if (!hasDisposisi) {
          const uniqueId = `auto-need-disp-${sm.id}`;
          generated.push({
            id: uniqueId,
            userId: currentUser.id,
            title: 'Surat Menunggu Disposisi ✉️',
            message: `Surat masuk dari "${sm.asalSurat}" perihal "${sm.perihal}" belum didisposisikan kepada staf.`,
            type: 'SURAT_MASUK_BARU',
            timestamp: sm.tanggalDiterima,
            isRead: readIds.includes(uniqueId),
            linkToTab: 'surat-masuk',
            relatedId: sm.id
          });
        }
      });
    }

    // C. For ADMIN / SEKRETARIS: Draft & Overview alerts
    if (currentUser.role === 'ADMIN') {
      // Unassigned letters overview
      suratMasukList.forEach(sm => {
        const hasDisposisi = sm.disposisi && sm.disposisi.length > 0;
        if (!hasDisposisi) {
          const uniqueId = `auto-admin-need-disp-${sm.id}`;
          generated.push({
            id: uniqueId,
            userId: currentUser.id,
            title: 'Saran Disposisi Pimpinan 📝',
            message: `Surat masuk dari "${sm.asalSurat}" perihal "${sm.perihal}" belum didelegasikan oleh Pimpinan.`,
            type: 'SURAT_MASUK_BARU',
            timestamp: sm.tanggalDiterima,
            isRead: readIds.includes(uniqueId),
            linkToTab: 'surat-masuk',
            relatedId: sm.id
          });
        }
      });

      // Draft letters alert
      suratKeluarList.forEach(sk => {
        if (sk.status === 'DRAFT') {
          const uniqueId = `auto-draft-${sk.id}`;
          generated.push({
            id: uniqueId,
            userId: currentUser.id,
            title: 'Draf Surat Keluar Siap Kirim 📑',
            message: `Surat Keluar tujuan "${sk.penerima}" perihal "${sk.perihal}" masih berstatus Draf.`,
            type: 'SURAT_KELUAR_BARU',
            timestamp: sk.tanggalSurat,
            isRead: readIds.includes(uniqueId),
            linkToTab: 'surat-keluar',
            relatedId: sk.id
          });
        }
      });
    }

    // D. PROCESS MANUAL REMINDERS
    // Trigger if today >= reminderDate
    manualReminders.forEach(rem => {
      const isPastOrToday = rem.reminderDate <= todayStr;
      if (isPastOrToday) {
        const uniqueId = `manual-rem-${rem.id}`;
        generated.push({
          id: uniqueId,
          userId: currentUser.id,
          title: '📌 Pengingat Jadwal / Agenda',
          message: rem.suratPerihal 
            ? `${rem.note} (Terkait Surat: "${rem.suratPerihal}" - No: ${rem.suratNo})` 
            : rem.note,
          type: 'PENGINGAT_MANUAL',
          timestamp: rem.reminderDate,
          isRead: readIds.includes(uniqueId),
          linkToTab: rem.suratId ? 'surat-masuk' : undefined,
          relatedId: rem.suratId
        });
      }
    });

    // E. PROCESS STAFF MEMOS
    staffMemos.forEach(memo => {
      const isRecipient = memo.recipientId === 'ALL' || memo.recipientId === currentUser.id;
      if (isRecipient) {
        const uniqueId = `memo-${memo.id}`;
        
        // Check if read
        const isMemoRead = memo.isReadBy?.includes(currentUser.id) || readIds.includes(uniqueId);
        
        generated.push({
          id: uniqueId,
          userId: currentUser.id,
          title: memo.priority === 'URGENT' ? '🚨 MEMO URGENT STAF' : memo.priority === 'PENTING' ? '⚠️ Memo Penting Staf' : '📢 Memo / Notifikasi Staf',
          message: `${memo.title}: "${memo.message}" (Dari: ${memo.senderName})`,
          type: memo.priority === 'URGENT' ? 'DISPOSISI_DEADLINE' : 'SURAT_MASUK_BARU',
          timestamp: memo.timestamp,
          isRead: isMemoRead,
          linkToTab: 'dashboard',
          relatedId: memo.id
        });
      }
    });

    // Filter out dismissed notifications
    const activeNotifications = generated.filter(notif => !dismissedIds.includes(notif.id));
    
    // Sort so unread and urgent items are on top, then by date descending
    activeNotifications.sort((a, b) => {
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return b.timestamp.localeCompare(a.timestamp);
    });

    setNotifications(activeNotifications);
  }, [suratMasukList, suratKeluarList, currentUser.id, manualReminders, readIds, dismissedIds, staffMemos]);

  // Check count of unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Toggle notification as read
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem(LOCAL_STORAGE_READ_NOTIFS_KEY, JSON.stringify(updated));
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    const updated = [...readIds, ...unreadIds];
    setReadIds(updated);
    localStorage.setItem(LOCAL_STORAGE_READ_NOTIFS_KEY, JSON.stringify(updated));
  };

  // Dismiss / Delete a single notification
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dismissedIds.includes(id)) {
      const updated = [...dismissedIds, id];
      setDismissedIds(updated);
      localStorage.setItem(LOCAL_STORAGE_DISMISSED_NOTIFS_KEY, JSON.stringify(updated));
    }
  };

  // Clear all notifications (dismisses all current active ones)
  const handleClearAll = () => {
    const currentActiveIds = notifications.map(n => n.id);
    const updated = [...dismissedIds, ...currentActiveIds];
    setDismissedIds(updated);
    localStorage.setItem(LOCAL_STORAGE_DISMISSED_NOTIFS_KEY, JSON.stringify(updated));
  };

  // Create custom reminder
  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderNote.trim()) {
      alert('Tulis catatan pengingat terlebih dahulu!');
      return;
    }

    const relatedSurat = suratMasukList.find(s => s.id === selectedSuratId);

    const newReminder: ManualReminder = {
      id: `rem-${Date.now()}`,
      userId: currentUser.id,
      suratId: relatedSurat?.id,
      suratNo: relatedSurat?.noSurat,
      suratPerihal: relatedSurat?.perihal,
      note: reminderNote,
      reminderDate: reminderDate,
      reminderTime: reminderTime,
      createdAt: new Date().toISOString(),
      isTriggered: false
    };

    saveManualReminders([newReminder, ...manualReminders]);
    setReminderNote('');
    setSelectedSuratId('');
    setShowAddReminder(false);
    alert('Pengingat kustom berhasil dijadwalkan secara permanen!');
  };

  // Delete manual reminder from history list
  const handleDeleteReminder = (id: string) => {
    const updated = manualReminders.filter(r => r.id !== id);
    saveManualReminders(updated);
  };

  // Handle click on notification (marks read and navigates)
  const handleNotificationClick = (notif: UserNotification) => {
    handleMarkAsRead(notif.id);
    setIsOpen(false);
    
    if (notif.id.startsWith('memo-')) {
      const memoId = notif.id.replace('memo-', '');
      const savedMemosStr = localStorage.getItem('esurat_staff_memos');
      if (savedMemosStr) {
        try {
          const memos = JSON.parse(savedMemosStr);
          const updated = memos.map((m: any) => {
            if (m.id === memoId) {
              const reads = m.isReadBy || [];
              if (!reads.includes(currentUser.id)) {
                return { ...m, isReadBy: [...reads, currentUser.id] };
              }
            }
            return m;
          });
          localStorage.setItem('esurat_staff_memos', JSON.stringify(updated));
          window.dispatchEvent(new Event('staff_memos_updated'));
        } catch (e) {}
      }
    }
    
    if (notif.linkToTab) {
      onNavigate(notif.linkToTab);
      
      // If there is a focus/select handler and a related letter
      if (notif.relatedId && onSelectLetter) {
        const matchedSurat = suratMasukList.find(s => s.id === notif.relatedId);
        if (matchedSurat) {
          setTimeout(() => {
            onSelectLetter(matchedSurat);
          }, 100);
        }
      }
    }
  };

  return (
    <div className="relative inline-block" id="notification-bell-container">
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200 rounded-full cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 flex items-center justify-center group"
        id="notification-bell-btn"
        title="Buka Pusat Pengingat & Notifikasi"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-bounce text-indigo-600' : 'text-slate-500'}`} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN OVERLAY PANEL */}
      {isOpen && (
        <>
          {/* Transparent clickaway shield */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-[350px] sm:w-[420px] bg-white rounded-2xl border border-slate-200/95 shadow-xl z-50 overflow-hidden transform origin-top-right transition-all animate-fade-in divide-y divide-slate-100">
            
            {/* Header */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 text-indigo-700 p-1.5 rounded-lg">
                  <Bell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Notifikasi & Pengingat</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Pengingat pintar untuk tugas persuratan Anda</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Tandai semua dibaca"
                  >
                    <CheckCheck className="h-4.5 w-4.5" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Hapus semua"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Quick action: Create reminder */}
            <div className="p-2.5 bg-indigo-50/50 flex items-center justify-between px-4">
              <span className="text-[10px] text-indigo-900 font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                Atur jadwal pengingat kerja Anda sendiri
              </span>
              <button
                onClick={() => setShowAddReminder(!showAddReminder)}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                {showAddReminder ? 'Tutup Form' : 'Buat Pengingat'}
              </button>
            </div>

            {/* ADD REMINDER FORM CONTAINER */}
            {showAddReminder && (
              <form onSubmit={handleAddCustomReminder} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 animate-slide-down">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-indigo-500" /> Pengingat Agenda Baru
                </h4>
                
                {/* Note Field */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Catatan Tugas / Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder="Contoh: Menghadiri rapat koordinasi dengan humas..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Associate Letter Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Hubungkan dengan Surat Masuk (Opsional)</label>
                  <select
                    value={selectedSuratId}
                    onChange={(e) => setSelectedSuratId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Tidak dihubungkan --</option>
                    {suratMasukList.map(sm => (
                      <option key={sm.id} value={sm.id}>
                        [{sm.noSurat.split('/')[0]}] {sm.perihal.substring(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Tanggal Diingatkan</label>
                    <input
                      type="date"
                      required
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Waktu</label>
                    <input
                      type="time"
                      required
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  Simpan Pengingat Permanen
                </button>
              </form>
            )}

            {/* NOTIFICATION LIST BODY */}
            <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100" id="notification-items-list">
              {notifications.length === 0 ? (
                <div className="py-12 px-6 text-center text-slate-400">
                  <Clock className="h-9 w-9 text-slate-300 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-700">Tidak ada notifikasi aktif</p>
                  <p className="text-[10px] text-slate-400 mt-1">Anda sudah memproses semua surat dan disposisi.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-slate-50/80 transition-all duration-150 cursor-pointer flex items-start gap-3 relative border-l-4 ${
                        notif.isRead ? 'border-l-transparent opacity-75' : 'border-l-indigo-600 bg-indigo-50/15'
                      }`}
                    >
                      {/* Icon category */}
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'DISPOSISI_DEADLINE' ? (
                          <div className="p-2 bg-red-50 text-red-600 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                        ) : notif.type === 'DISPOSISI_BARU' ? (
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
                            <Clock className="h-4 w-4" />
                          </div>
                        ) : notif.type === 'PENGINGAT_MANUAL' ? (
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                        ) : notif.type === 'SURAT_MASUK_BARU' ? (
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                            <FileText className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                            <Mail className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[11px] text-slate-800 truncate block">
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium mt-0.5 break-words">
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[8px] text-slate-400 font-mono block">
                            📅 {notif.timestamp}
                          </span>
                          {notif.linkToTab && (
                            <span className="text-[8px] font-extrabold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded tracking-wide">
                              Buka {notif.linkToTab.replace('-', ' ')} →
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action controllers */}
                      <div className="flex flex-col gap-1 shrink-0 ml-1">
                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-all"
                            title="Tandai dibaca"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDismiss(notif.id, e)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-red-500 transition-all"
                          title="Hapus"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* List of custom manual reminders saved permanently */}
            {manualReminders.length > 0 && (
              <div className="p-3.5 bg-slate-50 border-t border-slate-100">
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Daftar Agenda Kustom Aktif ({manualReminders.length})
                </h4>
                <div className="space-y-2 max-h-[140px] overflow-y-auto">
                  {manualReminders.map(rem => (
                    <div key={rem.id} className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] flex items-center justify-between shadow-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-700 block truncate">{rem.note}</span>
                        <span className="text-[8px] text-slate-400 block mt-0.5">
                          🗓️ {rem.reminderDate} {rem.reminderTime ? `· ⏰ ${rem.reminderTime}` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-slate-100 rounded transition-colors shrink-0"
                        title="Hapus pengingat kustom"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-3 bg-slate-50 text-center text-[10px] text-slate-400">
              <span>Sistem Pengingat Administrasi Otomatis Sinode GMIT</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
