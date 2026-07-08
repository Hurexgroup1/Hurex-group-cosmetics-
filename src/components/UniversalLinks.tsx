import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, Search, RefreshCw, Layers, ShieldAlert, Award, 
  Store, FileText, LayoutGrid, BarChart3, ChevronRight, HelpCircle, 
  Trash2, Filter, AlertCircle, Smartphone, Globe, Calendar, Clock, Save
} from 'lucide-react';
import { Product, Customer, Sale, OnlineOrder, Affiliate, AffiliateClick } from '../types';
import CopyableLink from './CopyableLink';

interface UniversalLinksProps {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  onlineOrders: OnlineOrder[];
  language: 'en' | 'sw';
  formatMoney: (amount: number) => string;
}

type LinkCategory = 'All' | 'Online Store' | 'Business Invoice' | 'Affiliate & MLM' | 'System & Security';

interface SavedLink {
  id: string;
  url: string;
  label: string;
  category: LinkCategory | 'Other';
  timestamp: string;
}

export default function UniversalLinks({
  products = [],
  customers = [],
  sales = [],
  onlineOrders = [],
  language,
  formatMoney
}: UniversalLinksProps) {
  const [activeTab, setActiveTab] = useState<'directory' | 'generator' | 'saved' | 'analytics'>('directory');
  const [selectedCategory, setSelectedCategory] = useState<LinkCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Saved links state
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  
  // Custom manual link states
  const [manualUrl, setManualUrl] = useState('');
  const [manualLabel, setManualLabel] = useState('');
  const [manualCategory, setManualCategory] = useState<LinkCategory | 'Other'>('Other');
  
  // Generator form states
  const [genCategory, setGenCategory] = useState<LinkCategory>('Online Store');
  const [genTarget, setGenTarget] = useState('homepage'); // Target subtype
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [customPromo, setCustomPromo] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Analytics states
  const [clickLogs, setClickLogs] = useState<AffiliateClick[]>([]);
  const [analyticsFilter, setAnalyticsFilter] = useState('');

  // Auto detect host origin
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://erp.hurexgroup.com';

  // Load and watch click logs
  const loadClickLogs = () => {
    try {
      const logsJson = localStorage.getItem('hurex_affiliate_clicks');
      if (logsJson) {
        setClickLogs(JSON.parse(logsJson));
      } else {
        // Seed default analytics if empty
        const sampleLogs: AffiliateClick[] = [
          {
            id: 'clk-1',
            affiliateCode: 'HRX-UPENDO-01',
            ip: '197.250.48.12',
            device: 'Mobile (iPhone)',
            browser: 'Safari',
            location: 'Dar es Salaam',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            campaign: 'ramadhan-sale',
            productId: products[0]?.id || 'p1'
          },
          {
            id: 'clk-2',
            affiliateCode: 'HRX-CHUMA-99',
            ip: '197.250.112.56',
            device: 'Desktop',
            browser: 'Chrome',
            location: 'Mwanza',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            campaign: 'facebook-ads'
          }
        ];
        localStorage.setItem('hurex_affiliate_clicks', JSON.stringify(sampleLogs));
        setClickLogs(sampleLogs);
      }
    } catch (err) {
      console.error("Error loading click logs:", err);
    }
  };

  useEffect(() => {
    loadClickLogs();
    // Setup interval to poll click analytics changes
    const interval = setInterval(loadClickLogs, 4000);
    return () => clearInterval(interval);
  }, [products]);

  // Handle Clear Logs
  const handleClearLogs = () => {
    if (confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta rekodi zote za ufuatiliaji?' : 'Are you sure you want to clear all tracking records?')) {
      localStorage.setItem('hurex_affiliate_clicks', JSON.stringify([]));
      setClickLogs([]);
    }
  };

  // Load saved links on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hurex_saved_links');
      if (stored) {
        setSavedLinks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading saved links:", e);
    }
  }, []);

  // Handle Save & Copy Link
  const handleSaveLink = (urlToSave: string, catToSave: LinkCategory | 'Other', labelToSave: string) => {
    const finalLabel = labelToSave.trim() || (language === 'sw' ? `Kiungo cha ${catToSave}` : `${catToSave} Link`);
    const newLink: SavedLink = {
      id: 'saved-' + Date.now(),
      url: urlToSave,
      label: finalLabel,
      category: catToSave,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newLink, ...savedLinks];
    setSavedLinks(updated);
    localStorage.setItem('hurex_saved_links', JSON.stringify(updated));

    // Copy to clipboard!
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToSave);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = urlToSave;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      alert(language === 'sw' 
        ? `Kiungo "${finalLabel}" kimehifadhiwa na kunakiliwa kwenye Clipboard kikamilifu!` 
        : `Link "${finalLabel}" successfully saved and copied to Clipboard!`);
    } catch (err) {
      console.error(err);
      alert(language === 'sw' 
        ? `Kiungo "${finalLabel}" kimehifadhiwa ila imeshindwa kunakili otomatiki.` 
        : `Link "${finalLabel}" saved, but failed to auto-copy to clipboard.`);
    }
  };

  // Handle Save Manual Link
  const handleSaveManualLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) {
      alert(language === 'sw' ? 'Tafadhali weka kiungo/URL kwanza!' : 'Please enter a link URL first!');
      return;
    }
    const finalLabel = manualLabel.trim() || (language === 'sw' ? 'Kiungo Maalum' : 'Custom Link');
    const newLink: SavedLink = {
      id: 'saved-' + Date.now(),
      url: manualUrl.trim(),
      label: finalLabel,
      category: manualCategory as any,
      timestamp: new Date().toISOString()
    };
    
    const updated = [newLink, ...savedLinks];
    setSavedLinks(updated);
    localStorage.setItem('hurex_saved_links', JSON.stringify(updated));

    // Copy to clipboard!
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(manualUrl.trim());
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = manualUrl.trim();
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      alert(language === 'sw' 
        ? `Kiungo "${finalLabel}" kimehifadhiwa na kunakiliwa kwenye Clipboard kikamilifu!` 
        : `Link "${finalLabel}" successfully saved and copied to Clipboard!`);
    } catch (err) {
      console.error(err);
      alert(language === 'sw' 
        ? `Kiungo "${finalLabel}" kimehifadhiwa ila imeshindwa kunakili otomatiki.` 
        : `Link "${finalLabel}" saved, but failed to auto-copy to clipboard.`);
    }

    // Reset inputs
    setManualUrl('');
    setManualLabel('');
    setManualCategory('Other');
  };

  // Pre-configured static/core links directory
  const coreLinks = [
    {
      id: 'store-home',
      category: 'Online Store' as LinkCategory,
      title_sw: 'Ukurasa wa Nyumbani wa Duka',
      title_en: 'Online Store Homepage',
      desc_sw: 'Kiungo kikuu cha wateja kuagiza bidhaa mtandaoni na kufanya malipo.',
      desc_en: 'Main URL for customers to browse catalog, order online, and checkout.',
      url: `${origin}/?view=store`
    },
    {
      id: 'affiliate-register',
      category: 'Affiliate & MLM' as LinkCategory,
      title_sw: 'Ukurasa wa Kujiunga na Washirika',
      title_en: 'Affiliate Portal & MLM Signup',
      desc_sw: 'Portal ya washirika kujiandikisha na kufuatilia tume zao za MLM ngazi ya 1, 2, na 3.',
      desc_en: 'Main application link for new partners to enroll as affiliates and track commissions.',
      url: `${origin}/?view=affiliate-register`
    },
    {
      id: 'order-tracking',
      category: 'Online Store' as LinkCategory,
      title_sw: 'Ufuatiliaji wa Agizo la Mteja',
      title_en: 'Customer Order Tracking Portal',
      desc_sw: 'Kiungo cha wateja kujaza namba ya agizo ili kuona hatua ya usafirishaji.',
      desc_en: 'Universal portal for buyers to enter their order number and track status.',
      url: `${origin}/?view=store&tab=track-order`
    },
    {
      id: 'invoice-payment',
      category: 'Business Invoice' as LinkCategory,
      title_sw: 'Ukurasa Mkuu wa Malipo ya Ankara',
      title_en: 'Business Quick Pay Gateway',
      desc_sw: 'Portal ya mteja yeyote kulipia ankara za mauzo au kulipa malimbikizo ya mikopo.',
      desc_en: 'Unified payment receipt and loan settlement gateway for store credit customers.',
      url: `${origin}/?view=pay-invoice`
    },
    {
      id: 'system-staff-invite',
      category: 'System & Security' as LinkCategory,
      title_sw: 'Mwaliko wa Watumiaji Wapya (Staff)',
      title_en: 'Staff Portal Invitation Link',
      desc_sw: 'Kiungo cha usalama cha kuwaalika wauzaji (cashiers) au wasimamizi kujiunga na mfumo.',
      desc_en: 'Secure onboarding URL used to register cache clerks and assistant managers.',
      url: `${origin}/?view=register&invite=staff`
    }
  ];

  // Get unique categories from products list
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Generate customized link handler
  const handleGenerateCustomLink = () => {
    let baseUrl = origin;
    let queryParams = [];

    if (genCategory === 'Online Store') {
      queryParams.push('view=store');
      if (genTarget === 'product' && selectedProduct) {
        queryParams.push(`product=${selectedProduct}`);
      } else if (genTarget === 'category' && selectedCategoryName) {
        queryParams.push(`category=${encodeURIComponent(selectedCategoryName)}`);
      } else if (genTarget === 'promo' && customPromo) {
        queryParams.push(`promo=${encodeURIComponent(customPromo.toUpperCase())}`);
      }
    } else if (genCategory === 'Business Invoice') {
      queryParams.push('view=invoice-viewer');
      if (genTarget === 'customer' && selectedCustomer) {
        queryParams.push(`customer=${selectedCustomer}`);
      } else if (genTarget === 'invoice' && selectedInvoice) {
        queryParams.push(`invoice=${selectedInvoice}`);
      }
    } else if (genCategory === 'Affiliate & MLM') {
      queryParams.push('view=store');
      if (selectedAffiliate) {
        queryParams.push(`ref=${selectedAffiliate}`);
      }
      if (genTarget === 'product-affiliate' && selectedProduct) {
        queryParams.push(`product=${selectedProduct}`);
      }
    } else if (genCategory === 'System & Security') {
      if (genTarget === 'password-reset') {
        queryParams.push('action=password-reset');
      } else {
        queryParams.push('view=register');
        queryParams.push('invite=staff');
      }
    }

    const fullUrl = queryParams.length > 0 ? `${baseUrl}/?${queryParams.join('&')}` : baseUrl;
    setGeneratedLink(fullUrl);
  };

  // Trigger link generation automatically when form inputs change
  useEffect(() => {
    handleGenerateCustomLink();
  }, [genCategory, genTarget, selectedProduct, selectedCategoryName, selectedCustomer, selectedInvoice, selectedAffiliate, customPromo]);

  // Filter core links list
  const filteredCoreLinks = coreLinks.filter(item => {
    const categoryMatches = selectedCategory === 'All' || item.category === selectedCategory;
    const searchString = `${item.title_sw} ${item.title_en} ${item.desc_sw} ${item.desc_en} ${item.url}`.toLowerCase();
    const searchMatches = searchString.includes(searchTerm.toLowerCase());
    return categoryMatches && searchMatches;
  });

  // Calculate high-level tracking statistics
  const totalClicks = clickLogs.length;
  const uniqueAffiliatesCount = Array.from(new Set(clickLogs.map(c => c.affiliateCode))).length;
  const mobileClicks = clickLogs.filter(c => c.device.toLowerCase().includes('mobile')).length;
  const desktopClicks = clickLogs.filter(c => c.device.toLowerCase().includes('desktop') || c.device.toLowerCase().includes('browser')).length;

  return (
    <div className="space-y-6">
      {/* Visual Elegant Header Block */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500 text-white rounded-2xl">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                {language === 'sw' ? 'Injini ya Viungo vya Universal' : 'Universal Copyable Link System'}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed font-bold">
              {language === 'sw' 
                ? 'Injini ya kisasa ya kutengeneza, kubinafsisha, nakala, kusambaza, na kufuatilia anwani na viungo vya duka la mtandaoni, ankara za malipo, na washirika (Affiliate Program) wenye usalama wa hali ya juu na QR Code.'
                : 'Advanced management hub to generate, customize, copy, and track online store URLs, digital payment invoices, referral programs, with secure QR Code assets.'}
            </p>
          </div>

          {/* Tab Selection Pill Controller */}
          <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 self-stretch md:self-auto gap-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'directory'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400'
              }`}
            >
              {language === 'sw' ? 'Orodha ya Viungo' : 'Link Directory'}
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'generator'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400'
              }`}
            >
              {language === 'sw' ? 'Tengeneza Kiungo' : 'Link Generator'}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400'
              }`}
            >
              {language === 'sw' ? 'Viungo Vilivyohifadhiwa' : 'Saved Links'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400'
              }`}
            >
              {language === 'sw' ? 'Ufuatiliaji (Clicks)' : 'Live Analytics'}
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: PRE-CONFIGURED LINK DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Filters & Search Row */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 self-start">
              {(['All', 'Online Store', 'Business Invoice', 'Affiliate & MLM', 'System & Security'] as LinkCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-1.5 px-3 rounded-full text-[11px] font-black uppercase tracking-wider transition border ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                      : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {cat === 'All' && (language === 'sw' ? 'Vyote' : 'All Links')}
                  {cat === 'Online Store' && (language === 'sw' ? 'Duka la Mtandaoni' : 'Online Store')}
                  {cat === 'Business Invoice' && (language === 'sw' ? 'Ankara & Risiti' : 'Invoices')}
                  {cat === 'Affiliate & MLM' && (language === 'sw' ? 'Affiliate & Tume' : 'Affiliates')}
                  {cat === 'System & Security' && (language === 'sw' ? 'Ulinzi & Mfumo' : 'System Invites')}
                </button>
              ))}
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'sw' ? 'Tafuta kiungo hapa...' : 'Search universal links...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          {/* Links Directory Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCoreLinks.length > 0 ? (
              filteredCoreLinks.map((item) => (
                <div key={item.id} className="grid grid-cols-1 gap-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-3xl hover:shadow-xs transition duration-250">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-zinc-850 dark:text-white leading-tight">
                      {language === 'sw' ? item.title_sw : item.title_en}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
                      {language === 'sw' ? item.desc_sw : item.desc_en}
                    </p>
                  </div>

                  {/* Rendering the Copyable Link interactive card inside */}
                  <CopyableLink 
                    url={item.url} 
                    category={item.category as any} 
                    language={language}
                    trackingId={item.id}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-8 h-8 text-zinc-400" />
                <p className="text-xs font-black text-zinc-550 dark:text-zinc-400">
                  {language === 'sw' ? 'Hakuna viungo vilivyopatikana kulingana na vichujio vyako.' : 'No links found matching your filters.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DYNAMIC LINK GENERATOR & BUILDER */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Parameters panel */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl space-y-5">
            <h3 className="text-sm font-black text-zinc-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-blue-500" />
              {language === 'sw' ? 'Sanidi Kiungo Kazi / Kipekee' : 'Configure Custom Smart Link'}
            </h3>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-650 dark:text-zinc-400 block">
                {language === 'sw' ? '1. Chagua Kundi la Kiungo' : '1. Choose Link Category'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { id: 'Online Store', icon: Store, labelSw: 'Duka Mtandaoni', labelEn: 'Online Store' },
                  { id: 'Business Invoice', icon: FileText, labelSw: 'Ankara & Malipo', labelEn: 'Invoice/Receipt' },
                  { id: 'Affiliate & MLM', icon: Award, labelSw: 'Affiliate & MLM', labelEn: 'Affiliates' },
                  { id: 'System & Security', icon: ShieldAlert, labelSw: 'Ulinzi & Mwaliko', labelEn: 'Security' }
                ] as const).map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setGenCategory(cat.id);
                        // Reset defaults
                        if (cat.id === 'Online Store') setGenTarget('homepage');
                        else if (cat.id === 'Business Invoice') setGenTarget('customer');
                        else if (cat.id === 'Affiliate & MLM') setGenTarget('general-affiliate');
                        else if (cat.id === 'System & Security') setGenTarget('staff-invite');
                      }}
                      className={`p-3 border rounded-2xl flex flex-col items-center gap-1.5 transition text-center ${
                        genCategory === cat.id
                          ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 dark:border-blue-500/80'
                          : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-[10px] font-black leading-none block">
                        {language === 'sw' ? cat.labelSw : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Select depending on Category */}
            <div className="space-y-4">
              <label className="text-xs font-black text-zinc-650 dark:text-zinc-400 block">
                {language === 'sw' ? '2. Chagua Lengo la Kiungo' : '2. Select Link Target'}
              </label>

              {/* Online Store Options */}
              {genCategory === 'Online Store' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'homepage', labelSw: 'Ukurasa Mkuu', labelEn: 'Store Home' },
                      { id: 'product', labelSw: 'Bidhaa Maalum', labelEn: 'Specific Product' },
                      { id: 'category', labelSw: 'Kundi la Bidhaa', labelEn: 'Product Category' },
                      { id: 'promo', labelSw: 'Msimbo wa Ofa', labelEn: 'Promo/Discounts' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGenTarget(opt.id)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center transition ${
                          genTarget === opt.id
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {language === 'sw' ? opt.labelSw : opt.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Context dropdowns */}
                  {genTarget === 'product' && (
                    <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Chagua Bidhaa' : 'Select Product'}
                      </span>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="w-full text-xs font-bold p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                      >
                        <option value="">-- {language === 'sw' ? 'Chagua Bidhaa hapa' : 'Select Product here'} --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ({formatMoney(p.sellingPrice)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {genTarget === 'category' && (
                    <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Chagua Kundi la Bidhaa' : 'Select Product Category'}
                      </span>
                      <select
                        value={selectedCategoryName}
                        onChange={(e) => setSelectedCategoryName(e.target.value)}
                        className="w-full text-xs font-bold p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                      >
                        <option value="">-- {language === 'sw' ? 'Chagua Kundi' : 'Select Category'} --</option>
                        {uniqueCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {genTarget === 'promo' && (
                    <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Weka Msimbo wa Kuponi (Promo)' : 'Enter Coupon Promo Code'}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. KARIBU20, PASAKA50"
                        value={customPromo}
                        onChange={(e) => setCustomPromo(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl uppercase"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Business Invoice Options */}
              {genCategory === 'Business Invoice' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'customer', labelSw: 'Portal ya Mteja (Akiba/Mikopo)', labelEn: 'Customer Ledger Portal' },
                      { id: 'invoice', labelSw: 'Ankara Moja kwa Moja', labelEn: 'Specific Invoice Link' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGenTarget(opt.id)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center transition ${
                          genTarget === opt.id
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {language === 'sw' ? opt.labelSw : opt.labelEn}
                      </button>
                    ))}
                  </div>

                  {genTarget === 'customer' && (
                    <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Chagua Mteja' : 'Select Customer'}
                      </span>
                      <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full text-xs font-bold p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                      >
                        <option value="">-- {language === 'sw' ? 'Chagua Mteja' : 'Select Customer'} --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} - ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {genTarget === 'invoice' && (
                    <div className="space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Chagua Ankara / Risiti ya Mauzo' : 'Select Invoice / Sales Receipt'}
                      </span>
                      <select
                        value={selectedInvoice}
                        onChange={(e) => setSelectedInvoice(e.target.value)}
                        className="w-full text-xs font-bold p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                      >
                        <option value="">-- {language === 'sw' ? 'Chagua Ankara' : 'Select Invoice'} --</option>
                        {sales.slice(0, 15).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.invoiceNo} - {s.customerName || 'Walk-in'} ({formatMoney(s.totalAmount)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Affiliate & MLM Options */}
              {genCategory === 'Affiliate & MLM' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'general-affiliate', labelSw: 'Kiungo cha Jumla (Store Homepage)', labelEn: 'General Store Link' },
                      { id: 'product-affiliate', labelSw: 'Kiungo cha Bidhaa Moja kwa Moja', labelEn: 'Product Affiliate Link' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGenTarget(opt.id)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center transition ${
                          genTarget === opt.id
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {language === 'sw' ? opt.labelSw : opt.labelEn}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                        {language === 'sw' ? 'Msimbo au Jina la Mshirika (Affiliate Code)' : 'Affiliate Code'}
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. HRX-AMINA-05"
                        value={selectedAffiliate}
                        onChange={(e) => setSelectedAffiliate(e.target.value.toUpperCase())}
                        className="w-full text-xs font-bold p-2.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                      />
                    </div>

                    {genTarget === 'product-affiliate' && (
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 block mb-1">
                          {language === 'sw' ? 'Chagua Bidhaa ya Kuunganisha' : 'Select Associated Product'}
                        </span>
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full text-xs font-bold p-2 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl"
                        >
                          <option value="">-- {language === 'sw' ? 'Chagua Bidhaa hapa' : 'Select Product here'} --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System & Security Options */}
              {genCategory === 'System & Security' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'staff-invite', labelSw: 'Mwaliko wa Muuzaji (Staff)', labelEn: 'Staff Onboarding Invite' },
                      { id: 'password-reset', labelSw: 'Kiungo cha Kubadili Nenosiri', labelEn: 'Password Reset Simulation' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setGenTarget(opt.id)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold text-center transition ${
                          genTarget === opt.id
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-850 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {language === 'sw' ? opt.labelSw : opt.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom URL label annotation */}
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-650 dark:text-zinc-400 block">
                {language === 'sw' ? '3. Weka Maelezo ya Kichwa (Custom Label)' : '3. Customize Link Title / Description'}
              </label>
              <input
                type="text"
                placeholder={language === 'sw' ? 'e.g. Ofa Maalum ya Pasaka duka zima' : 'e.g. Special Easter store-wide promotion'}
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold"
              />
            </div>
          </div>

          {/* Dynamic Visual Link Card Output preview */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-850 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block">
                {language === 'sw' ? 'Hakiki ya Kiungo chako (LIVE PREVIEW)' : 'Live Output Preview'}
              </h4>

              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/45 rounded-full text-blue-500 mb-1">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <h5 className="text-xs font-black text-zinc-800 dark:text-white truncate">
                  {customLabel || (language === 'sw' ? 'Kiungo cha Universal kilichosanidiwa' : 'Custom Generated Link')}
                </h5>
                <p className="text-[10px] text-zinc-400 font-bold max-w-xs mx-auto truncate leading-relaxed">
                  {generatedLink}
                </p>
              </div>

              <div className="text-[11px] text-zinc-450 font-bold bg-zinc-100 dark:bg-zinc-900/60 p-3 rounded-2xl leading-relaxed flex items-start gap-2 border border-zinc-200/50 dark:border-zinc-800/40">
                <HelpCircle className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span>
                  {language === 'sw' 
                    ? 'Kiungo hiki hufanya kazi kiotomatiki nje ya mfumo wa AI. Unaweza kukibandika kwenye mitandao ya kijamii kama WhatsApp, Facebook, TikTok ili kupokea maagizo ya mteja au kufuatilia tume.'
                    : 'This smart URL functions completely independent of any AI builder. It is safe to use in bulk newsletters, WhatsApp, Facebook, or SMS to track conversions.'}
                </span>
              </div>
            </div>

            {generatedLink && (
              <div className="animate-fade-in space-y-3.5">
                <CopyableLink 
                  url={generatedLink}
                  category={genCategory}
                  language={language}
                  label={customLabel || undefined}
                />
                
                <button
                  onClick={() => handleSaveLink(generatedLink, genCategory, customLabel)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs border border-transparent"
                >
                  <Save className="w-4 h-4 text-emerald-100" />
                  <span>
                    {language === 'sw' ? 'Hifadhi & Nakili Kiungo' : 'Save & Copy Link'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: USER SAVED LINKS */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-3xl">
            <div>
              <h3 className="text-sm font-black text-zinc-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Save className="w-4.5 h-4.5 text-emerald-500" />
                {language === 'sw' ? 'Viungo Vilivyohifadhiwa na Mtumiaji' : 'User Saved Links'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                {language === 'sw' 
                  ? 'Orodha ya viungo vyote ulivyounda na kuhifadhi kwa matumizi ya baade. Unaweza kuvinakili, kushiriki au kufuta.'
                  : 'A list of all links you constructed and saved for future use. You can copy, share, or delete them.'}
              </p>
            </div>
            {savedLinks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(language === 'sw' ? 'Je, una uhakika unataka kufuta viungo vyote vilivyohifadhiwa?' : 'Are you sure you want to delete all saved links?')) {
                    setSavedLinks([]);
                    localStorage.setItem('hurex_saved_links', JSON.stringify([]));
                  }
                }}
                className="py-2 px-4 border border-rose-250 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs font-black uppercase tracking-wider transition"
              >
                {language === 'sw' ? 'Futa Vyote' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Manual Link Custom Adder Form */}
          <form onSubmit={handleSaveManualLink} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>{language === 'sw' ? 'Hifadhi Kiungo Kipya Maalum' : 'Save a New Custom Link'}</span>
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-0.5">
                {language === 'sw' 
                  ? 'Unaweza kuhifadhi viungo vyako maalum (kama kurasa za TikTok, viungo vya WhatsApp, makundi ya Telegram, n.k.) ili kuvipata haraka na kuvinakili wakati wowote.'
                  : 'Save any external or custom links (like TikTok video campaigns, WhatsApp chat links, Telegram groups, etc.) for quick search and rapid clipboard copy.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* URL Input */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Anwani ya Kiungo (URL) *' : 'Link Address (URL) *'}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://tiktok.com/@my_store/video/1..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Label Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Jina la Kiungo (Label)' : 'Link Label (Friendly Name)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'sw' ? 'Mvuto wa TikTok - Promo' : 'TikTok Campaign - Promo'}
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-550"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Kundi (Category)' : 'Category / Classification'}
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Other">{language === 'sw' ? 'Mengineyo / Other' : 'Other / Custom'}</option>
                  <option value="Online Store">{language === 'sw' ? 'Duka la Mtandaoni (Online Store)' : 'Online Store'}</option>
                  <option value="Business Invoice">{language === 'sw' ? 'Ankara & Malipo (Invoices)' : 'Business Invoices'}</option>
                  <option value="Affiliate & MLM">{language === 'sw' ? 'Washirika & MLM (Affiliates)' : 'Affiliate & MLM'}</option>
                  <option value="System & Security">{language === 'sw' ? 'Ulinzi & Mfumo (Security)' : 'System Invites'}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs border border-transparent"
              >
                <Save className="w-4 h-4 text-blue-100" />
                <span>{language === 'sw' ? 'Hifadhi & Nakili Kwenye Clipboard' : 'Save & Copy to Clipboard'}</span>
              </button>
            </div>
          </form>

          {savedLinks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {savedLinks.map((item) => (
                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-3xl hover:shadow-xs transition relative flex flex-col justify-between gap-3">
                  <button
                    onClick={() => {
                      const updated = savedLinks.filter(l => l.id !== item.id);
                      setSavedLinks(updated);
                      localStorage.setItem('hurex_saved_links', JSON.stringify(updated));
                    }}
                    className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                    title={language === 'sw' ? 'Futa Kiungo' : 'Delete Link'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-1 pr-8">
                    <h4 className="text-sm font-black text-zinc-850 dark:text-white leading-tight">
                      {item.label}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </p>
                  </div>
                  
                  {/* CopyableLink renders inside beautifully */}
                  <CopyableLink 
                    url={item.url}
                    category={item.category as any}
                    language={language}
                    trackingId={item.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-250 dark:border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 rounded-full">
                <LinkIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <h4 className="text-sm font-black text-zinc-800 dark:text-white">
                {language === 'sw' ? 'Hakuna Viungo Vilivyohifadhiwa Bado' : 'No Saved Links Yet'}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed font-bold">
                {language === 'sw'
                  ? 'Nenda kwenye kichupo cha "Tengeneza Kiungo" ili kuunda na kuhifadhi viungo vyako maalum vya duka, washirika, au ankara hapa.'
                  : 'Go to the "Link Generator" tab to create and save your custom store, affiliate, or payment invoice links here.'}
              </p>
              <button
                onClick={() => setActiveTab('generator')}
                className="mt-2 py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
              >
                {language === 'sw' ? 'Tengeneza Kiungo Sasa' : 'Generate Link Now'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: LIVE ANALYTICS, CONVERSION & IP TRAFFIC TRACKER */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">
                {language === 'sw' ? 'Jumla ya Mibofyo' : 'Total URL Clicks'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-zinc-850 dark:text-white leading-none">{totalClicks}</span>
                <span className="text-xs text-zinc-400 font-bold">{language === 'sw' ? 'Tembeleo' : 'clicks'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">
                {language === 'sw' ? 'Washirika Waliobofya' : 'Active Affiliates'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-zinc-850 dark:text-white leading-none">{uniqueAffiliatesCount}</span>
                <span className="text-xs text-zinc-400 font-bold">{language === 'sw' ? 'Msimbo' : 'referred'}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">
                {language === 'sw' ? 'Mibofyo ya Simu (Mobile)' : 'Mobile Devices'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-zinc-850 dark:text-white leading-none">{mobileClicks}</span>
                <span className="text-xs text-zinc-400 font-bold">
                  {totalClicks > 0 ? `${Math.round((mobileClicks / totalClicks) * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">
                {language === 'sw' ? 'Kompyuta (Desktop)' : 'Desktop Devices'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-zinc-850 dark:text-white leading-none">{desktopClicks}</span>
                <span className="text-xs text-zinc-400 font-bold">
                  {totalClicks > 0 ? `${Math.round((desktopClicks / totalClicks) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Logs Table panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-zinc-850 dark:text-white uppercase tracking-wider">
                  {language === 'sw' ? 'Rekodi za Utembeleaji na IP (Traffic Log)' : 'Live IP & Traffic Tracking Log'}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Filter className="w-3.5 h-3.5 text-zinc-450 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'sw' ? 'Chuja kwa mshirika...' : 'Filter by affiliate...'}
                    value={analyticsFilter}
                    onChange={(e) => setAnalyticsFilter(e.target.value)}
                    className="pl-8 pr-3 py-1.5 w-full sm:w-48 text-[11px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleClearLogs}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                  title="Futa rekodi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-850">
                    <th className="py-3 px-4">{language === 'sw' ? 'Tarehe na Muda' : 'Date & Time'}</th>
                    <th className="py-3 px-4">{language === 'sw' ? 'Mshirika' : 'Affiliate Code'}</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">{language === 'sw' ? 'Kifaa & Browser' : 'Device & Browser'}</th>
                    <th className="py-3 px-4">{language === 'sw' ? 'Eneo / Mji' : 'Location'}</th>
                    <th className="py-3 px-4">{language === 'sw' ? 'Kampeni / Bidhaa' : 'Campaign / Product'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 text-xs">
                  {clickLogs.length > 0 ? (
                    clickLogs
                      .filter(log => !analyticsFilter || log.affiliateCode.toLowerCase().includes(analyticsFilter.toLowerCase()))
                      .map((log) => {
                        const date = new Date(log.timestamp);
                        return (
                          <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 font-bold text-zinc-800 dark:text-zinc-200">
                            <td className="py-3 px-4 space-y-0.5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                <span>{date.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{date.toLocaleTimeString()}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md text-[10px] border border-blue-100/60 dark:border-blue-900/40">
                                {log.affiliateCode}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-zinc-550 dark:text-zinc-450">{log.ip}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5 text-zinc-450" />
                                <span className="truncate max-w-[120px]">{log.device}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-normal">{log.browser}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5 text-zinc-450" />
                                <span>{log.location}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 space-y-0.5">
                              {log.campaign && (
                                <div className="text-[10px] bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-100/60 dark:border-purple-900/40 inline-block">
                                  {log.campaign}
                                </div>
                              )}
                              {log.productId && (
                                <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                                  {language === 'sw' ? 'Bidhaa ID: ' : 'Prod ID: '} {log.productId}
                                </div>
                              )}
                              {!log.campaign && !log.productId && <span className="text-zinc-400">-</span>}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        {language === 'sw' ? 'Hakuna kumbukumbu za ufuatiliaji bado.' : 'No traffic logs recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
