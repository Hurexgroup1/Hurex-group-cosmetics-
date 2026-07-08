import React, { useState, useEffect, useMemo } from 'react';
import { Product, OnlineOrder, Affiliate, AffiliateClick, AffiliateCommission, AffiliateWithdrawal } from '../types';
import { 
  Users, Wallet, Coins, Activity, Share2, Copy, QrCode, ShieldAlert, Award, 
  Download, RefreshCw, Send, Smartphone, Landmark, CheckCircle2, XCircle, 
  AlertTriangle, ArrowRight, Check, Search, Plus, Trash2, Edit2, FileText, BarChart2
} from 'lucide-react';

interface AffiliatesProps {
  products: Product[];
  onlineOrders: OnlineOrder[];
  formatMoney: (amount: number) => string;
  language: 'en' | 'sw';
  addAuditLog: (action: string, details: string) => void;
  onAddExpense?: (expense: any) => void;
}

export default function Affiliates({ 
  products, 
  onlineOrders, 
  formatMoney, 
  language, 
  addAuditLog,
  onAddExpense 
}: AffiliatesProps) {
  
  // --- LOCAL PERSISTENCE STORAGE INITIALIZATION ---
  const [affiliates, setAffiliates] = useState<Affiliate[]>(() => {
    const saved = localStorage.getItem('hurex_affiliates');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'aff-1',
        name: 'John Doe',
        code: 'JD1001',
        email: 'john.doe@hurex.com',
        phone: '0711223344',
        status: 'Active',
        commissionType: 'Percentage',
        commissionValue: 10, // 10%
        walletBalance: 145000,
        walletPending: 25000,
        walletPaid: 320000,
        dateRegistered: '2026-05-10',
        level: 1
      },
      {
        id: 'aff-2',
        name: 'Halima Machano',
        code: 'HM2002',
        email: 'halima@hurex.com',
        phone: '0755667788',
        status: 'Active',
        commissionType: 'Tiered',
        commissionValue: 8, // Tier base
        walletBalance: 84000,
        walletPending: 15000,
        walletPaid: 150000,
        dateRegistered: '2026-06-01',
        recruitedBy: 'JD1001',
        level: 2
      },
      {
        id: 'aff-3',
        name: 'Kassim Mussa',
        code: 'KM3003',
        email: 'kassim@hurex.com',
        phone: '0688990011',
        status: 'Active',
        commissionType: 'Fixed',
        commissionValue: 5000, // Sh 5,000 flat
        walletBalance: 45000,
        walletPending: 5000,
        walletPaid: 60000,
        dateRegistered: '2026-06-15',
        recruitedBy: 'HM2002',
        level: 3
      }
    ];
  });

  const [clicks, setClicks] = useState<AffiliateClick[]>(() => {
    const saved = localStorage.getItem('hurex_affiliate_clicks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'clk-1', affiliateCode: 'JD1001', ip: '197.250.48.12', device: 'Mobile (Android)', browser: 'Chrome', location: 'Dar es Salaam', timestamp: new Date(Date.now() - 3600000).toISOString(), campaign: 'summer-sale' },
      { id: 'clk-2', affiliateCode: 'HM2002', ip: '41.86.128.55', device: 'Mobile (iOS)', browser: 'Safari', location: 'Arusha', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 'clk-3', affiliateCode: 'KM3003', ip: '102.164.2.91', device: 'Desktop', browser: 'Firefox', location: 'Mwanza', timestamp: new Date(Date.now() - 14400000).toISOString() },
      { id: 'clk-4', affiliateCode: 'JD1001', ip: '197.250.48.12', device: 'Mobile (Android)', browser: 'Chrome', location: 'Dar es Salaam', timestamp: new Date(Date.now() - 3610000).toISOString(), isDuplicate: true } // duplicate click
    ];
  });

  const [commissions, setCommissions] = useState<AffiliateCommission[]>(() => {
    const saved = localStorage.getItem('hurex_affiliate_commissions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'com-1', orderNo: 'ORD-902811', orderAmount: 150000, affiliateCode: 'JD1001', level: 1, commissionRate: '10%', amountEarned: 15000, status: 'Approved', timestamp: new Date(Date.now() - 86400000).toISOString(), date: '2026-07-04' },
      { id: 'com-2', orderNo: 'ORD-902811', orderAmount: 150000, affiliateCode: 'HM2002', level: 2, commissionRate: 'Tier 5%', amountEarned: 7500, status: 'Approved', timestamp: new Date(Date.now() - 86400000).toISOString(), date: '2026-07-04' },
      { id: 'com-3', orderNo: 'ORD-382910', orderAmount: 56000, affiliateCode: 'KM3003', level: 1, commissionRate: 'Sh 5,000', amountEarned: 5000, status: 'Pending', timestamp: new Date().toISOString(), date: '2026-07-05' }
    ];
  });

  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>(() => {
    const saved = localStorage.getItem('hurex_affiliate_withdrawals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'wth-1', affiliateCode: 'JD1001', amount: 80000, paymentMethod: 'Mobile Money', paymentDetails: '0711223344 (John Doe M-Pesa)', status: 'Paid', timestamp: new Date(Date.now() - 172800000).toISOString(), date: '2026-07-03', receiptNumber: 'REC-992011' },
      { id: 'wth-2', affiliateCode: 'HM2002', amount: 50000, paymentMethod: 'Bank Transfer', paymentDetails: 'CRDB - 015299388100 (Halima Machano)', status: 'Pending', timestamp: new Date().toISOString(), date: '2026-07-05' }
    ];
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('hurex_affiliate_notifications');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'nt-1', recipientCode: 'JD1001', title: 'Commission Mpya!', message: 'Umepata Sh 15,000 kutoka kwa agizo ORD-902811', timestamp: new Date().toISOString(), read: false },
      { id: 'nt-2', recipientCode: 'HM2002', title: 'Malipo Yale Yameidhinishwa', message: 'Ombi lako la kutoa Sh 50,000 linafanyiwa kazi.', timestamp: new Date().toISOString(), read: false }
    ];
  });

  // --- SAVE STATES TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('hurex_affiliates', JSON.stringify(affiliates));
  }, [affiliates]);

  useEffect(() => {
    localStorage.setItem('hurex_affiliate_clicks', JSON.stringify(clicks));
  }, [clicks]);

  useEffect(() => {
    localStorage.setItem('hurex_affiliate_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem('hurex_affiliate_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('hurex_affiliate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // --- COMPONENT SUB-TAB STATES ---
  const [viewMode, setViewMode] = useState<'admin' | 'portal'>('admin');
  const [adminTab, setAdminTab] = useState<'overview' | 'partners' | 'commissions' | 'clicks' | 'payouts'>('overview');
  const [portalAffiliateCode, setPortalAffiliateCode] = useState<string>('JD1001'); // simulator current logged-in code
  const [portalTab, setPortalTab] = useState<'dashboard' | 'links' | 'wallet' | 'team'>('dashboard');

  // --- REGISTER AFFILIATE FORM STATES ---
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regType, setRegType] = useState<Affiliate['commissionType']>('Percentage');
  const [regVal, setRegVal] = useState(10);
  const [regSponsor, setRegSponsor] = useState('');

  // --- LINK BUILDER STATES ---
  const [builderProdId, setBuilderProdId] = useState('');
  const [builderCatName, setBuilderCatName] = useState('');
  const [builderCampaign, setBuilderCampaign] = useState('');
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // --- WITHDRAWAL REQUEST STATES ---
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<'Mobile Money' | 'Bank Transfer'>('Mobile Money');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  // --- FILTER & SEARCH STATES ---
  const [partnerSearch, setPartnerSearch] = useState('');
  const [commSearch, setCommSearch] = useState('');
  const [clickSearch, setClickSearch] = useState('');

  // --- UTILS FOR SHILLING FORMATTING ---
  const displayTZS = (amount: number) => {
    return language === 'sw' ? `${amount.toLocaleString('sw-TZ')} TZS` : `TZS ${amount.toLocaleString('en-US')}`;
  };

  // --- AUTOMATIC COMMISSION TRIGGER ---
  // If onlineOrders changes and there are orders that are "Confirmed" / "Delivered" and have an affiliate code,
  // let's check if we've already generated their commission to avoid duplication.
  useEffect(() => {
    const confirmedOrders = onlineOrders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered');
    let updated = false;

    confirmedOrders.forEach(order => {
      // Find direct affiliate
      const affiliateCode = order.affiliateCode;
      if (!affiliateCode) return;

      // Check if commission record already exists for this order
      const exists = commissions.some(c => c.orderNo === order.orderNo);
      if (exists) return;

      // Calculate commissions based on levels & tiered setup
      const mainAff = affiliates.find(a => a.code === affiliateCode);
      if (!mainAff) return;

      const results: AffiliateCommission[] = [];
      
      // LEVEL 1 COMMISSION
      let directEarned = 0;
      let rateStr = '';
      if (mainAff.commissionType === 'Percentage') {
        directEarned = Math.round(order.totalAmount * (mainAff.commissionValue / 100));
        rateStr = `${mainAff.commissionValue}%`;
      } else if (mainAff.commissionType === 'Fixed') {
        directEarned = mainAff.commissionValue;
        rateStr = `Fixed: ${displayTZS(mainAff.commissionValue)}`;
      } else if (mainAff.commissionType === 'Tiered') {
        // Direct Level 1 gets 10%, Level 2 gets 5%, Level 3 gets 2%
        directEarned = Math.round(order.totalAmount * 0.10);
        rateStr = 'L1 Tier (10%)';
      } else if (mainAff.commissionType === 'Product-Based') {
        // Average product rate simulated
        directEarned = Math.round(order.totalAmount * 0.12);
        rateStr = 'Product-Based';
      } else {
        directEarned = Math.round(order.totalAmount * 0.08);
        rateStr = 'Category-Based';
      }

      results.push({
        id: `com-auto-1-${Date.now()}-${Math.random()}`,
        orderNo: order.orderNo,
        orderAmount: order.totalAmount,
        affiliateCode: mainAff.code,
        level: 1,
        commissionRate: rateStr,
        amountEarned: directEarned,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        notes: `Direct commission from order ${order.orderNo}`
      });

      // LEVEL 2 COMMISSION (Direct Parent Sponsor)
      let parentAff: Affiliate | undefined;
      if (mainAff.recruitedBy) {
        parentAff = affiliates.find(a => a.code === mainAff.recruitedBy);
        if (parentAff) {
          const pEarned = Math.round(order.totalAmount * 0.05); // Level 2 gets 5%
          results.push({
            id: `com-auto-2-${Date.now()}-${Math.random()}`,
            orderNo: order.orderNo,
            orderAmount: order.totalAmount,
            affiliateCode: parentAff.code,
            level: 2,
            commissionRate: 'L2 Tier (5%)',
            amountEarned: pEarned,
            status: 'Pending',
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            notes: `Level 2 recruit commission from ${mainAff.name}`
          });

          // LEVEL 3 COMMISSION (Grandparent Sponsor)
          if (parentAff.recruitedBy) {
            const grandAff = affiliates.find(a => a.code === parentAff.recruitedBy);
            if (grandAff) {
              const gEarned = Math.round(order.totalAmount * 0.02); // Level 3 gets 2%
              results.push({
                id: `com-auto-3-${Date.now()}-${Math.random()}`,
                orderNo: order.orderNo,
                orderAmount: order.totalAmount,
                affiliateCode: grandAff.code,
                level: 3,
                commissionRate: 'L3 Tier (2%)',
                amountEarned: gEarned,
                status: 'Pending',
                timestamp: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0],
                notes: `Level 3 recruit commission from ${parentAff.name}`
              });
            }
          }
        }
      }

      // Add to commissions and notify
      setCommissions(prev => [...results, ...prev]);
      
      // Update pending wallets
      setAffiliates(prev => {
        return prev.map(a => {
          const directCom = results.find(r => r.affiliateCode === a.code && r.level === 1);
          const parentCom = results.find(r => r.affiliateCode === a.code && r.level === 2);
          const grandCom = results.find(r => r.affiliateCode === a.code && r.level === 3);
          
          let pendingAdd = 0;
          if (directCom) pendingAdd += directCom.amountEarned;
          if (parentCom) pendingAdd += parentCom.amountEarned;
          if (grandCom) pendingAdd += grandCom.amountEarned;

          if (pendingAdd > 0) {
            return {
              ...a,
              walletPending: a.walletPending + pendingAdd
            };
          }
          return a;
        });
      });

      // Add notifications
      const newNotifications = results.map(res => ({
        id: `nt-auto-${Date.now()}-${Math.random()}`,
        recipientCode: res.affiliateCode,
        title: language === 'sw' ? 'Mlipuko wa Tume!' : 'New Commission Logged!',
        message: language === 'sw' 
          ? `Umetengeneza ${displayMoney(res.amountEarned)} (Ngazi ${res.level}) kutoka kwa agizo ${order.orderNo}.`
          : `You made ${displayMoney(res.amountEarned)} (Level ${res.level}) from order ${order.orderNo}.`,
        timestamp: new Date().toISOString(),
        read: false
      }));

      setNotifications(prev => [...newNotifications, ...prev]);
      addAuditLog(
        'Komisheni ya Kiotomatiki', 
        `Agizo ${order.orderNo} lilisababisha hesabu ya tume kwa affiliate code ${affiliateCode}`
      );
      updated = true;
    });

    if (updated) {
      // Just reload
    }
  }, [onlineOrders]);

  // --- HELPERS ---
  const displayMoney = (num: number) => formatMoney(num);

  const activeAffiliate = useMemo(() => {
    return affiliates.find(a => a.code === portalAffiliateCode) || affiliates[0];
  }, [affiliates, portalAffiliateCode]);

  // --- CLICK REGISTRATOR SIMULATOR ---
  const simulateClick = (code: string, type: 'store' | 'product' | 'category' | 'campaign', value?: string) => {
    const targetAff = affiliates.find(a => a.code === code);
    if (!targetAff) return;

    // Check self-purchase or fraud checks
    const simulatedIp = '197.250.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255);
    const simulatedDevice = Math.random() > 0.4 ? 'Mobile (Android Phone)' : 'Desktop (Windows PC)';
    const simulatedBrowser = Math.random() > 0.5 ? 'Chrome Browser' : 'Safari Browser';
    const simulatedLocations = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar'];
    const simulatedLocation = simulatedLocations[Math.floor(Math.random() * simulatedLocations.length)];

    // Duplicate detection: if same IP clicked same affiliate within 1 minute
    const duplicate = clicks.some(c => c.affiliateCode === code && c.ip === simulatedIp && (Date.now() - new Date(c.timestamp).getTime() < 60000));
    const bot = Math.random() < 0.05; // 5% chance of bot click simulation

    const newClick: AffiliateClick = {
      id: `clk-${Date.now()}`,
      affiliateCode: code,
      ip: simulatedIp,
      device: simulatedDevice,
      browser: simulatedBrowser,
      location: simulatedLocation,
      timestamp: new Date().toISOString(),
      campaign: type === 'campaign' ? value : undefined,
      productId: type === 'product' ? value : undefined,
      categoryName: type === 'category' ? value : undefined,
      isBot: bot,
      isDuplicate: duplicate
    };

    setClicks(prev => [newClick, ...prev]);

    // Save as persistent visitor cookie reference in standard local storage
    if (!bot && !duplicate) {
      localStorage.setItem('hurex_active_referral', code);
      if (type === 'product' && value) {
        localStorage.setItem('hurex_active_referral_product', value);
      }
    }

    addAuditLog('Kiungo Kimegongwa', `Referral link ya affiliate ${code} imegongwa kutoka ${simulatedLocation} (${type})`);
    alert(
      language === 'sw' 
        ? `Zoezi Limefanikiwa!\n\nKiungo cha ${targetAff.name} (${code}) kimebonyezwa. Mfumo umerekodi maelezo kamilifu ya mteja kiotomatiki.`
        : `Success!\n\nReferral link for ${targetAff.name} (${code}) was clicked. The system logged customer metrics automatically.`
    );
  };

  // --- ADMIN FUNCTIONS ---
  const handleRegisterAffiliate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regCode) {
      alert(language === 'sw' ? 'Tafadhali jaza jina na msimbo!' : 'Please fill in name and affiliate code!');
      return;
    }

    // Check duplicate code
    const isDup = affiliates.some(a => a.code.toUpperCase() === regCode.toUpperCase());
    if (isDup) {
      alert(language === 'sw' ? 'Msimbo huu umeshatumika!' : 'This code is already taken!');
      return;
    }

    let calculatedLevel = 1;
    if (regSponsor) {
      const parent = affiliates.find(a => a.code === regSponsor);
      if (parent) {
        calculatedLevel = Math.min(3, parent.level + 1);
      }
    }

    const newAff: Affiliate = {
      id: `aff-${Date.now()}`,
      name: regName,
      code: regCode.toUpperCase(),
      email: regEmail || `${regCode.toLowerCase()}@hurex.com`,
      phone: regPhone || '0700000000',
      status: 'Active',
      commissionType: regType,
      commissionValue: Number(regVal),
      walletBalance: 0,
      walletPending: 0,
      walletPaid: 0,
      dateRegistered: new Date().toISOString().split('T')[0],
      recruitedBy: regSponsor || undefined,
      level: calculatedLevel
    };

    setAffiliates(prev => [newAff, ...prev]);
    setIsRegModalOpen(false);
    
    // Clear forms
    setRegName('');
    setRegCode('');
    setRegEmail('');
    setRegPhone('');
    setRegSponsor('');

    addAuditLog('Sajili Affiliate', `Mshirika mpya ${newAff.name} (${newAff.code}) amesajiliwa Ngazi ${newAff.level}`);
  };

  const handleApproveCommission = (commId: string) => {
    const target = commissions.find(c => c.id === commId);
    if (!target || target.status !== 'Pending') return;

    // Approve the commission and move money from pending to walletBalance!
    setCommissions(prev => prev.map(c => c.id === commId ? { ...c, status: 'Approved' } : c));
    setAffiliates(prev => {
      return prev.map(a => {
        if (a.code === target.affiliateCode) {
          return {
            ...a,
            walletPending: Math.max(0, a.walletPending - target.amountEarned),
            walletBalance: a.walletBalance + target.amountEarned
          };
        }
        return a;
      });
    });

    // Notify the affiliate
    const newNotification = {
      id: `nt-${Date.now()}`,
      recipientCode: target.affiliateCode,
      title: language === 'sw' ? 'Komisheni Imeidhinishwa!' : 'Commission Approved!',
      message: language === 'sw' 
        ? `Tume yako ya Sh ${target.amountEarned.toLocaleString()} imehamishwa kwenye pochi kuu ya kutoa.`
        : `Your commission of Sh ${target.amountEarned.toLocaleString()} has been moved to your main wallet balance.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Integrate with ERP: Auto-create an accounting expense record
    if (onAddExpense) {
      onAddExpense({
        category: 'Mengineyo',
        date: new Date().toISOString().split('T')[0],
        amount: target.amountEarned,
        description: `Tume ya Affiliate: ${target.affiliateCode} (Agizo: ${target.orderNo})`
      });
    }

    addAuditLog('Idhinisha Tume', `Tume ya kiasi ${displayMoney(target.amountEarned)} kwa ${target.affiliateCode} imeidhinishwa.`);
  };

  const handleRejectCommission = (commId: string) => {
    const target = commissions.find(c => c.id === commId);
    if (!target || target.status !== 'Pending') return;

    setCommissions(prev => prev.map(c => c.id === commId ? { ...c, status: 'Rejected' } : c));
    setAffiliates(prev => {
      return prev.map(a => {
        if (a.code === target.affiliateCode) {
          return {
            ...a,
            walletPending: Math.max(0, a.walletPending - target.amountEarned)
          };
        }
        return a;
      });
    });

    addAuditLog('Kataa Tume', `Tume ya ${target.affiliateCode} kwa agizo ${target.orderNo} imekataliwa kwa tuhuma za udanganyifu.`);
  };

  const handleProcessPayout = (payoutId: string) => {
    const target = withdrawals.find(w => w.id === payoutId);
    if (!target || target.status !== 'Pending') return;

    // Change status to Paid
    const receiptNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    setWithdrawals(prev => prev.map(w => w.id === payoutId ? { 
      ...w, 
      status: 'Paid', 
      receiptNumber: receiptNo,
      adminNote: 'Processed via Hurex ERP automatic gateway.'
    } : w));

    // Deduct from wallet balance and update total paid
    setAffiliates(prev => {
      return prev.map(a => {
        if (a.code === target.affiliateCode) {
          return {
            ...a,
            walletBalance: Math.max(0, a.walletBalance - target.amount),
            walletPaid: a.walletPaid + target.amount
          };
        }
        return a;
      });
    });

    // Send notification
    const newNotification = {
      id: `nt-${Date.now()}`,
      recipientCode: target.affiliateCode,
      title: language === 'sw' ? 'Malipo Yamekamilika!' : 'Payout Completed!',
      message: language === 'sw' 
        ? `Pochi yako imepokea Sh ${target.amount.toLocaleString()} kupitia ${target.paymentMethod}. Risiti: ${receiptNo}`
        : `Your payout of Sh ${target.amount.toLocaleString()} was successfully processed via ${target.paymentMethod}. Receipt: ${receiptNo}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    addAuditLog('Lipa Affiliate', `Malipo ya Sh ${target.amount.toLocaleString()} yamefanyika kwa ${target.affiliateCode}`);
  };

  const handleRejectPayout = (payoutId: string) => {
    const target = withdrawals.find(w => w.id === payoutId);
    if (!target || target.status !== 'Pending') return;

    setWithdrawals(prev => prev.map(w => w.id === payoutId ? { ...w, status: 'Rejected', adminNote: 'Rejected by finance audit.' } : w));
    addAuditLog('Kataa Malipo', `Malipo ya kiasi Sh ${target.amount.toLocaleString()} kwa ${target.affiliateCode} yamekataliwa.`);
  };

  // --- PORTAL/AFFILIATE FUNCTIONS ---
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      setWithdrawalMessage(language === 'sw' ? 'Weka kiasi sahihi!' : 'Enter a valid amount!');
      return;
    }

    if (payoutAmount > activeAffiliate.walletBalance) {
      setWithdrawalMessage(language === 'sw' ? 'Salio haitoshi kwenye pochi yako!' : 'Insufficient wallet balance!');
      return;
    }

    if (!payoutDetails) {
      setWithdrawalMessage(language === 'sw' ? 'Jaza maelezo ya akaunti yako!' : 'Fill in your payment account details!');
      return;
    }

    const newWth: AffiliateWithdrawal = {
      id: `wth-${Date.now()}`,
      affiliateCode: activeAffiliate.code,
      amount: payoutAmount,
      paymentMethod: payoutMethod,
      paymentDetails: payoutDetails,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    setWithdrawals(prev => [newWth, ...prev]);
    setPayoutAmount(0);
    setPayoutDetails('');
    setWithdrawalMessage(language === 'sw' ? '✓ Ombi limetumwa kwa wasimamizi!' : '✓ Withdrawal request sent successfully!');

    setTimeout(() => {
      setWithdrawalMessage('');
    }, 4000);

    addAuditLog('Ombi la Payout', `Affiliate ${activeAffiliate.code} ameomba kutoa kiasi cha ${displayMoney(newWth.amount)}`);
  };

  // --- ANALYTICS CALCULATIONS ---
  const adminStats = useMemo(() => {
    const totalClicksCount = clicks.filter(c => !c.isBot).length;
    const uniqueVisitors = new Set(clicks.filter(c => !c.isBot).map(c => c.ip)).size;
    const totalEarnings = commissions.filter(c => c.status === 'Approved' || c.status === 'Paid').reduce((sum, c) => sum + c.amountEarned, 0);
    const pendingPayouts = withdrawals.filter(w => w.status === 'Pending').reduce((sum, w) => sum + w.amount, 0);
    
    // Attributed orders total
    const ordersCount = commissions.filter((v, i, self) => self.findIndex(t => t.orderNo === v.orderNo) === i).length;
    const conversion = totalClicksCount > 0 ? ((ordersCount / totalClicksCount) * 100).toFixed(1) : '0';

    return {
      clicks: totalClicksCount,
      visitors: uniqueVisitors,
      orders: ordersCount,
      earnings: totalEarnings,
      pendingPayouts,
      conversion
    };
  }, [clicks, commissions, withdrawals]);

  const partnerStats = useMemo(() => {
    const myClicks = clicks.filter(c => c.affiliateCode === activeAffiliate.code && !c.isBot);
    const myCommissions = commissions.filter(c => c.affiliateCode === activeAffiliate.code);
    
    const visitors = new Set(myClicks.map(c => c.ip)).size;
    const directSales = myCommissions.filter(c => c.level === 1).length;
    const downlineSales = myCommissions.filter(c => c.level > 1).length;
    const totalComm = myCommissions.filter(c => c.status !== 'Rejected').reduce((sum, c) => sum + c.amountEarned, 0);
    const conversion = myClicks.length > 0 ? ((directSales / myClicks.length) * 100).toFixed(1) : '0';

    return {
      clicks: myClicks.length,
      visitors,
      directSales,
      downlineSales,
      totalComm,
      conversion
    };
  }, [clicks, commissions, activeAffiliate]);

  // --- FILTERS ---
  const filteredPartners = useMemo(() => {
    return affiliates.filter(a => {
      const s = partnerSearch.toLowerCase();
      return a.name.toLowerCase().includes(s) || a.code.toLowerCase().includes(s) || a.phone.includes(s);
    });
  }, [affiliates, partnerSearch]);

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      const s = commSearch.toLowerCase();
      return c.orderNo.toLowerCase().includes(s) || c.affiliateCode.toLowerCase().includes(s);
    });
  }, [commissions, commSearch]);

  const filteredClicks = useMemo(() => {
    return clicks.filter(c => {
      const s = clickSearch.toLowerCase();
      return c.affiliateCode.toLowerCase().includes(s) || c.location.toLowerCase().includes(s) || c.ip.includes(s);
    });
  }, [clicks, clickSearch]);

  // --- QR & REFERRAL LINKS GENERATION ---
  const currentReferralUrls = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    const code = activeAffiliate.code;
    return {
      store: `${base}?ref=${code}`,
      product: builderProdId ? `${base}?ref=${code}&productId=${builderProdId}` : `${base}?ref=${code}`,
      category: builderCatName ? `${base}?ref=${code}&category=${encodeURIComponent(builderCatName)}` : `${base}?ref=${code}`,
      campaign: builderCampaign ? `${base}?ref=${code}&campaign=${encodeURIComponent(builderCampaign)}` : `${base}?ref=${code}`
    };
  }, [activeAffiliate, builderProdId, builderCatName, builderCampaign]);

  const handleCopyLink = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkType(type);
    setTimeout(() => {
      setCopiedLinkType(null);
    }, 2000);
  };

  // --- EXPORTS TO CSV / EXCEL REPORT ---
  const exportToCSV = (dataType: 'partners' | 'commissions' | 'payouts') => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = '';

    if (dataType === 'partners') {
      headers = ['Name', 'Code', 'Email', 'Phone', 'Status', 'Type', 'Value', 'Balance', 'Pending', 'Paid'];
      rows = affiliates.map(a => [a.name, a.code, a.email, a.phone, a.status, a.commissionType, a.commissionValue, a.walletBalance, a.walletPending, a.walletPaid]);
      filename = 'affiliate_partners_report.csv';
    } else if (dataType === 'commissions') {
      headers = ['Order No', 'Order Amount', 'Affiliate', 'Level', 'Rate', 'Commission', 'Status', 'Date'];
      rows = commissions.map(c => [c.orderNo, c.orderAmount, c.affiliateCode, c.level, c.commissionRate, c.amountEarned, c.status, c.date]);
      filename = 'commissions_report.csv';
    } else {
      headers = ['Affiliate', 'Amount', 'Method', 'Details', 'Status', 'Date', 'Receipt'];
      rows = withdrawals.map(w => [w.affiliateCode, w.amount, w.paymentMethod, w.paymentDetails, w.status, w.date, w.receiptNumber || 'N/A']);
      filename = 'payouts_report.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('Ripoti ya CSV', `Ripoti ya CSV ya ${dataType} imepakuliwa na mtumiaji.`);
  };

  // --- DOWNLINE TREE CALCULATION ---
  const downlineTree = useMemo(() => {
    const level2 = affiliates.filter(a => a.recruitedBy === activeAffiliate.code);
    const level3 = affiliates.filter(a => level2.some(l2 => l2.code === a.recruitedBy));
    return {
      level2,
      level3
    };
  }, [affiliates, activeAffiliate]);

  // --- RENDER COMPONENT ---
  return (
    <div className="space-y-6">
      
      {/* SECTION TOP TOGGLE VIEW MODE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-md font-black text-zinc-850 dark:text-white uppercase tracking-tight">
              {language === 'sw' ? 'Mfumo wa Affiliate & Tume' : 'Affiliate & Commission Engine'}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {language === 'sw' 
              ? 'Dhibiti washirika, simamia viwango vya tume ya MLM, fuatilia kubonyezwa kwa viungo, na fanya malipo ya pochi.' 
              : 'Manage partners, control multi-level commissions, track referral clicks, and disburse wallet payouts.'}
          </p>
        </div>

        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('admin')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all ${
              viewMode === 'admin' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {language === 'sw' ? 'Wasimamizi (ERP Panel)' : 'ERP Admin Control'}
          </button>
          <button
            onClick={() => setViewMode('portal')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all ${
              viewMode === 'portal' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {language === 'sw' ? 'Affiliate Dashboard' : 'Affiliate Portal'}
          </button>
        </div>
      </div>

      {/* =======================================================
          ADMIN VIEW PORTAL: ERP MANAGEMENT MODULE
          ======================================================= */}
      {viewMode === 'admin' && (
        <div className="space-y-6">
          
          {/* Sub-Tabs Selector */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 pt-2 gap-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: language === 'sw' ? 'Muhtasari' : 'Overview', icon: BarChart2 },
              { id: 'partners', label: language === 'sw' ? 'Mshirika wetu' : 'Affiliate Partners', icon: Users },
              { id: 'commissions', label: language === 'sw' ? 'Komisheni' : 'Commissions', icon: Coins },
              { id: 'clicks', label: language === 'sw' ? 'Traffic ya Viungo' : 'Clicks & Traffic', icon: Activity },
              { id: 'payouts', label: language === 'sw' ? 'Miamala ya Pochi' : 'Withdrawals & Wallet', icon: Wallet }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 px-1 ${
                  adminTab === tab.id 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stats Bento Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
                {[
                  { label: language === 'sw' ? 'Jumla ya Bonyeza' : 'Total Clicks', val: adminStats.clicks, icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
                  { label: language === 'sw' ? 'Wateja Pekee' : 'Unique Visitors', val: adminStats.visitors, icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
                  { label: language === 'sw' ? 'Mauzo Affiliate' : 'Attributed Sales', val: adminStats.orders, icon: Award, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20' },
                  { label: language === 'sw' ? 'Kiwango cha Kugeuza' : 'Conversion Rate', val: `${adminStats.conversion}%`, icon: CheckCircle2, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20' },
                  { label: language === 'sw' ? 'Komisheni Imelipwa' : 'Approved Commissions', val: displayMoney(adminStats.earnings), icon: Coins, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
                  { label: language === 'sw' ? 'Pending Payouts' : 'Outstanding Payouts', val: displayMoney(adminStats.pendingPayouts), icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' }
                ].map((st, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{st.label}</span>
                      <span className={`p-1.5 rounded-xl ${st.color}`}>
                        <st.icon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="text-md sm:text-lg font-black mt-3 text-zinc-800 dark:text-white leading-tight">{st.val}</span>
                  </div>
                ))}
              </div>

              {/* Native Custom SVG Visual Dashboard Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Chart 1: Monthly Commission Earnings Bar Chart */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest">
                      {language === 'sw' ? 'Grafu ya Malipo ya Tume' : 'Commission Payments Trend'}
                    </h4>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                      2026
                    </span>
                  </div>

                  <div className="h-44 w-full flex items-end justify-between px-2 pt-2 relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-0 top-0 border-t border-dashed border-zinc-100 dark:border-zinc-800/60 w-full" />
                    <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-zinc-100 dark:border-zinc-800/60 w-full" />
                    <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-zinc-100 dark:border-zinc-800/60 w-full" />

                    {[
                      { m: 'Jan', amt: 45000, h: 'h-1/5 bg-blue-500' },
                      { m: 'Feb', amt: 90000, h: 'h-2/5 bg-blue-500' },
                      { m: 'Mar', amt: 65000, h: 'h-1.5/5 bg-blue-500' },
                      { m: 'Apr', amt: 120000, h: 'h-3/5 bg-blue-500' },
                      { m: 'May', amt: 180000, h: 'h-4/5 bg-emerald-500' },
                      { m: 'Jun', amt: 220000, h: 'h-5/5 bg-emerald-500' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 group z-10">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white text-[9px] font-black py-0.5 px-1.5 rounded absolute -top-6">
                          {displayMoney(bar.amt)}
                        </span>
                        <div className={`w-6 sm:w-10 rounded-t-lg transition-all ${bar.h} hover:opacity-85 shadow-sm`} />
                        <span className="text-[9px] font-bold text-zinc-400 mt-2">{bar.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Referral Clicks Trends (Daily Line Chart in Native SVG) */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest">
                      {language === 'sw' ? 'Mwenendo wa Traffic ya Clicks' : 'Daily Link Clicks Traffic'}
                    </h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                      {language === 'sw' ? 'Siku 7 Zilizopita' : 'Last 7 Days'}
                    </span>
                  </div>

                  <div className="h-44 w-full relative">
                    <svg className="w-full h-36" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="400" y2="20" stroke="#f4f4f5" strokeDasharray="3" className="dark:stroke-zinc-800/40" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#f4f4f5" strokeDasharray="3" className="dark:stroke-zinc-800/40" />
                      <line x1="0" y1="80" x2="400" y2="80" stroke="#f4f4f5" strokeDasharray="3" className="dark:stroke-zinc-800/40" />

                      {/* Line Path */}
                      <path d="M 0 80 Q 66 50 133 90 T 266 20 T 400 60 L 400 100 L 0 100 Z" fill="url(#clickGradient)" />
                      <path d="M 0 80 Q 66 50 133 90 T 266 20 T 400 60" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                    </svg>
                    
                    <div className="flex justify-between text-[9px] font-bold text-zinc-400 mt-2 px-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Suspicious/Fraud Detection Alerts Module */}
              <div className="bg-rose-50/50 dark:bg-rose-950/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center gap-2 mb-3 text-rose-800 dark:text-rose-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {language === 'sw' ? 'Jopo la Kugundua Udanganyifu' : 'Fraud Detection and Auditing Center'}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-rose-100/50 dark:border-rose-950/20 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="flex justify-between items-center font-bold mb-1">
                        <span className="text-zinc-800 dark:text-white font-black">1. Self-Purchase Block</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-black">ACTIVE</span>
                      </div>
                      {language === 'sw' 
                        ? 'Zuia affiliates kununua bidhaa kupitia viungo vyao wenyewe. Mfumo unalinganisha namba ya simu au IP ya agizo kuzuia tume.' 
                        : 'Block affiliates from purchasing via their own link. System matches checkout phone, email, and IP with registered affiliate info.'}
                    </div>
                    <div className="bg-white dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-rose-100/50 dark:border-rose-950/20 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="flex justify-between items-center font-bold mb-1">
                        <span className="text-zinc-800 dark:text-white font-black">2. Duplicate Click Spikes</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-black">ACTIVE</span>
                      </div>
                      {language === 'sw' 
                        ? 'Kichujio huzuia mbofyo wa haraka mfululizo kutoka kwa IP moja ndani ya dakika 1 ili kuzuia spamming au bots.'
                        : 'Our active filter discards rapid clicks from a single IP within a 1-minute window to ignore spamming and bot clicks.'}
                    </div>
                  </div>

                  {/* Anti-Fraud Audit Log */}
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-950/20 text-xs space-y-3">
                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 block uppercase tracking-wider">
                      {language === 'sw' ? 'Magogo ya Shughuli ya Kutiliwa Shaka' : 'Suspicious Activity Logs'}
                    </span>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      <div className="p-2 bg-rose-50/20 dark:bg-zinc-950/40 rounded-xl flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-white">IP Spike Filter Triggered</p>
                          <p className="text-[10px] text-zinc-500">JD1001 duplicate clicks filtered (Dar es Salaam - Chrome)</p>
                        </div>
                      </div>
                      <div className="p-2 bg-rose-50/20 dark:bg-zinc-950/40 rounded-xl flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-zinc-800 dark:text-white">Self-Purchase Warning Raised</p>
                          <p className="text-[10px] text-zinc-500">Halima Machano (HM2002) checked out with phone match</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AFFILIATES LIST */}
          {adminTab === 'partners' && (
            <div className="space-y-4">
              
              {/* Filter Controls & Add partner Button */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={language === 'sw' ? 'Tafuta washirika wetu...' : 'Search affiliate partners...'}
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => exportToCSV('partners')}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-black rounded-2xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => setIsRegModalOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'sw' ? 'Sajili Mshirika' : 'Add Partner'}
                  </button>
                </div>
              </div>

              {/* Partners Table Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150 dark:border-zinc-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-4">{language === 'sw' ? 'Jina & Msimbo' : 'Name & Code'}</th>
                        <th className="p-4">{language === 'sw' ? 'Mawasiliano' : 'Contact'}</th>
                        <th className="p-4">Ngazi</th>
                        <th className="p-4">{language === 'sw' ? 'Komisheni' : 'Commission Rate'}</th>
                        <th className="p-4">{language === 'sw' ? 'Balance ya Pochi' : 'Wallet Balance'}</th>
                        <th className="p-4">{language === 'sw' ? 'Pending' : 'Pending Wallet'}</th>
                        <th className="p-4">{language === 'sw' ? 'Kazi' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-bold text-zinc-700 dark:text-zinc-300">
                      {filteredPartners.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-zinc-400">
                            {language === 'sw' ? 'Hakuna washirika waliopatikana.' : 'No affiliate partners found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredPartners.map(partner => (
                          <tr key={partner.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-black">
                                  {partner.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block text-zinc-900 dark:text-white font-black">{partner.name}</span>
                                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono">
                                    {partner.code}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="block">{partner.email}</span>
                              <span className="block text-[10px] text-zinc-400">{partner.phone}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 rounded-lg text-[10px]">
                                Level {partner.level}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="block text-zinc-900 dark:text-white">{partner.commissionType}</span>
                              <span className="block text-[10px] text-zinc-400">
                                {partner.commissionType === 'Percentage' ? `${partner.commissionValue}%` : displayMoney(partner.commissionValue)}
                              </span>
                            </td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-black">
                              {displayMoney(partner.walletBalance)}
                            </td>
                            <td className="p-4 text-amber-500 font-black">
                              {displayMoney(partner.walletPending)}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setPortalAffiliateCode(partner.code);
                                  setViewMode('portal');
                                }}
                                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white rounded-lg text-[11px] font-black transition"
                                title={language === 'sw' ? 'Fungua Portal Simulator ya Mshirika Huyu' : 'Switch simulator to this partner'}
                              >
                                {language === 'sw' ? 'Dashboard Portal' : 'Login Portal'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: COMMISSION REGISTER AND MANAGEMENT */}
          {adminTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={language === 'sw' ? 'Tafuta kwa namba ya agizo au mshirika...' : 'Search by order number or affiliate...'}
                    value={commSearch}
                    onChange={(e) => setCommSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  onClick={() => exportToCSV('commissions')}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-black rounded-2xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  {language === 'sw' ? 'Pakua CSV' : 'Export CSV'}
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150 dark:border-zinc-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-4">{language === 'sw' ? 'Namba ya Agizo' : 'Order No'}</th>
                        <th className="p-4">{language === 'sw' ? 'Kiasi cha Mauzo' : 'Order Amount'}</th>
                        <th className="p-4">Affiliate</th>
                        <th className="p-4">Ngazi ya MLM</th>
                        <th className="p-4">{language === 'sw' ? 'Kiwango' : 'Rate'}</th>
                        <th className="p-4">{language === 'sw' ? 'Tume Iliyopatikana' : 'Commission Earned'}</th>
                        <th className="p-4">Hali</th>
                        <th className="p-4">{language === 'sw' ? 'Kazi' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-bold text-zinc-700 dark:text-zinc-300">
                      {filteredCommissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-zinc-400">
                            {language === 'sw' ? 'Hakuna rekodi za tume zilizopatikana.' : 'No commission records found.'}
                          </td>
                        </tr>
                      ) : (
                        filteredCommissions.map(comm => (
                          <tr key={comm.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                            <td className="p-4 whitespace-nowrap text-zinc-900 dark:text-white font-mono font-bold">
                              {comm.orderNo}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              {displayMoney(comm.orderAmount)}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">
                                {comm.affiliateCode}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded text-[10px]">
                                Level {comm.level}
                              </span>
                            </td>
                            <td className="p-4">
                              {comm.commissionRate}
                            </td>
                            <td className="p-4 text-emerald-600 dark:text-emerald-400 font-black whitespace-nowrap">
                              + {displayMoney(comm.amountEarned)}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                comm.status === 'Approved' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : comm.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}>
                                {comm.status}
                              </span>
                            </td>
                            <td className="p-4 flex gap-1 whitespace-nowrap">
                              {comm.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveCommission(comm.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded transition"
                                    title={language === 'sw' ? 'Idhinisha Tume' : 'Approve Commission'}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectCommission(comm.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded transition"
                                    title={language === 'sw' ? 'Kataa Tume' : 'Reject Commission'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {comm.status !== 'Pending' && (
                                <span className="text-zinc-400 text-[10px]">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: TRAFFIC AND CLICK LOGS */}
          {adminTab === 'clicks' && (
            <div className="space-y-4">
              
              <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">
                    <Activity className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-xs font-extrabold text-zinc-800 dark:text-white">
                    {language === 'sw' ? 'Automatic Tracking Engine: Active' : 'Automatic Web Tracking Engine: Active'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {clicks.length} {language === 'sw' ? 'mbofyo umehifadhiwa' : 'clicks captured'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder={language === 'sw' ? 'Tafuta msimbo, IP au mkoa...' : 'Search affiliate, IP or city...'}
                  value={clickSearch}
                  onChange={(e) => setClickSearch(e.target.value)}
                  className="w-full sm:max-w-md px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150 dark:border-zinc-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-4">Affiliate</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">{language === 'sw' ? 'Kifaa & Kivinjari' : 'Device & Browser'}</th>
                        <th className="p-4">{language === 'sw' ? 'Mkoa/Sehemu' : 'Location'}</th>
                        <th className="p-4">Kampeni</th>
                        <th className="p-4">{language === 'sw' ? 'Muda' : 'Timestamp'}</th>
                        <th className="p-4">Filters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {filteredClicks.map(clk => (
                        <tr key={clk.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 ${clk.isBot || clk.isDuplicate ? 'bg-rose-50/20 dark:bg-rose-950/5' : ''}`}>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-sans font-black text-zinc-900 dark:text-white block">
                              {clk.affiliateCode}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">{clk.ip}</td>
                          <td className="p-4 font-sans whitespace-nowrap">
                            <span className="block font-bold">{clk.device}</span>
                            <span className="block text-[10px] text-zinc-400">{clk.browser}</span>
                          </td>
                          <td className="p-4 font-sans whitespace-nowrap">{clk.location}</td>
                          <td className="p-4 font-sans whitespace-nowrap">
                            {clk.campaign ? (
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded text-[10px]">
                                {clk.campaign}
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-sans text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 font-sans whitespace-nowrap">
                            {new Date(clk.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {clk.isBot && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-black uppercase tracking-wider">
                                BOT BLOCKED
                              </span>
                            )}
                            {clk.isDuplicate && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black uppercase tracking-wider">
                                DUPLICATE IGNORED
                              </span>
                            )}
                            {!clk.isBot && !clk.isDuplicate && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-black uppercase tracking-wider">
                                TRACKED OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: WITHDRAWAL REQUESTS & PAYOUTS WALLET */}
          {adminTab === 'payouts' && (
            <div className="space-y-6">
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest mb-4">
                  {language === 'sw' ? 'Udhibiti wa Pesa za Washirika' : 'Affiliate Wallet & Payout Operations'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                  {language === 'sw' 
                    ? 'Washirika wanapoomba malipo kutoka kwenye pochi zao, maombi yao yanaingia hapa. Unaweza kuidhinisha au kukataa malipo. Baada ya kubonyeza "Lipa", salio lao kuu litakatwa na kuongezwa kwenye sifa ya "Imelipwa".'
                    : 'When partners request withdrawals from their earned balance, their requests appear below. Once paid, their wallet balance is decremented.'}
                </p>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                          <th className="p-4">Affiliate</th>
                          <th className="p-4">{language === 'sw' ? 'Kiasi cha Malipo' : 'Payout Amount'}</th>
                          <th className="p-4">{language === 'sw' ? 'Njia ya Payout' : 'Method'}</th>
                          <th className="p-4">{language === 'sw' ? 'Maelezo ya Akaunti' : 'Account Details'}</th>
                          <th className="p-4">Hali</th>
                          <th className="p-4">{language === 'sw' ? 'Muda' : 'Requested Date'}</th>
                          <th className="p-4">{language === 'sw' ? 'Kazi' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-bold text-zinc-700 dark:text-zinc-300">
                        {withdrawals.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-400">
                              {language === 'sw' ? 'Hakuna maombi ya kutoa fedha.' : 'No withdrawal requests found.'}
                            </td>
                          </tr>
                        ) : (
                          withdrawals.map(wth => (
                            <tr key={wth.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                              <td className="p-4 whitespace-nowrap">
                                <span className="font-mono font-black">{wth.affiliateCode}</span>
                              </td>
                              <td className="p-4 whitespace-nowrap text-rose-600 dark:text-rose-400 font-black">
                                {displayMoney(wth.amount)}
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {wth.paymentMethod === 'Mobile Money' ? <Smartphone className="w-4 h-4 text-emerald-500" /> : <Landmark className="w-4 h-4 text-blue-500" />}
                                  <span>{wth.paymentMethod}</span>
                                </div>
                              </td>
                              <td className="p-4 text-zinc-600 dark:text-zinc-400">
                                {wth.paymentDetails}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  wth.status === 'Paid' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                    : wth.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                                }`}>
                                  {wth.status}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap font-mono">{wth.date}</td>
                              <td className="p-4 whitespace-nowrap">
                                {wth.status === 'Pending' ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleProcessPayout(wth.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black text-[11px] transition"
                                    >
                                      {language === 'sw' ? 'Lipa' : 'Approve & Pay'}
                                    </button>
                                    <button
                                      onClick={() => handleRejectPayout(wth.id)}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-black text-[11px] transition"
                                    >
                                      {language === 'sw' ? 'Kataa' : 'Reject'}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 text-xs italic font-sans font-normal">
                                    {wth.receiptNumber ? `${language === 'sw' ? 'Risiti' : 'Receipt'}: ${wth.receiptNumber}` : '-'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* =======================================================
          PORTAL VIEW PORTAL: AFFILIATE PORTAL & SIMULATOR
          ======================================================= */}
      {viewMode === 'portal' && (
        <div className="space-y-6">
          
          {/* SIMULATOR SWITCH BAR */}
          <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2 items-center text-amber-850 dark:text-amber-200">
              <RefreshCw className="w-5 h-5 shrink-0 animate-spin-slow" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  {language === 'sw' ? 'Simulizi ya Akaunti ya Mshirika' : 'Affiliate Portal Switcher (Simulator)'}
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  {language === 'sw' ? 'Chagua akaunti hapa chini ili kuona sifa mbalimbali kama affiliate mshiriki.' : 'Choose which affiliate account experience to preview.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {affiliates.map(aff => (
                <button
                  key={aff.id}
                  onClick={() => setPortalAffiliateCode(aff.code)}
                  className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition ${
                    portalAffiliateCode === aff.code 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {aff.name} ({aff.code})
                </button>
              ))}
            </div>
          </div>

          {/* PORTAL NAVIGATION TAB */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800/80 pt-2 gap-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'dashboard', label: language === 'sw' ? 'Jopo langu' : 'My Dashboard', icon: BarChart2 },
              { id: 'links', label: language === 'sw' ? 'Tengeneza Viungo & QR' : 'Get Links & QR', icon: Share2 },
              { id: 'wallet', label: language === 'sw' ? 'Pochi Yangu' : 'My Pochi Wallet', icon: Wallet },
              { id: 'team', label: language === 'sw' ? 'Timu Yangu (MLM)' : 'My Recruits (Downline)', icon: Users }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPortalTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 px-1 ${
                  portalTab === tab.id 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* PORTAL TAB 1: DASHBOARD */}
          {portalTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Partner Card Detail */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                      {activeAffiliate.name.substring(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">
                        {activeAffiliate.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold">
                        {activeAffiliate.email} | {activeAffiliate.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">{language === 'sw' ? 'Aina ya Tume' : 'Commission Type'}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg font-black uppercase mt-1">
                    {activeAffiliate.commissionType} ({activeAffiliate.commissionValue}
                    {activeAffiliate.commissionType === 'Percentage' ? '%' : ' TZS'})
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: language === 'sw' ? 'Jumla ya Clicks' : 'Total Clicks', val: partnerStats.clicks, icon: Activity },
                  { label: language === 'sw' ? 'Wageni Pekee' : 'Unique Visitors', val: partnerStats.visitors, icon: Users },
                  { label: language === 'sw' ? 'Mauzo Direct' : 'Direct Sales', val: partnerStats.directSales, icon: Award },
                  { label: language === 'sw' ? 'Kiwango cha Kugeuza' : 'My Conversion', val: `${partnerStats.conversion}%`, icon: CheckCircle2 },
                  { label: language === 'sw' ? 'Tume niliyojipatia' : 'Total Commission', val: displayMoney(partnerStats.totalComm), icon: Coins }
                ].map((st, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{st.label}</span>
                      <span className="p-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400">
                        <st.icon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <span className="text-md sm:text-lg font-black mt-3 text-zinc-800 dark:text-white leading-tight">{st.val}</span>
                  </div>
                ))}
              </div>

              {/* WALLET METRICS BENTO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 flex flex-col justify-between h-40">
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block mb-1">
                      {language === 'sw' ? 'SALIO LA KUTOA (Withdrawable)' : 'WITHDRAWABLE WALLET BALANCE'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 font-sans mt-2">
                      {displayMoney(activeAffiliate.walletBalance)}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setPortalTab('wallet')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center justify-center gap-1"
                  >
                    <Wallet className="w-4 h-4" />
                    {language === 'sw' ? 'Kutoa Salio (Request Payout)' : 'Disburse Out Now'}
                  </button>
                </div>

                <div className="bg-amber-50/30 dark:bg-amber-950/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex flex-col justify-between h-40">
                  <div>
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest block mb-1">
                      {language === 'sw' ? 'TUME INAYOSUBIRI (Pending)' : 'PENDING OUTSTANDING COMMISSIONS'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 font-sans mt-2">
                      {displayMoney(activeAffiliate.walletPending)}
                    </h2>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    {language === 'sw' ? 'Inasubiri ukaguzi wa mwisho wa malipo na wasimamizi.' : 'Awaiting final order payment clearance by shop owner.'}
                  </p>
                </div>

                <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 flex flex-col justify-between h-40">
                  <div>
                    <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                      {language === 'sw' ? 'JUMLA KUU ILIYOLIPWA' : 'TOTAL EARNINGS DISBURSED'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-200 font-sans mt-2">
                      {displayMoney(activeAffiliate.walletPaid)}
                    </h2>
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {language === 'sw' ? 'Imekamilika kwa uaminifu 100%' : '100% payout fulfillment guaranteed'}
                  </div>
                </div>

              </div>

              {/* SIMULATOR QUICK REVENUE GENERATION */}
              <div className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800">
                <h4 className="text-xs font-black uppercase tracking-widest mb-3 text-zinc-500 dark:text-zinc-400">
                  {language === 'sw' ? 'Mchezo wa Kupata Clicks (Simulator Helper)' : 'Generate Simulator Traffic'}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                  {language === 'sw' 
                    ? 'Bofya vitufe vilivyo chini ili kuiga wateja wakibofya viungo vyako tofauti vya referral. Mfumo utakusanya na kukufanyia hesabu ya tume punde wakikamilisha agizo lao duka.'
                    : 'Click any buttons below to simulate customers browsing the site through your referral links. This allows you to inspect traffic metrics.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => simulateClick(activeAffiliate.code, 'store')}
                    className="px-3 py-2.5 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    Store referral
                  </button>
                  <button
                    onClick={() => {
                      if (products.length > 0) {
                        simulateClick(activeAffiliate.code, 'product', products[0].id);
                      } else {
                        alert('No products inside catalog yet!');
                      }
                    }}
                    className="px-3 py-2.5 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Award className="w-4 h-4 text-emerald-500" />
                    Product referral
                  </button>
                  <button
                    onClick={() => simulateClick(activeAffiliate.code, 'category', 'Electronics')}
                    className="px-3 py-2.5 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    Category referral
                  </button>
                  <button
                    onClick={() => simulateClick(activeAffiliate.code, 'campaign', 'summer-sale')}
                    className="px-3 py-2.5 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300 transition"
                  >
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Campaign referral
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PORTAL TAB 2: LINK BUILDER & QR GENERATION */}
          {portalTab === 'links' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Link builder inputs */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6">
                <div>
                  <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest mb-1">
                    {language === 'sw' ? 'Tengeneza Kiungo chako Maalum' : 'Interactive Link Customizer'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === 'sw' 
                      ? 'Tengeneza viungo maalum kwa ajili ya bidhaa, vikundi vya bidhaa, au kampeni za matangazo ya msimu.' 
                      : 'Generate permanent links targeting precise items, store shelves, or seasonal marketing campaigns.'}
                  </p>
                </div>

                <div className="space-y-4">
                  
                  {/* Select Product */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? '1. Unganisha na Bidhaa Moja kwa Moja' : 'Link with Specific Product'}
                    </label>
                    <select
                      value={builderProdId}
                      onChange={(e) => setBuilderProdId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- {language === 'sw' ? 'Chagua Bidhaa' : 'Select Product'} --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({displayMoney(p.sellingPrice)})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? '2. Unganisha na Jamii ya Bidhaa' : 'Link with Category Shelf'}
                    </label>
                    <select
                      value={builderCatName}
                      onChange={(e) => setBuilderCatName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">-- {language === 'sw' ? 'Chagua Jamii' : 'Select Category'} --</option>
                      {Array.from(new Set(products.map(p => p.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Campaign tag */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? '3. Ongeza Jina la Kampeni (Campaign)' : 'Attach Campaign Source Tag'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. summer-sale, instagram-bio, whatsapp-status"
                      value={builderCampaign}
                      onChange={(e) => setBuilderCampaign(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                </div>
              </div>

              {/* Dynamic results outputs, QR code download */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest mb-1">
                    {language === 'sw' ? 'Sifa ya Kiungo chako & QR' : 'Your Ready Referral URL & QR Code'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === 'sw' ? 'Copy kiungo chako na ukisambaze. Pia unaweza kupakua picha ya QR Code.' : 'Share these links or download their unique QR codes to print for offline marketing.'}
                  </p>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center py-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl">
                  {/* Standard, reliable QR Code API generation */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180&data=${encodeURIComponent(currentReferralUrls.store)}`}
                    alt="Affiliate QR Code"
                    className="w-32 h-32 bg-white p-2 rounded-xl border border-zinc-200"
                  />
                  <span className="text-[10px] font-mono text-zinc-500 font-bold mt-2 bg-white dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg">
                    {activeAffiliate.code}
                  </span>
                </div>

                {/* Copied alert or Link Outputs */}
                <div className="space-y-2">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex justify-between items-center text-xs">
                    <span className="truncate max-w-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
                      {currentReferralUrls.store}
                    </span>
                    <button
                      onClick={() => handleCopyLink(currentReferralUrls.store, 'store')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[11px] font-black hover:bg-blue-700 transition shrink-0 ml-2"
                    >
                      {copiedLinkType === 'store' ? 'Copied! ✓' : 'Copy Link'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PORTAL TAB 3: POCHI WALLET AND WITHDRAWAL ACTIONS */}
          {portalTab === 'wallet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Request Payout Form */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6">
                <div>
                  <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest mb-1">
                    {language === 'sw' ? 'Omba Kutoa Pesa' : 'Request Earnings Disbursal'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === 'sw' 
                      ? 'Salio lolote linalozidi Sh 10,000 linaweza kutolewa moja kwa moja kupitia njia ya simu au benki.'
                      : 'Any amount exceeding Sh 10,000 can be processed to your mobile wallet or bank.'}
                  </p>
                </div>

                {withdrawalMessage && (
                  <div className={`p-3 rounded-2xl text-xs font-black ${
                    withdrawalMessage.includes('✓') 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {withdrawalMessage}
                  </div>
                )}

                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  
                  {/* Amount Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? 'Kiasi (TZS)' : 'Withdrawal Amount (TZS)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={payoutAmount || ''}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Payment Method Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? 'Njia ya Payout' : 'Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('Mobile Money')}
                        className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                          payoutMethod === 'Mobile Money'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        Mobile Money
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('Bank Transfer' as any)}
                        className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
                          payoutMethod === 'Bank Transfer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <Landmark className="w-4 h-4" />
                        Bank Account
                      </button>
                    </div>
                  </div>

                  {/* Payment Details Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {language === 'sw' ? 'Namba au Akaunti ya Malipo' : 'Account details / Recipient info'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={payoutMethod === 'Mobile Money' ? 'e.g. 0712345678 (Tigo Pesa)' : 'e.g. CRDB Bank - Account 0153...'}
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-sm transition"
                  >
                    {language === 'sw' ? 'Tuma Ombi la Kutoa Salio' : 'Request Wallet Withdrawal Now'}
                  </button>

                </form>
              </div>

              {/* Earnings & Transactions logs list */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-6">
                <div>
                  <h4 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest mb-1">
                    {language === 'sw' ? 'Historia yangu ya Pochi' : 'My Wallet Transaction Logs'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === 'sw' ? 'Kumbukumbu kamili ya tume ulizozipata na malipo uliyochukua.' : 'Your historically accumulated earnings and withdrawals.'}
                  </p>
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {withdrawals.filter(w => w.affiliateCode === activeAffiliate.code).map(wth => (
                    <div key={wth.id} className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <span className="block font-black text-zinc-800 dark:text-white">
                          {language === 'sw' ? 'Kutoa Fedha (Payout)' : 'Payout Withdrawal'}
                        </span>
                        <span className="block text-[10px] text-zinc-400">
                          {wth.paymentMethod} | {wth.date}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-rose-600 dark:text-rose-400">
                          - {displayMoney(wth.amount)}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          wth.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-850'
                        }`}>
                          {wth.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PORTAL TAB 4: TIMU YANGU - MULTI LEVEL RECRUITS TREE */}
          {portalTab === 'team' && (
            <div className="space-y-6">
              
              {/* Explanation Banner */}
              <div className="bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex gap-3.5">
                <Award className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <h4 className="font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                    {language === 'sw' ? 'Mfumo wa Timu za Ushirika (Multi-Level MLM)' : 'Multi-Level Downline Downward Tree'}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                    {language === 'sw' 
                      ? 'Usajili wako unafaidika kwa asilimia za uuzaji wa washirika uliowasajili! Timu yako ikiuza bidhaa duka unajipatia: Ngazi 2 (5% ya uuzaji) na Ngazi 3 (2% ya uuzaji) ya kiasi chote kiotomatiki.'
                      : 'You earn commissions when your downline team members generate sales! Level 2 recruits award you 5%, and Level 3 recruits award you 2%.'}
                  </p>
                </div>
              </div>

              {/* MLM Recruits Tree Visual cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Level 2 Downline */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-400">
                      {language === 'sw' ? 'Wasaidizi wangu (Ngazi 2)' : 'Direct Recruits (Level 2)'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black">
                      5% commission
                    </span>
                  </div>

                  <div className="space-y-2">
                    {downlineTree.level2.length === 0 ? (
                      <p className="text-center py-6 text-zinc-400 text-xs">
                        {language === 'sw' ? 'Bado haujasajili mshirika yeyote.' : 'No direct recruits at this level yet.'}
                      </p>
                    ) : (
                      downlineTree.level2.map(rec => (
                        <div key={rec.id} className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-blue-100 text-blue-800 rounded font-black text-[10px]">
                              {rec.code}
                            </span>
                            <span className="font-black text-zinc-800 dark:text-white">{rec.name}</span>
                          </div>
                          <span className="text-zinc-400 text-[10px]">Joined: {rec.dateRegistered}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Level 3 Downline */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs font-black uppercase text-zinc-450 dark:text-zinc-400">
                      {language === 'sw' ? 'Wasaidizi wadogo (Ngazi 3)' : 'Sub-Recruits (Level 3)'}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-black">
                      2% commission
                    </span>
                  </div>

                  <div className="space-y-2">
                    {downlineTree.level3.length === 0 ? (
                      <p className="text-center py-6 text-zinc-400 text-xs">
                        {language === 'sw' ? 'Hakuna wasaidizi wadogo bado.' : 'No sub-recruits at this level yet.'}
                      </p>
                    ) : (
                      downlineTree.level3.map(rec => (
                        <div key={rec.id} className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-purple-100 text-purple-800 rounded font-black text-[10px]">
                              {rec.code}
                            </span>
                            <span className="font-black text-zinc-800 dark:text-white">{rec.name}</span>
                          </div>
                          <span className="text-zinc-400 text-[10px]">Sponsor: {rec.recruitedBy}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* =======================================================
          REGISTER PARTNER MODAL
          ======================================================= */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="reg-affiliate-modal">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150 dark:border-zinc-800 shadow-xl max-w-md w-full p-6 space-y-6">
            
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-black text-zinc-850 dark:text-white uppercase tracking-tight">
                {language === 'sw' ? 'Sajili Mshirika Mpya' : 'Add New Affiliate Partner'}
              </h3>
              <button 
                onClick={() => setIsRegModalOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAffiliate} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Jina Kamili' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Custom Affiliate Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Msimbo Maalum (Affiliate Code)' : 'Affiliate Code (Unique)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JD1001, SALIM99"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Commission Structure Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    {language === 'sw' ? 'Aina ya Tume' : 'Commission Type'}
                  </label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Tiered">Tiered MLM</option>
                    <option value="Product-Based">Product-Based</option>
                    <option value="Category-Based">Category-Based</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    {language === 'sw' ? 'Kiwango' : 'Commission Value'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={regVal || ''}
                    onChange={(e) => setRegVal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sponsor (For Multi-level Referral Link calculation) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {language === 'sw' ? 'Msimbo wa Sponsor (Mlezi MLM)' : 'Sponsor Recruiter Code (MLM)'}
                </label>
                <select
                  value={regSponsor}
                  onChange={(e) => setRegSponsor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-800 dark:text-white focus:outline-none"
                >
                  <option value="">-- {language === 'sw' ? 'Hakuna (Level 1)' : 'None (Starts at Level 1)'} --</option>
                  {affiliates.map(a => (
                    <option key={a.id} value={a.code}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-sm transition mt-2"
              >
                {language === 'sw' ? 'Sajili sasa' : 'Save Partner Details'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
