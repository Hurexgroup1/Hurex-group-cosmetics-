import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, Package, Tag, Layers, RefreshCw, Barcode, AlertCircle, Zap } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onAddBulkProducts: (products: Omit<Product, 'id'>[]) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  formatMoney: (amount: number) => string;
}

export default function Products({ products, onAddProduct, onAddBulkProducts, onUpdateProduct, onDeleteProduct, formatMoney }: ProductsProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [image, setImage] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);

  // Categories list derived dynamically
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Vyakula');
    setBarcode(Math.floor(1000000000 + Math.random() * 9000000000).toString()); // auto barcode generator!
    setBuyingPrice(0);
    setSellingPrice(0);
    setQuantity(10);
    setMinStock(5);
    setImage('');
    setIsUnlimited(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category);
    setBarcode(product.barcode);
    setBuyingPrice(product.buyingPrice);
    setSellingPrice(product.sellingPrice);
    setQuantity(product.quantity);
    setMinStock(product.minStock);
    setImage(product.image || '');
    setIsUnlimited(product.isUnlimited || false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || buyingPrice <= 0 || sellingPrice <= 0) {
      alert(
        language === 'sw'
          ? 'Tafadhali jaza taarifa zote kwa usahihi kabla ya kuhifadhi.'
          : 'Please fill in all product details correctly before saving.'
      );
      return;
    }

    if (sellingPrice < buyingPrice) {
      const confirmLowPrice = window.confirm(
        language === 'sw'
          ? 'Onyo: Bei ya kuuza ni chini ya bei ya kununua. Je, unataka kuendelea?'
          : 'Warning: Selling price is below buying price. Do you want to proceed?'
      );
      if (!confirmLowPrice) return;
    }

    const payload = {
      name,
      category,
      barcode,
      buyingPrice: Number(buyingPrice),
      sellingPrice: Number(sellingPrice),
      quantity: isUnlimited ? 999999 : Number(quantity),
      minStock: Number(minStock),
      image: image || undefined,
      isUnlimited
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...payload
      });
    } else {
      onAddProduct(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, productName: string) => {
    const doubleConfirm = window.confirm(
      language === 'sw'
        ? `Je, una uhakika unataka kufuta bidhaa "${productName}"? \nKitendo hiki hakina ukomo na kitaondoa bidhaa mara moja.`
        : `Are you sure you want to delete product "${productName}"? \nThis action is irreversible and will remove the product immediately.`
    );
    if (doubleConfirm) {
      onDeleteProduct(id);
    }
  };

  const handleLoadBulkProducts = () => {
    const swNames = [
      { name: "Maji ya Uhai (1.5L)", category: "Vinywaji", buy: 800, sell: 1200 },
      { name: "Sabuni ya Liquid (K-Saf)", category: "Usafi", buy: 3500, sell: 4500 },
      { name: "Mchele Bora wa Mbeya (1kg)", category: "Vyakula", buy: 2200, sell: 3000 },
      { name: "Chumvi ya Kwanza (500g)", category: "Vyakula", buy: 300, sell: 500 },
      { name: "Juice ya Azam Embe (1L)", category: "Vinywaji", buy: 2000, sell: 2500 },
      { name: "Safi Dishwashing Liquid", category: "Usafi", buy: 1800, sell: 2400 },
      { name: "Dawa ya Kikohozi Flucold", category: "Dawa", buy: 4000, sell: 5500 },
      { name: "Panadol Kidogo (Kete)", category: "Dawa", buy: 1500, sell: 2000 },
      { name: "T-shirt ya Kijivu (Hurex)", category: "Nguo", buy: 12000, sell: 18000 },
      { name: "Soksi Nyeusi za Pamba", category: "Nguo", buy: 1500, sell: 2500 },
      { name: "Balb ya Umeme Philips 15W", category: "Vifaa vya Umeme", buy: 4500, sell: 6000 },
      { name: "Chaja ya Simu Type-C", category: "Vifaa vya Umeme", buy: 8000, sell: 12000 },
      { name: "Kiberiti cha Popo (Boksi)", category: "Vyakula", buy: 100, sell: 200 },
      { name: "Kahawa ya Tanzania (50g)", category: "Vinywaji", buy: 2500, sell: 3500 },
      { name: "Shampoo ya Nivea (250ml)", category: "Usafi", buy: 6500, sell: 8500 },
      { name: "Dawa ya Malaria Duo-cotecxin", category: "Dawa", buy: 7000, sell: 9500 },
      { name: "Suruali ya Jeans Nyeusi", category: "Nguo", buy: 18000, sell: 25000 },
      { name: "Extension Cable (Njia 4)", category: "Vifaa vya Umeme", buy: 15000, sell: 22000 },
      { name: "Mkate wa Baker's Point", category: "Vyakula", buy: 1500, sell: 2000 },
      { name: "Maziwa ya Asas (Nusu Lita)", category: "Vinywaji", buy: 1200, sell: 1700 }
    ];

    const generated: Omit<Product, 'id'>[] = [];
    const baseBarcode = 6000100200;

    for (let i = 1; i <= 100; i++) {
      const template = swNames[(i - 1) % swNames.length];
      const quantity = Math.floor(10 + Math.random() * 200);
      const isItemUnlimited = i % 12 === 0; // make some items unlimited stock!
      
      generated.push({
        name: `${template.name} - Vol ${Math.ceil(i / swNames.length)}`,
        category: template.category,
        barcode: (baseBarcode + i).toString(),
        buyingPrice: template.buy + (i * 10),
        sellingPrice: template.sell + (i * 15),
        quantity: isItemUnlimited ? 999999 : quantity,
        minStock: Math.floor(5 + Math.random() * 15),
        isUnlimited: isItemUnlimited
      });
    }

    onAddBulkProducts(generated);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
            {language === 'sw' ? 'Udhibiti wa Bidhaa' : 'Product Inventory Control'}
          </h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {language === 'sw' 
              ? 'Ongeza, hariri au futa bidhaa kwenye mfumo wako bila kiwango cha ukomo' 
              : 'Add, edit, or delete products in your system without any limit constraints'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={handleLoadBulkProducts}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors rounded-xl border border-emerald-200/50 dark:border-emerald-900/30 shadow-xs"
            title="Load 100 products dynamically"
          >
            <Zap className="w-3.5 h-3.5" />
            {language === 'sw' ? 'Ongeza Bidhaa 100+ (Bulk)' : 'Load 100+ Bulk Items'}
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl shadow-xs"
            id="btn-ongeza-bidhaa"
          >
            <Plus className="w-4 h-4" />
            {language === 'sw' ? 'Sajili Bidhaa Mpya' : 'Register New Product'}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder={language === 'sw' ? 'Tafuta kwa Jina au Barcode...' : 'Search by Name or Barcode...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto scrollbar-none overflow-x-auto shrink-0 pb-1 md:pb-0">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100'}`}
            >
              {cat === 'All' ? (language === 'sw' ? 'Zote' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list or table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xs">
        {/* Mobile Cards view */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              {language === 'sw' ? 'Hakuna bidhaa inayolingana na utafutaji wako.' : 'No products matched your search.'}
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLowStock = p.quantity <= p.minStock;
              return (
                <div key={p.id} className="p-3.5 flex gap-3 items-start hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/10 shrink-0">
                    {p.image ? (
                      <img src={p.image} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" alt={p.name} />
                    ) : (
                      <Package className="w-5.5 h-5.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-xs text-zinc-950 dark:text-white truncate block">{p.name}</span>
                      <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider shrink-0">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
                      <Barcode className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{p.barcode || (language === 'sw' ? "Haina Barcode" : "No Barcode")}</span>
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-zinc-400 block font-medium">{language === 'sw' ? 'Kununua:' : 'Buying:'} <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{formatMoney(p.buyingPrice)}</strong></span>
                        <span className="text-[11px] text-zinc-900 dark:text-white block font-black">{language === 'sw' ? 'Kuuza:' : 'Selling:'} {formatMoney(p.sellingPrice)}</span>
                      </div>
                      <div className="text-right space-y-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${p.isUnlimited ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' : isLowStock ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isUnlimited ? 'bg-blue-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          {p.isUnlimited ? (language === 'sw' ? 'Bila Kikomo' : 'Unlimited') : `${p.quantity} ${isLowStock ? (language === 'sw' ? 'Pungufu' : 'Low Stock') : (language === 'sw' ? 'Ipo' : 'In Stock')}`}
                        </span>
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">{language === 'sw' ? 'Alama' : 'Icon'}</th>
                <th className="p-4">{language === 'sw' ? 'Jina la Bidhaa' : 'Product Name'}</th>
                <th className="p-4">{language === 'sw' ? 'Kundi (Category)' : 'Category'}</th>
                <th className="p-4">Barcode</th>
                <th className="p-4">{language === 'sw' ? 'Gharama (Buy)' : 'Cost (Buy)'}</th>
                <th className="p-4">{language === 'sw' ? 'Bei (Sell)' : 'Price (Sell)'}</th>
                <th className="p-4">{language === 'sw' ? 'Stoki' : 'Stock'}</th>
                <th className="p-4 text-center">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400">
                    {language === 'sw' ? 'Hakuna bidhaa inayolingana na utafutaji wako.' : 'No products matched your search.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.quantity <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/10 shrink-0">
                          {p.image ? (
                            <img src={p.image} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" alt={p.name} />
                          ) : (
                            <Package className="w-5 h-5" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-zinc-800 dark:text-white">{p.name}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-zinc-400" />
                          {p.barcode || (language === 'sw' ? "Haina Barcode" : "No Barcode")}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatMoney(p.buyingPrice)}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                        {formatMoney(p.sellingPrice)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${p.isUnlimited ? 'bg-blue-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span className={`font-semibold ${p.isUnlimited ? 'text-blue-600 dark:text-blue-400 font-black' : isLowStock ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {p.isUnlimited ? (language === 'sw' ? 'Bila Kikomo' : 'Unlimited') : p.quantity} {!p.isUnlimited && isLowStock && (language === 'sw' ? '(Pungufu!)' : '(Low!)')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Dynamic Popups/Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden shadow-xl" id="modal-bidhaa">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10 shrink-0">
              <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white">
                {editingProduct 
                  ? (language === 'sw' ? 'Hariri Bidhaa iliyosajiliwa' : 'Edit Registered Product')
                  : (language === 'sw' ? 'Sajili Bidhaa Mpya' : 'Register New Product')}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Jina la Bidhaa *' : 'Product Name *'}
                    </label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'sw' ? "Mf. Sukari ya Kilombero 1Kg" : "e.g. Kilombero Sugar 1Kg"}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Kundi (Category) *' : 'Category *'}
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm"
                    >
                      <option value="Vyakula">{language === 'sw' ? 'Vyakula / Groceries' : 'Groceries / Foods'}</option>
                      <option value="Vinywaji">{language === 'sw' ? 'Vinywaji / Drinks' : 'Drinks / Beverages'}</option>
                      <option value="Usafi">{language === 'sw' ? 'Usafi / Hygiene' : 'Hygiene / Cleaning'}</option>
                      <option value="Dawa">{language === 'sw' ? 'Dawa / Medicine' : 'Medicine / Pharmacy'}</option>
                      <option value="Nguo">{language === 'sw' ? 'Nguo / Clothing' : 'Clothing / Apparel'}</option>
                      <option value="Vifaa vya Umeme">{language === 'sw' ? 'Vifaa vya Umeme' : 'Electronics / Devices'}</option>
                      <option value="Mengineyo">{language === 'sw' ? 'Mengineyo' : 'Others'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Barcode (TRA / Universal)' : 'Barcode (Universal)'}
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder={language === 'sw' ? "Barcode ya bidhaa" : "Product barcode"}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm"
                      />
                      <Barcode className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Gharama ya Kununua (TZS) *' : 'Buying Cost (TZS) *'}
                    </label>
                    <input 
                      type="number"
                      min="0"
                      required
                      value={buyingPrice}
                      onChange={(e) => setBuyingPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Bei ya Kuuza POS (TZS) *' : 'Selling Price POS (TZS) *'}
                    </label>
                    <input 
                      type="number"
                      min="0"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white font-bold text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        {language === 'sw' ? 'Idadi Mpya (Stock Qty) *' : 'Stock Quantity *'}
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-[11px] font-bold text-blue-600 dark:text-blue-400 select-none">
                        <input
                          type="checkbox"
                          checked={isUnlimited}
                          onChange={(e) => setIsUnlimited(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                        <span>{language === 'sw' ? 'Bila Kikomo' : 'Unlimited'}</span>
                      </label>
                    </div>
                    <input 
                      type="number"
                      min="0"
                      required={!isUnlimited}
                      disabled={isUnlimited}
                      value={isUnlimited ? '' : quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      placeholder={isUnlimited ? (language === 'sw' ? 'Haina Kikomo (Unlimited)' : 'Unlimited Stock') : '0'}
                      className={`w-full px-4 py-2 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm ${isUnlimited ? 'bg-zinc-100 dark:bg-zinc-950 text-zinc-400 cursor-not-allowed font-semibold' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-white'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Kiwango cha chini cha tahadhari' : 'Minimum Alert Stock Level'}
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      {language === 'sw' ? 'Picha ya Bidhaa (Product Image)' : 'Product Image'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* URL Input */}
                      <div>
                        <span className="block text-[10px] text-zinc-400 mb-1">
                          {language === 'sw' ? 'Weka Kiungo cha Picha (Image URL):' : 'Enter Image URL:'}
                        </span>
                        <input 
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/..."
                          className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 text-xs"
                        />
                      </div>

                      {/* File Upload to Base64 */}
                      <div>
                        <span className="block text-[10px] text-zinc-400 mb-1">
                          {language === 'sw' ? 'Au Pakia Faili kutoka Kifaa (Upload):' : 'Or Upload Local Image File:'}
                        </span>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                        />
                      </div>
                    </div>

                    {/* Curated Presets picker for quick testing */}
                    <div className="pt-1">
                      <span className="block text-[9px] text-zinc-400 uppercase tracking-wider mb-1">
                        {language === 'sw' ? 'Mifano ya picha za haraka (Presets):' : 'Quick Image Presets:'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: language === 'sw' ? '🥤 Soda/Vinywaji' : '🥤 Drinks/Beverages', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&q=80' },
                          { label: language === 'sw' ? '🧂 Chakula/Sukari' : '🧂 Food/Sugar', url: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&q=80' },
                          { label: language === 'sw' ? '🧼 Usafi/Sabuni' : '🧼 Hygiene/Soap', url: 'https://images.unsplash.com/photo-1607006342440-b7001804cfce?w=150&q=80' },
                          { label: language === 'sw' ? '💊 Dawa/Afya' : '💊 Medicine/Health', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&q=80' },
                          { label: language === 'sw' ? '👕 Nguo/Clothing' : '👕 Clothing/Apparel', url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150&q=80' },
                          { label: language === 'sw' ? '💻 Umeme/Device' : '💻 Electronics/Devices', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=150&q=80' }
                        ].map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setImage(preset.url)}
                            className={`px-2 py-1 text-[10px] rounded-lg transition-colors border ${image === preset.url ? 'bg-blue-500 text-white border-blue-500 font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-200'}`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {image && (
                      <div className="mt-2 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-850 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Hakiki picha" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-emerald-600 font-bold block">
                            {language === 'sw' ? 'Picha imepakiwa!' : 'Image loaded!'}
                          </span>
                          <span className="text-[9px] text-zinc-400 block truncate">{image}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                        >
                          {language === 'sw' ? 'Ondoa' : 'Remove'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {sellingPrice < buyingPrice && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'sw' 
                        ? 'Kumbuka: Bei ya kuuza ni ndogo kuliko bei ya kununulia (Gharama). Utasababisha hasara.' 
                        : 'Notice: Selling price is below buying cost. This transaction will incur a loss.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Fixed Modal Footer */}
              <div className="p-4 md:p-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 justify-end shrink-0 bg-zinc-50/50 dark:bg-zinc-800/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs"
                >
                  {language === 'sw' ? 'Hifadhi Taarifa' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
