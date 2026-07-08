import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Product, Sale, Expense, Customer } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Layers, 
  DollarSign, 
  ArrowRight, 
  Grid, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Edit2,
  Trash2
} from 'lucide-react';

interface ReportsProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  formatMoney: (amount: number) => string;
  onUpdateSale?: (sale: Sale) => void;
  onDeleteSale?: (id: string) => void;
}

type ReportType = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'yearly' 
  | 'pandl' 
  | 'sales' 
  | 'expenses' 
  | 'inventory' 
  | 'bestselling';

export default function Reports({ products, sales, expenses, customers, formatMoney, onUpdateSale, onDeleteSale }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('daily');
  const [selectedCashier, setSelectedCashier] = useState<string>('all');

  // Sorting State for Reports
  const [salesSortKey, setSalesSortKey] = useState<'datetime' | 'invoice' | 'amount' | 'profit'>('datetime');
  const [salesSortOrder, setSalesSortOrder] = useState<'asc' | 'desc'>('desc');

  const [expensesSortKey, setExpensesSortKey] = useState<'datetime' | 'amount' | 'category'>('datetime');
  const [expensesSortOrder, setExpensesSortOrder] = useState<'asc' | 'desc'>('desc');

  // Editing a sale state
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCashierName, setEditCashierName] = useState('');
  const [editCustomerId, setEditCustomerId] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Credit'>('Cash');
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [editProfit, setEditProfit] = useState<number>(0);
  const [editInvoiceNote, setEditInvoiceNote] = useState('');

  const handleOpenEditSaleModal = (sale: Sale) => {
    setEditingSale(sale);
    setEditDate(sale.date);
    setEditTime(sale.time || '12:00:00');
    setEditCashierName(sale.cashierName);
    setEditCustomerId(sale.customerId || '');
    setEditPaymentMethod(sale.paymentMethod);
    setEditTotalAmount(sale.totalAmount);
    setEditProfit(sale.profit);
    setEditInvoiceNote(sale.note || '');
    setIsEditModalOpen(true);
  };

  const handleSaveUpdatedSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale || !onUpdateSale) return;

    const matchedCustomer = customers.find(c => c.id === editCustomerId);
    const updatedSale: Sale = {
      ...editingSale,
      date: editDate,
      time: editTime,
      cashierName: editCashierName,
      customerId: editCustomerId || undefined,
      customerName: matchedCustomer ? matchedCustomer.name : undefined,
      paymentMethod: editPaymentMethod,
      totalAmount: Number(editTotalAmount),
      profit: Number(editProfit),
      note: editInvoiceNote
    };

    onUpdateSale(updatedSale);
    setIsEditModalOpen(false);
    setEditingSale(null);
  };

  const handleDeleteSaleItem = (saleId: string) => {
    if (!onDeleteSale) return;
    const confirmDelete = window.confirm("Je, una uhakika unataka kufuta kabisa mauzo haya?\nKitendo hiki kitarudisha idadi ya bidhaa stoo (restock) na kurekebisha deni la mteja.");
    if (confirmDelete) {
      onDeleteSale(saleId);
    }
  };

  // Time filters
  const todayStr = new Date().toISOString().split('T')[0];
  
  const getDaysAgoDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  const startOfWeek = getDaysAgoDate(7);
  const startOfMonth = getDaysAgoDate(30);
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  // Helper filters
  const filterSales = (type: ReportType) => {
    if (type === 'daily') return sales.filter(s => s.date === todayStr);
    if (type === 'weekly') return sales.filter(s => new Date(s.date) >= startOfWeek);
    if (type === 'monthly') return sales.filter(s => new Date(s.date) >= startOfMonth);
    if (type === 'yearly') return sales.filter(s => new Date(s.date) >= startOfYear);
    return sales;
  };

  const filterExpenses = (type: ReportType) => {
    if (type === 'daily') return expenses.filter(e => e.date === todayStr);
    if (type === 'weekly') return expenses.filter(e => new Date(e.date) >= startOfWeek);
    if (type === 'monthly') return expenses.filter(e => new Date(e.date) >= startOfMonth);
    if (type === 'yearly') return expenses.filter(e => new Date(e.date) >= startOfYear);
    return expenses;
  };

  const rawSales = filterSales(activeReport);
  const currentSales = selectedCashier === 'all' 
    ? rawSales 
    : rawSales.filter(s => s.cashierName === selectedCashier);

  const currentExpenses = filterExpenses(activeReport);

  // Sorting computation for reports
  const sortedSales = [...currentSales].sort((a, b) => {
    if (salesSortKey === 'datetime') {
      const aDateTime = `${a.date}T${a.time || '12:00:00'}`;
      const bDateTime = `${b.date}T${b.time || '12:00:00'}`;
      return salesSortOrder === 'desc' 
        ? bDateTime.localeCompare(aDateTime)
        : aDateTime.localeCompare(bDateTime);
    }
    if (salesSortKey === 'invoice') {
      return salesSortOrder === 'desc'
        ? b.invoiceNo.localeCompare(a.invoiceNo)
        : a.invoiceNo.localeCompare(b.invoiceNo);
    }
    if (salesSortKey === 'amount') {
      return salesSortOrder === 'desc'
        ? b.totalAmount - a.totalAmount
        : a.totalAmount - b.totalAmount;
    }
    if (salesSortKey === 'profit') {
      return salesSortOrder === 'desc'
        ? b.profit - a.profit
        : a.profit - b.profit;
    }
    return 0;
  });

  const sortedExpenses = [...currentExpenses].sort((a, b) => {
    if (expensesSortKey === 'datetime') {
      return expensesSortOrder === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    }
    if (expensesSortKey === 'amount') {
      return expensesSortOrder === 'desc'
        ? b.amount - a.amount
        : a.amount - b.amount;
    }
    if (expensesSortKey === 'category') {
      return expensesSortOrder === 'desc'
        ? b.category.localeCompare(a.category)
        : a.category.localeCompare(b.category);
    }
    return 0;
  });

  // Extract unique cashier names for filtering
  const uniqueCashiers = Array.from(new Set(sales.map(s => s.cashierName).filter(Boolean)));

  // Math totals
  const totalSales = currentSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = currentSales.reduce((sum, s) => sum + s.profit, 0);
  const netEarnings = totalProfit - totalExpenses;

  // Best sellers calculations
  const productQuantities: Record<string, { id: string; name: string; category: string; quantity: number; revenue: number }> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productQuantities[item.productId]) {
        productQuantities[item.productId] = {
          id: item.productId,
          name: item.name,
          category: '',
          quantity: 0,
          revenue: 0
        };
      }
      productQuantities[item.productId].quantity += item.quantity;
      productQuantities[item.productId].revenue += item.quantity * item.sellingPrice * (1 - item.discountPercent / 100);
    });
  });

  const bestSellingList = Object.values(productQuantities)
    .sort((a, b) => b.quantity - a.quantity);

  // Export to CSV helper
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `Ripoti-${activeReport}-${todayStr}.csv`;

    if (activeReport === 'inventory') {
      headers = ['ID', 'Jina', 'Kundi', 'Barcode', 'Gharama ya Kununua', 'Bei ya Kuuza', 'Stoki', 'Kiwango cha chini'];
      rows = products.map(p => [
        p.id, p.name, p.category, p.barcode, String(p.buyingPrice), String(p.sellingPrice), String(p.quantity), String(p.minStock)
      ]);
    } else if (activeReport === 'expenses') {
      headers = ['ID', 'Kundi', 'Tarehe', 'Kiasi (TZS)', 'Maelezo'];
      rows = sortedExpenses.map(e => [
        e.id, e.category, e.date, String(e.amount), e.description
      ]);
    } else if (activeReport === 'sales' || activeReport === 'daily' || activeReport === 'weekly' || activeReport === 'monthly' || activeReport === 'yearly') {
      headers = ['ID', 'Invoice No', 'Tarehe', 'Muda', 'Njia ya Malipo', 'Kiasi', 'Faida Ghafi', 'Cashier'];
      rows = sortedSales.map(s => [
        s.id, s.invoiceNo, s.date, s.time || '12:00:00', s.paymentMethod, String(s.totalAmount), String(s.profit), s.cashierName
      ]);
    } else if (activeReport === 'bestselling') {
      headers = ['ID', 'Jina la Bidhaa', 'Idadi ya Mauzo', 'Jumla ya Mapato'];
      rows = bestSellingList.map(b => [
        b.id, b.name, String(b.quantity), String(b.revenue)
      ]);
    } else if (activeReport === 'pandl') {
      headers = ['Kipengele', 'Kiasi (TZS)'];
      rows = [
        ['Jumla ya Mauzo', String(totalSales)],
        ['Gharama ya Bidhaa (COGS)', String(totalSales - totalProfit)],
        ['Faida Ghafi (Gross Profit)', String(totalProfit)],
        ['Jumla ya Matumizi', String(totalExpenses)],
        ['Faida Safi (Net Profit/Loss)', String(netEarnings)]
      ];
    }

    // construct csv content properly
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString('sw-TZ', { year: 'numeric', month: 'long', day: 'numeric' });
      const reportTitle = menuItems.find(m => m.id === activeReport)?.label || 'Ripoti';

      // Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text("SMART POS SYSTEM", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246); // blue-500
      doc.text(`RIPOTI: ${reportTitle.toUpperCase()}`, 14, 27);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Tarehe ya Ripoti: ${today}`, 14, 33);
      doc.text(`Kichujio cha Cashier: ${selectedCashier === 'all' ? 'Wafanyakazi Wote' : selectedCashier}`, 14, 38);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);

      // Summary Section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text("MUHTASARI WA KIPINDI (SUMMARY)", 14, 49);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Jumla ya Mauzo (Total Sales):`, 14, 55);
      doc.setFont('Helvetica', 'bold');
      doc.text(formatMoney(totalSales), 85, 55);

      doc.setFont('Helvetica', 'normal');
      doc.text(`Jumla ya Matumizi (Total Expenses):`, 14, 61);
      doc.setFont('Helvetica', 'bold');
      doc.text(formatMoney(totalExpenses), 85, 61);

      doc.setFont('Helvetica', 'normal');
      doc.text(`Mapato Safi (Net Surplus/Profit):`, 14, 67);
      doc.setFont('Helvetica', 'bold');
      if (netEarnings >= 0) {
        doc.setTextColor(16, 185, 129); // emerald-500
      } else {
        doc.setTextColor(239, 68, 68); // red-500
      }
      doc.text(formatMoney(netEarnings), 85, 67);

      doc.setTextColor(30, 41, 59);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 72, 196, 72);

      // Table Content
      let y = 80;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text("MCHANGANUO WA TAARIFA (DETAILED LIST)", 14, y);
      y += 6;

      let headers: string[] = [];
      let rows: string[][] = [];

      if (activeReport === 'inventory') {
        headers = ['Jina la Bidhaa', 'Kundi', 'Barcode', 'Bei ya Kuuza', 'Stoki'];
        rows = products.map(p => [
          p.name, p.category, p.barcode || '-', formatMoney(p.sellingPrice), String(p.quantity)
        ]);
      } else if (activeReport === 'expenses') {
        headers = ['Kundi la Matumizi', 'Tarehe', 'Kiasi (TZS)', 'Maelezo'];
        rows = sortedExpenses.map(e => [
          e.category, e.date, formatMoney(e.amount), e.description || '-'
        ]);
      } else if (activeReport === 'sales' || activeReport === 'daily' || activeReport === 'weekly' || activeReport === 'monthly' || activeReport === 'yearly') {
        headers = ['Invoice No', 'Tarehe', 'Njia ya Malipo', 'Kiasi (TZS)', 'Faida Ghafi', 'Cashier'];
        rows = sortedSales.map(s => [
          s.invoiceNo, `${s.date} ${s.time || ''}`, s.paymentMethod, formatMoney(s.totalAmount), formatMoney(s.profit), s.cashierName || '-'
        ]);
      } else if (activeReport === 'bestselling') {
        headers = ['Jina la Bidhaa', 'Idadi ya Mauzo', 'Jumla ya Mapato (TZS)'];
        rows = bestSellingList.map(b => [
          b.name, `${b.quantity} Pcs`, formatMoney(b.revenue)
        ]);
      } else if (activeReport === 'pandl') {
        headers = ['Kipengele / Hesabu', 'Kiasi cha Sasa (TZS)'];
        rows = [
          ['Jumla ya Mauzo', formatMoney(totalSales)],
          ['Gharama ya Bidhaa (COGS)', formatMoney(totalSales - totalProfit)],
          ['Faida Ghafi (Gross Profit)', formatMoney(totalProfit)],
          ['Jumla ya Matumizi', formatMoney(totalExpenses)],
          ['Faida Safi (Net Profit/Loss)', formatMoney(netEarnings)]
        ];
      }

      // Draw simple table headers
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setFillColor(241, 245, 249); // light slate gray
      doc.rect(14, y, 182, 6, 'F');
      doc.setTextColor(71, 85, 105);

      const colWidths = activeReport === 'inventory' ? [55, 30, 35, 35, 25]
                     : activeReport === 'expenses' ? [45, 35, 40, 60]
                     : activeReport === 'bestselling' ? [80, 40, 60]
                     : activeReport === 'pandl' ? [100, 80]
                     : [25, 32, 22, 32, 32, 35]; // sales related

      let xOffset = 15;
      headers.forEach((header, idx) => {
        doc.text(header, xOffset, y + 4.5);
        xOffset += colWidths[idx] || 30;
      });

      y += 6;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      rows.forEach((row) => {
        // Check page break
        if (y > 270) {
          doc.addPage();
          y = 20;
          // Re-draw headers on new page
          doc.setFont('Helvetica', 'bold');
          doc.setFillColor(241, 245, 249);
          doc.rect(14, y, 182, 6, 'F');
          doc.setTextColor(71, 85, 105);
          let xOff = 15;
          headers.forEach((header, idx) => {
            doc.text(header, xOff, y + 4.5);
            xOff += colWidths[idx] || 30;
          });
          y += 6;
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
        }

        let xOff = 15;
        row.forEach((cell, idx) => {
          let text = String(cell);
          const maxLen = idx === 0 && activeReport === 'bestselling' ? 45 
                        : idx === 0 && activeReport === 'inventory' ? 32
                        : idx === 3 && activeReport === 'expenses' ? 40
                        : 30;
          if (text.length > maxLen) {
            text = text.substring(0, maxLen - 3) + '...';
          }
          doc.text(text, xOff, y + 4.5);
          xOff += colWidths[idx] || 30;
        });

        // draw thin line
        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 6, 196, y + 6);
        y += 6;
      });

      // footer
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Imetolewa kiotomatiki na mfumo wa duka Smart POS - Tarehe: ${new Date().toLocaleString('sw-TZ')}`, 14, 287);

      doc.save(`Ripoti-${activeReport}-${todayStr}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
      alert("Kulikuwa na hitilafu wakati wa kutengeneza PDF. Tafadhali jaribu tena.");
    }
  };

  const menuItems: { id: ReportType; label: string; desc: string }[] = [
    { id: 'daily', label: 'Ripoti ya Leo (Daily)', desc: 'Mauzo na matumizi ya siku ya leo' },
    { id: 'weekly', label: 'Ripoti ya Wiki (Weekly)', desc: 'Miezi/mwelekeo wa siku 7 zilizopita' },
    { id: 'monthly', label: 'Ripoti ya Mwezi (Monthly)', desc: 'Takwimu za mauzo baada ya siku 30' },
    { id: 'yearly', label: 'Ripoti ya Mwaka (Yearly)', desc: 'Kila mwaka tangu duka lifunguliwe' },
    { id: 'pandl', label: 'Statement ya P&L', desc: 'Changanuzi rasmi ya hesabu za mwezi' },
    { id: 'sales', label: 'Ripoti ya Mauzo (Sales)', desc: 'Orodha ya invoices zote zilizolipwa' },
    { id: 'expenses', label: 'Ripoti ya Matumizi (Expenses)', desc: 'Gharama zote zilizolipwa' },
    { id: 'inventory', label: 'Ripoti ya Stoki (Inventory)', desc: 'Viwango vya bidhaa zilizopo' },
    { id: 'bestselling', label: 'Bidhaa Zinazopendwa', desc: 'Orodha ya bidhaa maarufu duka hili' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Mfumo wa Kutoa Ripoti (Reports Module)</h4>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Kagua, kisha pakua taarifa kwa muundo wa PDF, Excel na CSV</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Interactive menu */}
        <div className="space-y-2 bg-white dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-2 mb-2 block">Chagua Ripoti</span>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveReport(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col justify-center border ${
                activeReport === item.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                  : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="font-semibold text-xs">{item.label}</span>
              <span className={`text-[10px] mt-0.5 ${activeReport === item.id ? 'text-blue-100' : 'text-zinc-400'}`}>{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Right: Dynamic report tables */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h5 className="font-black text-lg text-zinc-900 dark:text-white flex items-center gap-2 capitalize">
                <FileText className="w-5 h-5 text-blue-500" />
                {menuItems.find(m => m.id === activeReport)?.label}
              </h5>
              <p className="text-xs text-zinc-400 mt-1">
                Taarifa hizi ni za wakati halisi. Hakuna ukomo katika kiwango au idadi ya kumbukumbu.
              </p>
            </div>

            {/* Cashier filter dropdown & Export buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Show cashier filter for sales-related reports */}
              {['daily', 'weekly', 'monthly', 'yearly', 'sales', 'pandl', 'bestselling'].includes(activeReport) && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase whitespace-nowrap hidden sm:inline">Mchuja Muuzaji:</span>
                  <select
                    value={selectedCashier}
                    onChange={(e) => setSelectedCashier(e.target.value)}
                    className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Wafanyakazi Wote</option>
                    {uniqueCashiers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={exportToCSV}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Excel/CSV
              </button>
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Pakua PDF
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/80 rounded-xl transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Chapa (Print)
              </button>
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Mauzo kwenye Ripoti</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white mt-1 block">{formatMoney(totalSales)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Matumizi kwenye Ripoti</span>
              <span className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1 block">{formatMoney(totalExpenses)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Mapato Safi (Net Surplus)</span>
              <span className={`text-lg font-bold mt-1 block ${netEarnings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {netEarnings >= 0 ? '+' : ''}{formatMoney(netEarnings)}
              </span>
            </div>
          </div>

          {/* Sorting controls bar */}
          {(['daily', 'weekly', 'monthly', 'yearly', 'sales', 'expenses'].includes(activeReport)) && (
            <div className="flex flex-wrap items-center gap-3.5 bg-zinc-50 dark:bg-zinc-950/20 px-4 py-3 rounded-xl border border-zinc-100/60 dark:border-zinc-805 text-xs">
              <span className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kupanga Orodha (Sort Settings):</span>
              
              {activeReport !== 'expenses' ? (
                <>
                  {/* Sales Sort settings */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Panga Kwa:</span>
                    <select
                      value={salesSortKey}
                      onChange={(e) => setSalesSortKey(e.target.value as any)}
                      className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 p-0 text-xs focus:ring-0 cursor-pointer focus:outline-hidden"
                    >
                      <option value="datetime" className="dark:bg-zinc-900">Muda na Saa (Timestamp)</option>
                      <option value="invoice" className="dark:bg-zinc-900">Namba ya Invoice</option>
                      <option value="amount" className="dark:bg-zinc-900">Kiasi cha Mauzo</option>
                      <option value="profit" className="dark:bg-zinc-900">Faida Ghafi</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Mwelekeo:</span>
                    <select
                      value={salesSortOrder}
                      onChange={(e) => setSalesSortOrder(e.target.value as any)}
                      className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 p-0 text-xs focus:ring-0 cursor-pointer focus:outline-hidden"
                    >
                      <option value="desc" className="dark:bg-zinc-900">Mpya Kwanza (Newest)</option>
                      <option value="asc" className="dark:bg-zinc-900">Zamani Kwanza (Oldest)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Expenses Sort settings */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Panga Kwa:</span>
                    <select
                      value={expensesSortKey}
                      onChange={(e) => setExpensesSortKey(e.target.value as any)}
                      className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 p-0 text-xs focus:ring-0 cursor-pointer focus:outline-hidden"
                    >
                      <option value="datetime" className="dark:bg-zinc-900">Tarehe ya Matumizi</option>
                      <option value="amount" className="dark:bg-zinc-900">Kiasi cha Matumizi</option>
                      <option value="category" className="dark:bg-zinc-900">Kundi la Matumizi</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Mwelekeo:</span>
                    <select
                      value={expensesSortOrder}
                      onChange={(e) => setExpensesSortOrder(e.target.value as any)}
                      className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 p-0 text-xs focus:ring-0 cursor-pointer focus:outline-hidden"
                    >
                      <option value="desc" className="dark:bg-zinc-900">Gharama Mpya (Newest)</option>
                      <option value="asc" className="dark:bg-zinc-900">Gharama za Zamani</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Table container */}
          <div className="overflow-x-auto">
            {activeReport === 'inventory' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400">
                    <th className="p-3">Jina la Bidhaa</th>
                    <th className="p-3">Kundi</th>
                    <th className="p-3">Gharama ya Hifadhi</th>
                    <th className="p-3">Bei ya Rejareja</th>
                    <th className="p-3 text-center">Idadi iliyopo</th>
                    <th className="p-3 text-right">Thamani ya Mauzo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-zinc-800 dark:text-white">{p.name}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 font-mono">{formatMoney(p.buyingPrice)}</td>
                      <td className="p-3 font-mono font-bold">{formatMoney(p.sellingPrice)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${p.quantity <= p.minStock ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-zinc-100'}`}>
                          {p.quantity} Pcs
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 font-mono">{formatMoney(p.quantity * p.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeReport === 'bestselling' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400">
                    <th className="p-3">Nafasi</th>
                    <th className="p-3">Bidhaa</th>
                    <th className="p-3 text-center">Idadi iliyouzwa</th>
                    <th className="p-3 text-right">Mapato ya Jumla</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {bestSellingList.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-zinc-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-zinc-800 dark:text-white">{item.name}</td>
                      <td className="p-3 text-center font-bold text-zinc-700 dark:text-zinc-300">{item.quantity} bidhaa</td>
                      <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400 font-mono">{formatMoney(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeReport === 'pandl' ? (
              <div className="space-y-4 max-w-lg mx-auto py-4">
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="flex justify-between p-4 bg-zinc-50/50 dark:bg-zinc-800/10">
                    <span className="font-bold text-zinc-800 dark:text-white">KIPENGELE CHA TAARIFA (STATEMENT)</span>
                    <span className="font-bold">KIASI (TZS)</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span>Mauzo Yote yaliyokusanywa (Sales revenue)</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-white">{formatMoney(totalSales)}</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span>Cost of Goods Sold (COGS)</span>
                    <span className="font-mono text-zinc-500">-{formatMoney(totalSales - totalProfit)}</span>
                  </div>
                  <div className="flex justify-between p-4 font-bold bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-400">
                    <span>Faida Ghafi (Gross Profit / Sales - COGS)</span>
                    <span className="font-mono">{formatMoney(totalProfit)}</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span>Matumizi ya Biashara (Total Expenses)</span>
                    <span className="font-mono text-rose-500">-{formatMoney(totalExpenses)}</span>
                  </div>
                  <div className={`flex justify-between p-4 font-black text-sm ${netEarnings >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    <span>(=) NET INCOME / SURPLUS (Faida / Hasara Kuu)</span>
                    <span className="font-mono">{formatMoney(netEarnings)}</span>
                  </div>
                </div>
              </div>
            ) : activeReport === 'expenses' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400">
                    <th className="p-3">Tarehe</th>
                    <th className="p-3">Kundi</th>
                    <th className="p-3">Maelezo ya Matumizi</th>
                    <th className="p-3 text-right">Kiasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sortedExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="p-3 font-mono text-zinc-500">{e.date}</td>
                      <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{e.category}</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-400">{e.description}</td>
                      <td className="p-3 text-right font-bold text-zinc-900 dark:text-white font-mono">{formatMoney(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* sales, daily, weekly, monthly, yearly reports tables */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400">
                    <th className="p-3">Namba ya Invoice</th>
                    <th className="p-3">Tarehe</th>
                    <th className="p-3">Njia ya Malipo</th>
                    <th className="p-3">Muuzaji</th>
                    <th className="p-3">Faida Ghafi</th>
                    <th className="p-3 font-black">Mauzo (TZS)</th>
                    <th className="p-3 text-center">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sortedSales.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/5">
                      <td className="p-3 font-bold">{s.invoiceNo}</td>
                      <td className="p-3 font-mono text-zinc-500 text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">{s.date}</span>
                          <span className="text-[10px] text-zinc-400 font-semibold">{s.time || '12:00:00'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 font-semibold">{s.paymentMethod}</span>
                      </td>
                      <td className="p-3">{s.cashierName}</td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{formatMoney(s.profit)}</td>
                      <td className="p-3 font-bold text-zinc-900 dark:text-white font-mono">{formatMoney(s.totalAmount)}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          {onUpdateSale && (
                            <button
                              onClick={() => handleOpenEditSaleModal(s)}
                              className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-md transition"
                              title="Hariri Mauzo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteSale && (
                            <button
                              onClick={() => handleDeleteSaleItem(s.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition"
                              title="Futa Mauzo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal ya kuhariri Mauzo */}
      {isEditModalOpen && editingSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl p-6 relative">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Hariri Taarifa za Mauzo
            </h3>
            <form onSubmit={handleSaveUpdatedSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Namba ya Risiti (Invoice No)</label>
                <input
                  type="text"
                  value={editingSale.invoiceNo}
                  disabled
                  className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg text-zinc-500 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Tarehe (Date)</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Muda (Time)</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Muuzaji (Cashier)</label>
                <input
                  type="text"
                  value={editCashierName}
                  onChange={(e) => setEditCashierName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Njia ya Malipo</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash / Pesa Taslimu</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank">Bank / Kadi</option>
                    <option value="Credit">Credit / Deni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Mteja (Customer)</label>
                  <select
                    value={editCustomerId}
                    onChange={(e) => setEditCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Mteja wa Kawaida</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Jumla Kuu (Total TZS)</label>
                  <input
                    type="number"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Faida ya Mauzo (Profit TZS)</label>
                  <input
                    type="number"
                    value={editProfit}
                    onChange={(e) => setEditProfit(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Memo / Maelezo mafupi</label>
                <input
                  type="text"
                  value={editInvoiceNote}
                  onChange={(e) => setEditInvoiceNote(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSale(null);
                  }}
                  className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-xs rounded-xl transition"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Hifadhi Mabadiliko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
