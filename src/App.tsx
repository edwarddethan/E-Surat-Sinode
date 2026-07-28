import React, { useState, useEffect } from 'react';
import { 
  User, 
  UserRole,
  SuratMasuk, 
  SuratKeluar, 
  Disposisi, 
  StatusSuratKeluar, 
  StatusTindakLanjut,
  STAFF_LIST,
  MenuPermission 
} from './types';
import { 
  INITIAL_SURAT_MASUK, 
  INITIAL_SURAT_KELUAR,
  INITIAL_MENU_PERMISSIONS 
} from './data';
import Dashboard from './components/Dashboard';
import SuratMasukList from './components/SuratMasukList';
import SuratKeluarList from './components/SuratKeluarList';
import DisposisiList from './components/DisposisiList';
import Login from './components/Login';
import UserList from './components/UserList';
import GoogleDriveManager from './components/GoogleDriveManager';
import GmitLogo from './components/GmitLogo';
import NotificationCenter from './components/NotificationCenter';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  ClipboardList, 
  Menu, 
  X, 
  Building, 
  Clock, 
  FileCheck,
  Award,
  ChevronRight,
  ShieldAlert,
  LogOut,
  Users,
  Edit3,
  UserCheck,
  Check,
  Key,
  HardDrive
} from 'lucide-react';

const LOCAL_STORAGE_KEY_MASUK = 'esurat_data_masuk_v1';
const LOCAL_STORAGE_KEY_KELUAR = 'esurat_data_keluar_v1';
const LOCAL_STORAGE_KEY_USER = 'esurat_active_user_v1';
const LOCAL_STORAGE_KEY_AUTH = 'esurat_is_logged_in_v1';
const LOCAL_STORAGE_KEY_USERS = 'esurat_data_users_v1';
const LOCAL_STORAGE_KEY_PERMISSIONS = 'esurat_menu_permissions_v1';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data States
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(STAFF_LIST[0]); // Default: Pdt. Edward Syistha Dethan, M.Th. (Admin)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // External trigger for disposition creation
  const [selectedLetterForDisposisi, setSelectedLetterForDisposisi] = useState<SuratMasuk | null>(null);
  
  // Mobile address expansion state for Kop banner
  const [showFullAddressMobile, setShowFullAddressMobile] = useState(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileTitle, setEditProfileTitle] = useState('');
  const [editProfileUsername, setEditProfileUsername] = useState('');
  const [editProfileNip, setEditProfileNip] = useState('');
  const [editProfilePassword, setEditProfilePassword] = useState('');
  const [editProfileRole, setEditProfileRole] = useState<UserRole>('ADMIN');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  const handleOpenProfileModal = () => {
    setEditProfileName(currentUser.name || '');
    setEditProfileTitle(currentUser.title || currentUser.jabatan || '');
    setEditProfileUsername(currentUser.username || '');
    setEditProfileNip(currentUser.nip || '');
    setEditProfilePassword(currentUser.password || '');
    setEditProfileRole(currentUser.role || 'ADMIN');
    setProfileSuccessMsg(null);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileName.trim() || !editProfileTitle.trim() || !editProfileUsername.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      name: editProfileName.trim(),
      title: editProfileTitle.trim(),
      username: editProfileUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      nip: editProfileNip.trim(),
      password: editProfilePassword.trim() || currentUser.password || 'password123',
      role: editProfileRole,
    };

    handleUpdateUser(updatedUser);
    setProfileSuccessMsg('Nama, role, dan profil Anda berhasil disimpan secara permanen!');
    setTimeout(() => {
      setProfileSuccessMsg(null);
      setIsProfileModalOpen(false);
    }, 1200);
  };

  // 1. Initial State Loading
  useEffect(() => {
    // Load Authentication State
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    if (savedAuth === 'true') {
      setIsLoggedIn(true);
    }

    // Load Surat Masuk
    const savedMasuk = localStorage.getItem(LOCAL_STORAGE_KEY_MASUK);
    if (savedMasuk) {
      try {
        const parsedMasuk: SuratMasuk[] = JSON.parse(savedMasuk);
        setSuratMasuk(parsedMasuk);
      } catch (e) {
        setSuratMasuk(INITIAL_SURAT_MASUK);
        localStorage.setItem(LOCAL_STORAGE_KEY_MASUK, JSON.stringify(INITIAL_SURAT_MASUK));
      }
    } else {
      setSuratMasuk(INITIAL_SURAT_MASUK);
      localStorage.setItem(LOCAL_STORAGE_KEY_MASUK, JSON.stringify(INITIAL_SURAT_MASUK));
    }

    // Load Surat Keluar
    const savedKeluar = localStorage.getItem(LOCAL_STORAGE_KEY_KELUAR);
    if (savedKeluar) {
      try {
        const parsedKeluar: SuratKeluar[] = JSON.parse(savedKeluar);
        setSuratKeluar(parsedKeluar);
      } catch (e) {
        setSuratKeluar(INITIAL_SURAT_KELUAR);
        localStorage.setItem(LOCAL_STORAGE_KEY_KELUAR, JSON.stringify(INITIAL_SURAT_KELUAR));
      }
    } else {
      setSuratKeluar(INITIAL_SURAT_KELUAR);
      localStorage.setItem(LOCAL_STORAGE_KEY_KELUAR, JSON.stringify(INITIAL_SURAT_KELUAR));
    }

    // Load Users
    const savedUsers = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    let loadedUsers = STAFF_LIST;
    if (savedUsers) {
      try {
        const parsed: User[] = JSON.parse(savedUsers);
        loadedUsers = parsed;
        setUsers(loadedUsers);
      } catch (e) {
        setUsers(STAFF_LIST);
        localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(STAFF_LIST));
      }
    } else {
      setUsers(STAFF_LIST);
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(STAFF_LIST));
    }

    // Load Menu Permissions
    const savedPermissions = localStorage.getItem(LOCAL_STORAGE_KEY_PERMISSIONS);
    if (savedPermissions) {
      try {
        setMenuPermissions(JSON.parse(savedPermissions));
      } catch (e) {
        setMenuPermissions(INITIAL_MENU_PERMISSIONS);
      }
    } else {
      setMenuPermissions(INITIAL_MENU_PERMISSIONS);
      localStorage.setItem(LOCAL_STORAGE_KEY_PERMISSIONS, JSON.stringify(INITIAL_MENU_PERMISSIONS));
    }

    // Load Active User
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const match = loadedUsers.find(s => s.id === parsed.id);
        if (match) {
          setCurrentUser(match);
        } else {
          setCurrentUser(loadedUsers[0] || STAFF_LIST[0]);
        }
      } catch (e) {
        setCurrentUser(loadedUsers[0] || STAFF_LIST[0]);
      }
    } else {
      setCurrentUser(loadedUsers[0] || STAFF_LIST[0]);
    }
  }, []);

  // Redirect if current tab is no longer permitted
  useEffect(() => {
    if (isLoggedIn && menuPermissions.length > 0) {
      const currentPerm = menuPermissions.find(p => p.menuId === activeTab);
      if (currentPerm && !currentPerm.roles.includes(currentUser.role)) {
        // Find first accessible tab
        const firstAccessible = menuPermissions.find(p => p.roles.includes(currentUser.role));
        if (firstAccessible) {
          setActiveTab(firstAccessible.menuId);
        } else {
          setActiveTab('dashboard'); // fallback
        }
      }
    }
  }, [currentUser.role, activeTab, menuPermissions, isLoggedIn]);

  const hasMenuAccess = (menuId: string): boolean => {
    const permission = menuPermissions.find(p => p.menuId === menuId);
    if (!permission) return true; // default to allow if not defined
    return permission.roles.includes(currentUser.role);
  };

  // 2. State Saving on Change
  const saveSuratMasuk = (data: SuratMasuk[]) => {
    setSuratMasuk(data);
    localStorage.setItem(LOCAL_STORAGE_KEY_MASUK, JSON.stringify(data));
  };

  const saveSuratKeluar = (data: SuratKeluar[]) => {
    setSuratKeluar(data);
    localStorage.setItem(LOCAL_STORAGE_KEY_KELUAR, JSON.stringify(data));
  };

  const saveMenuPermissions = (data: MenuPermission[]) => {
    setMenuPermissions(data);
    localStorage.setItem(LOCAL_STORAGE_KEY_PERMISSIONS, JSON.stringify(data));
  };

  const saveUsers = (data: User[]) => {
    setUsers(data);
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(data));
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
  };

  const handleLoginSuccess = (user: User) => {
    setIsLoggedIn(true);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, 'true');
    handleUserChange(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, 'false');
    setActiveTab('dashboard');
  };

  const handleAddUser = (newUser: User) => {
    const updated = [...users, newUser];
    saveUsers(updated);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(updated);
    if (updatedUser.id === currentUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
  };

  // 3. Operations
  // Add new Incoming letter
  const handleAddSuratMasuk = (newSurat: SuratMasuk) => {
    const updated = [newSurat, ...suratMasuk];
    saveSuratMasuk(updated);
  };

  // Update Incoming letter (e.g. upload / change file)
  const handleUpdateSuratMasuk = (updatedSurat: SuratMasuk) => {
    const updated = suratMasuk.map(sm => sm.id === updatedSurat.id ? updatedSurat : sm);
    saveSuratMasuk(updated);
  };

  // Delete Incoming letter
  const handleDeleteSuratMasuk = (id: string) => {
    const updated = suratMasuk.filter(sm => sm.id !== id);
    saveSuratMasuk(updated);
  };

  // Add new Outgoing letter
  const handleAddSuratKeluar = (newSurat: SuratKeluar) => {
    const updated = [newSurat, ...suratKeluar];
    saveSuratKeluar(updated);
  };

  // Update Outgoing letter
  const handleUpdateSuratKeluar = (updatedSurat: SuratKeluar) => {
    const updated = suratKeluar.map(sk => sk.id === updatedSurat.id ? updatedSurat : sk);
    saveSuratKeluar(updated);
  };

  // Delete Outgoing letter
  const handleDeleteSuratKeluar = (id: string) => {
    const updated = suratKeluar.filter(sk => sk.id !== id);
    saveSuratKeluar(updated);
  };

  // Update Outgoing letter status
  const handleUpdateStatusSuratKeluar = (suratId: string, status: StatusSuratKeluar) => {
    const updated = suratKeluar.map(sk => {
      if (sk.id === suratId) {
        return {
          ...sk,
          status,
          tanggalDikirim: status === 'DIKIRIM' ? new Date().toISOString().split('T')[0] : sk.tanggalDikirim
        };
      }
      return sk;
    });
    saveSuratKeluar(updated);
  };

  // Add Disposition to Incoming Letter
  const handleAddDisposisi = (suratId: string, disposisi: Disposisi) => {
    const updated = suratMasuk.map(sm => {
      if (sm.id === suratId) {
        return {
          ...sm,
          disposisi: [...(sm.disposisi || []), disposisi]
        };
      }
      return sm;
    });
    saveSuratMasuk(updated);
  };

  // Update Disposition progress (for Staf/Kabid)
  const handleUpdateDisposisiStatus = (
    suratId: string, 
    disposisiId: string, 
    status: StatusTindakLanjut, 
    catatan?: string
  ) => {
    const updated = suratMasuk.map(sm => {
      if (sm.id === suratId && sm.disposisi) {
        const updatedDisposisi = sm.disposisi.map(disp => {
          if (disp.id === disposisiId) {
            return {
              ...disp,
              status,
              catatanTindakLanjut: catatan || disp.catatanTindakLanjut,
              tanggalSelesai: status === 'SELESAI' ? new Date().toISOString().split('T')[0] : disp.tanggalSelesai
            };
          }
          return disp;
        });
        return {
          ...sm,
          disposisi: updatedDisposisi
        };
      }
      return sm;
    });
    saveSuratMasuk(updated);
  };

  // Direct trigger to write disposition from dashboard quick items
  const handleSelectLetterForDisposisi = (letter: SuratMasuk) => {
    setSelectedLetterForDisposisi(letter);
    setActiveTab('surat-masuk');
  };

  const handleClearSelectedLetterForDisposisi = () => {
    setSelectedLetterForDisposisi(null);
  };

  // Count pending items for navigation badge
  const pendingDisposisiCount = suratMasuk
    .flatMap(sm => sm.disposisi || [])
    .filter(d => d.penerimaId === currentUser.id && d.status !== 'SELESAI').length;

  const totalUnassignedCount = suratMasuk.filter(sm => !sm.disposisi || sm.disposisi.length === 0).length;

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased font-sans">
      
      {/* MOBILE TOP NAVBAR */}
      <header className="lg:hidden bg-white text-slate-800 border-b border-slate-200 px-3 py-2 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-purple-50 p-0.5 rounded-full border border-purple-150 flex items-center justify-center shrink-0">
            <GmitLogo className="h-full w-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black tracking-tight text-xs text-slate-900 leading-none">E-SURAT</span>
            <span className="text-[8px] font-bold text-purple-700 tracking-wider mt-0.5 uppercase">Sinode GMIT</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* User Profile Badge Pill for Mobile */}
          <div 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
            title="Klik untuk buka menu profil"
          >
            <div className="h-5 w-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-black uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">
              {currentUser.name.split(',')[0]}
            </span>
          </div>

          <NotificationCenter 
            suratMasukList={suratMasuk} 
            suratKeluarList={suratKeluar} 
            currentUser={currentUser}
            onNavigate={setActiveTab}
            onSelectLetter={handleSelectLetterForDisposisi}
          />

          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
            id="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white text-slate-800 flex flex-col justify-between
          transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out border-r border-slate-200
        `}>
          {/* Sidebar Header */}
          <div className="p-5 pb-3">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="h-10 w-10 flex items-center justify-center overflow-hidden bg-purple-50 p-1 rounded-full border border-purple-150 shadow-xs shrink-0">
                <GmitLogo className="h-full w-full" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-slate-900 text-xs tracking-wider leading-none">E-SURAT</h2>
                <span className="text-[9px] font-bold text-purple-700 uppercase bg-purple-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">Sinode GMIT</span>
              </div>
            </div>

            {/* Nav List */}
            <nav className="space-y-1 mt-6">
              {/* Dashboard Tab */}
              {hasMenuAccess('dashboard') && (
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'dashboard' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4.5 w-4.5" />
                    <span>Dashboard Utama</span>
                  </div>
                </button>
              )}

              {/* Surat Masuk Tab */}
              {hasMenuAccess('surat-masuk') && (
                <button
                  onClick={() => {
                    setActiveTab('surat-masuk');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'surat-masuk' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="h-4.5 w-4.5" />
                    <span>Surat Masuk</span>
                  </div>
                  {/* Director's badge: count of unassigned letters */}
                  {currentUser.role === 'PIMPINAN' && totalUnassignedCount > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {totalUnassignedCount} baru
                    </span>
                  )}
                </button>
              )}

              {/* Surat Keluar Tab */}
              {hasMenuAccess('surat-keluar') && (
                <button
                  onClick={() => {
                    setActiveTab('surat-keluar');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'surat-keluar' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="h-4.5 w-4.5" />
                    <span>Surat Keluar</span>
                  </div>
                </button>
              )}

              {/* Disposisi Tab */}
              {hasMenuAccess('disposisi') && (
                <button
                  onClick={() => {
                    setActiveTab('disposisi');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'disposisi' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="h-4.5 w-4.5" />
                    <span>
                      {currentUser.role === 'STAF' ? 'Kotak Disposisi' : 'Oversight Disposisi'}
                    </span>
                  </div>
                  {/* Badge if there are items assigned to current user */}
                  {currentUser.role === 'STAF' && pendingDisposisiCount > 0 && (
                    <span className="bg-amber-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingDisposisiCount} pending
                    </span>
                  )}
                </button>
              )}

              {/* Data User Tab */}
              {hasMenuAccess('users') && (
                <button
                  onClick={() => {
                    setActiveTab('users');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'users' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4.5 w-4.5" />
                    <span>Data User / Pegawai</span>
                  </div>
                </button>
              )}

              {/* Cadangan Google Drive Tab */}
              {hasMenuAccess('google-drive') && (
                <button
                  onClick={() => {
                    setActiveTab('google-drive');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer smooth-transition ${
                    activeTab === 'google-drive' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Cadangan Google Drive</span>
                  </div>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-800 cursor-pointer smooth-transition mt-4 border border-dashed border-red-100"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Log Out / Keluar</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Award className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>e-Gov Core Engine</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Dioptimalkan untuk standarisasi tata naskah dinas elektronik nasional.
              </p>
            </div>
          </div>
        </aside>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}

        {/* MAIN BODY WORKSPACE */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 pb-24 lg:pb-8">
          
          {/* PERSISTENT APP HEADER / KOP DIGITAL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
            {/* Elegant top border accent using GMIT purple */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4c1d95] bg-gradient-to-r from-purple-700 to-indigo-600" />
            
            <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Logo container */}
                <div className="p-1 bg-white border border-slate-200 rounded-full shadow-xs shrink-0">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-50 flex items-center justify-center p-1 sm:p-1.5 rounded-full border border-dashed border-indigo-200">
                    <GmitLogo className="h-full w-full" />
                  </div>
                </div>
                
                {/* Title for mobile */}
                <div className="flex-1 md:hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[8px] font-bold tracking-wider text-purple-700 uppercase bg-purple-50 px-1.5 py-0.5 rounded inline-block">
                      GMIT
                    </span>
                    <span className="text-[8px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 rounded inline-block">
                      MAJELIS SINODE
                    </span>
                  </div>
                  <h1 className="font-heading font-extrabold text-slate-900 text-sm leading-tight mt-0.5">
                    E-Surat Sinode GMIT
                  </h1>
                </div>

                {/* Address Toggle Button for Mobile */}
                <button
                  type="button"
                  onClick={() => setShowFullAddressMobile(!showFullAddressMobile)}
                  className="md:hidden text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-lg shrink-0 cursor-pointer"
                >
                  {showFullAddressMobile ? 'Sembunyikan' : 'Alamat Kop'}
                </button>
              </div>
              
              {/* Kop Text (Desktop & Expanded Mobile) */}
              <div className={`text-center md:text-left space-y-1.5 flex-1 ${showFullAddressMobile ? 'block' : 'hidden md:block'}`}>
                <div className="hidden md:flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-[9px] font-bold tracking-wider text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                    SINODE GEREJA MASEHI INJILI DI TIMOR (GMIT)
                  </span>
                  <span className="text-[9px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                    KANTOR MAJELIS SINODE
                  </span>
                </div>
                <h1 className="hidden md:block font-heading font-extrabold text-slate-900 text-lg sm:text-xl leading-tight">
                  Sistem Informasi Administrasi Persuratan & Disposisi Elektronik
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-medium">
                  Jln. S. K. Lerik Kota Baru Telp. (0380) 8438423, Fax. 831182, E–mail: Infokom.gmit@yahoo.com , Sinodegmitkupang@gmail.com, Website: www.sinodegmit.or.id · <span className="text-slate-400 font-normal">Telepon: (0380) 8430030</span>
                </p>
              </div>
              
              {/* Right Side: Active Session Info & Notification Bell */}
              <div className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-5">
                <NotificationCenter 
                  suratMasukList={suratMasuk} 
                  suratKeluarList={suratKeluar} 
                  currentUser={currentUser}
                  onNavigate={setActiveTab}
                  onSelectLetter={handleSelectLetterForDisposisi}
                />
                <div 
                  onClick={handleOpenProfileModal}
                  className="space-y-1 text-right group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                  title="Klik untuk ubah nama atau profil Anda"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition">{currentUser.name}</span>
                    <Edit3 className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">{currentUser.jabatan || currentUser.title}</div>
                  <span className="inline-flex items-center gap-1 text-[8px] font-extrabold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* DYNAMIC VIEW RENDERING */}
          <div className="animate-fade-in duration-200">
            {activeTab === 'dashboard' && (
              <Dashboard 
                suratMasuk={suratMasuk} 
                suratKeluar={suratKeluar} 
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onSelectLetterForDisposisi={handleSelectLetterForDisposisi}
              />
            )}

            {activeTab === 'surat-masuk' && (
              <SuratMasukList 
                suratMasukList={suratMasuk}
                currentUser={currentUser}
                onAddSuratMasuk={handleAddSuratMasuk}
                onUpdateSuratMasuk={handleUpdateSuratMasuk}
                onAddDisposisi={handleAddDisposisi}
                onDeleteSuratMasuk={handleDeleteSuratMasuk}
                selectLetterForDisposisi={selectedLetterForDisposisi}
                clearSelectedLetterForDisposisi={handleClearSelectedLetterForDisposisi}
                users={users}
                onAddUser={handleAddUser}
              />
            )}

            {activeTab === 'surat-keluar' && (
              <SuratKeluarList 
                suratKeluarList={suratKeluar}
                currentUser={currentUser}
                onAddSuratKeluar={handleAddSuratKeluar}
                onUpdateSuratKeluar={handleUpdateSuratKeluar}
                onUpdateStatusSuratKeluar={handleUpdateStatusSuratKeluar}
                onDeleteSuratKeluar={handleDeleteSuratKeluar}
                users={users}
              />
            )}

            {activeTab === 'disposisi' && (
              <DisposisiList 
                suratMasukList={suratMasuk}
                currentUser={currentUser}
                onUpdateDisposisiStatus={handleUpdateDisposisiStatus}
                users={users}
                onAddSuratKeluar={handleAddSuratKeluar}
              />
            )}

            {activeTab === 'users' && (
              <UserList 
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                menuPermissions={menuPermissions}
                onUpdateMenuPermissions={saveMenuPermissions}
              />
            )}

            {activeTab === 'google-drive' && (
              <GoogleDriveManager 
                suratMasukList={suratMasuk}
                suratKeluarList={suratKeluar}
              />
            )}
          </div>

        </main>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-xl flex items-center justify-around select-none">
        {hasMenuAccess('dashboard') && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Beranda</span>
          </button>
        )}

        {hasMenuAccess('surat-masuk') && (
          <button
            onClick={() => setActiveTab('surat-masuk')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'surat-masuk' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className={`h-5 w-5 ${activeTab === 'surat-masuk' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Surat Masuk</span>
            {currentUser.role === 'PIMPINAN' && totalUnassignedCount > 0 && (
              <span className="absolute top-0 right-3 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        )}

        {hasMenuAccess('surat-keluar') && (
          <button
            onClick={() => setActiveTab('surat-keluar')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'surat-keluar' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className={`h-5 w-5 ${activeTab === 'surat-keluar' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Surat Keluar</span>
          </button>
        )}

        {hasMenuAccess('disposisi') && (
          <button
            onClick={() => setActiveTab('disposisi')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'disposisi' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className={`h-5 w-5 ${activeTab === 'disposisi' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Disposisi</span>
            {currentUser.role === 'STAF' && pendingDisposisiCount > 0 && (
              <span className="absolute top-0 right-3 h-2 w-2 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>
        )}

        {hasMenuAccess('users') && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'users' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className={`h-5 w-5 ${activeTab === 'users' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">User</span>
          </button>
        )}

        {hasMenuAccess('google-drive') && (
          <button
            onClick={() => setActiveTab('google-drive')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'google-drive' ? 'text-indigo-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className={`h-5 w-5 ${activeTab === 'google-drive' ? 'text-indigo-600 scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Drive</span>
          </button>
        )}
      </nav>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-[10px] text-slate-400 mb-14 lg:mb-0">
        <p>© 2026 Kantor Sinode GMIT - Sistem Informasi Tata Kelola Surat & Kearsipan Elektronik Sinode GMIT</p>
      </footer>

      {/* MODAL EDIT PROFIL PENGGUNA (SAYA) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Edit Nama & Profil Saya</h3>
                <p className="text-xs text-slate-500">Perubahan nama dan data akun akan disimpan secara permanen.</p>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  placeholder="Contoh: Pdt. Edward Syistha Dethan, M.Th."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jabatan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editProfileTitle}
                  onChange={(e) => setEditProfileTitle(e.target.value)}
                  placeholder="Contoh: Ketua Sinode GMIT / Administrator Utama"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Role / Peranan Sistem <span className="text-red-500">*</span></label>
                  <select
                    value={editProfileRole}
                    onChange={(e) => setEditProfileRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN (Akses Penuh)</option>
                    <option value="PIMPINAN">PIMPINAN (Disposisi)</option>
                    <option value="STAF">STAF (Pelaksana)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Username <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editProfileUsername}
                    onChange={(e) => setEditProfileUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">NIP (Opsional)</label>
                  <input
                    type="text"
                    value={editProfileNip}
                    onChange={(e) => setEditProfileNip(e.target.value)}
                    placeholder="1978..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Key className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Kata Sandi / Password</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfilePassword}
                    onChange={(e) => setEditProfilePassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer"
                >
                  Simpan Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
