import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, User as UserIcon, ShieldAlert, KeyRound, CheckCircle2, Globe } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterUser: (user: Omit<User, 'id'>) => void;
}

export default function Login({ users, onLoginSuccess, onRegisterUser }: LoginProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Cashier');
  
  // Feedback Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailClean = loginEmail.trim().toLowerCase();
    
    // Check for hardcoded Admin credentials fallback to protect against empty localStorage or deletions
    if (emailClean === 'hurexgroup88@gmail.com' && loginPassword === 'Hugoshamte@4040') {
      const existingAdmin = users.find(u => (u.email || '').toLowerCase() === 'hurexgroup88@gmail.com');
      if (existingAdmin) {
        if (!existingAdmin.isApproved) {
          // Hardcoded admin should always be approved!
          existingAdmin.isApproved = true;
        }
        onLoginSuccess(existingAdmin);
        return;
      } else {
        // Create the admin dynamically if somehow deleted
        const newAdmin: User = {
          id: 'u-admin-fallback',
          name: 'HUREX Admin',
          username: 'admin',
          email: 'hurexgroup88@gmail.com',
          role: 'Admin',
          permissions: ['manage_products', 'make_sales', 'view_reports', 'manage_users', 'backup_restore'],
          password: 'Hugoshamte@4040',
          isApproved: true
        };
        // Auto-register and login
        onRegisterUser(newAdmin);
        onLoginSuccess(newAdmin);
        return;
      }
    }

    // Standard user login check
    const matchedUser = users.find(u => (u.email || '').toLowerCase() === emailClean);
    
    if (!matchedUser) {
      setError(
        language === 'sw' 
          ? 'Mtumiaji aliye na barua pepe hii hajapatikana kwenye mfumo.' 
          : 'User with this email was not found in the system.'
      );
      return;
    }

    if (matchedUser.password !== loginPassword) {
      setError(
        language === 'sw'
          ? 'Nenosiri uliloingiza si sahihi. Tafadhali jaribu tena.'
          : 'The password you entered is incorrect. Please try again.'
      );
      return;
    }

    if (!matchedUser.isApproved) {
      setError(
        language === 'sw'
          ? 'Akaunti yako haijapewa RUHUSA bado. Tafadhali wasiliana na Admin (hurexgroup88@gmail.com) ili uweze kuruhusiwa kutumia mfumo.'
          : 'Your account has not been APPROVED yet. Please contact Admin (hurexgroup88@gmail.com) to gain system access.'
      );
      return;
    }

    // Success!
    onLoginSuccess(matchedUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName || !regEmail || !regPassword) {
      setError(
        language === 'sw'
          ? 'Tafadhali jaza sehemu zote zilizoashiriwa na nyota (*).'
          : 'Please fill in all fields marked with an asterisk (*).'
      );
      return;
    }

    const emailClean = regEmail.trim().toLowerCase();
    
    // Check if user already exists
    const userExists = users.some(u => (u.email || '').toLowerCase() === emailClean);
    if (userExists) {
      setError(
        language === 'sw'
          ? 'Mtumiaji mwenye barua pepe hii tayari amesajiliwa kwenye mfumo.'
          : 'A user with this email is already registered in the system.'
      );
      return;
    }

    // Define permissions based on role
    let permissions: string[] = ['make_sales'];
    if (regRole === 'Admin') {
      permissions = ['manage_products', 'make_sales', 'view_reports', 'manage_users', 'backup_restore'];
    } else if (regRole === 'Manager') {
      permissions = ['manage_products', 'make_sales', 'view_reports'];
    }

    // If they register using the requested admin email, automatically approve them as Admin
    const isAdminEmail = emailClean === 'hurexgroup88@gmail.com';
    const isApproved = isAdminEmail; // only auto-approve the official Admin email

    const payload = {
      name: regName,
      username: emailClean.split('@')[0],
      email: emailClean,
      role: isAdminEmail ? 'Admin' as UserRole : regRole,
      permissions: isAdminEmail ? ['manage_products', 'make_sales', 'view_reports', 'manage_users', 'backup_restore'] : permissions,
      password: regPassword,
      isApproved: isApproved
    };

    onRegisterUser(payload);
    
    if (isAdminEmail) {
      setSuccess(
        language === 'sw'
          ? 'Usajili wa Admin umekamilika! Sasa unaweza kuingia kwenye mfumo kwa kutumia taarifa zako.'
          : 'Admin registration complete! You can now log into the system with your credentials.'
      );
      setIsRegisterMode(false);
      setLoginEmail(emailClean);
      setLoginPassword(regPassword);
    } else {
      setSuccess(
        language === 'sw'
          ? 'Usajili umefanikiwa kikamilifu! Akaunti yako sasa inasubiri ruhusa na idhini kutoka kwa Admin wa mfumo ili uweze kuingia.'
          : 'Registration successful! Your account is now pending approval from the system Admin before you can log in.'
      );
      setIsRegisterMode(false);
      // Clean up register form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors duration-200">
      
      {/* Top Floating Language Switcher for First App Setup */}
      <div className="mb-4 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-full p-1 shadow-sm shrink-0 z-50">
        <div className="px-2.5 text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span>{language === 'sw' ? 'Lugha:' : 'Language:'}</span>
        </div>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs rounded-full font-black transition-all ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('sw')}
          className={`px-3 py-1 text-xs rounded-full font-black transition-all ${
            language === 'sw'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Kiswahili
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden p-8 relative">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl shadow-lg mb-4">
            HX
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            HUREX GROUP OF COMPANIES LTD
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium">
            {language === 'sw'
              ? 'Mfumo wa Kisasa wa Kusimamia Mauzo na Bidhaa'
              : 'Modern Sales and Inventory Management System'}
          </p>
        </div>

        {/* Feedback indicators */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex gap-2 items-start font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex gap-2 items-start font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {!isRegisterMode ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Barua Pepe' : 'Email Address'}
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Mf: hurexgroup88@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs placeholder-zinc-400 transition"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Nenosiri' : 'Password'}
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={language === 'sw' ? 'Weka nenosiri lako' : 'Enter your password'}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs placeholder-zinc-400 transition"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition duration-250 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-4 h-4" />
              {t('login.submit')}
            </button>

            <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-6">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {language === 'sw' ? 'Huna akaunti iliyosajiliwa bado? ' : 'Don’t have an account yet? '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsRegisterMode(true);
                  }}
                  className="text-blue-600 hover:underline font-bold"
                >
                  {language === 'sw' ? 'Sajili Akaunti Hapa' : 'Register Account Here'}
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Jina Kamili *' : 'Full Name *'}
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Mf: Hamis Juma"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs placeholder-zinc-400 transition"
                />
                <UserIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Barua Pepe *' : 'Email Address *'}
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Mf: mfanyakazi@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs placeholder-zinc-400 transition"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Nenosiri *' : 'Password *'}
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder={language === 'sw' ? 'Unda nenosiri imara' : 'Create strong password'}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs placeholder-zinc-400 transition"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'sw' ? 'Jukumu Linaloombwa' : 'Requested Role'}
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-blue-600 text-zinc-850 dark:text-white text-xs transition"
              >
                <option value="Cashier">{language === 'sw' ? 'Cashier (Muuza Duka)' : 'Cashier (Store Seller)'}</option>
                <option value="Manager">{language === 'sw' ? 'Manager (Msimamizi)' : 'Manager (Supervisor)'}</option>
              </select>
              <span className="text-[10px] text-zinc-400 block mt-1">
                {language === 'sw' 
                  ? 'Kumbuka: Akaunti yako itakua na jukumu hili mara tu baada ya Admin kuidhinisha.'
                  : 'Note: Your account will have this role once approved by the Admin.'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition duration-250 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 mt-2"
            >
              {language === 'sw' ? 'Kamilisha Usajili' : 'Complete Registration'}
            </button>

            <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-6">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {language === 'sw' ? 'Tayari unayo akaunti yako? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsRegisterMode(false);
                  }}
                  className="text-blue-600 hover:underline font-bold"
                >
                  {language === 'sw' ? 'Ingia Hapa' : 'Login Here'}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Security disclaimer */}
        <div className="text-center mt-6 text-[9px] text-zinc-400 leading-normal">
          {language === 'sw' 
            ? 'Ulinzi na Usalama wa Data umehifadhiwa kikamilifu.' 
            : 'Data Protection and Security is fully guaranteed.'}
          <br />
          HUREX GROUP OF COMPANIES LTD &copy; 2026.
        </div>
      </div>
    </div>
  );
}
