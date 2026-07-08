import React, { useState } from 'react';
import { User, UserRole, AuditLog, CustomPermission } from '../types';
import { 
  Users, 
  Lock, 
  ShieldCheck, 
  History, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Key, 
  UserPlus2, 
  Settings2,
  Calendar,
  ShieldPlus
} from 'lucide-react';

interface UsersProps {
  users: User[];
  auditLogs: AuditLog[];
  activeUserId: string;
  customPermissions: CustomPermission[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onSwitchUser: (userId: string) => void;
  onClearAuditLogs: () => void;
  onAddCustomPermission: (permission: CustomPermission) => void;
}

export default function UsersTab({
  users,
  auditLogs,
  activeUserId,
  customPermissions,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSwitchUser,
  onClearAuditLogs,
  onAddCustomPermission
}: UsersProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Cashier');
  const [permissions, setPermissions] = useState<string[]>(['make_sales']);
  const [isApproved, setIsApproved] = useState(true);

  // Custom Permission state
  const [newPermKey, setNewPermKey] = useState('');
  const [newPermName, setNewPermName] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');
  const [showAddPermForm, setShowAddPermForm] = useState(false);

  const handleCreateCustomPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermKey || !newPermName || !newPermDesc) {
      alert('Tafadhali jaza sifa zote za jukumu jipya.');
      return;
    }
    const cleanKey = newPermKey.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    
    if (customPermissions.some(cp => cp.key === cleanKey)) {
      alert('Jukumu lenye ufunguo (key) huu tayari lipo.');
      return;
    }

    onAddCustomPermission({
      key: cleanKey,
      name: newPermName,
      desc: newPermDesc
    });

    setPermissions(prev => [...prev, cleanKey]);

    setNewPermKey('');
    setNewPermName('');
    setNewPermDesc('');
    setShowAddPermForm(false);
  };

  const handleTogglePermission = (pKey: string) => {
    if (permissions.includes(pKey)) {
      setPermissions(permissions.filter(k => k !== pKey));
    } else {
      setPermissions([...permissions, pKey]);
    }
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('Cashier');
    setPermissions(['view_dashboard', 'make_sales', 'manage_customers']);
    setIsApproved(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email || '');
    setPassword(u.password || '');
    setRole(u.role);
    setPermissions(u.permissions || []);
    setIsApproved(u.isApproved !== false);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Tafadhali jaza jina kamili na barua pepe (email).');
      return;
    }

    const payload = {
      name,
      username: username || email.split('@')[0],
      email: email.toLowerCase().replace(/\s/g, ''),
      role,
      permissions,
      password: password || undefined,
      isApproved
    };

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        ...payload
      });
    } else {
      onAddUser(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, uName: string) => {
    if (id === activeUserId) {
      alert('Huwezi kufuta akaunti yako uliyoingia nayo hivi sasa.');
      return;
    }
    const doubleConfirm = window.confirm(`Je, una uhakika unataka kumfuta mtumiaji huyu "${uName}" kwenye mfumo?`);
    if (doubleConfirm) {
      onDeleteUser(id);
    }
  };

  const applyRolePresets = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setPermissions(['view_dashboard', 'make_sales', 'manage_products', 'manage_expenses', 'view_pandl', 'view_reports', 'manage_customers', 'manage_users', 'backup_restore']);
    } else if (selectedRole === 'Manager') {
      setPermissions(['view_dashboard', 'make_sales', 'manage_products', 'manage_expenses', 'view_pandl', 'view_reports', 'manage_customers']);
    } else {
      setPermissions(['view_dashboard', 'make_sales', 'manage_customers']);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Selection */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeSubTab === 'users' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'}`}
          >
            <Users className="w-4 h-4" />
            Watumiaji na Majukumu (Roles)
          </button>
          <button 
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${activeSubTab === 'audit' ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'}`}
          >
            <History className="w-4 h-4" />
            Audit Trail (Ripoti ya Matendo)
          </button>
        </div>
      </div>

      {activeSubTab === 'users' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Usimamizi wa Akaunti</h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Unda akaunti za wauzaji, kagua nywila zao au weka haki mahususi (custom permissions)</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              <UserPlus2 className="w-4 h-4" />
              Sajili Mtumiaji Mpya
            </button>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => {
              const isActive = u.id === activeUserId;
              return (
                <div 
                  key={u.id} 
                  className={`border rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-xs relative flex flex-col justify-between ${isActive ? 'border-2 border-blue-500 bg-blue-50/10 dark:bg-zinc-900' : 'border-zinc-100 dark:border-zinc-800'}`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2.5 items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                          u.role === 'Admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                          u.role === 'Manager' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-zinc-800 dark:text-white flex items-center gap-1">
                            {u.name}
                            {isActive && <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase">Wewe</span>}
                          </h5>
                          <div className="text-[10px] text-zinc-400 space-y-0.5">
                            <div>Email: <strong className="text-zinc-600 dark:text-zinc-300">{u.email || `${u.username}@hurex.com`}</strong></div>
                            <div>Username: <strong>{u.username}</strong></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 text-zinc-400 hover:text-blue-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                        {u.id !== activeUserId && (
                          <button 
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions tags */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">Haki za Kiutendaji:</span>
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.map(item => (
                          <span key={item} className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100/10 rounded">
                            {item.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Jukumu: <strong>{u.role}</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.isApproved !== false 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                    }`}>
                      {u.isApproved !== false ? 'Ruhusa: Amekubaliwa' : 'Ruhusa: Imesitishwa'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Audit Trail ledger */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h5 className="font-extrabold text-zinc-900 dark:text-white">Audit Trail System Logger</h5>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Udhibiti na ukaguzi wa matendo yote yaliyofanyika kwenye hifadhidata ya duka kwa usalama mkuu</p>
            </div>
            <button 
              onClick={() => {
                const conf = window.confirm('Je, una uhakika unataka kufuta logi zote za shughuli katika Audit Trail? Kitendo hiki ni thabiti!');
                if (conf) onClearAuditLogs();
              }}
              className="px-3 py-1.5 text-xs text-rose-500 border border-rose-200 hover:bg-rose-50 rounded-xl font-bold transition"
            >
              Clear Audit Log
            </button>
          </div>

          {/* Mobile cards view for Audit logs */}
          <div className="md:hidden space-y-3">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs bg-zinc-50 dark:bg-zinc-800/10 rounded-xl">
                Hakuna kumbukumbu za matendo bado.
              </div>
            ) : (
              [...auditLogs].reverse().map(log => (
                <div key={log.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="flex items-center gap-1 text-zinc-400 font-mono">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {new Date(log.timestamp).toLocaleDateString('sw-TZ')} {new Date(log.timestamp).toLocaleTimeString('sw-TZ')}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      log.userRole === 'Admin' ? 'bg-rose-100 text-rose-800' :
                      log.userRole === 'Manager' ? 'bg-purple-100 text-purple-800' :
                      'bg-zinc-100 text-zinc-800'
                    }`}>
                      {log.userRole}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{log.username}</span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">{log.action}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed bg-white dark:bg-zinc-900/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="p-3 w-32">Wakati / Tarehe</th>
                  <th className="p-3">Mtumiaji</th>
                  <th className="p-3">Jukumu</th>
                  <th className="p-3">Tendo (Action)</th>
                  <th className="p-3">Maelezo Kamili</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-400">
                      Hakuna kumbukumbu za matendo bado.
                    </td>
                  </tr>
                ) : (
                  [...auditLogs].reverse().map(log => (
                    <tr key={log.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-800/5 transition">
                      <td className="p-3 whitespace-nowrap text-zinc-400 font-mono">
                        <span className="flex items-center gap-1 font-semibold text-[10px]">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {new Date(log.timestamp).toLocaleDateString('sw-TZ')} {new Date(log.timestamp).toLocaleTimeString('sw-TZ')}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-zinc-800 dark:text-zinc-200">
                        {log.username}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.userRole === 'Admin' ? 'bg-rose-100 text-rose-800' :
                          log.userRole === 'Manager' ? 'bg-purple-100 text-purple-800' :
                          'bg-zinc-100 text-zinc-800'
                        }`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400">
                        {log.action}
                      </td>
                      <td className="p-3 text-zinc-500 break-words">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User creator / Settings Modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl text-xs">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingUser ? 'Hariri Mtumiaji na Haki' : 'Sajili Mtumiaji na Jukumu'}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Jina Kamili la Mfanyakazi *</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mf: Halima Bakari Cashier"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Barua Pepe (Email Address) *</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Mf: mteja@hurex.com"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Jina la kuingia (Username) *</label>
                  <input 
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Mf: halima"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Nenosiri kupata ufikiaji (Password)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Weka password mpya / weka tupu"
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                    />
                    <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-zinc-400 font-semibold mb-1">Jukumu Kuu (Role Template)</label>
                  <div className="flex gap-2">
                    {(['Admin', 'Manager', 'Cashier'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => applyRolePresets(r)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${role === r ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-transparent border-zinc-150 text-zinc-400'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Approval Toggle */}
                {editingUser?.email !== 'hurexgroup88@gmail.com' && (
                  <div className="col-span-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-700 dark:text-zinc-200 block text-xs">Ruhusa ya Kutumia Mfumo (Admin Approval)</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Ruhusu au mzuie mtumiaji huyu asiingie kwenye mfumo bila idhini.</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={isApproved}
                      onChange={(e) => setIsApproved(e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 h-5 w-5 border-zinc-300 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Custom Permissions Checklist */}
                <div className="col-span-2 space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-zinc-400 font-black uppercase tracking-wider text-[9px]">Haki Maalum za Majukumu (Custom Permissions):</label>
                    <button
                      type="button"
                      onClick={() => setShowAddPermForm(!showAddPermForm)}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                    >
                      <ShieldPlus className="w-3.5 h-3.5" />
                      {showAddPermForm ? 'Funga Fomu' : 'Ongeza Jukumu Jipya'}
                    </button>
                  </div>

                  {/* Add Custom Permission Inline Form */}
                  {showAddPermForm && (
                    <div className="p-3.5 bg-blue-50/20 dark:bg-zinc-800/40 border border-blue-100/30 dark:border-zinc-800 rounded-xl space-y-3">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs block">Sajili Haki/Jukumu Jipya Maalum (Add Dynamic Duty)</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Key/ID (English, e.g. view_logs) *</label>
                          <input 
                            type="text"
                            value={newPermKey}
                            onChange={(e) => setNewPermKey(e.target.value)}
                            placeholder="Mf: view_logs"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Jina la Jukumu (Swahili) *</label>
                          <input 
                            type="text"
                            value={newPermName}
                            onChange={(e) => setNewPermName(e.target.value)}
                            placeholder="Mf: Kuangalia Audit Trail"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Maelezo Kamili ya Jukumu hili *</label>
                          <input 
                            type="text"
                            value={newPermDesc}
                            onChange={(e) => setNewPermDesc(e.target.value)}
                            placeholder="Mf: Huruhusu kuona nani amefanya tendo gani na saa ngapi"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddPermForm(false)}
                          className="px-2.5 py-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded font-bold"
                        >
                          Ghairi
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateCustomPermission}
                          className="px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                        >
                          Unda Jukumu
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {customPermissions.map(p => {
                      const isChecked = permissions.includes(p.key);
                      return (
                        <div 
                          key={p.key}
                          onClick={() => handleTogglePermission(p.key)}
                          className={`p-2.5 border rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition flex gap-2 items-start ${isChecked ? 'border-blue-500 bg-blue-50/10' : 'border-zinc-100 dark:border-zinc-800'}`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="mt-0.5 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-zinc-300 rounded"
                          />
                          <div>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200 block text-[11px]">{p.name}</span>
                            <span className="text-[10px] text-zinc-400 block leading-tight mt-0.5">{p.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs"
                >
                  Hifadhi Mtumiaji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
