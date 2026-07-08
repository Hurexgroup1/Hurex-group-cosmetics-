import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  FileText, 
  MapPin, 
  Phone, 
  Percent, 
  Building, 
  Eye, 
  Check, 
  RefreshCw,
  Sliders,
  Sparkles,
  MessageCircle,
  CreditCard,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Building2
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface SettingsProps {
  systemName: string;
  onChangeSystemName: (name: string) => void;
  receiptBusinessName: string;
  setReceiptBusinessName: (val: string) => void;
  receiptAddress: string;
  setReceiptAddress: (val: string) => void;
  receiptContact: string;
  setReceiptContact: (val: string) => void;
  receiptFooter: string;
  setReceiptFooter: (val: string) => void;
  defaultTaxRate: number;
  setDefaultTaxRate: (rate: number) => void;
  onAddAuditLog: (action: string, details: string) => void;
  blackTextEnabled: boolean;
  onToggleBlackText: (val: boolean) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;

  // Storefront properties
  whatsappNumber: string;
  onChangeWhatsappNumber: (val: string) => void;
  lipaNambaMpesa: string;
  onChangeLipaNambaMpesa: (val: string) => void;
  lipaNambaTigo: string;
  onChangeLipaNambaTigo: (val: string) => void;
  lipaNambaAirtel: string;
  onChangeLipaNambaAirtel: (val: string) => void;
  wakalaMpesa: string;
  onChangeWakalaMpesa: (val: string) => void;
  wakalaTigo: string;
  onChangeWakalaTigo: (val: string) => void;
  wakalaAirtel: string;
  onChangeWakalaAirtel: (val: string) => void;
  lipaNambaHalopesa: string;
  onChangeLipaNambaHalopesa: (val: string) => void;
  wakalaHalopesa: string;
  onChangeWakalaHalopesa: (val: string) => void;
  lipaNambaAzampesa: string;
  onChangeLipaNambaAzampesa: (val: string) => void;
  bankAccountInfo: string;
  onChangeBankAccountInfo: (val: string) => void;
  instagramLink: string;
  onChangeInstagramLink: (val: string) => void;
  tiktokLink: string;
  onChangeTiktokLink: (val: string) => void;
  facebookLink: string;
  onChangeFacebookLink: (val: string) => void;
  youtubeLink: string;
  onChangeYoutubeLink: (val: string) => void;
  paymentInstructions: string;
  onChangePaymentInstructions: (val: string) => void;
}

export default function Settings({
  systemName,
  onChangeSystemName,
  receiptBusinessName,
  setReceiptBusinessName,
  receiptAddress,
  setReceiptAddress,
  receiptContact,
  setReceiptContact,
  receiptFooter,
  setReceiptFooter,
  defaultTaxRate,
  setDefaultTaxRate,
  onAddAuditLog,
  blackTextEnabled,
  onToggleBlackText,
  theme,
  onToggleTheme,

  // Storefront destructured
  whatsappNumber,
  onChangeWhatsappNumber,
  lipaNambaMpesa,
  onChangeLipaNambaMpesa,
  lipaNambaTigo,
  onChangeLipaNambaTigo,
  lipaNambaAirtel,
  onChangeLipaNambaAirtel,
  wakalaMpesa,
  onChangeWakalaMpesa,
  wakalaTigo,
  onChangeWakalaTigo,
  wakalaAirtel,
  onChangeWakalaAirtel,
  lipaNambaHalopesa,
  onChangeLipaNambaHalopesa,
  wakalaHalopesa,
  onChangeWakalaHalopesa,
  lipaNambaAzampesa,
  onChangeLipaNambaAzampesa,
  bankAccountInfo,
  onChangeBankAccountInfo,
  instagramLink,
  onChangeInstagramLink,
  tiktokLink,
  onChangeTiktokLink,
  facebookLink,
  onChangeFacebookLink,
  youtubeLink,
  onChangeYoutubeLink,
  paymentInstructions,
  onChangePaymentInstructions
}: SettingsProps) {
  const { language, setLanguage, t } = useLanguage();
  
  // Local temporary form states so changes are only applied when the user clicks 'Hifadhi' (Save)
  const [localSystemName, setLocalSystemName] = useState(systemName);
  const [localBusinessName, setLocalBusinessName] = useState(receiptBusinessName);
  const [localAddress, setLocalAddress] = useState(receiptAddress);
  const [localContact, setLocalContact] = useState(receiptContact);
  const [localFooter, setLocalFooter] = useState(receiptFooter);
  const [localTaxRate, setLocalTaxRate] = useState(defaultTaxRate);

  // Storefront local states
  const [localWhatsappNumber, setLocalWhatsappNumber] = useState(whatsappNumber);
  const [localLipaNambaMpesa, setLocalLipaNambaMpesa] = useState(lipaNambaMpesa);
  const [localLipaNambaTigo, setLocalLipaNambaTigo] = useState(lipaNambaTigo);
  const [localLipaNambaAirtel, setLocalLipaNambaAirtel] = useState(lipaNambaAirtel);
  const [localWakalaMpesa, setLocalWakalaMpesa] = useState(wakalaMpesa);
  const [localWakalaTigo, setLocalWakalaTigo] = useState(wakalaTigo);
  const [localWakalaAirtel, setLocalWakalaAirtel] = useState(wakalaAirtel);
  const [localLipaNambaHalopesa, setLocalLipaNambaHalopesa] = useState(lipaNambaHalopesa);
  const [localWakalaHalopesa, setLocalWakalaHalopesa] = useState(wakalaHalopesa);
  const [localLipaNambaAzampesa, setLocalLipaNambaAzampesa] = useState(lipaNambaAzampesa);
  const [localBankAccountInfo, setLocalBankAccountInfo] = useState(bankAccountInfo);
  const [localInstagramLink, setLocalInstagramLink] = useState(instagramLink);
  const [localTiktokLink, setLocalTiktokLink] = useState(tiktokLink);
  const [localFacebookLink, setLocalFacebookLink] = useState(facebookLink);
  const [localYoutubeLink, setLocalYoutubeLink] = useState(youtubeLink);
  const [localPaymentInstructions, setLocalPaymentInstructions] = useState(paymentInstructions);
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Propagate changes to parent App state
    onChangeSystemName(localSystemName);
    setReceiptBusinessName(localBusinessName);
    setReceiptAddress(localAddress);
    setReceiptContact(localContact);
    setReceiptFooter(localFooter);
    setDefaultTaxRate(localTaxRate);

    // Propagate storefront settings
    onChangeWhatsappNumber(localWhatsappNumber);
    onChangeLipaNambaMpesa(localLipaNambaMpesa);
    onChangeLipaNambaTigo(localLipaNambaTigo);
    onChangeLipaNambaAirtel(localLipaNambaAirtel);
    onChangeWakalaMpesa(localWakalaMpesa);
    onChangeWakalaTigo(localWakalaTigo);
    onChangeWakalaAirtel(localWakalaAirtel);
    onChangeLipaNambaHalopesa(localLipaNambaHalopesa);
    onChangeWakalaHalopesa(localWakalaHalopesa);
    onChangeLipaNambaAzampesa(localLipaNambaAzampesa);
    onChangeBankAccountInfo(localBankAccountInfo);
    onChangeInstagramLink(localInstagramLink);
    onChangeTiktokLink(localTiktokLink);
    onChangeFacebookLink(localFacebookLink);
    onChangeYoutubeLink(localYoutubeLink);
    onChangePaymentInstructions(localPaymentInstructions);
    
    // Log action
    onAddAuditLog('Mipangilio ya Mfumo', `Mipangilio ya jina la mfumo, risiti, na duka la mtandaoni imebadilishwa.`);
    
    // Show success feedback
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm('Je, unataka kurudisha mipangilio ya mwanzo (Default Settings)?')) {
      setLocalSystemName('HUREX GROUP');
      setLocalBusinessName('HUREX GROUP OF COMPANIES LTD');
      setLocalAddress('Mlimani City, Dar es Salaam, Tanzania');
      setLocalContact('Simu: +255 712 345 678 | Email: hurexgroup88@gmail.com');
      setLocalFooter('KARIBU TENA - HUREX GROUP');
      setLocalTaxRate(18);

      setLocalWhatsappNumber('255712345678');
      setLocalLipaNambaMpesa('556677');
      setLocalLipaNambaTigo('889900');
      setLocalLipaNambaAirtel('');
      setLocalWakalaMpesa('');
      setLocalWakalaTigo('');
      setLocalWakalaAirtel('');
      setLocalLipaNambaHalopesa('');
      setLocalWakalaHalopesa('');
      setLocalLipaNambaAzampesa('');
      setLocalBankAccountInfo('');
      setLocalInstagramLink('');
      setLocalTiktokLink('');
      setLocalFacebookLink('');
      setLocalYoutubeLink('');
      setLocalPaymentInstructions('Lipa kabla ya kutuma agizo ili kuanza maandalizi ya mzigo wako.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-150 dark:border-zinc-800">
        <h2 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-blue-500 animate-spin-slow" />
          {language === 'sw' ? 'Mipangilio ya Mfumo na Risiti' : 'System & Receipt Settings'}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {language === 'sw' 
            ? 'Marekebisho ya jina la mfumo wako, anwani, mawasiliano ya duka na muundo wa risiti inayochapishwa.'
            : 'Configure your application title, store address, contact info, and receipt layout.'
          }
        </p>
      </div>

      {/* Two Columns: Left Form, Right Receipt Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Inputs Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-50 dark:border-zinc-800/60">
            <Sliders className="w-4.5 h-4.5 text-blue-500" />
            <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wider">
              {language === 'sw' ? 'Jopo la Mipangilio (Configuration)' : 'Configuration Panel'}
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Language Configuration */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150/60 dark:border-zinc-800">
              <label className="block text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-500 animate-spin-slow" />
                {language === 'sw' ? 'Lugha ya Mfumo (System Language):' : 'System Language (Lugha):'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-base">🇺🇸</span> English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('sw')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    language === 'sw'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-base">🇹🇿</span> Kiswahili
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                {language === 'sw'
                  ? 'Badilisha lugha ya mfumo mzima kati ya Kiingereza na Kiswahili papo hapo.'
                  : 'Instantly switch the entire system language between English and Swahili.'}
              </p>
            </div>

            {/* System Name Configuration */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Jina la Mfumo (App System Title):' : 'App System Title:'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                </span>
                <input
                  type="text"
                  required
                  value={localSystemName}
                  onChange={(e) => setLocalSystemName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                  placeholder={language === 'sw' ? 'Mfano: HUREX GROUP au SMART POS' : 'Example: HUREX GROUP or SMART POS'}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                {language === 'sw' 
                  ? 'Hili litabadilisha jina kuu linaloonekana kwenye upande wa kushoto (Sidebar) na kote kwenye mfumo.'
                  : 'This changes the primary brand title displayed on the Sidebar and across the system.'}
              </p>
            </div>

            {/* Receipt Business Name */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Jina la Biashara Kwenye Risiti (Receipt Header):' : 'Receipt Header (Business Name):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="w-4 h-4 text-amber-500" />
                </span>
                <input
                  type="text"
                  required
                  value={localBusinessName}
                  onChange={(e) => setLocalBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                  placeholder={language === 'sw' ? 'Mfano: HUREX GROUP OF COMPANIES LTD' : 'Example: HUREX GROUP OF COMPANIES LTD'}
                />
              </div>
            </div>

            {/* Store Address */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Anuani / Mahali Duka Lilipo (Store Location):' : 'Store Location / Address:'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </span>
                <input
                  type="text"
                  required
                  value={localAddress}
                  onChange={(e) => setLocalAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                  placeholder={language === 'sw' ? 'Mfano: Mlimani City, Dar es Salaam, Tanzania' : 'Example: Mlimani City, Dar es Salaam, Tanzania'}
                />
              </div>
            </div>

            {/* Contacts Info */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Mawasiliano na Barua Pepe (Phone & Email):' : 'Phone & Email Contacts:'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="text"
                  required
                  value={localContact}
                  onChange={(e) => setLocalContact(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                  placeholder={language === 'sw' ? 'Mfano: Simu: +255 712 345 678 | Email: info@domain.com' : 'Example: Phone: +255 712 345 678 | Email: info@domain.com'}
                />
              </div>
            </div>

            {/* Receipt Footer Message */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Ujumbe wa Chini ya Risiti (Receipt Footer Greeting):' : 'Receipt Footer Greeting:'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileText className="w-4 h-4 text-indigo-500" />
                </span>
                <input
                  type="text"
                  required
                  value={localFooter}
                  onChange={(e) => setLocalFooter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                  placeholder={language === 'sw' ? 'Mfano: KARIBU TENA - HUREX GROUP' : 'Example: THANK YOU - HUREX GROUP'}
                />
              </div>
            </div>

            {/* Global Tax/VAT Rate */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                {language === 'sw' ? 'Kiwango cha VAT ya Mfumo Default (% Default VAT Rate):' : 'Default VAT / Tax Rate (%):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Percent className="w-4 h-4 text-blue-500" />
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={localTaxRate}
                  onChange={(e) => setLocalTaxRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:text-black focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                {language === 'sw' 
                  ? 'Kiwango hiki cha kodi kitatumika kiotomatiki wakati wa kuanzisha mauzo mapya ya bidhaa duka.'
                  : 'This tax rate is automatically applied when starting a new sale.'}
              </p>
            </div>

             {/* Hali ya Macho Salama / Eye-Care Night Mode (Warm Sepia) */}
             <div className="p-4 bg-amber-500/5 dark:bg-amber-950/10 rounded-2xl border border-amber-500/15 dark:border-amber-900/25 mt-4">
              <div className="flex items-center justify-between">
                <div className="max-w-[80%]">
                  <h4 className="text-xs font-black text-amber-800 dark:text-amber-200 uppercase tracking-tight flex items-center gap-1.5">
                    <span className="text-sm">👁️</span>
                    <span>{language === 'sw' ? 'Hali ya Macho Salama (Usiku)' : 'Eye-Care Night Mode'}</span>
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-amber-300/70 mt-0.5">
                    {language === 'sw'
                      ? 'Badilisha rangi za mfumo kuwa za joto (Warm Sepia) ili kulinda macho yako na kuzuia uchovu unapotumia mfumo wakati wa usiku au kwenye giza.'
                      : 'Switch screen colors to cozy, warm sepia tones to eliminate blue light, protect your eyes, and prevent fatigue at night.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={() => onToggleTheme && onToggleTheme()}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 dark:bg-amber-900/30 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>

             {/* High Contrast Black Text Mode (Mwandiko Mweusi) */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 mt-4">
              <div className="flex items-center justify-between">
                <div className="max-w-[80%]">
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                    {language === 'sw' ? 'Mwandiko Mweusi Uliokolezwa (High Contrast Text)' : 'High Contrast Text Mode'}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {language === 'sw'
                      ? 'Wezesha mwandiko mweusi kabisa uliokolezwa ili kurahisisha usomaji wa taarifa, ripoti na risiti chini ya mwanga wowote mweupe.'
                      : 'Enable extreme text contrast (pitch black) to optimize reading receipts, reports, and details on the white screen.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blackTextEnabled}
                    onChange={(e) => onToggleBlackText(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Online Store & WhatsApp Order Configuration */}
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/20 space-y-4">
              <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-100/40 dark:border-emerald-900/10">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  {language === 'sw' ? 'Mpangilio wa Duka la Mtandaoni & WhatsApp' : 'Online Storefront & WhatsApp Settings'}
                </h4>
              </div>

              {/* WhatsApp Phone Number */}
              <div>
                <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                  Namba ya WhatsApp ya Kupokea Oda (Bila alama ya +):
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-emerald-500" />
                  </span>
                  <input
                    type="text"
                    required
                    value={localWhatsappNumber}
                    onChange={(e) => setLocalWhatsappNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:text-black focus:outline-hidden"
                    placeholder="Mfano: 255785659204, 255761929290"
                  />
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">
                  Ingiza namba ya simu ianze na 255 bila alama ya kujumuisha (+) kwa ajili ya WhatsApp API. Unaweza kuweka namba zaidi ya moja kwa kuzitenganisha na koma (e.g. <b>255785659204, 255761929290</b>). Mteja atachagua namba ya kutuma wakati wa kuagiza.
                </p>
              </div>

              <div className="space-y-4 border-t border-emerald-100/40 dark:border-emerald-900/10 pt-4">
                <span className="block text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  🏦 Njia za Malipo ya Mitandao ya Simu & Wakala:
                </span>
                
                {/* M-PESA (VODACOM) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      M-Pesa (Vodacom) - Lipa Namba:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <CreditCard className="w-4 h-4 text-red-500" />
                      </span>
                      <input
                        type="text"
                        value={localLipaNambaMpesa}
                        onChange={(e) => setLocalLipaNambaMpesa(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 556677"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      M-Pesa (Vodacom) - Code ya Wakala:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-red-500" />
                      </span>
                      <input
                        type="text"
                        value={localWakalaMpesa}
                        onChange={(e) => setLocalWakalaMpesa(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 12345 (Tuma kwa Wakala)"
                      />
                    </div>
                  </div>
                </div>

                {/* TIGO PESA (TIGO) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Tigo Pesa - Lipa Namba:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      </span>
                      <input
                        type="text"
                        value={localLipaNambaTigo}
                        onChange={(e) => setLocalLipaNambaTigo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 889900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Tigo Pesa - Code ya Wakala:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-blue-500" />
                      </span>
                      <input
                        type="text"
                        value={localWakalaTigo}
                        onChange={(e) => setLocalWakalaTigo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 54321 (Tuma kwa Wakala)"
                      />
                    </div>
                  </div>
                </div>

                {/* AIRTEL MONEY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Airtel Money - Lipa Namba:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <CreditCard className="w-4 h-4 text-red-600" />
                      </span>
                      <input
                        type="text"
                        value={localLipaNambaAirtel}
                        onChange={(e) => setLocalLipaNambaAirtel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 112233"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Airtel Money - Code ya Wakala:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-red-600" />
                      </span>
                      <input
                        type="text"
                        value={localWakalaAirtel}
                        onChange={(e) => setLocalWakalaAirtel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 98765 (Tuma kwa Wakala)"
                      />
                    </div>
                  </div>
                </div>

                {/* HALOPESA (HALOTEL) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      HaloPesa (Halotel) - Lipa Namba:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                      </span>
                      <input
                        type="text"
                        value={localLipaNambaHalopesa}
                        onChange={(e) => setLocalLipaNambaHalopesa(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 445566"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      HaloPesa (Halotel) - Code ya Wakala:
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-orange-500" />
                      </span>
                      <input
                        type="text"
                        value={localWakalaHalopesa}
                        onChange={(e) => setLocalWakalaHalopesa(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="Mfano: 56789 (Tuma kwa Wakala)"
                      />
                    </div>
                  </div>
                </div>

                {/* AZAM PESA */}
                <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    Namba ya Lipa kwa Azam Pesa:
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                    </span>
                    <input
                      type="text"
                      value={localLipaNambaAzampesa}
                      onChange={(e) => setLocalLipaNambaAzampesa(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="Mfano: 778899"
                    />
                  </div>
                </div>

                {/* BANK DETAILS */}
                <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                    Taarifa za Akaunti ya Benki (Namba ya Akaunti, Jina la Benki & Akaunti):
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Building className="w-4 h-4 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      value={localBankAccountInfo}
                      onChange={(e) => setLocalBankAccountInfo(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="Mfano: CRDB Bank: 0152345678900 (Jina: HUREX SHOP)"
                    />
                  </div>
                </div>
              </div>

              {/* SOCIAL MEDIA SECTION */}
              <div className="space-y-4 border-t border-emerald-100/40 dark:border-emerald-900/10 pt-4">
                <span className="block text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
                  📱 Mitandao ya Kijamii (Social Media Platforms):
                </span>
                <p className="text-[9px] text-zinc-400">Ingiza link kamili (URL) za mitandao ya kijamii ya duka lako ili wateja wazifikie kwa urahisi.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Instagram */}
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Instagram Link (URL):
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Instagram className="w-4 h-4 text-pink-500" />
                      </span>
                      <input
                        type="url"
                        value={localInstagramLink}
                        onChange={(e) => setLocalInstagramLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="https://instagram.com/jina_la_duka"
                      />
                    </div>
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      TikTok Link (URL):
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Globe className="w-4 h-4 text-black dark:text-zinc-200" />
                      </span>
                      <input
                        type="url"
                        value={localTiktokLink}
                        onChange={(e) => setLocalTiktokLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="https://tiktok.com/@jina_la_duka"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      Facebook Page Link (URL):
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Facebook className="w-4 h-4 text-blue-600" />
                      </span>
                      <input
                        type="url"
                        value={localFacebookLink}
                        onChange={(e) => setLocalFacebookLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="https://facebook.com/jina_la_duka"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                      YouTube Channel Link (URL):
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Youtube className="w-4 h-4 text-red-600" />
                      </span>
                      <input
                        type="url"
                        value={localYoutubeLink}
                        onChange={(e) => setLocalYoutubeLink(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        placeholder="https://youtube.com/c/jina_la_duka"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div>
                <label className="block text-emerald-800 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-wider mb-1">
                  Maelezo ya Malipo (Maelekezo mengine):
                </label>
                <textarea
                  value={localPaymentInstructions}
                  onChange={(e) => setLocalPaymentInstructions(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-850 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-black text-black dark:text-white focus:ring-2 focus:ring-emerald-500 focus:text-black focus:outline-hidden resize-none"
                  rows={2}
                  placeholder="Mfano: Malipo kupitia NMB Bank: 012345678 (HUREX LTD) au Halopesa..."
                />
              </div>
            </div>
          </div>

          {/* Save & Reset buttons */}
          <div className="flex flex-wrap gap-3 pt-5 border-t border-zinc-50 dark:border-zinc-800/65 justify-between items-center">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              {language === 'sw' ? 'Kurudisha ya Awali' : 'Reset to Defaults'}
            </button>

            <div className="flex gap-3">
              {isSaved && (
                <span className="text-emerald-500 font-bold text-xs flex items-center gap-1 animate-fade-in">
                  <Check className="w-4 h-4" />
                  {language === 'sw' ? 'Hifadhi imefanikiwa!' : 'Saved successfully!'}
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {language === 'sw' ? 'Hifadhi Mipangilio yote' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Live Continuous Roll Thermal Receipt Preview on the Right */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
            <Eye className="w-4.5 h-4.5 text-blue-500" />
            <span>{language === 'sw' ? 'Monekano wa Risiti (Live Preview)' : 'Receipt Live Preview'}</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-3xl border border-zinc-200/40 dark:border-zinc-800/40 shadow-xs flex justify-center">
            {/* Real continuous roll thermal receipt mock */}
            <div className="w-full max-w-[270px] bg-white text-zinc-900 border border-zinc-300 p-4 shadow-md font-sans text-[10px] leading-tight select-none relative animate-pulse-subtle">
              {/* Thermal receipt jagged top edge effect */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(135deg,#e2e8f0_25%,transparent_25%),linear-gradient(225deg,#e2e8f0_25%,transparent_25%)] bg-[size:6px_6px] bg-repeat-x"></div>

              <div className="text-center pt-2 pb-3 border-b border-dashed border-zinc-300">
                <h4 className="text-[11px] font-black uppercase tracking-wide break-words">{localBusinessName || 'JINA LA BIASHARA'}</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5 break-words">{localAddress || 'Anwani ya Duka'}</p>
                <p className="text-[9px] text-zinc-400 break-words">{localContact || 'Mawasiliano na Email'}</p>
                <div className="text-[10px] font-bold text-zinc-800 border-t border-zinc-200 mt-2 pt-1 font-mono">
                  {language === 'sw' ? 'RISITI YA MFUMO:' : 'SYSTEM RECEIPT:'} {localSystemName.toUpperCase()}
                </div>
              </div>

              {/* Sample Details */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 text-zinc-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Invoisi No:' : 'Invoice No:'}</span>
                  <span className="font-bold text-zinc-800">TX-2026-0089</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Muda/Saa:' : 'Date/Time:'}</span>
                  <span className="font-mono">2026-06-30 14:25:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Mteja:' : 'Customer:'}</span>
                  <span className="font-semibold text-zinc-800">{language === 'sw' ? 'Mteja wa Kawaida' : 'Standard Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'sw' ? 'Njia ya Malipo:' : 'Payment Method:'}</span>
                  <span className="font-semibold">Cash</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>John Admin</span>
                </div>
              </div>

              {/* Sample Sale Items */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 space-y-1">
                <div className="flex justify-between text-zinc-400 font-bold uppercase text-[8px] tracking-wider">
                  <span className="flex-1">{language === 'sw' ? 'Bidhaa x Qty' : 'Item x Qty'}</span>
                  <span className="w-14 text-right">{language === 'sw' ? 'Bei' : 'Price'}</span>
                  <span className="w-16 text-right">{language === 'sw' ? 'Jumla' : 'Total'}</span>
                </div>
                
                <div className="flex justify-between text-zinc-700">
                  <span className="flex-1 truncate pr-1">
                    {language === 'sw' ? 'Dawa ya Meno Colgate' : 'Colgate Toothpaste'} <em className="text-zinc-400 text-[8px] block not-italic">x 2 Pcs</em>
                  </span>
                  <span className="w-14 text-right font-mono">3,500</span>
                  <span className="w-16 text-right font-bold font-mono">7,000</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span className="flex-1 truncate pr-1">
                    {language === 'sw' ? 'Maji Safi ya Uhai 1.5L' : 'Uhai Mineral Water 1.5L'} <em className="text-zinc-400 text-[8px] block not-italic">x 5 Pcs</em>
                  </span>
                  <span className="w-14 text-right font-mono">1,000</span>
                  <span className="w-16 text-right font-bold font-mono">5,000</span>
                </div>
              </div>

              {/* Sample Sums */}
              <div className="py-2.5 border-b border-dashed border-zinc-300 space-y-1">
                <div className="flex justify-between text-zinc-500">
                  <span>{language === 'sw' ? 'Nusu-Jumla (Subtotal):' : 'Subtotal:'}</span>
                  <span className="font-mono">10,169</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>VAT ({localTaxRate}%):</span>
                  <span className="font-mono">{Math.round(12000 * (localTaxRate / (100 + localTaxRate))).toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US')}</span>
                </div>
                <div className="flex justify-between text-zinc-900 font-extrabold text-[11px] pt-1">
                  <span>{language === 'sw' ? 'JUMLA KUU:' : 'GRAND TOTAL:'}</span>
                  <span className="font-mono text-blue-600 font-black">Sh 12,000</span>
                </div>
              </div>

              {/* Sample Greetings */}
              <div className="text-center pt-3 text-zinc-500 space-y-1">
                <p>{language === 'sw' ? 'Asante kwa kufanya biashara nasi!' : 'Thank you for your business!'}</p>
                <p className="font-black tracking-wider text-[8px] uppercase text-zinc-700 break-words">
                  {localFooter || (language === 'sw' ? 'KARIBU TENA' : 'WELCOME AGAIN')}
                </p>
              </div>

              {/* Continuous Roll bottom rip-off jagged look */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[linear-gradient(315deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,#e2e8f0_25%,transparent_25%)] bg-[size:6px_6px] bg-repeat-x"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
