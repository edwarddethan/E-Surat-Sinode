import React, { useState } from 'react';
import { User, UserRole, MenuPermission } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Copy, 
  Check, 
  UserCheck, 
  Shield, 
  Briefcase,
  X,
  Settings,
  Lock,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface UserListProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  menuPermissions?: MenuPermission[];
  onUpdateMenuPermissions?: (permissions: MenuPermission[]) => void;
}

export default function UserList({ 
  users, 
  currentUser, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  menuPermissions = [],
  onUpdateMenuPermissions
}: UserListProps) {
  // Sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'permissions'>('users');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Form States
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('STAF');
  const [formStatus, setFormStatus] = useState<'AKTIF' | 'NON_AKTIF'>('AKTIF');
  const [formError, setFormError] = useState('');

  // Password Visibility States (userId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Clipboard Copy State (userId -> boolean)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Search and Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.nip?.includes(searchTerm)) ||
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (user.status || 'AKTIF') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCopyNip = (userId: string, nip: string) => {
    if (!nip) return;
    navigator.clipboard.writeText(nip);
    setCopiedStates(prev => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [userId]: false }));
    }, 1500);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormNip('');
    setFormName('');
    setFormUsername('');
    setFormPassword('password123');
    setFormTitle('');
    setFormRole('STAF');
    setFormStatus('AKTIF');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormNip(user.nip || '');
    setFormName(user.name);
    setFormUsername(user.username || '');
    setFormPassword(user.password || 'password123');
    setFormTitle(user.title);
    setFormRole(user.role);
    setFormStatus(user.status || 'AKTIF');
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Handle Add User Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formPassword.trim() || !formUsername.trim()) {
      setFormError('Kolom Username, Nama, Jabatan, dan Kata Sandi wajib diisi.');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      setFormError('Username tidak valid.');
      return;
    }

    // Check duplicate username
    const usernameExists = users.some(u => u.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      setFormError('Username sudah terdaftar dalam sistem.');
      return;
    }

    // Check duplicate NIP if provided
    if (formNip.trim()) {
      const nipExists = users.some(u => u.nip === formNip.trim());
      if (nipExists) {
        setFormError('NIP sudah terdaftar dalam sistem.');
        return;
      }
    }

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: formName.trim(),
      username: cleanUsername,
      role: formRole,
      title: formTitle.trim(),
      nip: formNip.trim() || undefined,
      password: formPassword.trim(),
      status: formStatus,
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    setNoticeMessage(`Pengguna baru "${newUser.name}" (Role: ${newUser.role}) berhasil ditambahkan dan disimpan secara permanen!`);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  // Handle Edit User Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!formName.trim() || !formTitle.trim() || !formPassword.trim() || !formUsername.trim()) {
      setFormError('Kolom Username, Nama, Jabatan, dan Kata Sandi wajib diisi.');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      setFormError('Username tidak valid.');
      return;
    }

    // Check duplicate username (exclude self)
    const usernameExists = users.some(u => u.username?.toLowerCase() === cleanUsername && u.id !== selectedUser.id);
    if (usernameExists) {
      setFormError('Username sudah terdaftar untuk pengguna lain.');
      return;
    }

    // Check duplicate NIP (exclude self) if provided
    if (formNip.trim()) {
      const nipExists = users.some(u => u.nip === formNip.trim() && u.id !== selectedUser.id);
      if (nipExists) {
        setFormError('NIP sudah terdaftar untuk pengguna lain.');
        return;
      }
    }

    // Protection: Cannot deactivate currently logged-in user
    if (selectedUser.id === currentUser.id && formStatus === 'NON_AKTIF') {
      setFormError('Anda tidak dapat menonaktifkan akun Anda yang sedang digunakan.');
      return;
    }

    const updatedUser: User = {
      ...selectedUser,
      name: formName.trim(),
      username: cleanUsername,
      role: formRole,
      title: formTitle.trim(),
      nip: formNip.trim(),
      password: formPassword.trim(),
      status: formStatus,
    };

    onUpdateUser(updatedUser);
    setIsEditModalOpen(false);
    setNoticeMessage(`Data pengguna "${updatedUser.name}" (Role: ${updatedUser.role}) berhasil diperbarui dan disimpan secara permanen!`);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  // Toggle single user status quickly from list
  const handleToggleStatus = (user: User) => {
    if (user.id === currentUser.id) {
      setNoticeMessage('Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif.');
      return;
    }
    const newStatus = (user.status || 'AKTIF') === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF';
    onUpdateUser({
      ...user,
      status: newStatus
    });
    setNoticeMessage(`Status akun ${user.name} berhasil diubah menjadi ${newStatus} dan disimpan secara permanen.`);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Handle delete click
  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser.id) {
      setNoticeMessage('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.');
      return;
    }
    setUserToDelete(user);
  };

  // Execute actual deletion
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      setNoticeMessage('Anda tidak dapat menghapus akun Anda sendiri.');
      setUserToDelete(null);
      return;
    }
    const deletedName = userToDelete.name;
    onDeleteUser(userToDelete.id);
    setUserToDelete(null);
    setNoticeMessage(`Pengguna "${deletedName}" berhasil dihapus secara permanen dari sistem.`);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  const handleTogglePermission = (menuId: string, role: UserRole) => {
    if (!onUpdateMenuPermissions) return;
    
    // Safety check: Prevent Admin / Sekretaris from locking themselves out of the users tab
    if (menuId === 'users' && role === 'ADMIN' && currentUser.role === 'ADMIN') {
      const perm = menuPermissions.find(p => p.menuId === 'users');
      if (perm && perm.roles.includes('ADMIN')) {
        alert('Keamanan Terjaga: Anda tidak diperbolehkan mencabut akses Admin dari menu "Data User / Pegawai" agar tidak terkunci keluar dari pengaturan ini.');
        return;
      }
    }

    const updated = menuPermissions.map(p => {
      if (p.menuId === menuId) {
        const hasRole = p.roles.includes(role);
        const newRoles = hasRole 
          ? p.roles.filter(r => r !== role)
          : [...p.roles, role];
        return { ...p, roles: newRoles };
      }
      return p;
    });
    
    onUpdateMenuPermissions(updated);
  };

  const handleResetPermissions = () => {
    if (!onUpdateMenuPermissions) return;
    if (confirm('Apakah Anda yakin ingin mereset seluruh hak akses menu ke pengaturan bawaan sistem?')) {
      const defaults: MenuPermission[] = [
        { menuId: 'dashboard', label: 'Dashboard Utama', description: 'Akses ke rangkuman statistik surat, jalan pintas disposisi, dan grafik visualisasi volume surat.', roles: ['ADMIN', 'PIMPINAN', 'STAF'] },
        { menuId: 'surat-masuk', label: 'Surat Masuk', description: 'Melihat daftar surat masuk, mengunggah berkas surat, mencetak lembar disposisi, dan memberikan instruksi disposisi.', roles: ['ADMIN', 'PIMPINAN', 'STAF'] },
        { menuId: 'surat-keluar', label: 'Surat Keluar', description: 'Membuat konsep surat keluar (draft), mendaftarkan nomor surat keluar resmi, dan melacak status pengiriman surat.', roles: ['ADMIN', 'PIMPINAN', 'STAF'] },
        { menuId: 'disposisi', label: 'Kotak & Oversight Disposisi', description: 'Memantau dan menindaklanjuti instruksi disposisi dari pimpinan (untuk staf) atau mengawasi seluruh progres (untuk pimpinan/admin).', roles: ['ADMIN', 'PIMPINAN', 'STAF'] },
        { menuId: 'users', label: 'Data User / Pegawai', description: 'Mengelola biodata pegawai, NIP, peran (role), kata sandi akun, status aktif, dan konfigurasi hak akses menu ini.', roles: ['ADMIN', 'PIMPINAN'] }
      ];
      onUpdateMenuPermissions(defaults);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* NOTICE BANNER */}
      {noticeMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNoticeMessage(null)} 
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h1 className="font-heading font-extrabold text-slate-900 text-xl tracking-tight">Manajemen Data User & Hak Akses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data staf kantor sinode GMIT, peran akses, jabatan, serta konfigurasi izin akses navigasi menu sidebar.
          </p>
        </div>
        {activeSubTab === 'users' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-heading text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Daftar Pengguna / Pegawai</span>
        </button>
        <button
          onClick={() => setActiveSubTab('permissions')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-heading text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'permissions'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Pengaturan Hak Akses Menu</span>
        </button>
      </div>

      {activeSubTab === 'users' && (
        <>
          {/* FILTER & SEARCH PANEL */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan Nama, NIP atau Jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Peran / Role</option>
            <option value="ADMIN">Admin / Sekretaris</option>
            <option value="PIMPINAN">Pimpinan</option>
            <option value="STAF">Staf</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="AKTIF">Status Aktif</option>
            <option value="NON_AKTIF">Status Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* DATA USER TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400 font-semibold">
                    Tidak ada data pengguna yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isCurrentUser = user.id === currentUser.id;
                  const isVisible = visiblePasswords[user.id] || false;
                  const isCopied = copiedStates[user.id] || false;
                  const currentStatus = user.status || 'AKTIF';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition duration-150">
                      {/* 1. No */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* 2. NIP */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span>{user.nip || '-'}</span>
                          {user.nip && (
                            <button
                              onClick={() => handleCopyNip(user.id, user.nip!)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                              title="Salin NIP"
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 3. Username */}
                      <td className="py-3.5 px-4 font-semibold text-indigo-600 font-mono">
                        {user.username ? `${user.username}` : '-'}
                      </td>

                      {/* 4. Nama */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Password */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type={isVisible ? "text" : "password"}
                            value={user.password || 'password123'}
                            readOnly
                            className="bg-transparent border-none p-0 text-xs font-mono text-slate-600 w-24 outline-hidden focus:ring-0"
                          />
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition cursor-pointer"
                            title={isVisible ? "Sembunyikan password" : "Tampilkan password"}
                          >
                            {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* 5. Jabatan */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.title}
                      </td>

                      {/* 6. Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === 'PIMPINAN'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.role === 'PIMPINAN' ? (
                            <Shield className="h-3 w-3 shrink-0" />
                          ) : user.role === 'ADMIN' ? (
                            <UserCheck className="h-3 w-3 shrink-0" />
                          ) : (
                            <Briefcase className="h-3 w-3 shrink-0" />
                          )}
                          <span>
                            {user.role === 'PIMPINAN' ? 'Pimpinan' : user.role === 'ADMIN' ? 'Admin' : 'Staf'}
                          </span>
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                            currentStatus === 'AKTIF'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70'
                              : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100/70'
                          }`}
                          title="Klik untuk mengubah status"
                        >
                          {currentStatus === 'AKTIF' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          <span>{currentStatus === 'AKTIF' ? 'Aktif' : 'Non-Aktif'}</span>
                        </button>
                      </td>

                      {/* 8. Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-100 transition cursor-pointer"
                            title="Edit Data Pengguna"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isCurrentUser 
                                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border-slate-200 hover:border-red-100'
                            }`}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? "Anda sedang menggunakan akun ini" : "Hapus Pengguna"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan <strong>{filteredUsers.length}</strong> dari <strong>{users.length}</strong> pengguna terdaftar
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-100 text-[10px] font-semibold">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>Hak istimewa edit & hapus diamankan secara internal.</span>
          </div>
        </div>
      </div>
      
      </>
      )}

      {activeSubTab === 'permissions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Info Banner */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-700">
              <Settings className="h-5 w-5" />
              <h3 className="font-heading font-extrabold text-sm text-slate-900">Konfigurasi Hak Akses Menu Navigasi</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atur hak akses tiap peranan (Role) terhadap menu navigasi di sidebar utama. Modifikasi di bawah ini akan langsung mengubah visibilitas menu tersebut bagi pengguna yang bersangkutan secara real-time.
            </p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-[11px] text-slate-500">
              <Lock className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>Sistem keamanan menolak akses menu yang telah dinonaktifkan dari daftar peranan di bawah ini.</span>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {menuPermissions.map((menu) => {
              return (
                <div key={menu.menuId} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4 hover:border-indigo-150 transition-all duration-150 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-heading font-extrabold text-slate-800 text-sm">{menu.label}</h4>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md mt-1.5 inline-block uppercase font-bold tracking-wider">
                          KODE MENU: {menu.menuId}
                        </span>
                      </div>
                      <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Layers className="h-4.5 w-4.5" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{menu.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hak Akses Peran:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {/* PIMPINAN Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(menu.menuId, 'PIMPINAN')}
                        className={`inline-flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center text-[10px] font-bold ${
                          menu.roles.includes('PIMPINAN')
                            ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/50'
                            : 'bg-slate-50/50 border-slate-150 text-slate-400 hover:bg-slate-100/50'
                        }`}
                      >
                        <Shield className="h-4 w-4 mb-1" />
                        <span>Pimpinan</span>
                        <span className="text-[8px] opacity-75 font-normal mt-0.5">
                          {menu.roles.includes('PIMPINAN') ? 'Diizinkan' : 'Dilarang'}
                        </span>
                      </button>

                      {/* ADMIN Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(menu.menuId, 'ADMIN')}
                        className={`inline-flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center text-[10px] font-bold ${
                          menu.roles.includes('ADMIN')
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50'
                            : 'bg-slate-50/50 border-slate-150 text-slate-400 hover:bg-slate-100/50'
                        }`}
                      >
                        <UserCheck className="h-4 w-4 mb-1" />
                        <span>Admin</span>
                        <span className="text-[8px] opacity-75 font-normal mt-0.5">
                          {menu.roles.includes('ADMIN') ? 'Diizinkan' : 'Dilarang'}
                        </span>
                      </button>

                      {/* STAF Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(menu.menuId, 'STAF')}
                        className={`inline-flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center text-[10px] font-bold ${
                          menu.roles.includes('STAF')
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50'
                            : 'bg-slate-50/50 border-slate-150 text-slate-400 hover:bg-slate-100/50'
                        }`}
                      >
                        <Briefcase className="h-4 w-4 mb-1" />
                        <span>Staf</span>
                        <span className="text-[8px] opacity-75 font-normal mt-0.5">
                          {menu.roles.includes('STAF') ? 'Diizinkan' : 'Dilarang'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium text-center sm:text-left">
              * Perubahan hak akses disimpan secara instan di sistem dan LocalStorage browser.
            </span>
            <button
              type="button"
              onClick={handleResetPermissions}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
            >
              Reset ke Bawaan Sistem
            </button>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm">Tambah Pengguna Baru</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* NIP */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">NIP<span className="text-slate-400 font-normal lowercase">(opsional)</span></label>
                <input
                  type="text"
                  placeholder="Contoh: 198805202012012005"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value.replace(/\D/g, ''))} // only digits
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="fauzi"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Huruf kecil, angka, underscore (_), tanpa spasi.</p>
              </div>

              {/* Nama */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pdt. abcde, S.Th"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kata Sandi / Password</label>
                <input
                  type="text"
                  required
                  placeholder="Isikan kata sandi login"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Jabatan */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sekretaris Sinode GMIT"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Role Selection Interactive Cards */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Pilih Role / Peranan Sistem <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Role: {formRole}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('STAF')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'STAF'
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-indigo-900">STAF</span>
                      {formRole === 'STAF' && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Pelaksana Disposisi</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-purple-900">ADMIN</span>
                      {formRole === 'ADMIN' && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Akses Penuh Kelola</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('PIMPINAN')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'PIMPINAN'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-amber-900">PIMPINAN</span>
                      {formRole === 'PIMPINAN' && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Disposisi & Pengawas</p>
                  </button>
                </div>
              </div>

              {/* Status Awal */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Status Awal Pengguna</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-semibold"
                >
                  <option value="AKTIF">Status Aktif (Bisa Login Ke Sistem)</option>
                  <option value="NON_AKTIF">Status Non-Aktif (Dihentikan Sementara)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10 animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-600" />
                <h3 className="font-heading font-extrabold text-slate-800 text-sm">Ubah Data Pengguna</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* NIP */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">NIP Pegawai <span className="text-slate-400 font-normal lowercase">(opsional)</span></label>
                <input
                  type="text"
                  placeholder="Contoh: 198805202012012005"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value.replace(/\D/g, ''))} // only digits
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-semibold"></span>
                  <input
                    type="text"
                    required
                    placeholder="fauzi"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">Huruf kecil, angka, underscore (_), tanpa spasi.</p>
              </div>

              {/* Nama */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pdt. Yusuf Nakmofa, M.Th"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kata Sandi / Password</label>
                <input
                  type="text"
                  required
                  placeholder="Isikan kata sandi login"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Jabatan */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Jabatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sekretaris Sinode GMIT"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Role Selection Interactive Cards */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Pilih Role / Peranan Sistem <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Role: {formRole}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('STAF')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'STAF'
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-indigo-900">STAF</span>
                      {formRole === 'STAF' && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Pelaksana Disposisi</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'ADMIN'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500/20 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-purple-900">ADMIN</span>
                      {formRole === 'ADMIN' && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Akses Penuh Kelola</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('PIMPINAN')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      formRole === 'PIMPINAN'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20 text-amber-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-amber-900">PIMPINAN</span>
                      {formRole === 'PIMPINAN' && <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] leading-tight text-slate-500 font-normal">Disposisi & Pengawas</p>
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Status Pengguna</label>
                <select
                  value={formStatus}
                  disabled={selectedUser?.id === currentUser.id}
                  onChange={(e) => setFormStatus(e.target.value as 'AKTIF' | 'NON_AKTIF')}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-semibold ${
                    selectedUser?.id === currentUser.id ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="AKTIF">Status Aktif (Bisa Login Ke Sistem)</option>
                  <option value="NON_AKTIF">Status Non-Aktif (Dihentikan Sementara)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS PENGGUNA */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-base">Konfirmasi Hapus Pengguna</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Nama:</span>
                <span className="font-bold text-slate-800">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Username:</span>
                <span className="font-mono font-bold text-indigo-600">@{userToDelete.username || userToDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Jabatan:</span>
                <span className="font-medium text-slate-700">{userToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Role:</span>
                <span className="font-extrabold text-slate-800">{userToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen dari sistem E-Surat Sinode GMIT?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Pengguna</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
