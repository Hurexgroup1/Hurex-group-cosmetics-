import React, { useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, User, AuditLog, SystemData, UserRole, CustomPermission, SavedDocument, OnlineOrder } from './types';
import { 
  sampleProducts, 
  sampleCustomers, 
  sampleSales, 
  sampleExpenses, 
  sampleUsers, 
  sampleAuditLogs 
} from './sampleData';

// import components
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import POS from './components/POS';
import Expenses from './components/Expenses';
import ProfitLoss from './components/ProfitLoss';
import Reports from './components/Reports';
import Customers from './components/Customers';
import UsersTab from './components/Users';
import BackupRestore from './components/BackupRestore';
import Login from './components/Login';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import OnlineStore from './components/OnlineStore';
import Affiliates from './components/Affiliates';
import UniversalLinks from './components/UniversalLinks';
import DatabaseSchema from './components/DatabaseSchema';
import SelfHostedHub from './components/SelfHostedHub';
import LanguageSelectorFirstTime from './components/LanguageSelectorFirstTime';
import { useLanguage, Language } from './lib/i18n';

import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Percent, 
  FileText, 
  Users, 
  Sliders, 
  BookOpen, 
  LogOut, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ShieldAlert,
  Wallet,
  Coins,
  Activity,
  Clock,
  FolderOpen,
  Store,
  Award,
  Link,
  Share2,
  Copy,
  Settings as SettingsIcon,
  Eye,
  Trash2,
  Check,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Filter,
  RefreshCw,
  Search,
  Database,
  HardDrive
} from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFirstTime, setIsFirstTime] = useState<boolean>(() => {
    return !localStorage.getItem('hurex_first_time_lang_chosen');
  });

  // Safe base64 encoding/decoding for Unicode strings (to handle Swahili characters and emojis)
  const safeBtoa = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error(e);
      return '';
    }
  };

  const safeAtob = (str: string) => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (e) {
      console.error(e);
      return '';
    }
  };

  // Check if there is encoded store data in the URL
  const urlStoreData = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get('data') || params.get('d');
      if (dataParam) {
        const decoded = safeAtob(dataParam);
        if (decoded) {
          const parsed = JSON.parse(decoded);
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse store data from URL", e);
    }
    return null;
  })();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync urlStoreData with localStorage for visitor persistence
  useEffect(() => {
    if (urlStoreData) {
      if (urlStoreData.p) {
        const mappedProducts = urlStoreData.p.map((p: any) => ({
          id: p.id,
          name: p.n,
          category: p.c,
          barcode: '',
          buyingPrice: 0,
          sellingPrice: p.p,
          quantity: p.q || 10,
          minStock: 0,
          image: p.i
        }));
        localStorage.setItem('mf_products', JSON.stringify(mappedProducts));
      }
      if (urlStoreData.n) localStorage.setItem('hurex_system_name', urlStoreData.n);
      if (urlStoreData.w) localStorage.setItem('hurex_store_whatsapp', urlStoreData.w);
      if (urlStoreData.mp) localStorage.setItem('hurex_store_mpesa', urlStoreData.mp);
      if (urlStoreData.tg) localStorage.setItem('hurex_store_tigo', urlStoreData.tg);
      if (urlStoreData.at) localStorage.setItem('hurex_store_airtel', urlStoreData.at);
      if (urlStoreData.wm) localStorage.setItem('hurex_store_wakala_mpesa', urlStoreData.wm);
      if (urlStoreData.wt) localStorage.setItem('hurex_store_wakala_tigo', urlStoreData.wt);
      if (urlStoreData.wa) localStorage.setItem('hurex_store_wakala_airtel', urlStoreData.wa);
      if (urlStoreData.hp) localStorage.setItem('hurex_store_halopesa', urlStoreData.hp);
      if (urlStoreData.wh) localStorage.setItem('hurex_store_wakala_halopesa', urlStoreData.wh);
      if (urlStoreData.az) localStorage.setItem('hurex_store_azampesa', urlStoreData.az);
      if (urlStoreData.ba) localStorage.setItem('hurex_store_bank_account_info', urlStoreData.ba);
      if (urlStoreData.ig) localStorage.setItem('hurex_store_instagram', urlStoreData.ig);
      if (urlStoreData.tk) localStorage.setItem('hurex_store_tiktok', urlStoreData.tk);
      if (urlStoreData.fb) localStorage.setItem('hurex_store_facebook', urlStoreData.fb);
      if (urlStoreData.yt) localStorage.setItem('hurex_store_youtube', urlStoreData.yt);
      if (urlStoreData.ins) localStorage.setItem('hurex_store_payment_instructions', urlStoreData.ins);
    }
  }, [urlStoreData]);

  // Store client routing parameters state
  const [initialProductId, setInitialProductId] = useState<string | null>(null);
  const [initialCategory, setInitialCategory] = useState<string | null>(null);
  const [initialPromoCode, setInitialPromoCode] = useState<string | null>(null);
  const [initialTrackOrderNo, setInitialTrackOrderNo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      
      // Parse affiliate referral codes
      const refCode = params.get('ref') || params.get('aff') || params.get('referral');
      if (refCode) {
        localStorage.setItem('hurex_active_referral', refCode.toUpperCase());
        try {
          const clicksJson = localStorage.getItem('hurex_affiliate_clicks');
          let currentClicks = clicksJson ? JSON.parse(clicksJson) : [];
          const simulatedIp = '197.250.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
          const duplicate = currentClicks.some((c: any) => c.affiliateCode === refCode.toUpperCase() && (Date.now() - new Date(c.timestamp).getTime() < 60000));
          if (!duplicate) {
            currentClicks.unshift({
              id: `clk-url-${Date.now()}`,
              affiliateCode: refCode.toUpperCase(),
              ip: simulatedIp,
              device: 'Mobile (Web Link)',
              browser: 'Browser',
              location: 'Dar es Salaam',
              timestamp: new Date().toISOString(),
              campaign: params.get('campaign') || undefined,
              productId: params.get('productId') || params.get('product') || undefined,
              categoryName: params.get('category') ? decodeURIComponent(params.get('category')!) : undefined
            });
            localStorage.setItem('hurex_affiliate_clicks', JSON.stringify(currentClicks));
          }
        } catch (err) {
          console.error("Error logging URL click:", err);
        }
      }

      // Parse tracking parameters
      const trackNo = params.get('track') || params.get('t') || params.get('track_id');
      if (trackNo) {
        setInitialTrackOrderNo(trackNo);
      }

      // Parse product parameters
      const prodId = params.get('productId') || params.get('product') || params.get('p_id');
      if (prodId) {
        setInitialProductId(prodId);
      }

      // Parse category parameters
      const catName = params.get('category') || params.get('cat') || params.get('categoryName');
      if (catName) {
        setInitialCategory(decodeURIComponent(catName));
      }

      // Parse promo parameters
      const promo = params.get('promo') || params.get('promo_code');
      if (promo) {
        setInitialPromoCode(promo);
      }

      // Record visitor/link clicks in analytics
      const isStoreActive = params.get('store') === 'true' || params.get('view') === 'store' || trackNo || window.location.pathname.startsWith('/store') || window.location.hash.startsWith('#/store');
      if (isStoreActive) {
        const savedStats = localStorage.getItem('hurex_store_analytics');
        const stats = savedStats ? JSON.parse(savedStats) : {
          visitors: 350,
          generalClicks: 480,
          productClicks: {},
          categoryClicks: {},
          campaignClicks: {}
        };
        
        if (!stats.productClicks) stats.productClicks = {};
        if (!stats.categoryClicks) stats.categoryClicks = {};
        if (!stats.campaignClicks) stats.campaignClicks = {};

        // Unique visitor session check
        if (!sessionStorage.getItem('hurex_visitor_recorded')) {
          stats.visitors = (stats.visitors || 0) + 1;
          sessionStorage.setItem('hurex_visitor_recorded', 'true');
        }

        if (prodId) {
          stats.productClicks[prodId] = (stats.productClicks[prodId] || 0) + 1;
        } else if (catName) {
          const decCat = decodeURIComponent(catName);
          stats.categoryClicks[decCat] = (stats.categoryClicks[decCat] || 0) + 1;
        } else if (promo) {
          stats.campaignClicks[promo] = (stats.campaignClicks[promo] || 0) + 1;
        } else {
          stats.generalClicks = (stats.generalClicks || 0) + 1;
        }

        localStorage.setItem('hurex_store_analytics', JSON.stringify(stats));
        setStoreAnalytics(stats);
      }
    } catch (e) {
      console.error("Error running link tracking or parameter router:", e);
    }
  }, []);

  // --- Persistent States from LocalStorage ---
  const [products, setProducts] = useState<Product[]>(() => {
    if (urlStoreData && urlStoreData.p) {
      return urlStoreData.p.map((p: any) => ({
        id: p.id,
        name: p.n,
        category: p.c,
        barcode: '',
        buyingPrice: 0,
        sellingPrice: p.p,
        quantity: p.q || 10,
        minStock: 0,
        image: p.i
      }));
    }
    const saved = localStorage.getItem('mf_products');
    return saved ? JSON.parse(saved) : sampleProducts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('mf_customers');
    return saved ? JSON.parse(saved) : sampleCustomers;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('mf_sales');
    return saved ? JSON.parse(saved) : sampleSales;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('mf_expenses');
    return saved ? JSON.parse(saved) : sampleExpenses;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mf_users');
    return saved ? JSON.parse(saved) : sampleUsers;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mf_audit_logs');
    return saved ? JSON.parse(saved) : sampleAuditLogs;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('mf_active_user_id') || 'u1'; // Default: John Admin
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('hurex_is_logged_in') === 'true';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hurex_theme');
    if (saved) return saved as 'light' | 'dark';
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'dark' : 'light';
  });

  // Ukaguzi wa kiotomatiki wa Usiku/Mchana kulingana na saa ya mtumiaji
  useEffect(() => {
    const checkTimeAndSetTheme = () => {
      const hour = new Date().getHours();
      // Kuanzia saa 12:00 jioni (18:00) hadi saa 12:00 asubuhi (06:00) ni usiku/macho salama
      const isNight = hour >= 18 || hour < 6;
      setTheme(isNight ? 'dark' : 'light');
    };

    // Angalia mara moja mfumo unapoanza
    checkTimeAndSetTheme();

    // Angalia kila baada ya dakika 2 iwapo saa imebadilika kuingia usiku au mchana
    const interval = setInterval(checkTimeAndSetTheme, 120000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomerStoreMode, setIsCustomerStoreMode] = useState<boolean>(() => {
    return window.location.search.includes('store=true') || 
           window.location.search.includes('view=store') || 
           window.location.search.includes('track=') || 
           window.location.search.includes('t=') || 
           window.location.pathname.includes('/store') || 
           window.location.hash.includes('/store');
  });

  // System Name state
  const [systemName, setSystemName] = useState<string>(() => {
    if (urlStoreData && urlStoreData.n) return urlStoreData.n;
    return localStorage.getItem('hurex_system_name') || 'HUREX GROUP';
  });

  // Receipt Configuration states
  const [receiptBusinessName, setReceiptBusinessName] = useState<string>(() => {
    return localStorage.getItem('receipt_business_name') || 'HUREX GROUP OF COMPANIES LTD';
  });

  const [receiptAddress, setReceiptAddress] = useState<string>(() => {
    return localStorage.getItem('receipt_address') || 'Mlimani City, Dar es Salaam, Tanzania';
  });

  const [receiptContact, setReceiptContact] = useState<string>(() => {
    return localStorage.getItem('receipt_contact') || 'Simu: +255 712 345 678 | Email: hurexgroup88@gmail.com';
  });

  const [receiptFooter, setReceiptFooter] = useState<string>(() => {
    return localStorage.getItem('receipt_footer') || 'KARIBU TENA - HUREX GROUP';
  });

  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem('hurex_default_tax_rate');
    return saved ? Number(saved) : 18; // Default 18% VAT
  });

  const [blackTextEnabled, setBlackTextEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('hurex_black_text_enabled');
    return saved !== null ? saved === 'true' : true; // Default to true so it takes effect immediately!
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    const saved = localStorage.getItem('hurex_font_size');
    return (saved as 'normal' | 'large' | 'xlarge') || 'normal';
  });

  const cycleFontSize = () => {
    setFontSize(prev => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  // Store Settings state
  const [storeWhatsappNumber, setStoreWhatsappNumber] = useState<string>(() => {
    if (urlStoreData && urlStoreData.w) return urlStoreData.w;
    return localStorage.getItem('hurex_store_whatsapp') || '255785659204, 255761929290';
  });

  const [storeLipaNambaMpesa, setStoreLipaNambaMpesa] = useState<string>(() => {
    if (urlStoreData && urlStoreData.mp) return urlStoreData.mp;
    return localStorage.getItem('hurex_store_mpesa') || '556677';
  });

  const [storeLipaNambaTigo, setStoreLipaNambaTigo] = useState<string>(() => {
    if (urlStoreData && urlStoreData.tg) return urlStoreData.tg;
    return localStorage.getItem('hurex_store_tigo') || '889900';
  });

  const [storeLipaNambaAirtel, setStoreLipaNambaAirtel] = useState<string>(() => {
    if (urlStoreData && urlStoreData.at !== undefined) return urlStoreData.at;
    return localStorage.getItem('hurex_store_airtel') || '';
  });

  const [storeWakalaMpesa, setStoreWakalaMpesa] = useState<string>(() => {
    if (urlStoreData && urlStoreData.wm !== undefined) return urlStoreData.wm;
    return localStorage.getItem('hurex_store_wakala_mpesa') || '';
  });

  const [storeWakalaTigo, setStoreWakalaTigo] = useState<string>(() => {
    if (urlStoreData && urlStoreData.wt !== undefined) return urlStoreData.wt;
    return localStorage.getItem('hurex_store_wakala_tigo') || '';
  });

  const [storeWakalaAirtel, setStoreWakalaAirtel] = useState<string>(() => {
    if (urlStoreData && urlStoreData.wa !== undefined) return urlStoreData.wa;
    return localStorage.getItem('hurex_store_wakala_airtel') || '';
  });

  const [storeLipaNambaHalopesa, setStoreLipaNambaHalopesa] = useState<string>(() => {
    if (urlStoreData && urlStoreData.hp !== undefined) return urlStoreData.hp;
    return localStorage.getItem('hurex_store_halopesa') || '';
  });

  const [storeWakalaHalopesa, setStoreWakalaHalopesa] = useState<string>(() => {
    if (urlStoreData && urlStoreData.wh !== undefined) return urlStoreData.wh;
    return localStorage.getItem('hurex_store_wakala_halopesa') || '';
  });

  const [storeLipaNambaAzampesa, setStoreLipaNambaAzampesa] = useState<string>(() => {
    if (urlStoreData && urlStoreData.az !== undefined) return urlStoreData.az;
    return localStorage.getItem('hurex_store_azampesa') || '';
  });

  const [storeBankAccountInfo, setStoreBankAccountInfo] = useState<string>(() => {
    if (urlStoreData && urlStoreData.ba !== undefined) return urlStoreData.ba;
    return localStorage.getItem('hurex_store_bank_account_info') || '';
  });

  // Social Media State variables
  const [storeInstagram, setStoreInstagram] = useState<string>(() => {
    if (urlStoreData && urlStoreData.ig !== undefined) return urlStoreData.ig;
    return localStorage.getItem('hurex_store_instagram') || '';
  });

  const [storeTiktok, setStoreTiktok] = useState<string>(() => {
    if (urlStoreData && urlStoreData.tk !== undefined) return urlStoreData.tk;
    return localStorage.getItem('hurex_store_tiktok') || '';
  });

  const [storeFacebook, setStoreFacebook] = useState<string>(() => {
    if (urlStoreData && urlStoreData.fb !== undefined) return urlStoreData.fb;
    return localStorage.getItem('hurex_store_facebook') || '';
  });

  const [storeYoutube, setStoreYoutube] = useState<string>(() => {
    if (urlStoreData && urlStoreData.yt !== undefined) return urlStoreData.yt;
    return localStorage.getItem('hurex_store_youtube') || '';
  });

  const [storePaymentInstructions, setStorePaymentInstructions] = useState<string>(() => {
    if (urlStoreData && urlStoreData.ins !== undefined) return urlStoreData.ins;
    return localStorage.getItem('hurex_store_payment_instructions') || 'Lipa kabla ya kutuma agizo ili kuanza maandalizi ya mzigo wako.';
  });

  // Customizable Online Store URL slug
  const [storeSlug, setStoreSlug] = useState<string>(() => {
    return localStorage.getItem('hurex_store_slug') || 'hurex-group';
  });

  // Promotional campaigns list (offline persisted)
  const [promoCampaigns, setPromoCampaigns] = useState<any[]>(() => {
    const saved = localStorage.getItem('hurex_promo_campaigns');
    if (saved) return JSON.parse(saved);
    return [
      { code: 'SUMMER50', discount: 50, expiryDate: '2026-08-31', clicks: 142, orders: 12, revenue: 450000 },
      { code: 'KARIBU10', discount: 10, expiryDate: '2026-12-31', clicks: 64, orders: 5, revenue: 120000 }
    ];
  });

  // Link Clicks, Visitors and Conversion Analytics
  const [storeAnalytics, setStoreAnalytics] = useState<any>(() => {
    const saved = localStorage.getItem('hurex_store_analytics');
    if (saved) return JSON.parse(saved);
    return {
      visitors: 350,
      generalClicks: 480,
      productClicks: {},
      categoryClicks: {},
      campaignClicks: {}
    };
  });

  // Sync these new store variables to localStorage
  useEffect(() => {
    localStorage.setItem('hurex_store_slug', storeSlug);
  }, [storeSlug]);

  useEffect(() => {
    localStorage.setItem('hurex_promo_campaigns', JSON.stringify(promoCampaigns));
  }, [promoCampaigns]);

  useEffect(() => {
    localStorage.setItem('hurex_store_analytics', JSON.stringify(storeAnalytics));
  }, [storeAnalytics]);

  // Dynamic, offline-persistent base64 shared link containing all products and store settings
  const currentShareUrl = (() => {
    try {
      const payload = {
        n: systemName,
        w: storeWhatsappNumber,
        mp: storeLipaNambaMpesa,
        tg: storeLipaNambaTigo,
        at: storeLipaNambaAirtel,
        wm: storeWakalaMpesa,
        wt: storeWakalaTigo,
        wa: storeWakalaAirtel,
        hp: storeLipaNambaHalopesa,
        wh: storeWakalaHalopesa,
        az: storeLipaNambaAzampesa,
        ba: storeBankAccountInfo,
        ig: storeInstagram,
        tk: storeTiktok,
        fb: storeFacebook,
        yt: storeYoutube,
        ins: storePaymentInstructions,
        p: products.map(p => ({
          id: p.id,
          n: p.name,
          c: p.category,
          p: p.sellingPrice,
          i: p.image,
          q: p.quantity
        }))
      };
      const jsonStr = JSON.stringify(payload);
      const encoded = safeBtoa(jsonStr);
      return `${window.location.origin}${window.location.pathname}?store=true&slug=${storeSlug}&d=${encoded}`;
    } catch (e) {
      console.error(e);
      return `${window.location.origin}${window.location.pathname}?store=true`;
    }
  })();

  // Documents Gallery state
  const [documents, setDocuments] = useState<SavedDocument[]>(() => {
    const saved = localStorage.getItem('hurex_documents');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'doc-1',
        name: 'Leseni ya Biashara (HUREX Business License 2026)',
        category: 'Leseni/Kodi',
        fileType: 'pdf',
        fileSize: '1.2 MB',
        date: '2026-06-25',
        time: '10:15:30',
        description: 'Leseni halali ya biashara iliyotolewa na Manispaa ya Kinondoni kwa mwaka wa fedha 2026.'
      },
      {
        id: 'doc-2',
        name: 'Cheti cha TRA Tax Clearance Certificate 2026',
        category: 'Leseni/Kodi',
        fileType: 'png',
        fileSize: '840 KB',
        date: '2026-06-20',
        time: '14:30:10',
        description: 'Cheti cha upatikanaji wa kodi TRA kinachoonyesha kuwa duka halina deni lolote la kodi.'
      },
      {
        id: 'doc-3',
        name: 'Mkataba wa Upangaji Ofisi Mlimani City',
        category: 'Mikataba',
        fileType: 'pdf',
        fileSize: '3.4 MB',
        date: '2026-06-15',
        time: '09:00:00',
        description: 'Mkataba rasmi wa upangaji wa eneo la duka uliosainiwa kati ya HUREX na Usimamizi wa Mlimani City Mall.'
      }
    ];
  });

  // Custom persistent permissions state
  const [customPermissions, setCustomPermissions] = useState<CustomPermission[]>(() => {
    const saved = localStorage.getItem('mf_custom_permissions');
    if (saved) return JSON.parse(saved);
    return [
      { key: 'view_dashboard', name: 'Muhtasari wa Duka (Dashboard)', desc: 'Kuangalia takwimu na muhtasari wa leo na mwenendo' },
      { key: 'make_sales', name: 'Kufanya Mauzo (POS)', desc: 'Upatikanaji katika mfumo wa mauzo duka' },
      { key: 'manage_products', name: 'Kusimamia Bidhaa (Products)', desc: 'Kuongeza, kuhariri au kufuta bidhaa za duka' },
      { key: 'manage_expenses', name: 'Kusimamia Matumizi (Expenses)', desc: 'Kuongeza na kuhariri matumizi ya duka' },
      { key: 'view_pandl', name: 'Faida & Hasara (P&L)', desc: 'Ripoti ya kina ya faida na hasara duka' },
      { key: 'view_reports', name: 'Kuangalia Ripoti (Reports)', desc: 'Kuangalia ripoti mbalimbali za mauzo na grafu' },
      { key: 'manage_customers', name: 'Kusimamia Wateja (CRM)', desc: 'Kuongeza wateja na kusimamia madeni yao' },
      { key: 'manage_users', name: 'Kusimamia Watumiaji', desc: 'Kuhariri haki za cashier na wasimamizi' },
      { key: 'backup_restore', name: 'Backup & Restore', desc: 'Kuhifadhi sifa za mfumo au backup' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mf_custom_permissions', JSON.stringify(customPermissions));
  }, [customPermissions]);

  // Online orders state
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(() => {
    const saved = localStorage.getItem('hurex_online_orders');
    if (saved) return JSON.parse(saved);
    
    // Default Swahili/Tanzanian sample orders for a realistic dashboard
    return [
      {
        id: 'ord-1',
        orderNo: 'ORD-382910',
        customerName: "Halima Juma",
        customerPhone: "0712345678",
        customerAddress: "Mbezi Beach, Dar es Salaam",
        customerNote: "Tafadhali namba yangu ya simu mbadala ni 0754888999. Naomba mzigo uje ukiwa umefungwa vizuri na risiti tayari.",
        items: [
          { productId: 'p1', name: 'Mchele wa Kyela (10kg)', quantity: 2, price: 28000 }
        ],
        totalAmount: 56000,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        time: "10:24:15"
      },
      {
        id: 'ord-2',
        orderNo: 'ORD-902811',
        customerName: "John Emmanuel",
        customerPhone: "0688990011",
        customerAddress: "Kariakoo Market, Dar es Salaam",
        customerNote: "Nimeshafanya muamala kupitia Tigo Pesa na nimeambatanisha risiti.",
        items: [
          { productId: 'p2', name: 'Sukari ya Bagamoyo (5kg)', quantity: 1, price: 15000 }
        ],
        totalAmount: 15000,
        status: 'Confirmed',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: "15:40:02"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hurex_online_orders', JSON.stringify(onlineOrders));
  }, [onlineOrders]);

  // Online Store Admin UI states
  const [onlineStoreSubTab, setOnlineStoreSubTab] = useState<'orders' | 'preview'>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const handleAddCustomPermission = (newPermission: CustomPermission) => {
    setCustomPermissions(prev => [...prev, newPermission]);
    addAuditLog('Ongeza Jukumu', `Jukumu jipya la mfumo "${newPermission.name}" (${newPermission.key}) limeongezwa.`);
  };

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');

  const handleOpenProfileModal = () => {
    setProfileName(activeUser.name);
    setProfileUsername(activeUser.username);
    setProfileEmail(activeUser.email || '');
    setProfilePassword(activeUser.password || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail || !profileUsername) {
      alert('Tafadhali jaza sifa zote.');
      return;
    }

    const updatedUsers = users.map(u => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          name: profileName,
          username: profileUsername,
          email: profileEmail,
          password: profilePassword || undefined
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    addAuditLog('Hariri Wasifu', `Wasifu wako wa mtumiaji "${profileName}" umehuishwa.`);
    setIsProfileModalOpen(false);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mf_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mf_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('mf_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('mf_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('mf_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('mf_active_user_id', activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    localStorage.setItem('hurex_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hurex_black_text_enabled', String(blackTextEnabled));
    if (blackTextEnabled) {
      document.documentElement.classList.add('black-text-mode');
    } else {
      document.documentElement.classList.remove('black-text-mode');
    }
  }, [blackTextEnabled]);

  useEffect(() => {
    localStorage.setItem('hurex_font_size', fontSize);
    const root = document.documentElement;
    root.classList.remove('font-scale-large', 'font-scale-xlarge');
    if (fontSize === 'large') {
      root.classList.add('font-scale-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('font-scale-xlarge');
    }
  }, [fontSize]);

  // Sync settings & documents to localStorage
  useEffect(() => {
    localStorage.setItem('hurex_system_name', systemName);
  }, [systemName]);

  useEffect(() => {
    localStorage.setItem('receipt_business_name', receiptBusinessName);
  }, [receiptBusinessName]);

  useEffect(() => {
    localStorage.setItem('receipt_address', receiptAddress);
  }, [receiptAddress]);

  useEffect(() => {
    localStorage.setItem('receipt_contact', receiptContact);
  }, [receiptContact]);

  useEffect(() => {
    localStorage.setItem('receipt_footer', receiptFooter);
  }, [receiptFooter]);

  useEffect(() => {
    localStorage.setItem('hurex_default_tax_rate', String(defaultTaxRate));
  }, [defaultTaxRate]);

  useEffect(() => {
    localStorage.setItem('hurex_store_whatsapp', storeWhatsappNumber);
  }, [storeWhatsappNumber]);

  useEffect(() => {
    localStorage.setItem('hurex_store_mpesa', storeLipaNambaMpesa);
  }, [storeLipaNambaMpesa]);

  useEffect(() => {
    localStorage.setItem('hurex_store_tigo', storeLipaNambaTigo);
  }, [storeLipaNambaTigo]);

  useEffect(() => {
    localStorage.setItem('hurex_store_airtel', storeLipaNambaAirtel);
  }, [storeLipaNambaAirtel]);

  useEffect(() => {
    localStorage.setItem('hurex_store_wakala_mpesa', storeWakalaMpesa);
  }, [storeWakalaMpesa]);

  useEffect(() => {
    localStorage.setItem('hurex_store_wakala_tigo', storeWakalaTigo);
  }, [storeWakalaTigo]);

  useEffect(() => {
    localStorage.setItem('hurex_store_wakala_airtel', storeWakalaAirtel);
  }, [storeWakalaAirtel]);

  useEffect(() => {
    localStorage.setItem('hurex_store_halopesa', storeLipaNambaHalopesa);
  }, [storeLipaNambaHalopesa]);

  useEffect(() => {
    localStorage.setItem('hurex_store_wakala_halopesa', storeWakalaHalopesa);
  }, [storeWakalaHalopesa]);

  useEffect(() => {
    localStorage.setItem('hurex_store_azampesa', storeLipaNambaAzampesa);
  }, [storeLipaNambaAzampesa]);

  useEffect(() => {
    localStorage.setItem('hurex_store_bank_account_info', storeBankAccountInfo);
  }, [storeBankAccountInfo]);

  useEffect(() => {
    localStorage.setItem('hurex_store_instagram', storeInstagram);
  }, [storeInstagram]);

  useEffect(() => {
    localStorage.setItem('hurex_store_tiktok', storeTiktok);
  }, [storeTiktok]);

  useEffect(() => {
    localStorage.setItem('hurex_store_facebook', storeFacebook);
  }, [storeFacebook]);

  useEffect(() => {
    localStorage.setItem('hurex_store_youtube', storeYoutube);
  }, [storeYoutube]);

  useEffect(() => {
    localStorage.setItem('hurex_store_payment_instructions', storePaymentInstructions);
  }, [storePaymentInstructions]);

  useEffect(() => {
    localStorage.setItem('hurex_documents', JSON.stringify(documents));
  }, [documents]);

  // Gallery Handlers
  const handleAddDocument = (payload: Omit<SavedDocument, 'id'>) => {
    const newDoc: SavedDocument = {
      id: 'doc-' + Date.now(),
      ...payload
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('Ongeza Hati', `Hati "${newDoc.name}" imehifadhiwa kwenye maktaba ya duka.`);
  };

  const handleDeleteDocument = (id: string) => {
    const target = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (target) {
      addAuditLog('Futa Hati', `Hati "${target.name}" imefutwa kwenye maktaba ya duka.`);
    }
  };

  // Current logged in user object
  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  // Helper formatting TZS / Shillings
  const formatMoney = (amount: number) => {
    return 'Sh ' + Math.round(amount).toLocaleString('sw-TZ');
  };

  // Add Action Log
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: activeUser.id,
      username: activeUser.username,
      userRole: activeUser.role,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setActiveUserId(user.id);
    setIsLoggedIn(true);
    localStorage.setItem('mf_active_user_id', user.id);
    localStorage.setItem('hurex_is_logged_in', 'true');
    
    // Load language preference from UserSettings DB table model
    const savedSettings = localStorage.getItem('mf_user_settings');
    let settingsList: any[] = savedSettings ? JSON.parse(savedSettings) : [];
    const userSetting = settingsList.find(s => s.user_id === user.id);
    if (userSetting) {
      setLanguage(userSetting.language_code);
    } else {
      // Create user setting record
      settingsList.push({
        id: 'us-' + Date.now(),
        user_id: user.id,
        language_code: language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStorage.setItem('mf_user_settings', JSON.stringify(settingsList));
    }
    
    // Log the login activity
    const logMsg = `Mtumiaji "${user.name}" (${user.role}) ameingia kwenye mfumo wa HUREX.`;
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: user.id,
      username: user.username,
      userRole: user.role,
      action: 'Kuingia Mfumo',
      timestamp: new Date().toISOString(),
      details: logMsg
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const handleRegisterUser = (newUserPayload: Omit<User, 'id'>) => {
    const newU: User = {
      id: 'u-' + Date.now(),
      ...newUserPayload
    };
    setUsers(prev => [...prev, newU]);
    
    // Log register activity
    const logMsg = `Mtumiaji mpya amejisajili: "${newU.name}" (${newU.role}). Ruhusa ya Admin inasubiriwa.`;
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: 'system',
      username: 'System',
      userRole: 'Admin',
      action: 'Usajili Mtumiaji',
      timestamp: new Date().toISOString(),
      details: logMsg
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const handleLogout = () => {
    // Log logout activity
    const logMsg = `Mtumiaji "${activeUser.name}" ametoka kwenye mfumo wa HUREX.`;
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: activeUser.id,
      username: activeUser.username,
      userRole: activeUser.role,
      action: 'Kutoka Mfumo',
      timestamp: new Date().toISOString(),
      details: logMsg
    };
    setAuditLogs(prev => [...prev, newLog]);
    
    setIsLoggedIn(false);
    localStorage.removeItem('hurex_is_logged_in');
  };

  // Switch Active User / Simulator
  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setActiveUserId(userId);
      // Auto-fallback the tab to dashboard when switching user, in case they lose tab permission
      setActiveTab('dashboard');
      // Log transition
      const logMsg = `Mtumiaji amebadilishwa kuwa: ${targetUser.name} (${targetUser.role})`;
      
      const newLog: AuditLog = {
        id: 'log-' + Date.now(),
        userId: targetUser.id,
        username: targetUser.username,
        userRole: targetUser.role,
        action: 'Kuingia Mfumo (Switch)',
        timestamp: new Date().toISOString(),
        details: logMsg
      };
      setAuditLogs(prev => [...prev, newLog]);
    }
  };

  // --- CRUD HANDLERS ---

  // Products
  const handleAddProduct = (payload: Omit<Product, 'id'>) => {
    const newP: Product = {
      id: 'p-' + Date.now(),
      ...payload
    };
    setProducts(prev => [newP, ...prev]);
    addAuditLog('Ongeza Bidhaa', `Bidhaa "${newP.name}" imesajiliwa na bei ${formatMoney(newP.sellingPrice)}.`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    addAuditLog('Hariri Bidhaa', `Bidhaa "${updated.name}" imefanyiwa marekebisho ya idadi na bei.`);
  };

  const handleDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (target) {
      addAuditLog('Futa Bidhaa', `Bidhaa "${target.name}" imefutwa kutoka kwenye duka kabisa.`);
    }
  };

  // Customers
  const handleAddCustomer = (payload: Omit<Customer, 'id'>) => {
    const newC: Customer = {
      id: 'c-' + Date.now(),
      ...payload
    };
    setCustomers(prev => [newC, ...prev]);
    addAuditLog('Ongeza Mteja', `Mteja "${newC.name}" amesajiliwa kwenye CRM ya duka.`);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    addAuditLog('Hariri Mteja', `Taarifa za mteja "${updated.name}" zimepitiwa upya.`);
  };

  const handleDeleteCustomer = (id: string) => {
    const target = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    if (target) {
      addAuditLog('Futa Mteja', `Mteja "${target.name}" amefutwa kwenye mfumo.`);
    }
  };

  // Expenses
  const handleAddExpense = (payload: Omit<Expense, 'id'>) => {
    const newE: Expense = {
      id: 'e-' + Date.now(),
      ...payload
    };
    setExpenses(prev => [newE, ...prev]);
    addAuditLog('Rekodi Matumizi', `Matumizi ya "${newE.category}" ya kiasi ${formatMoney(newE.amount)} yameingizwa.`);
  };

  const handleUpdateExpense = (updated: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    addAuditLog('Hariri Matumizi', `Gharama za "${updated.category}" zimefanyiwa marekebisho.`);
  };

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (target) {
      addAuditLog('Futa Matumizi', `Gharama ya "${target.category}" ya kiasi ${formatMoney(target.amount)} imefutwa.`);
    }
  };

  // Sales (POS Completed checkouts)
  const handleAddSale = (payload: Omit<Sale, 'id'>) => {
    const newS: Sale = {
      id: 's-' + Date.now(),
      ...payload
    };

    // 1. Subtract product inventory quantities
    setProducts(prev => {
      return prev.map(p => {
        const boughtItem = newS.items.find(item => item.productId === p.id);
        if (boughtItem) {
          return {
            ...p,
            quantity: Math.max(0, p.quantity - boughtItem.quantity)
          };
        }
        return p;
      });
    });

    // 2. Adjust customer balance if selected and paymentMethod is 'Credit' or debts
    if (newS.customerId) {
      setCustomers(prev => {
        return prev.map(c => {
          if (c.id === newS.customerId) {
            // If bought on credit, their negative balance increases (they owe us more)
            const balanceChange = newS.paymentMethod === 'Credit' ? -newS.totalAmount : 0;
            return {
              ...c,
              balance: c.balance + balanceChange
            };
          }
          return c;
        });
      });
    }

    setSales(prev => [newS, ...prev]);
    addAuditLog('Kamilisha Uuzaji', `Mauzo yamekamilishwa kwa namba ${newS.invoiceNo} njia ya ${newS.paymentMethod}.`);
  };

  const handleUpdateSale = (updated: Sale) => {
    const original = sales.find(s => s.id === updated.id);
    if (!original) return;

    // Adjust customer balance if the customer or payment method changed!
    // Revert original customer's credit balance impact
    if (original.customerId && original.paymentMethod === 'Credit') {
      setCustomers(prev => prev.map(c => c.id === original.customerId ? { ...c, balance: c.balance + original.totalAmount } : c));
    }
    // Apply updated customer's credit balance impact
    if (updated.customerId && updated.paymentMethod === 'Credit') {
      setCustomers(prev => prev.map(c => c.id === updated.customerId ? { ...c, balance: c.balance - updated.totalAmount } : c));
    }

    setSales(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAuditLog('Hariri Mauzo', `Mauzo namba ${updated.invoiceNo} yamefanyiwa marekebisho ya taarifa.`);
  };

  // --- ONLINE STORE ORDERS HANDLERS ---
  const handlePlaceOnlineOrder = (order: OnlineOrder) => {
    const activeRef = localStorage.getItem('hurex_active_referral');
    const orderWithRef = {
      ...order,
      affiliateCode: order.affiliateCode || activeRef || undefined
    };
    setOnlineOrders(prev => [orderWithRef, ...prev]);
    addAuditLog('Agizo la Mtandaoni', `Agizo jipya la mtandaoni ${orderWithRef.orderNo} la mteja ${orderWithRef.customerName} limepokelewa na linasubiri thibitisho.${orderWithRef.affiliateCode ? ` (Affiliate: ${orderWithRef.affiliateCode})` : ''}`);
  };

  const handleConfirmOnlineOrder = (orderId: string) => {
    const order = onlineOrders.find(o => o.id === orderId);
    if (!order || order.status === 'Confirmed') return;

    // 1. Convert OnlineOrder items to SaleItems
    const saleItems = order.items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      buyingPrice: products.find(p => p.id === item.productId)?.buyingPrice || 0,
      sellingPrice: item.price,
      discountPercent: 0
    }));

    // Calculate details (deducting discounts)
    const discountAmt = order.discountAmount || 0;
    const finalAmount = order.totalAmount;

    // 2. Create Sale payload
    const salePayload: Omit<Sale, 'id'> = {
      invoiceNo: order.orderNo,
      date: order.date,
      time: order.time,
      items: saleItems,
      discountAmount: discountAmt,
      taxRate: defaultTaxRate,
      taxAmount: Math.round(finalAmount * (defaultTaxRate / 100)),
      totalAmount: finalAmount,
      profit: saleItems.reduce((acc, item) => acc + ((item.sellingPrice - item.buyingPrice) * item.quantity), 0) - discountAmt,
      paymentMethod: order.paymentMethod || 'Mobile Money',
      customerName: order.customerName,
      cashierId: activeUser.id,
      cashierName: activeUser.name,
      note: `Agizo la Mtandaoni ${order.orderNo}. Kampeni ya Promo: ${order.promoCode || 'Hakuna'}. Simu: ${order.customerPhone}. Anwani: ${order.customerAddress || 'Duka/Delivery'}`
    };

    // 3. Add Sale (which automatically subtracts product stock!)
    handleAddSale(salePayload);

    // 4. Automatically register customer in Customers list (CRM Automation)
    if (order.customerPhone) {
      const customerPhoneNormalized = order.customerPhone.trim();
      const customerExists = customers.some(c => c.phone.trim() === customerPhoneNormalized);
      if (!customerExists && order.customerName) {
        const newCust = {
          id: 'cust-' + Date.now(),
          name: order.customerName,
          phone: order.customerPhone,
          email: '',
          address: order.customerAddress || '',
          balance: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setCustomers(prev => [newCust, ...prev]);
        localStorage.setItem('mf_customers', JSON.stringify([newCust, ...customers]));
      }
    }

    // 5. Update campaign stats if promo code was used
    if (order.promoCode) {
      setPromoCampaigns(prev => {
        return prev.map(c => {
          if (c.code.toUpperCase() === order.promoCode?.toUpperCase()) {
            return {
              ...c,
              orders: (c.orders || 0) + 1,
              revenue: (c.revenue || 0) + finalAmount
            };
          }
          return c;
        });
      });
    }

    // 6. Update order status to Confirmed
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Confirmed' } : o));
    addAuditLog('Thibitisha Malipo', `Agizo la mtandaoni ${order.orderNo} la mteja ${order.customerName} limekubaliwa (stoki imepunguzwa na mauzo yamerekodiwa).`);
  };

  const handleCancelOnlineOrder = (orderId: string) => {
    const order = onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    // If it was already active/deducted, we should revert the sale to restore stock!
    const wasActive = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(order.status);
    if (wasActive) {
      const associatedSale = sales.find(s => s.invoiceNo === order.orderNo);
      if (associatedSale) {
        handleDeleteSale(associatedSale.id);
      } else {
        // Fallback: Manually restore stock quantities if sale record was not found
        setProducts(prev => {
          return prev.map(p => {
            const orderItem = order.items.find(item => item.productId === p.id);
            if (orderItem) {
              return {
                ...p,
                quantity: p.quantity + orderItem.quantity
              };
            }
            return p;
          });
        });
      }

      // If had promo code, deduct campaign stats
      if (order.promoCode) {
        setPromoCampaigns(prev => {
          return prev.map(c => {
            if (c.code.toUpperCase() === order.promoCode?.toUpperCase()) {
              return {
                ...c,
                orders: Math.max(0, (c.orders || 0) - 1),
                revenue: Math.max(0, (c.revenue || 0) - order.totalAmount)
              };
            }
            return c;
          });
        });
      }
    }

    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    addAuditLog('Kataa/Ghairi Agizo la Mtandaoni', `Agizo la mtandaoni ${order.orderNo} la mteja ${order.customerName} limekataliwa/limeghairiwa, stoki na rekodi ya mauzo vimerejeshwa.`);
  };

  const handleUpdateOnlineOrderStatus = (orderId: string, newStatus: OnlineOrder['status']) => {
    const order = onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;
    if (oldStatus === newStatus) return;

    const isActiveStatus = (status: string) => ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(status);

    // Transition rules:
    if (newStatus === 'Confirmed' && oldStatus === 'Pending') {
      handleConfirmOnlineOrder(orderId);
      return;
    }

    if (newStatus === 'Cancelled' && isActiveStatus(oldStatus)) {
      handleCancelOnlineOrder(orderId);
      return;
    }

    // Moving between logistics states (e.g. Confirmed -> Shipped)
    // If transitioning from Pending directly to any active logistics state, run confirmation first!
    if (isActiveStatus(newStatus) && oldStatus === 'Pending') {
      handleConfirmOnlineOrder(orderId);
      // set status after a brief moment or update in state immediately
      setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      return;
    }

    // Otherwise, just update status
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    addAuditLog('Sasisha Hali ya Agizo', `Agizo ${order.orderNo} limesasishwa kutoka '${oldStatus}' kwenda '${newStatus}'.`);
  };

  const handleDeleteOnlineOrder = (orderId: string, shouldRevertStock: boolean = false) => {
    const target = onlineOrders.find(o => o.id === orderId);
    if (!target) return;

    if (shouldRevertStock && target.status === 'Confirmed') {
      const associatedSale = sales.find(s => s.invoiceNo === target.orderNo);
      if (associatedSale) {
        handleDeleteSale(associatedSale.id);
      } else {
        // Fallback: manually restore stock if sale not found
        setProducts(prev => {
          return prev.map(p => {
            const orderItem = target.items.find(item => item.productId === p.id);
            if (orderItem) {
              return {
                ...p,
                quantity: p.quantity + orderItem.quantity
              };
            }
            return p;
          });
        });
      }
    }

    setOnlineOrders(prev => prev.filter(o => o.id !== orderId));
    addAuditLog('Futa Agizo la Mtandaoni', `Agizo la mtandaoni ${target.orderNo} la mteja ${target.customerName} limefutwa kabisa.`);
  };

  const handleDeleteSale = (id: string) => {
    const target = sales.find(s => s.id === id);
    if (!target) return;

    // 1. Return items back to stock (Restock inventory)
    setProducts(prev => {
      return prev.map(p => {
        const boughtItem = target.items.find(item => item.productId === p.id);
        if (boughtItem) {
          return {
            ...p,
            quantity: p.quantity + boughtItem.quantity
          };
        }
        return p;
      });
    });

    // 2. Revert customer balance impact if it was credit
    if (target.customerId && target.paymentMethod === 'Credit') {
      setCustomers(prev => prev.map(c => c.id === target.customerId ? { ...c, balance: c.balance + target.totalAmount } : c));
    }

    setSales(prev => prev.filter(s => s.id !== id));
    addAuditLog('Futa Mauzo', `Mauzo namba ${target.invoiceNo} yamefutwa kabisa kutoka kwenye mfumo na bidhaa zimerudishwa stoo.`);
  };

  // Users Management
  const handleAddUser = (payload: Omit<User, 'id'>) => {
    const newU: User = {
      id: 'u-' + Date.now(),
      ...payload
    };
    setUsers(prev => [...prev, newU]);
    addAuditLog('Sajili Mtumiaji', `Akaunti mpya ya mtumiaji "${newU.name}" (${newU.role}) imeundwa.`);
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    addAuditLog('Kuhariri Mtumiaji', `Sifa za akaunti za mwanachama "${updated.name}" zimepitiwa.`);
  };

  const handleDeleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (target) {
      addAuditLog('Futa Mtumiaji', `Mtumiaji "${target.name}" ameondolewa.`);
    }
  };

  // Backup & Restore state
  const handleRestoreSystemData = (data: SystemData) => {
    if (data.products) setProducts(data.products);
    if (data.customers) setCustomers(data.customers);
    if (data.sales) setSales(data.sales);
    if (data.expenses) setExpenses(data.expenses);
    if (data.users) setUsers(data.users);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
  };

  // --- Check Permissions for activeTab ---
  const currentTabPermissionMap: Record<string, string> = {
    'dashboard': 'view_dashboard',
    'products': 'manage_products',
    'sales': 'make_sales',
    'expenses': 'manage_expenses',
    'pandl': 'view_pandl',
    'reports': 'view_reports',
    'customers': 'manage_customers',
    'users': 'manage_users',
    'backup': 'backup_restore',
    'gallery': '',
    'settings': '',
    'online_store': ''
  };

  const requiredPermission = currentTabPermissionMap[activeTab];
  let hasAccess = !requiredPermission || 
                  (activeUser.permissions && activeUser.permissions.includes(requiredPermission)) || 
                  activeUser.role === 'Admin';

  // Backwards compatibility fallbacks for previous permission model keys
  if (!hasAccess && activeUser.role !== 'Admin' && requiredPermission) {
    if (requiredPermission === 'manage_expenses' && activeUser.permissions?.includes('manage_products')) {
      hasAccess = true;
    } else if (requiredPermission === 'view_pandl' && activeUser.permissions?.includes('view_reports')) {
      hasAccess = true;
    } else if (requiredPermission === 'manage_customers' && activeUser.permissions?.includes('make_sales')) {
      hasAccess = true;
    } else if (requiredPermission === 'view_dashboard') {
      hasAccess = true;
    }
  }

  // Pekee Admin ndiye ana uwezo wa usimamizi wa account (Watumiaji tab)
  if (activeTab === 'users' && activeUser.role !== 'Admin') {
    hasAccess = false;
  }

  // Nav side items in Swahili/English
  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, permission: 'view_dashboard' },
    { id: 'sales', label: t('nav.sales'), icon: ShoppingCart, permission: 'make_sales' },
    { id: 'products', label: t('nav.products'), icon: Package, permission: 'manage_products' },
    { id: 'expenses', label: t('nav.expenses'), icon: Coins, permission: 'manage_expenses' },
    { id: 'pandl', label: t('nav.pandl'), icon: Percent, permission: 'view_pandl' },
    { id: 'reports', label: t('nav.reports'), icon: FileText, permission: 'view_reports' },
    { id: 'customers', label: t('nav.customers'), icon: Users, permission: 'manage_customers' },
    { id: 'gallery', label: t('nav.gallery'), icon: FolderOpen },
    { id: 'online_store', label: t('nav.online_store'), icon: Store },
    { id: 'affiliates', label: t('nav.affiliates'), icon: Award },
    { id: 'links', label: language === 'sw' ? 'Meneja Viungo' : 'Link Hub', icon: Link },
    ...(activeUser.role === 'Admin' ? [{ id: 'users', label: t('nav.users'), icon: Sliders, permission: 'manage_users' }] : []),
    { id: 'db_schema', label: language === 'sw' ? 'Sanifu Database' : 'Database Schema', icon: Database },
    { id: 'self_hosted', label: language === 'sw' ? 'Mifumo Huru Seva' : 'Self-Hosted Sovereignty', icon: HardDrive },
    { id: 'backup', label: t('nav.backup'), icon: BookOpen, permission: 'backup_restore' },
    { id: 'settings', label: t('nav.settings'), icon: SettingsIcon }
  ];

  // --- Check if user is logged in ---
  if (isFirstTime) {
    return (
      <LanguageSelectorFirstTime
        onSelect={(lang) => {
          setLanguage(lang);
          localStorage.setItem('hurex_first_time_lang_chosen', 'true');
          setIsFirstTime(false);
          
          const activeUserId = localStorage.getItem('mf_active_user_id');
          if (activeUserId) {
            const savedSettings = localStorage.getItem('mf_user_settings');
            let settingsList: any[] = savedSettings ? JSON.parse(savedSettings) : [];
            const index = settingsList.findIndex(s => s.user_id === activeUserId);
            if (index >= 0) {
              settingsList[index].language_code = lang;
              settingsList[index].updated_at = new Date().toISOString();
            } else {
              settingsList.push({
                id: 'us-' + Date.now(),
                user_id: activeUserId,
                language_code: lang,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            localStorage.setItem('mf_user_settings', JSON.stringify(settingsList));
          }
        }}
      />
    );
  }

  if (isCustomerStoreMode) {
    return (
      <OnlineStore 
        products={products}
        whatsappNumber={storeWhatsappNumber}
        lipaNambaMpesa={storeLipaNambaMpesa}
        lipaNambaTigo={storeLipaNambaTigo}
        lipaNambaAirtel={storeLipaNambaAirtel}
        wakalaMpesa={storeWakalaMpesa}
        wakalaTigo={storeWakalaTigo}
        wakalaAirtel={storeWakalaAirtel}
        lipaNambaHalopesa={storeLipaNambaHalopesa}
        wakalaHalopesa={storeWakalaHalopesa}
        lipaNambaAzampesa={storeLipaNambaAzampesa}
        bankAccountInfo={storeBankAccountInfo}
        instagramLink={storeInstagram}
        tiktokLink={storeTiktok}
        facebookLink={storeFacebook}
        youtubeLink={storeYoutube}
        paymentInstructions={storePaymentInstructions}
        systemName={systemName}
        formatMoney={formatMoney}
        onCloseStoreView={() => setIsCustomerStoreMode(false)}
        blackTextEnabled={blackTextEnabled}
        onPlaceOnlineOrder={handlePlaceOnlineOrder}
        shareUrl={currentShareUrl}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <Login 
        users={users} 
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row transition-colors ${blackTextEnabled ? 'black-text-mode' : ''}`}>
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/60 dark:border-zinc-800 transform md:translate-x-0 transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-screen flex flex-col justify-between overflow-y-auto scrollbar-thin ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-0 hidden md:flex'
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand Swahili */}
          <div className="h-16 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between px-6 bg-zinc-50/50 dark:bg-zinc-800/10 shrink-0">
            <span className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg font-black text-xs shrink-0">HX</span>
              <h1 className="font-extrabold text-sm tracking-tight text-zinc-800 dark:text-white truncate" title={systemName}>{systemName}</h1>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                title={theme === 'dark' ? (language === 'sw' ? 'Mchana (Mwangaza)' : 'Light Mode') : (language === 'sw' ? 'Macho Salama (Usiku)' : 'Eye-Care Night Mode')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
              </button>
              {/* Quick Font Size Switch Button */}
              <button
                onClick={cycleFontSize}
                className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition font-mono font-bold text-xs"
                title={language === 'sw' ? 'Kuza Maandishi' : 'Change Text Size'}
              >
                {fontSize === 'normal' ? 'Aa' : fontSize === 'large' ? 'Aa+' : 'Aa++'}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Container for Navigation & Extra Cards */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
            {/* Nav Items Links */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const isAllowed = !item.permission || activeUser.permissions.includes(item.permission);
                const IsActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      IsActive 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    } ${!isAllowed ? 'opacity-40' : ''}`}
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                    {!isAllowed && (
                      <span className="absolute right-3 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">🔒</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* USOMAJI RAHISI (EASY READING ACCESSIBILITY CARD) */}
            <div className="p-3 bg-blue-50/40 dark:bg-amber-950/20 rounded-2xl border border-blue-100/50 dark:border-amber-900/30 shadow-xs">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-amber-400 uppercase tracking-widest mb-2">
                <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-amber-500 shrink-0" />
                <span>{language === 'sw' ? 'Urahisi wa Kusoma' : 'Easy Reading Features'}</span>
              </div>
              
              <div className="space-y-2">
                {/* Macho Salama / Cozy Night mode */}
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-amber-200">
                  <span>{language === 'sw' ? 'Hali ya Macho Salama (Usiku)' : 'Eye-Care (Night Mode)'}</span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`px-2 py-0.5 rounded text-[9px] font-black transition-all uppercase ${
                      theme === 'dark' 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                    }`}
                  >
                    {theme === 'dark' ? (language === 'sw' ? 'USIKU' : 'ON') : (language === 'sw' ? 'MCHANA' : 'OFF')}
                  </button>
                </div>

                {/* High Contrast Text Switch */}
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-amber-200">
                  <span>{language === 'sw' ? 'Mwandiko Safi/Mweusi' : 'High Contrast Text'}</span>
                  <button
                    type="button"
                    onClick={() => setBlackTextEnabled(!blackTextEnabled)}
                    className={`px-2 py-0.5 rounded text-[9px] font-black transition-all uppercase ${
                      blackTextEnabled 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {blackTextEnabled ? (language === 'sw' ? 'NDIYO' : 'ON') : (language === 'sw' ? 'HAPANA' : 'OFF')}
                  </button>
                </div>

                {/* Font Size Adjuster buttons */}
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  <span>{language === 'sw' ? 'Kuzidisha Maandishi' : 'Text Zoom'}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFontSize('normal')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                        fontSize === 'normal' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                      title={language === 'sw' ? 'Maandishi ya Kawaida' : 'Normal Text'}
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('large')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                        fontSize === 'large' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                      title={language === 'sw' ? 'Maandishi Makubwa' : 'Large Text'}
                    >
                      1.2x
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('xlarge')}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                        fontSize === 'xlarge' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                      title={language === 'sw' ? 'Maandishi Makubwa Zaidi' : 'Extra Large'}
                    >
                      1.4x
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Saa ya Jopo la Mfumo (Live Local Time Clock) */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse shrink-0" />
                <span>{language === 'sw' ? 'Saa ya Jopo la Mfumo' : 'System Control Panel Clock'}</span>
              </div>
              <div className="text-base font-black text-zinc-800 dark:text-white font-mono tracking-wider">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold capitalize mt-1">
                {currentTime.toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* User Account Info bottom */}
        <div className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-950/20 shrink-0 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-600 font-extrabold text-sm text-white flex items-center justify-center">
              {activeUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-[11px] text-zinc-800 dark:text-white block truncate">{activeUser.name}</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">{activeUser.role} Account</span>
              <button 
                onClick={handleOpenProfileModal}
                className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline font-bold text-left block mt-0.5"
                title={language === 'sw' ? 'Hariri Taarifa Zangu' : 'Edit My Profile'}
              >
                {language === 'sw' ? 'Hariri Taarifa Zangu ✎' : 'Edit My Profile ✎'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="w-full p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100/40 transition flex items-center justify-center gap-1.5 font-bold text-xs"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {language === 'sw' ? 'Toka katika Mfumo' : 'Sign Out of System'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Coordinate Content wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header top */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between px-4 md:hidden shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="flex items-center gap-1.5 font-extrabold text-sm text-zinc-800 dark:text-white">
            <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px]">HX</span>
            {systemName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition"
              title={theme === 'dark' ? (language === 'sw' ? 'Mchana (Mwangaza)' : 'Light Mode') : (language === 'sw' ? 'Macho Salama (Usiku)' : 'Eye-Care Night Mode')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-zinc-500" />}
            </button>
            <button
              onClick={cycleFontSize}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition font-mono font-bold text-xs"
              title={language === 'sw' ? 'Badili Ukubwa wa Maandishi' : 'Change Text Size'}
            >
              {fontSize === 'normal' ? 'Aa' : fontSize === 'large' ? 'Aa+' : 'Aa++'}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 -mr-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition flex items-center justify-center"
              title={language === 'sw' ? "Toka katika Mfumo" : "Sign Out"}
            >
              <LogOut className="w-5.5 h-5.5" />
            </button>
          </div>
        </header>

        {/* Dynamic render check permissions or selected tab */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-22 md:pb-8 overflow-y-auto w-full max-w-full overflow-x-hidden">
          {!hasAccess ? (
            <div className="max-w-md mx-auto py-20 text-center space-y-4" id="forbidden-alert">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                {language === 'sw' ? 'Ufikiaji Umesitishwa!' : 'Access Denied!'}
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-pretty">
                {language === 'sw' ? (
                  <>
                    Akaunti yako ya jukumu la <strong>&ldquo;{activeUser.role}&rdquo;</strong> haina idhini ya ufikiaji ya tab ya <strong>&ldquo;{activeTab.toUpperCase()}&rdquo;</strong> kwa kuwa huna ruhusa kama <strong>&ldquo;{requiredPermission}&rdquo;</strong>.
                  </>
                ) : (
                  <>
                    Your <strong>&ldquo;{activeUser.role}&rdquo;</strong> role account does not have access permissions for the <strong>&ldquo;{activeTab.toUpperCase()}&rdquo;</strong> tab because you lack the <strong>&ldquo;{requiredPermission}&rdquo;</strong> permission.
                  </>
                )}
              </p>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850 rounded-xl text-left border border-zinc-150">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                  {language === 'sw' ? 'Nini cha kufanya?' : 'What to do?'}
                </span>
                <span className="text-[10px] text-zinc-500 block leading-normal mt-1">
                  {language === 'sw' ? (
                    <>
                      1. Wasiliana na Admin (hurexgroup88@gmail.com) ili akubadilishie ruhusa za jukumu lako kwenye jopo la watumiaji.<br />
                      2. Unaweza pia kutoka na kuingia tena na akaunti sahihi ikiwa unayo.
                    </>
                  ) : (
                    <>
                      1. Contact Admin (hurexgroup88@gmail.com) to change your role permissions in the users panel.<br />
                      2. You can also log out and sign in again with the correct account if you have one.
                    </>
                  )}
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
              >
                {language === 'sw' ? 'Rudi Kwenye Dashboard' : 'Back to Dashboard'}
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  products={products}
                  sales={sales}
                  expenses={expenses}
                  customers={customers}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'products' && (
                <Products 
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'sales' && (
                <POS 
                  products={products}
                  customers={customers}
                  activeUserId={activeUserId}
                  activeUserName={activeUser.name}
                  onAddSale={handleAddSale}
                  onUpdateSale={handleUpdateSale}
                  onDeleteSale={handleDeleteSale}
                  formatMoney={formatMoney}
                  salesHistory={sales}
                  receiptBusinessName={receiptBusinessName}
                  receiptAddress={receiptAddress}
                  receiptContact={receiptContact}
                  receiptFooter={receiptFooter}
                  defaultTaxRate={defaultTaxRate}
                />
              )}

              {activeTab === 'expenses' && (
                <Expenses 
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'pandl' && (
                <ProfitLoss 
                  sales={sales}
                  expenses={expenses}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'reports' && (
                <Reports 
                  products={products}
                  sales={sales}
                  expenses={expenses}
                  customers={customers}
                  formatMoney={formatMoney}
                  onUpdateSale={handleUpdateSale}
                  onDeleteSale={handleDeleteSale}
                />
              )}

              {activeTab === 'customers' && (
                <Customers 
                  customers={customers}
                  sales={sales}
                  onAddCustomer={handleAddCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'users' && (
                <UsersTab 
                  users={users}
                  auditLogs={auditLogs}
                  activeUserId={activeUserId}
                  customPermissions={customPermissions}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onSwitchUser={handleSwitchUser}
                  onClearAuditLogs={handleClearAuditLogs}
                  onAddCustomPermission={handleAddCustomPermission}
                />
              )}

              {activeTab === 'backup' && (
                <BackupRestore 
                  systemData={{ products, customers, sales, expenses, users, auditLogs }}
                  onRestoreSystemData={handleRestoreSystemData}
                  onAddAuditLog={addAuditLog}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'gallery' && (
                <Gallery 
                  documents={documents}
                  onAddDocument={handleAddDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}

              {activeTab === 'settings' && (
                <Settings 
                  systemName={systemName}
                  onChangeSystemName={setSystemName}
                  receiptBusinessName={receiptBusinessName}
                  setReceiptBusinessName={setReceiptBusinessName}
                  receiptAddress={receiptAddress}
                  setReceiptAddress={setReceiptAddress}
                  receiptContact={receiptContact}
                  setReceiptContact={setReceiptContact}
                  receiptFooter={receiptFooter}
                  setReceiptFooter={setReceiptFooter}
                  defaultTaxRate={defaultTaxRate}
                  setDefaultTaxRate={setDefaultTaxRate}
                  onAddAuditLog={addAuditLog}
                  blackTextEnabled={blackTextEnabled}
                  onToggleBlackText={setBlackTextEnabled}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                   whatsappNumber={storeWhatsappNumber}
                  onChangeWhatsappNumber={setStoreWhatsappNumber}
                  lipaNambaMpesa={storeLipaNambaMpesa}
                  onChangeLipaNambaMpesa={setStoreLipaNambaMpesa}
                  lipaNambaTigo={storeLipaNambaTigo}
                  onChangeLipaNambaTigo={setStoreLipaNambaTigo}
                  lipaNambaAirtel={storeLipaNambaAirtel}
                  onChangeLipaNambaAirtel={setStoreLipaNambaAirtel}
                  wakalaMpesa={storeWakalaMpesa}
                  onChangeWakalaMpesa={setStoreWakalaMpesa}
                  wakalaTigo={storeWakalaTigo}
                  onChangeWakalaTigo={setStoreWakalaTigo}
                  wakalaAirtel={storeWakalaAirtel}
                  onChangeWakalaAirtel={setStoreWakalaAirtel}
                  lipaNambaHalopesa={storeLipaNambaHalopesa}
                  onChangeLipaNambaHalopesa={setStoreLipaNambaHalopesa}
                  wakalaHalopesa={storeWakalaHalopesa}
                  onChangeWakalaHalopesa={setStoreWakalaHalopesa}
                  lipaNambaAzampesa={storeLipaNambaAzampesa}
                  onChangeLipaNambaAzampesa={setStoreLipaNambaAzampesa}
                  bankAccountInfo={storeBankAccountInfo}
                  onChangeBankAccountInfo={setStoreBankAccountInfo}
                  instagramLink={storeInstagram}
                  onChangeInstagramLink={setStoreInstagram}
                  tiktokLink={storeTiktok}
                  onChangeTiktokLink={setStoreTiktok}
                  facebookLink={storeFacebook}
                  onChangeFacebookLink={setStoreFacebook}
                  youtubeLink={storeYoutube}
                  onChangeYoutubeLink={setStoreYoutube}
                  paymentInstructions={storePaymentInstructions}
                  onChangePaymentInstructions={setStorePaymentInstructions}
                />
              )}

              {activeTab === 'online_store' && (
                <div className="space-y-6">
                  {/* Top Header with Sub-tabs */}
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-black text-zinc-850 dark:text-white uppercase tracking-tight">Duka la Mtandaoni & Maagizo</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Dhibiti maagizo yote ya mtandaoni, thibitisha malipo kupitia risiti ili kupunguza stoki moja kwa moja duka, na uone muonekano wa duka.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsCustomerStoreMode(true)}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Store className="w-4 h-4" />
                          Fungua Duka (Mteja Mode)
                        </button>
                      </div>
                    </div>

                    {/* Tab Selectors */}
                    <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 pt-2 gap-4">
                      <button
                        onClick={() => setOnlineStoreSubTab('orders')}
                        className={`pb-2.5 text-xs font-black uppercase tracking-wider relative transition-all ${
                          onlineStoreSubTab === 'orders' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                      >
                        Maagizo ya Wateja ({onlineOrders.length})
                        {onlineOrders.filter(o => o.status === 'Pending').length > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full animate-bounce">
                            {onlineOrders.filter(o => o.status === 'Pending').length} MAPYA
                          </span>
                        )}
                        {onlineStoreSubTab === 'orders' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                        )}
                      </button>

                      <button
                        onClick={() => setOnlineStoreSubTab('preview')}
                        className={`pb-2.5 text-xs font-black uppercase tracking-wider relative transition-all ${
                          onlineStoreSubTab === 'preview' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                        }`}
                      >
                        Preview & Kiungo cha Duka
                        {onlineStoreSubTab === 'preview' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: MAAGIZO YA WATEJA */}
                  {onlineStoreSubTab === 'orders' && (
                    <div className="space-y-6">
                      {/* Stats Dashboard */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-amber-500/5 dark:bg-amber-950/10 p-5 rounded-2xl border border-amber-500/10 dark:border-amber-900/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Maagizo Yanayosubiri</span>
                            <span className="text-2xl font-black text-zinc-800 dark:text-white mt-1 block">
                              {onlineOrders.filter(o => o.status === 'Pending').length}
                            </span>
                          </div>
                          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                            <Clock className="w-5 h-5 animate-pulse" />
                          </div>
                        </div>

                        <div className="bg-emerald-500/5 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-500/10 dark:border-emerald-900/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Mapato Yaliyothibitishwa</span>
                            <span className="text-2xl font-black text-zinc-800 dark:text-white mt-1 block">
                              {formatMoney(
                                onlineOrders
                                  .filter(o => o.status === 'Confirmed')
                                  .reduce((sum, o) => sum + o.totalAmount, 0)
                              )}
                            </span>
                          </div>
                          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                            <Coins className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="bg-zinc-500/5 dark:bg-zinc-950/10 p-5 rounded-2xl border border-zinc-500/10 dark:border-zinc-900/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Jumla ya Maagizo yote</span>
                            <span className="text-2xl font-black text-zinc-800 dark:text-white mt-1 block">
                              {onlineOrders.length}
                            </span>
                          </div>
                          <div className="p-3 bg-zinc-500/10 text-zinc-500 rounded-xl">
                            <Activity className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                        <div className="relative w-full sm:w-80">
                          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Tafuta kwa Jina, Namba ya Agizo, au Simu..."
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white focus:outline-hidden"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-end">
                          {['All', 'Pending', 'Confirmed', 'Cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setOrderStatusFilter(status)}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                                orderStatusFilter === status
                                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                                  : 'bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/80'
                              }`}
                            >
                              {status === 'All' ? 'Yote' : status === 'Pending' ? 'Inasubiri' : status === 'Confirmed' ? 'Imethibitishwa' : 'Imeghairiwa'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Orders List */}
                      <div className="space-y-4">
                        {onlineOrders.filter(order => {
                          const matchesSearch = order.orderNo.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                                order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                                order.customerPhone.toLowerCase().includes(orderSearchTerm.toLowerCase());
                          const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
                          return matchesSearch && matchesStatus;
                        }).length === 0 ? (
                          <div className="text-center p-12 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl space-y-3">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
                              <Filter className="w-5 h-5" />
                            </div>
                            <h5 className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">Hakuna agizo lolote lililopatikana</h5>
                            <p className="text-xs text-zinc-400 max-w-xs mx-auto">Hajapatikana agizo linalolingana na utafutaji au chujio ulilochagua kwa sasa.</p>
                          </div>
                        ) : (
                          onlineOrders.filter(order => {
                            const matchesSearch = order.orderNo.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                                  order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                                                  order.customerPhone.toLowerCase().includes(orderSearchTerm.toLowerCase());
                            const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
                            return matchesSearch && matchesStatus;
                          }).map((order) => {
                            const isExpanded = expandedOrderId === order.id;
                            return (
                              <div 
                                id={`order-card-${order.id}`}
                                key={order.id} 
                                className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:border-zinc-250 dark:hover:border-zinc-750 transition-all text-xs"
                              >
                                {/* Header (Always visible) */}
                                <div 
                                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-850/10 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                      <ShoppingCart className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">{order.orderNo}</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase ${
                                          order.status === 'Pending'
                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50'
                                            : order.status === 'Confirmed'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/50'
                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200/50'
                                        }`}>
                                          {order.status === 'Pending' ? 'Inasubiri' : order.status === 'Confirmed' ? 'Imethibitishwa' : 'Imeghairiwa'}
                                        </span>
                                      </div>
                                      <span className="font-extrabold text-zinc-900 dark:text-white mt-1 block text-sm">{order.customerName}</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
                                    <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                      {order.date} | {order.time}
                                    </div>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm md:text-base mt-0.5">
                                      {formatMoney(order.totalAmount)}
                                    </span>
                                  </div>
                                </div>

                                {/* Expandable Detail Body */}
                                {isExpanded && (
                                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-5 bg-zinc-50/50 dark:bg-zinc-850/5 space-y-5">
                                    {/* Contact & Delivery Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                                      {/* Customer Address & Quick contact */}
                                      <div className="space-y-3.5 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 shadow-2xs">
                                        <h5 className="font-black uppercase tracking-wider text-[10px] text-zinc-400 flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                          Taarifa za Mawasiliano & Mahali
                                        </h5>
                                        <div className="space-y-2 text-zinc-700 dark:text-zinc-300">
                                          <div>
                                            <span className="font-bold block text-[10px] text-zinc-400 uppercase">Simu ya Mteja:</span>
                                            <span className="font-mono text-zinc-800 dark:text-white block mt-0.5">{order.customerPhone}</span>
                                          </div>
                                          <div>
                                            <span className="font-bold block text-[10px] text-zinc-400 uppercase">Mahali mzigo upelekwe:</span>
                                            <span className="text-zinc-800 dark:text-white block mt-0.5">{order.customerAddress}</span>
                                          </div>
                                        </div>

                                        {/* Quick Action buttons to contact */}
                                        <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-3">
                                          <a 
                                            href={`tel:${order.customerPhone}`}
                                            className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white text-center font-bold rounded-xl flex items-center justify-center gap-1"
                                          >
                                            <Phone className="w-3.5 h-3.5" />
                                            Piga Simu
                                          </a>
                                          <a 
                                            href={`https://wa.me/${order.customerPhone.replace('+', '').trim()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold rounded-xl flex items-center justify-center gap-1"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            WhatsApp
                                          </a>
                                        </div>
                                      </div>

                                      {/* Note / Special Instructions */}
                                      <div className="space-y-3.5 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 shadow-2xs flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <h5 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">
                                            📝 Maelekezo / Ujumbe Maalum
                                          </h5>
                                          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                                            {order.customerNote ? `"${order.customerNote}"` : "Hakuna maelezo maalum yaliyowekwa na mteja kwenye agizo hili."}
                                          </p>
                                        </div>

                                        {/* Payment Receipt Image preview */}
                                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                                          <span className="font-bold block text-[10px] text-zinc-400 uppercase mb-1.5">Risiti ya Malipo (Payment Receipt):</span>
                                          {order.paymentReceiptImage ? (
                                            <div className="flex items-center gap-3">
                                              <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-750 flex items-center justify-center shrink-0">
                                                <img 
                                                  src={order.paymentReceiptImage} 
                                                  className="w-full h-full object-cover" 
                                                  alt="Kihakiki Risiti" 
                                                  referrerPolicy="no-referrer"
                                                />
                                              </div>
                                              <button 
                                                onClick={() => setReceiptModalUrl(order.paymentReceiptImage || null)}
                                                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-white font-bold rounded-lg flex items-center gap-1 text-[11px]"
                                              >
                                                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                                                Angalia Risiti Kamili
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-zinc-400 text-[11px] block">⚠️ Mteja bado hajaambatanisha risiti ya malipo.</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Ordered Items Table */}
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xs">
                                      <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-850/30 border-b border-zinc-100 dark:border-zinc-800">
                                        <h5 className="font-black uppercase tracking-wider text-[10px] text-zinc-400">Bidhaa Zilizowekwa Kwenye Agizo:</h5>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                          <thead>
                                            <tr className="border-b border-zinc-100 dark:border-zinc-850 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                              <th className="px-4 py-2.5">Bidhaa (Product)</th>
                                              <th className="px-4 py-2.5 text-center">Idadi (Qty)</th>
                                              <th className="px-4 py-2.5 text-right">Bei ya Kitengo</th>
                                              <th className="px-4 py-2.5 text-right">Jumla Kuu</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-300">
                                            {order.items.map((item, idx) => (
                                              <tr key={idx} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-850/10">
                                                <td className="px-4 py-2.5 font-bold text-zinc-900 dark:text-white">{item.name}</td>
                                                <td className="px-4 py-2.5 text-center font-mono font-bold text-zinc-900 dark:text-white">{item.quantity}</td>
                                                <td className="px-4 py-2.5 text-right font-mono">{formatMoney(item.price)}</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                  {formatMoney(item.price * item.quantity)}
                                                </td>
                                              </tr>
                                            ))}
                                            <tr className="bg-zinc-50/50 dark:bg-zinc-850/10 font-bold border-t border-zinc-150 dark:border-zinc-800">
                                              <td colSpan={3} className="px-4 py-3 text-right uppercase tracking-wider text-[10px] text-zinc-400">Jumla ya Malipo (Subtotal):</td>
                                              <td className="px-4 py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                {formatMoney(order.totalAmount)}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    {/* Meneja wa Agizo & Stoki (Order & Stock Manager Panel) */}
                                    <div className="mt-6 p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850/60 rounded-2xl shadow-inner text-xs">
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-850">
                                        <div>
                                          <h5 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                                            Meneja wa Agizo & Maamuzi ya Stoki (Order & Stock Decision)
                                          </h5>
                                          <p className="text-[10px] text-zinc-400 mt-0.5">
                                            Dhibiti maamuzi ya agizo hili, thibitisha malipo na uhakiki jinsi stoki ya bidhaa inavyoathirika.
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start md:self-auto">
                                          <span className="text-[10px] text-zinc-400 uppercase font-bold">Hali ya Agizo:</span>
                                          {order.status === 'Pending' ? (
                                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[10px] rounded-lg border border-amber-200/30 dark:border-amber-900/30 uppercase tracking-wider">
                                              Inasubiri (Pending)
                                            </span>
                                          ) : order.status === 'Confirmed' ? (
                                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] rounded-lg border border-emerald-200/30 dark:border-emerald-900/30 uppercase tracking-wider flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                                              Limekubaliwa (Confirmed)
                                            </span>
                                          ) : (
                                            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-[10px] rounded-lg border border-rose-200/30 dark:border-rose-900/30 uppercase tracking-wider">
                                              Limekataliwa (Cancelled)
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Stock Impact Preview Card */}
                                      <div className="mb-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                                        <h6 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                                          📋 Athari ya Stoki ya Bidhaa Kabla ya Kukubali:
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {order.items.map((item, idx) => {
                                            const storeProd = products.find(p => p.id === item.productId);
                                            const currentStock = storeProd ? storeProd.quantity : 0;
                                            const isLow = currentStock < item.quantity;
                                            const predictedStock = order.status === 'Confirmed' 
                                              ? currentStock 
                                              : Math.max(0, currentStock - item.quantity);

                                            return (
                                              <div 
                                                key={idx} 
                                                className={`p-2.5 rounded-lg border text-[11px] ${
                                                  isLow && order.status === 'Pending'
                                                    ? 'border-amber-300 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/5' 
                                                    : 'border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30'
                                                }`}
                                              >
                                                <div className="flex justify-between items-start gap-2">
                                                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</span>
                                                  <span className="font-mono text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-500 shrink-0">
                                                    ID: {item.productId.slice(0, 5)}
                                                  </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[10px]">
                                                  <div>
                                                    <span className="text-zinc-400">Zilizopo:</span>{' '}
                                                    <span className={`font-mono font-bold ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                      {currentStock}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span className="text-zinc-400">Agizwa:</span>{' '}
                                                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                                      -{item.quantity}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span className="text-zinc-400">Zitakazobaki:</span>{' '}
                                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                      {predictedStock}
                                                    </span>
                                                  </div>
                                                </div>
                                                {isLow && order.status === 'Pending' && (
                                                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                                                    ⚠️ Tahadhari: Stoki haitoshi duka (Inapungua kwa {item.quantity - currentStock})!
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Interactive Operational Panel */}
                                      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                                        <div className="flex-1">
                                          {order.status === 'Pending' && (
                                            <div className="flex flex-col sm:flex-row items-stretch gap-3">
                                              {/* Accept Order Button */}
                                              <button
                                                onClick={() => {
                                                  handleConfirmOnlineOrder(order.id);
                                                }}
                                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 text-left cursor-pointer"
                                              >
                                                <Check className="w-4 h-4 shrink-0" />
                                                <div>
                                                  <span className="block font-black text-xs">Kubali Agizo & Punguza Stoki</span>
                                                  <span className="block text-[9px] font-normal opacity-85 text-emerald-100">Kamilisha agizo & andikisha mauzo dukani</span>
                                                </div>
                                              </button>
 
                                              {/* Cancel / Reject Order Button */}
                                              <button
                                                onClick={() => {
                                                  handleCancelOnlineOrder(order.id);
                                                }}
                                                className="px-4 py-3 bg-zinc-200 hover:bg-zinc-250 dark:bg-zinc-800 dark:hover:bg-zinc-750 active:scale-[0.98] text-zinc-800 dark:text-zinc-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-left cursor-pointer"
                                              >
                                                <X className="w-4 h-4 shrink-0" />
                                                <div>
                                                  <span className="block font-bold text-xs">Kataa / Ghairi Agizo</span>
                                                  <span className="block text-[9px] font-normal opacity-70 text-zinc-500 dark:text-zinc-400">Weka kama 'Cancelled', stoki haitaguswa</span>
                                                </div>
                                              </button>
                                            </div>
                                          )}
 
                                          {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(order.status) && (
                                            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 w-full">
                                              <div className="flex-1 space-y-2">
                                                <div>
                                                  <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center gap-1.5">
                                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                                                    <span>Agizo limekubaliwa na linafuatiliwa (Active)</span>
                                                  </div>
                                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                                                    Mauzo yameandikishwa na stoki imeshapunguzwa duka. Hali ya sasa: <strong className="uppercase font-black text-emerald-600 dark:text-emerald-400">{order.status}</strong>
                                                  </p>
                                                </div>

                                                {/* Logistics Status Selector dropdown */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                  <label className="text-[10px] font-black text-zinc-455 dark:text-zinc-500 uppercase tracking-wider shrink-0">
                                                    Badilisha Hali ya Usafirishaji:
                                                  </label>
                                                  <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOnlineOrderStatus(order.id, e.target.value as any)}
                                                    className="text-[11px] font-extrabold py-1 px-2.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                  >
                                                    <option value="Confirmed">1. Confirmed / Malipo Tayari</option>
                                                    <option value="Processing">2. Processing / Maandalizi</option>
                                                    <option value="Packed">3. Packed / Kwenye Boksi</option>
                                                    <option value="Shipped">4. Shipped / Njiani</option>
                                                    <option value="Delivered">5. Delivered / Umefika</option>
                                                  </select>
                                                </div>
                                              </div>
 
                                              <button
                                                onClick={() => {
                                                  handleCancelOnlineOrder(order.id);
                                                }}
                                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 shrink-0"
                                              >
                                                <X className="w-3.5 h-3.5 shrink-0" />
                                                Ghairi Agizo & Rejesha Stoki
                                              </button>
                                            </div>
                                          )}
 
                                          {order.status === 'Cancelled' && (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-rose-500/5 dark:bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
                                              <div className="flex-1">
                                                <div className="text-rose-600 dark:text-rose-400 font-black text-xs flex items-center gap-1.5">
                                                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                                                  <span>Agizo hili limekataliwa (Cancelled)!</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                                                  Stoki haijaguswa wala kupunguzwa duka.
                                                </p>
                                              </div>
 
                                              <button
                                                onClick={() => {
                                                  handleConfirmOnlineOrder(order.id);
                                                }}
                                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 shrink-0"
                                              >
                                                <Check className="w-3.5 h-3.5 shrink-0" />
                                                Badilisha & Kubali Sasa
                                              </button>
                                            </div>
                                          )}
                                        </div>
 
                                        {/* Action: Delete completely from DB */}
                                        <div className="border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 pt-3 lg:pt-0 lg:pl-4 flex items-center justify-end">
                                          <button
                                            onClick={() => {
                                              handleDeleteOnlineOrder(order.id, order.status === 'Confirmed');
                                            }}
                                            className="px-3.5 py-2.5 border border-rose-200 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs w-full lg:w-auto"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                            Futa Agizo kabisa
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: PREVIEW & KIUNGO CHA DUKA */}
                  {onlineStoreSubTab === 'preview' && (
                    <div className="space-y-6">
                      {/* Share Store Link Banner */}
                      <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/20 dark:to-transparent rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-xl shrink-0">
                            <Share2 className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <span className="font-extrabold text-emerald-800 dark:text-emerald-400 uppercase text-[9px] tracking-wider block">Link ya duka lako la Mtandaoni (Share on WhatsApp):</span>
                            <span className="font-mono text-zinc-650 dark:text-zinc-300 text-[11px] block select-all mt-0.5 break-all">
                              {window.location.origin}/?store=true&d=... (Rich Link)
                            </span>
                            <p className="text-[10px] text-zinc-400 mt-1">Mteja akibofya link hii, atafunguliwa duka lako la mtandaoni likiwa na bidhaa zako zote na namba zako za malipo kwenye kifaa chochote!</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(currentShareUrl);
                            alert('Kiungo maalum cha duka lako kimenakiliwa kikiwa na bidhaa zako zote! Sasa unaweza kukituma kwa wateja wako kupitia WhatsApp, Instagram au SMS.');
                          }}
                          className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 self-stretch md:self-auto shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Nakili Link ya Duka
                        </button>
                      </div>

                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs h-[700px] relative">
                        <OnlineStore 
                          products={products}
                          whatsappNumber={storeWhatsappNumber}
                          lipaNambaMpesa={storeLipaNambaMpesa}
                          lipaNambaTigo={storeLipaNambaTigo}
                          lipaNambaAirtel={storeLipaNambaAirtel}
                          wakalaMpesa={storeWakalaMpesa}
                          wakalaTigo={storeWakalaTigo}
                          wakalaAirtel={storeWakalaAirtel}
                          lipaNambaHalopesa={storeLipaNambaHalopesa}
                          wakalaHalopesa={storeWakalaHalopesa}
                          lipaNambaAzampesa={storeLipaNambaAzampesa}
                          bankAccountInfo={storeBankAccountInfo}
                          instagramLink={storeInstagram}
                          tiktokLink={storeTiktok}
                          facebookLink={storeFacebook}
                          youtubeLink={storeYoutube}
                          paymentInstructions={storePaymentInstructions}
                          systemName={systemName}
                          formatMoney={formatMoney}
                          blackTextEnabled={blackTextEnabled}
                          onPlaceOnlineOrder={handlePlaceOnlineOrder}
                          shareUrl={currentShareUrl}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'affiliates' && (
                <Affiliates 
                  products={products}
                  onlineOrders={onlineOrders}
                  formatMoney={formatMoney}
                  language={language}
                  addAuditLog={addAuditLog}
                  onAddExpense={handleAddExpense}
                />
              )}

              {activeTab === 'links' && (
                <UniversalLinks 
                  products={products}
                  customers={customers}
                  sales={sales}
                  onlineOrders={onlineOrders}
                  language={language}
                  formatMoney={formatMoney}
                />
              )}

              {activeTab === 'db_schema' && (
                <DatabaseSchema 
                  language={language}
                />
              )}

              {activeTab === 'self_hosted' && (
                <SelfHostedHub 
                  language={language}
                />
              )}
            </>
          )}
        </main>

        {/* Sticky Bottom Navigation for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-150/80 dark:border-zinc-800/80 md:hidden flex items-center justify-around h-16 pb-safe shadow-lg">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-extrabold tracking-tight">{t('nav.dashboard')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sales');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors ${
              activeTab === 'sales' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <ShoppingCart className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-extrabold tracking-tight">{t('nav.sales')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('products');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors ${
              activeTab === 'products' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Package className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-extrabold tracking-tight">{t('nav.products')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setIsMobileMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors ${
              activeTab === 'reports' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-extrabold tracking-tight">{t('nav.reports')}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-colors ${
              isMobileMenuOpen ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-extrabold tracking-tight">
              {language === 'sw' ? 'Menyu' : 'Menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Profile Edit Modal (Hariri Taarifa Zangu) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl text-xs">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Marekebisho ya Wasifu Wangu</span>
              </h4>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Jina Kamili *</label>
                <input 
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Jina la Kuingia (Username) *</label>
                <input 
                  type="text"
                  required
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Barua Pepe (Email Address) *</label>
                <input 
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nenosiri Mpya (Password) - weka tupu kubaki ya zamani</label>
                <input 
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Nenosiri mpya"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 justify-end">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs"
                >
                  Hifadhi Wasifu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Zoom Modal */}
      {receiptModalUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-xs">
            <div className="p-4 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/50">
              <h4 className="text-sm font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧾 Risiti ya Malipo ya Mteja</span>
              </h4>
              <button 
                onClick={() => setReceiptModalUrl(null)}
                className="text-zinc-500 hover:text-zinc-800 text-lg leading-none p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-zinc-50">
              <img 
                src={receiptModalUrl} 
                className="max-w-full max-h-[70vh] object-contain rounded-xl border border-zinc-200 shadow-sm" 
                alt="Risiti ya Malipo"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
