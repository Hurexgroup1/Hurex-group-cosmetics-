import React, { useState, useEffect, useRef } from 'react';
import { Product, Customer, CartItem, Sale, SaleItem } from '../types';
import { useLanguage } from '../lib/i18n';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Check, 
  Printer, 
  History, 
  CreditCard, 
  Briefcase, 
  Info,
  Calendar,
  Download,
  Camera,
  Edit2,
  ArrowDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import BarcodeScannerModal from './BarcodeScannerModal';

interface POSProps {
  products: Product[];
  customers: Customer[];
  activeUserId: string;
  activeUserName: string;
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onUpdateSale?: (sale: Sale) => void;
  onDeleteSale?: (id: string) => void;
  formatMoney: (amount: number) => string;
  salesHistory: Sale[];
  receiptBusinessName?: string;
  receiptAddress?: string;
  receiptContact?: string;
  receiptFooter?: string;
  defaultTaxRate?: number;
}

export default function POS({ 
  products, 
  customers, 
  activeUserId, 
  activeUserName, 
  onAddSale, 
  onUpdateSale, 
  onDeleteSale, 
  formatMoney, 
  salesHistory,
  receiptBusinessName: propReceiptBusinessName,
  receiptAddress: propReceiptAddress,
  receiptContact: propReceiptContact,
  receiptFooter: propReceiptFooter,
  defaultTaxRate: propDefaultTaxRate
}: POSProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank' | 'Mobile Money' | 'Credit'>('Cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(propDefaultTaxRate !== undefined ? propDefaultTaxRate : 18);
  const [invoiceNote, setInvoiceNote] = useState('');
  
  // Completed receipt modal state
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Receipt customization states (persisted in localStorage)
  const [receiptBusinessName, setReceiptBusinessName] = useState(() => localStorage.getItem('receipt_business_name') || 'HUREX GROUP OF COMPANIES LTD');
  const [receiptAddress, setReceiptAddress] = useState(() => localStorage.getItem('receipt_address') || 'Mlimani City, Dar es Salaam, Tanzania');
  const [receiptContact, setReceiptContact] = useState(() => localStorage.getItem('receipt_contact') || 'Simu: +255 712 345 678 | Email: hurexgroup88@gmail.com');
  const [receiptFooter, setReceiptFooter] = useState(() => localStorage.getItem('receipt_footer') || 'KARIBU TENA - HUREX GROUP');

  // Synchronize with centrally managed parent state
  useEffect(() => {
    if (propReceiptBusinessName) {
      setReceiptBusinessName(propReceiptBusinessName);
    }
  }, [propReceiptBusinessName]);

  useEffect(() => {
    if (propReceiptAddress) {
      setReceiptAddress(propReceiptAddress);
    }
  }, [propReceiptAddress]);

  useEffect(() => {
    if (propReceiptContact) {
      setReceiptContact(propReceiptContact);
    }
  }, [propReceiptContact]);

  useEffect(() => {
    if (propReceiptFooter) {
      setReceiptFooter(propReceiptFooter);
    }
  }, [propReceiptFooter]);

  useEffect(() => {
    if (propDefaultTaxRate !== undefined) {
      setTaxRate(propDefaultTaxRate);
    }
  }, [propDefaultTaxRate]);

  // Receipt in-place editing state (temporary mode in receipt modal)
  const [isEditingReceiptInfo, setIsEditingReceiptInfo] = useState(false);
  const [tempBusinessName, setTempBusinessName] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [tempContact, setTempContact] = useState('');
  const [tempFooter, setTempFooter] = useState('');
  const [tempInvoiceNo, setTempInvoiceNo] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [tempCustomerName, setTempCustomerName] = useState('');
  const [tempPaymentMethod, setTempPaymentMethod] = useState('');
  const [tempCashierName, setTempCashierName] = useState('');
  const [tempNote, setTempNote] = useState('');

  // Sorting State for POS Sales History
  const [salesSortKey, setSalesSortKey] = useState<'datetime' | 'invoice' | 'amount'>('datetime');
  const [salesSortOrder, setSalesSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedSalesHistory = [...salesHistory].sort((a, b) => {
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
    return 0;
  });

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

  // Dynamic generate unique invoice number
  const [invoiceNo, setInvoiceNo] = useState('');

  const generateInvoiceNo = () => {
    const date = new Date();
    const yearMonth = date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0');
    const randomSec = String(date.getSeconds()).padStart(2, '0') + String(Math.floor(100 + Math.random() * 900));
    return `TRA-${yearMonth}-${randomSec}`;
  };

  useEffect(() => {
    setInvoiceNo(generateInvoiceNo());
  }, [salesHistory]);

  // Filtering products for listing
  const posProducts = products.filter(p => {
    return p.quantity > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Cart operations
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (!product.isUnlimited && existing.quantity >= product.quantity) {
        alert(
          language === 'sw'
            ? `Onyo: Hakuna stoki ya kutosha kwa bidhaa "${product.name}". Stoki iliyopo ni ${product.quantity}.`
            : `Warning: Not enough stock for product "${product.name}". Available stock is ${product.quantity}.`
        );
        return;
      }
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, discountPercent: 0 }]);
    }
  };

  const handleBarcodeScanSuccess = (barcode: string) => {
    if (!barcode || barcode.trim() === '') return;
    const cleanBarcode = barcode.trim().toLowerCase();
    const matchedProduct = products.find(p => p.barcode && p.barcode.trim().toLowerCase() === cleanBarcode);
    if (matchedProduct) {
      if (!matchedProduct.isUnlimited && matchedProduct.quantity <= 0) {
        alert(
          language === 'sw'
            ? `Bidhaa "${matchedProduct.name}" imepatikana lakini haina stoki kwa sasa.`
            : `Product "${matchedProduct.name}" was found but is out of stock.`
        );
      } else {
        addToCart(matchedProduct);
      }
    } else {
      alert(
        language === 'sw'
          ? `Barcode "${barcode}" haijatambuliwa kwenye mfumo wa bidhaa. Hakikisha bidhaa imesajiliwa na barcode hii.`
          : `Barcode "${barcode}" not recognized. Please make sure the product is registered with this barcode.`
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, newQty: number, maxQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const matchedProduct = products.find(p => p.id === productId);
    if (matchedProduct && !matchedProduct.isUnlimited && newQty > maxQty) {
      alert(
        language === 'sw'
          ? `Stoki haitoshi. Idadi ya juu iliyopo ni ${maxQty}.`
          : `Insufficient stock. Maximum available quantity is ${maxQty}.`
      );
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const updateCartItemDiscount = (productId: string, val: number) => {
    if (val < 0 || val > 100) return;
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, discountPercent: val }
        : item
    ));
  };

  // Calculations
  const calculatedSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.product.sellingPrice * (1 - item.discountPercent / 100);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const finalSubtotal = Math.max(0, calculatedSubtotal - discountAmount);
  const calculatedTax = Math.round(finalSubtotal * (taxRate / 100));
  const finalTotal = finalSubtotal + calculatedTax;

  const totalBuyingCost = cart.reduce((sum, item) => {
    return sum + (item.product.buyingPrice * item.quantity);
  }, 0);

  const finalProfit = Math.max(0, finalSubtotal - totalBuyingCost);

  // Perform transaction
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert(
        language === 'sw'
          ? 'Tafadhali ongeza bidhaa kwenye kikapu kwanza.'
          : 'Please add products to the cart first.'
      );
      return;
    }

    const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

    const salePayload: Omit<Sale, 'id'> = {
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        buyingPrice: item.product.buyingPrice,
        sellingPrice: item.product.sellingPrice,
        discountPercent: item.discountPercent
      })),
      discountAmount,
      taxRate,
      taxAmount: calculatedTax,
      totalAmount: finalTotal,
      profit: finalProfit,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomerObj?.name || undefined,
      cashierId: activeUserId,
      cashierName: activeUserName,
      note: invoiceNote
    };

    // Save
    onAddSale(salePayload);

    // Prepare complete state for printing before resetting
    const completedObj: Sale = {
      id: 'temp-' + Date.now(),
      ...salePayload
    };
    setCompletedSale(completedObj);
    setIsReceiptOpen(true);

    // Reset parameters
    setCart([]);
    setSelectedCustomerId('');
    setDiscountAmount(0);
    setInvoiceNote('');
    setPaymentMethod('Cash');
    setInvoiceNo(generateInvoiceNo());
  };

  const downloadPDFReceipt = (sale: Sale) => {
    try {
      // Dynamic height to resemble a real continuous roll thermal receipt
      const receiptWidth = 80; // mm
      const baseHeight = 110; // mm
      const itemHeight = sale.items.length * 7; // mm per item
      const receiptHeight = Math.max(130, baseHeight + itemHeight);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [receiptWidth, receiptHeight]
      });

      // Typography
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text(receiptBusinessName, 40, 10, { align: "center" });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(receiptAddress, 40, 14, { align: "center" });
      doc.text(receiptContact, 40, 18, { align: "center" });

      doc.setDrawColor(200, 200, 200);
      doc.line(5, 22, 75, 22);

      // Meta info
      doc.setTextColor(30, 30, 30);
      doc.setFont("Helvetica", "bold");
      doc.text(language === 'sw' ? `RISITI NO: ${sale.invoiceNo}` : `RECEIPT NO: ${sale.invoiceNo}`, 5, 27);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.text(language === 'sw' ? `Tarehe/Muda: ${sale.date} ${sale.time || '12:00:00'}` : `Date/Time: ${sale.date} ${sale.time || '12:00:00'}`, 5, 32);
      
      const paymentMethodName = sale.paymentMethod === 'Cash' 
        ? (language === 'sw' ? 'Taslimu (Cash)' : 'Cash') 
        : sale.paymentMethod === 'Bank' 
        ? (language === 'sw' ? 'Benki / Kadi (Bank)' : 'Bank / Card') 
        : sale.paymentMethod === 'Mobile Money' 
        ? (language === 'sw' ? 'Mtandao (Mobile)' : 'Mobile Money') 
        : (language === 'sw' ? 'Deni (Credit)' : 'Credit');
        
      doc.text(language === 'sw' ? `Njia ya Malipo: ${paymentMethodName}` : `Payment Method: ${paymentMethodName}`, 5, 36);
      doc.text(language === 'sw' ? `Mteja: ${sale.customerName || 'Mteja wa Kawaida'}` : `Customer: ${sale.customerName || 'Regular Customer'}`, 5, 40);
      doc.text(language === 'sw' ? `Muuzaji (Cashier): ${sale.cashierName}` : `Cashier: ${sale.cashierName}`, 5, 44);

      doc.line(5, 48, 75, 48);

      // Headers
      doc.setFont("Helvetica", "bold");
      doc.text(language === 'sw' ? "Bidhaa" : "Product", 5, 52);
      doc.text("Qty", 40, 52, { align: "right" });
      doc.text(language === 'sw' ? "Bei" : "Price", 56, 52, { align: "right" });
      doc.text(language === 'sw' ? "Jumla" : "Total", 75, 52, { align: "right" });

      doc.line(5, 54, 75, 54);

      // Items loop
      doc.setFont("Helvetica", "normal");
      let y = 58;
      sale.items.forEach((item) => {
        // Truncate name to avoid overlaps
        let nameToPrint = item.name;
        if (nameToPrint.length > 20) {
          nameToPrint = nameToPrint.substring(0, 18) + "...";
        }
        
        doc.text(nameToPrint, 5, y);
        doc.text(String(item.quantity), 40, y, { align: "right" });
        doc.text(formatMoney(item.sellingPrice).replace(/TZS|Tsh/i, '').trim(), 56, y, { align: "right" });

        const itemNetPrice = item.sellingPrice * (1 - item.discountPercent / 100);
        doc.text(formatMoney(itemNetPrice * item.quantity).replace(/TZS|Tsh/i, '').trim(), 75, y, { align: "right" });
        y += 5;
      });

      doc.line(5, y - 1, 75, y - 1);

      // Summary totals
      doc.setFontSize(7.5);
      doc.text(language === 'sw' ? "Nusu-Jumla:" : "Subtotal:", 45, y + 4, { align: "right" });
      doc.text(formatMoney(sale.totalAmount - sale.taxAmount), 75, y + 4, { align: "right" });

      let offset = 4;
      if (sale.discountAmount > 0) {
        offset += 4;
        doc.text(language === 'sw' ? "Punguzo:" : "Discount:", 45, y + offset, { align: "right" });
        doc.text(`- ${formatMoney(sale.discountAmount)}`, 75, y + offset, { align: "right" });
      }

      offset += 4;
      doc.text(`VAT (${sale.taxRate}%):`, 45, y + offset, { align: "right" });
      doc.text(formatMoney(sale.taxAmount), 75, y + offset, { align: "right" });

      offset += 5;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text(language === 'sw' ? "JUMLA KUU:" : "GRAND TOTAL:", 45, y + offset, { align: "right" });
      doc.text(formatMoney(sale.totalAmount), 75, y + offset, { align: "right" });

      doc.line(5, y + offset + 3, 75, y + offset + 3);

      // Message notes
      const finalY = y + offset + 8;
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      doc.text(language === 'sw' ? "Asante kwa kufanya biashara nasi!" : "Thank you for doing business with us!", 40, finalY, { align: "center" });
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7);
      doc.text(receiptFooter, 40, finalY + 4, { align: "center" });

      doc.save(`Risiti_Hurex_${sale.invoiceNo}.pdf`);
    } catch (err) {
      console.error("Failed to generate receipt PDF:", err);
      alert(
        language === 'sw'
          ? "Kulikuwa na tatizo la kuandaa PDF. Tafadhali tumia kitufe cha 'Chapisha Risiti' kufanya nakala."
          : "There was an error generating the PDF. Please use the 'Print' button to make a physical print."
      );
    }
  };

  const printReceiptLayout = () => {
    window.print();
  };

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
    const confirmDelete = window.confirm(
      language === 'sw'
        ? "Je, una uhakika unataka kufuta kabisa mauzo haya?\nKitendo hiki kitarudisha idadi ya bidhaa stoo (restock) na kurekebisha deni la mteja."
        : "Are you sure you want to permanently delete this sale?\nThis action will return the items to stock (restock) and update the customer's debt."
    );
    if (confirmDelete) {
      onDeleteSale(saleId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher POS and History */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(false)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${!showHistory ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {language === 'sw' ? 'POS-Duka la Mauzo' : 'POS-Point of Sale'}
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${showHistory ? 'bg-blue-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <History className="w-4 h-4" />
            {language === 'sw' ? 'Kumbukumbu na Stakabadhi' : 'Sales History & Receipts'} {salesHistory.length > 0 && `(${salesHistory.length})`}
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {language === 'sw' ? 'Muuzaji Active:' : 'Active Cashier:'} <strong className="text-zinc-800 dark:text-zinc-200">{activeUserName} ({activeUserId === 'u1' ? 'Admin' : (language === 'sw' ? 'Muuzaji' : 'Cashier')})</strong>
        </div>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="pos-grid">
          {/* Left: Product selector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder={language === 'sw' ? "Tafuta kwa Jina au changanua Barcode..." : "Search by Name or scan Barcode..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
                title={language === 'sw' ? "Changanua Barcode kwa Kamera" : "Scan Barcode with Camera"}
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'sw' ? "Kamera Scan" : "Camera Scan"}</span>
              </button>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {posProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                  {language === 'sw' ? 'Hakuna bidhaa inayouzika/yenye stoki hivi sasa.' : 'No sellable or in-stock products available right now.'}
                </div>
              ) : (
                posProducts.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-left cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10 transition-all flex flex-col justify-between h-36"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-wider">{p.category}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${p.quantity <= p.minStock ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {language === 'sw' ? 'Stoki:' : 'Stock:'} {p.quantity}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-white mt-1.5 line-clamp-2 h-8">{p.name}</h4>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-50 dark:border-zinc-800/60 mt-1">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{formatMoney(p.sellingPrice)}</span>
                      <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Cart and calculations */}
          <div id="cart-section" className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h5 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                {language === 'sw' ? 'Hesabu la Kikapu' : 'Cart Calculation'}
              </h5>
              <span className="text-xs font-bold text-zinc-500 font-mono">{invoiceNo}</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs text-balance">
                  {language === 'sw' ? 'Kikapu kiko tupu. Gonga bidhaa kushoto kuiongeza kwenye kikapu.' : 'The cart is empty. Click on a product on the left to add it.'}
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100/50 dark:border-zinc-800/40">
                    <div className="flex-1 min-w-0">
                      <h6 className="text-xs font-bold text-zinc-800 dark:text-white truncate">{item.product.name}</h6>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{formatMoney(item.product.sellingPrice)}/pcs</span>
                        {/* Custom item discount */}
                        <div className="flex items-center gap-0.5 text-[10px]">
                          <span className="text-zinc-400">{language === 'sw' ? 'Punguzo:' : 'Discount:'}</span>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent}
                            onChange={(e) => updateCartItemDiscount(item.product.id, Number(e.target.value))}
                            className="w-8 border-0 bg-zinc-100 dark:bg-zinc-700/80 rounded px-1 text-center font-bold text-zinc-700 dark:text-zinc-300 py-0.5 text-[9px]"
                          />
                          <span className="text-zinc-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1, item.product.quantity)}
                        className="p-1 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-zinc-800 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1, item.product.quantity)}
                        className="p-1 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 rounded transition ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Selector & Payment form */}
            <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Mteja (Customer)' : 'Customer'}</label>
                  <select 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white text-xs"
                  >
                    <option value="">{language === 'sw' ? '-- Mteja wa Kawaida --' : '-- Regular Customer --'}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Inalipiwa kwa (Payment)' : 'Payment Method'}</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white text-xs font-semibold"
                  >
                    <option value="Cash">{language === 'sw' ? 'Cash / Pesa Taslimu' : 'Cash'}</option>
                    <option value="Mobile Money">{language === 'sw' ? 'Mobile Money (M-Pesa, HaloPesa, nk)' : 'Mobile Money'}</option>
                    <option value="Bank">{language === 'sw' ? 'Bank / Kadi' : 'Bank / Card'}</option>
                    <option value="Credit">{language === 'sw' ? 'Credit / Deni (Mteja atalipa baadae)' : 'Credit / Unpaid Debt'}</option>
                  </select>
                </div>
              </div>

              {/* Extras: overall Discount & VAT */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Punguzo la Jumla (Overall Disc Sh)' : 'Overall Discount (TZS)'}</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="TZS 0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'VAT ya Serikali (%)' : 'Government VAT (%)'}</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Maelezo mafupi / Memo ya risiti' : 'Receipt Memo / Notes'}</label>
                <input 
                  type="text"
                  placeholder={language === 'sw' ? "Mf: Shukrani kwa kukomboa bidhaa" : "e.g., Thank you for your purchase"}
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white text-xs"
                />
              </div>

              {/* Calculations Block */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-2 mt-4 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>{language === 'sw' ? 'Nusu-Jumla (Subtotal after individual desc):' : 'Subtotal (after item discounts):'}</span>
                  <span className="font-semibold">{formatMoney(calculatedSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>{language === 'sw' ? 'Punguzo la Jumla:' : 'Overall Discount:'}</span>
                    <span>- {formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>VAT ({taxRate}%):</span>
                  <span className="font-semibold">{formatMoney(calculatedTax)}</span>
                </div>
                <div className="flex justify-between text-zinc-900 dark:text-white text-sm font-extrabold pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                  <span>{language === 'sw' ? 'Jumla Kuu (Grand Total):' : 'Grand Total:'}</span>
                  <span className="text-lg text-blue-600 dark:text-blue-400">{formatMoney(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-1.5 ${cart.length === 0 ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-98'}`}
                id="btn-kamilisha-mauzo"
              >
                <Check className="w-5 h-5" />
                {paymentMethod === 'Credit' 
                  ? (language === 'sw' ? 'Kamilisha Deni / Credit' : 'Complete Credit / Debt') 
                  : (language === 'sw' ? 'Kamilisha Malipo na Risiti' : 'Complete Payment & Print Receipt')}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Sales History view ledger */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h5 className="font-bold text-zinc-900 dark:text-white">{language === 'sw' ? 'Kumbukumbu Yote ya Mauzo' : 'All Sales History'}</h5>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{language === 'sw' ? 'Orodha na risiti za mauzo yote yaliyosajiliwa' : 'List and receipts of all registered sales in the system'}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs w-full xl:w-auto xl:justify-end">
              {/* Pangilia kwa (Sort by) */}
              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase">{language === 'sw' ? 'Pangilia:' : 'Sort by:'}</span>
                <select
                  value={salesSortKey}
                  onChange={(e) => setSalesSortKey(e.target.value as any)}
                  className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 focus:ring-0 p-0 text-xs cursor-pointer focus:outline-hidden"
                >
                  <option value="datetime" className="dark:bg-zinc-900">{language === 'sw' ? 'Muda na Saa (Timestamp)' : 'Date & Time'}</option>
                  <option value="invoice" className="dark:bg-zinc-900">{language === 'sw' ? 'Namba ya Risiti' : 'Receipt Number'}</option>
                  <option value="amount" className="dark:bg-zinc-900">{language === 'sw' ? 'Kiasi cha Mauzo' : 'Sales Amount'}</option>
                </select>
              </div>

              {/* Mwelekeo (Order) */}
              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/40 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase">{language === 'sw' ? 'Mwelekeo:' : 'Order:'}</span>
                <select
                  value={salesSortOrder}
                  onChange={(e) => setSalesSortOrder(e.target.value as any)}
                  className="bg-transparent border-0 font-bold text-zinc-700 dark:text-zinc-300 focus:ring-0 p-0 text-xs cursor-pointer focus:outline-hidden"
                >
                  <option value="desc" className="dark:bg-zinc-900">{language === 'sw' ? 'Mpya Kwanza (Newest)' : 'Newest First'}</option>
                  <option value="asc" className="dark:bg-zinc-900">{language === 'sw' ? 'Zamani Kwanza (Oldest)' : 'Oldest First'}</option>
                </select>
              </div>

              <div className="text-right text-xs bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-850">
                {language === 'sw' ? 'Jumla Mauzo:' : 'Total Sales:'} <strong className="text-zinc-800 dark:text-white text-sm ml-1">{formatMoney(salesHistory.reduce((sum, s) => sum + s.totalAmount, 0))}</strong>
              </div>
            </div>
          </div>

          {/* Mobile Cards view */}
          <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedSalesHistory.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-xs">
                {language === 'sw' ? 'Hakuna mauzo yaliyorekodiwa bado.' : 'No sales recorded yet.'}
              </div>
            ) : (
              sortedSalesHistory.map(sale => (
                <div key={sale.id} className="p-3.5 space-y-2 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/5 transition">
                  <div className="flex justify-between items-start gap-1">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-white block">{sale.invoiceNo}</span>
                      <span className="text-[10px] text-zinc-400 font-medium block">{language === 'sw' ? 'Mteja:' : 'Customer:'} <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{sale.customerName || (language === 'sw' ? 'Mteja wa Kawaida' : 'Regular Customer')}</strong></span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      sale.paymentMethod === 'Cash' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' :
                      sale.paymentMethod === 'Bank' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' :
                      sale.paymentMethod === 'Mobile Money' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400' :
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {sale.paymentMethod === 'Cash' 
                        ? (language === 'sw' ? 'Cash' : 'Cash') 
                        : sale.paymentMethod === 'Bank' 
                        ? (language === 'sw' ? 'Benki / Kadi' : 'Bank') 
                        : sale.paymentMethod === 'Mobile Money' 
                        ? (language === 'sw' ? 'Mtandao' : 'Mobile') 
                        : (language === 'sw' ? 'Deni' : 'Credit')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {sale.date} {sale.time || '12:00:00'}
                    </span>
                    <span>{language === 'sw' ? 'Muuzaji:' : 'Cashier:'} <strong>{sale.cashierName}</strong></span>
                  </div>

                  <div className="flex items-end justify-between pt-1 border-t border-zinc-50 dark:border-zinc-800/40">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-400 block font-medium">{language === 'sw' ? 'Faida:' : 'Profit:'} <strong className="text-emerald-600 font-bold">{formatMoney(sale.profit)}</strong></span>
                      <span className="text-xs text-zinc-950 dark:text-white block font-black">TZS {formatMoney(sale.totalAmount)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setCompletedSale(sale);
                          setIsReceiptOpen(true);
                        }}
                        className="px-2 py-1 text-[10px] h-7 font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-md transition"
                        title={language === 'sw' ? "Tazama Risiti" : "View Receipt"}
                      >
                        {language === 'sw' ? 'Risiti' : 'Receipt'}
                      </button>
                      
                      {onUpdateSale && (
                        <button
                          onClick={() => handleOpenEditSaleModal(sale)}
                          className="px-2 py-1 text-[10px] h-7 font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-md transition"
                          title={language === 'sw' ? "Hariri Mauzo" : "Edit Sale"}
                        >
                          {language === 'sw' ? 'Hariri' : 'Edit'}
                        </button>
                      )}

                      {onDeleteSale && (
                        <button
                          onClick={() => handleDeleteSaleItem(sale.id)}
                          className="px-2 py-1 text-[10px] h-7 font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-md transition"
                          title={language === 'sw' ? "Futa Mauzo" : "Delete Sale"}
                        >
                          {language === 'sw' ? 'Futa' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 text-zinc-500 font-bold uppercase tracking-wider">
                  <th className="p-3">{language === 'sw' ? 'Tarehe' : 'Date'}</th>
                  <th className="p-3">{language === 'sw' ? 'Namba ya Risiti' : 'Receipt No.'}</th>
                  <th className="p-3">{language === 'sw' ? 'Mteja' : 'Customer'}</th>
                  <th className="p-3">{language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'}</th>
                  <th className="p-3">{language === 'sw' ? 'Jumla Kuu' : 'Grand Total'}</th>
                  <th className="p-3">{language === 'sw' ? 'Faida Ghafi' : 'Gross Profit'}</th>
                  <th className="p-3">{language === 'sw' ? 'Muuzaji (Cashier)' : 'Cashier'}</th>
                  <th className="p-3 text-center">{language === 'sw' ? 'Kitendo' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {sortedSalesHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-400">
                      {language === 'sw' ? 'Hakuna mauzo yaliyorekodiwa bado.' : 'No sales recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  sortedSalesHistory.map(sale => (
                    <tr key={sale.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/5 transition">
                      <td className="p-3 whitespace-nowrap text-zinc-500 font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {sale.date}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold ml-4.5">
                            {sale.time || '12:00:00'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-zinc-800 dark:text-zinc-200">
                        {sale.invoiceNo}
                      </td>
                      <td className="p-3 whitespace-nowrap text-zinc-600 dark:text-zinc-300 font-medium">
                        {sale.customerName || (language === 'sw' ? 'Mteja wa Kawaida' : 'Regular Customer')}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800' :
                          sale.paymentMethod === 'Bank' ? 'bg-blue-100 text-blue-800' :
                          sale.paymentMethod === 'Mobile Money' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sale.paymentMethod === 'Cash' 
                            ? (language === 'sw' ? 'Cash' : 'Cash') 
                            : sale.paymentMethod === 'Bank' 
                            ? (language === 'sw' ? 'Benki / Kadi' : 'Bank') 
                            : sale.paymentMethod === 'Mobile Money' 
                            ? (language === 'sw' ? 'Mtandao' : 'Mobile') 
                            : (language === 'sw' ? 'Deni' : 'Credit')}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                        {formatMoney(sale.totalAmount)}
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(sale.profit)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-zinc-500">
                        {sale.cashierName}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setCompletedSale(sale);
                              setIsReceiptOpen(true);
                            }}
                            className="px-2 py-1 text-[10px] h-7 font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border border-blue-200/50 rounded-md transition"
                            title={language === 'sw' ? "Tazama Risiti" : "View Receipt"}
                          >
                            {language === 'sw' ? 'Risiti' : 'Receipt'}
                          </button>
                          
                          {onUpdateSale && (
                            <button
                              onClick={() => handleOpenEditSaleModal(sale)}
                              className="px-2 py-1 text-[10px] h-7 font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-amber-200/50 rounded-md transition"
                              title={language === 'sw' ? "Hariri Mauzo" : "Edit Sale"}
                            >
                              {language === 'sw' ? 'Hariri' : 'Edit'}
                            </button>
                          )}

                          {onDeleteSale && (
                            <button
                              onClick={() => handleDeleteSaleItem(sale.id)}
                              className="px-2 py-1 text-[10px] h-7 font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200/50 rounded-md transition"
                              title={language === 'sw' ? "Futa Mauzo" : "Delete Sale"}
                            >
                              {language === 'sw' ? 'Futa' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Thermal-style receipt popup */}
      {isReceiptOpen && completedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:static print:bg-white print:p-0 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl p-6 relative print:border-0 print:shadow-none print:p-0 print:max-w-none">
            
            {isEditingReceiptInfo ? (
              <div className="space-y-4 print:hidden">
                <div className="text-center pb-2.5 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-black uppercase text-amber-500 tracking-wider">{language === 'sw' ? 'Hariri Risiti (Edit Receipt)' : 'Edit Receipt'}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">{language === 'sw' ? 'Hariri taarifa muhimu za risiti hii kabla ya kupakua au kuchapisha.' : 'Edit key receipt information before downloading or printing.'}</p>
                </div>
                
                {/* Scrollable form fields */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-[11px] text-zinc-700 dark:text-zinc-300">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Jina la Biashara:' : 'Business Name:'}</label>
                    <input 
                      type="text" 
                      value={tempBusinessName} 
                      onChange={(e) => setTempBusinessName(e.target.value)} 
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Mtaa/Anuani ya Duka:' : 'Store Address:'}</label>
                    <input 
                      type="text" 
                      value={tempAddress} 
                      onChange={(e) => setTempAddress(e.target.value)} 
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Simu na Barua Pepe:' : 'Phone & Email:'}</label>
                    <input 
                      type="text" 
                      value={tempContact} 
                      onChange={(e) => setTempContact(e.target.value)} 
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Namba ya Risiti:' : 'Receipt No:'}</label>
                      <input 
                        type="text" 
                        value={tempInvoiceNo} 
                        onChange={(e) => setTempInvoiceNo(e.target.value)} 
                        className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Njia ya Malipo:' : 'Payment Method:'}</label>
                      <select 
                        value={tempPaymentMethod} 
                        onChange={(e) => setTempPaymentMethod(e.target.value)} 
                        className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Tarehe:' : 'Date:'}</label>
                      <input 
                        type="date" 
                        value={tempDate} 
                        onChange={(e) => setTempDate(e.target.value)} 
                        className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Muda:' : 'Time:'}</label>
                      <input 
                        type="time" 
                        value={tempTime} 
                        onChange={(e) => setTempTime(e.target.value)} 
                        className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Mteja:' : 'Customer:'}</label>
                    <input 
                      type="text" 
                      value={tempCustomerName} 
                      onChange={(e) => setTempCustomerName(e.target.value)} 
                      placeholder={language === 'sw' ? "Mteja wa Kawaida" : "Regular Customer"}
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Muuzaji:' : 'Cashier Name:'}</label>
                    <input 
                      type="text" 
                      value={tempCashierName} 
                      onChange={(e) => setTempCashierName(e.target.value)} 
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Ujumbe wa Chini (Footer Note):' : 'Footer Note:'}</label>
                    <input 
                      type="text" 
                      value={tempFooter} 
                      onChange={(e) => setTempFooter(e.target.value)} 
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'sw' ? 'Notes/Kumbukumbu:' : 'Notes / Memo:'}</label>
                    <textarea 
                      value={tempNote} 
                      onChange={(e) => setTempNote(e.target.value)} 
                      rows={2}
                      className="w-full mt-0.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-white"
                      placeholder={language === 'sw' ? "Ujumbe mwingine wa ziada kwenye risiti..." : "Other additional messages on the receipt..."}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingReceiptInfo(false)}
                    className="flex-1 py-2 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition cursor-pointer"
                  >
                    {language === 'sw' ? 'Ghairi' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptBusinessName(tempBusinessName);
                      localStorage.setItem('receipt_business_name', tempBusinessName);
                      setReceiptAddress(tempAddress);
                      localStorage.setItem('receipt_address', tempAddress);
                      setReceiptContact(tempContact);
                      localStorage.setItem('receipt_contact', tempContact);
                      setReceiptFooter(tempFooter);
                      localStorage.setItem('receipt_footer', tempFooter);

                      if (completedSale) {
                        const updated: Sale = {
                          ...completedSale,
                          invoiceNo: tempInvoiceNo,
                          date: tempDate,
                          time: tempTime,
                          customerName: tempCustomerName || undefined,
                          paymentMethod: tempPaymentMethod as any,
                          cashierName: tempCashierName,
                          note: tempNote || undefined
                        };
                        setCompletedSale(updated);
                        if (onUpdateSale) {
                          onUpdateSale(updated);
                        }
                      }
                      setIsEditingReceiptInfo(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition shadow-xs cursor-pointer"
                  >
                    {language === 'sw' ? 'Hifadhi Taarifa' : 'Save Details'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">{receiptBusinessName}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{receiptAddress}</p>
                  <p className="text-[11px] text-zinc-400">{receiptContact}</p>
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-2">{language === 'sw' ? 'RISITI YENYE POLISHE' : 'POLISHED POS RECEIPT'}</p>
                </div>

                {/* Receipt Details */}
                <div className="py-4 space-y-1.5 text-xs border-b border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>{language === 'sw' ? 'Risiti No:' : 'Receipt No:'}</span>
                    <span className="font-bold text-zinc-800 dark:text-white">{completedSale.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'sw' ? 'Tarehe na Muda:' : 'Date & Time:'}</span>
                    <span className="font-medium font-mono">{completedSale.date} {completedSale.time || '12:00:00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'sw' ? 'Mteja:' : 'Customer:'}</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{completedSale.customerName || (language === 'sw' ? 'Mteja wa Kawaida' : 'Regular Customer')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'sw' ? 'Malipo ya:' : 'Payment Method:'}</span>
                    <span className="font-semibold">
                      {completedSale.paymentMethod === 'Cash' ? (language === 'sw' ? 'Cash' : 'Cash') :
                       completedSale.paymentMethod === 'Bank' ? (language === 'sw' ? 'Benki / Kadi' : 'Bank / Card') :
                       completedSale.paymentMethod === 'Mobile Money' ? (language === 'sw' ? 'Pesa ya Mtandao' : 'Mobile Money') :
                       (language === 'sw' ? 'Deni / Mikopo' : 'Credit / Debt')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'sw' ? 'Mhudumu:' : 'Cashier:'}</span>
                    <span>{completedSale.cashierName}</span>
                  </div>
                </div>

                {/* Sale items summary */}
                <div className="py-4 text-xs border-b border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[10px]">
                    <span className="flex-1">{language === 'sw' ? 'Bidhaa x Qty' : 'Item x Qty'}</span>
                    <span className="w-20 text-right">{language === 'sw' ? 'Bei' : 'Price'}</span>
                    <span className="w-20 text-right">{language === 'sw' ? 'Jumla' : 'Total'}</span>
                  </div>
                  {completedSale.items.map((item, idx) => {
                    const discLabel = item.discountPercent > 0 ? ` (Disc ${item.discountPercent}%)` : '';
                    const itemNetPrice = item.sellingPrice * (1 - item.discountPercent / 100);
                    return (
                      <div key={idx} className="flex justify-between text-zinc-700 dark:text-zinc-300">
                        <span className="flex-1 truncate pr-1">{item.name} <em className="text-zinc-400 text-[10px] block font-mono">x {item.quantity}{discLabel}</em></span>
                        <span className="w-20 text-right font-mono">{formatMoney(item.sellingPrice)}</span>
                        <span className="w-20 text-right font-bold text-zinc-900 dark:text-white font-mono">{formatMoney(itemNetPrice * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Totals */}
                <div className="py-4 space-y-1.5 text-xs border-b border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between text-zinc-500">
                    <span>{language === 'sw' ? 'Nusu-Jumla (Subtotal):' : 'Subtotal:'}</span>
                    <span className="font-mono">{formatMoney(completedSale.totalAmount - completedSale.taxAmount)}</span>
                  </div>
                  {completedSale.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>{language === 'sw' ? 'Punguzo la Jumla:' : 'Overall Discount:'}</span>
                      <span className="font-mono">- {formatMoney(completedSale.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>VAT ({completedSale.taxRate}%):</span>
                    <span className="font-mono">{formatMoney(completedSale.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-900 dark:text-white font-black text-sm pt-2">
                    <span>{language === 'sw' ? 'JUMLA KUU:' : 'GRAND TOTAL:'}</span>
                    <span className="font-mono text-base text-blue-600 dark:text-blue-400">{formatMoney(completedSale.totalAmount)}</span>
                  </div>
                </div>

                {completedSale.note && (
                  <div className="py-3 text-center text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800 rounded-lg mt-2">
                    &ldquo;{completedSale.note}&rdquo;
                  </div>
                )}

                <div className="text-center pt-5 text-[10px] text-zinc-400 space-y-1">
                  <p>{language === 'sw' ? 'Asante kwa kufanya biashara nasi!' : 'Thank you for your patronage!'}</p>
                  <p className="font-bold tracking-widest text-[9px]">{receiptFooter}</p>
                </div>

                {/* Action buttons footer */}
                <div className="flex flex-col gap-2 mt-6 print:hidden">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsReceiptOpen(false)}
                      className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-xs rounded-xl transition cursor-pointer text-center"
                    >
                      {language === 'sw' ? 'Funga' : 'Close'}
                    </button>
                    <button
                      onClick={() => {
                        setTempBusinessName(receiptBusinessName);
                        setTempAddress(receiptAddress);
                        setTempContact(receiptContact);
                        setTempFooter(receiptFooter);
                        setTempInvoiceNo(completedSale.invoiceNo);
                        setTempDate(completedSale.date);
                        setTempTime(completedSale.time || '12:00:00');
                        setTempCustomerName(completedSale.customerName || '');
                        setTempPaymentMethod(completedSale.paymentMethod);
                        setTempCashierName(completedSale.cashierName);
                        setTempNote(completedSale.note || '');
                        setIsEditingReceiptInfo(true);
                      }}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {language === 'sw' ? 'Hariri Risiti' : 'Edit Receipt'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPDFReceipt(completedSale)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {language === 'sw' ? 'Pakua PDF' : 'Download PDF'}
                    </button>
                    <button
                      onClick={printReceiptLayout}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {language === 'sw' ? 'Chapisha' : 'Print'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal ya kuhariri Mauzo */}
      {isEditModalOpen && editingSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl p-6 relative">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              {language === 'sw' ? 'Hariri Taarifa za Mauzo' : 'Edit Sale Details'}
            </h3>
            <form onSubmit={handleSaveUpdatedSale} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Namba ya Risiti (Invoice No)' : 'Receipt Number (Invoice No)'}</label>
                <input
                  type="text"
                  value={editingSale.invoiceNo}
                  disabled
                  className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg text-zinc-500 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Tarehe (Date)' : 'Date'}</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Muda (Time)' : 'Time'}</label>
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
                <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Muuzaji (Cashier)' : 'Cashier'}</label>
                <input
                  type="text"
                  value={editCashierName}
                  onChange={(e) => setEditCashierName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Njia ya Malipo' : 'Payment Method'}</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">{language === 'sw' ? 'Cash / Pesa Taslimu' : 'Cash'}</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank">{language === 'sw' ? 'Bank / Kadi' : 'Bank / Card'}</option>
                    <option value="Credit">{language === 'sw' ? 'Credit / Deni' : 'Credit / Debt'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Mteja (Customer)' : 'Customer'}</label>
                  <select
                    value={editCustomerId}
                    onChange={(e) => setEditCustomerId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{language === 'sw' ? 'Mteja wa Kawaida' : 'Regular Customer'}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Jumla Kuu (Total TZS)' : 'Grand Total (TZS)'}</label>
                  <input
                    type="number"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Faida ya Mauzo (Profit TZS)' : 'Sale Profit (TZS)'}</label>
                  <input
                    type="number"
                    value={editProfit}
                    onChange={(e) => setEditProfit(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg text-zinc-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">{language === 'sw' ? 'Memo / Maelezo mafupi' : 'Memo / Short Notes'}</label>
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
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  {language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode scanner camera modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleBarcodeScanSuccess}
      />

      {/* Floating Cart Button for Mobile */}
      {!showHistory && cart.length > 0 && (
        <button
          onClick={() => {
            document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="fixed bottom-18 right-4 md:hidden bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 z-40 active:scale-95 transition-all border border-blue-500/20 animate-bounce cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span>
            {language === 'sw' 
              ? `Kikapu (${cart.reduce((sum, item) => sum + item.quantity, 0)}) - Lipia` 
              : `Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)}) - Pay`}
          </span>
          <ArrowDown className="w-3.5 h-3.5 animate-pulse shrink-0" />
        </button>
      )}
    </div>
  );
}
