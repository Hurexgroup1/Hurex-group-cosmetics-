import React, { useState } from 'react';
import { Customer, Sale } from '../types';
import { Plus, Search, User, Phone, MapPin, DollarSign, Edit2, Trash2, Calendar, ShoppingBag } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  sales: Sale[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  formatMoney: (amount: number) => string;
}

export default function Customers({ customers, sales, onAddCustomer, onUpdateCustomer, onDeleteCustomer, formatMoney }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);

  // Active customer history modal state
  const [inspectCustomer, setInspectCustomer] = useState<Customer | null>(null);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setAddress('');
    setBalance(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setBalance(customer.balance);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Tafadhali weka jina la mteja kabla ya kuhifadhi.');
      return;
    }

    const payload = {
      name,
      phone,
      address,
      balance: Number(balance)
    };

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        ...payload
      });
    } else {
      onAddCustomer(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const doubleConfirm = window.confirm(`Je, una uhakika unataka kumfuta mteja "${name}" kutoka kwenye duka?`);
    if (doubleConfirm) {
      onDeleteCustomer(id);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.phone.includes(searchTerm) ||
           c.address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Udhibiti wa Wateja (CRM)</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Sajili wateja, kagua madeni, na kagua historia ya manunuzi yao ya duka</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Ongeza Mteja Mpya
        </button>
      </div>

      {/* CRM search filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Tafuta mteja kwa jina, simu au anuani..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
        />
      </div>

      {/* Customers List Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-400 text-sm">
            Hakuna mteja aliyesajiliwa anayelingana na neno lako la kusaich.
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const customerSales = sales.filter(s => s.customerId === customer.id);
            const totalSpent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
            
            const owesDebts = customer.balance < 0;
            const absoluteBalance = Math.abs(customer.balance);

            return (
              <div 
                key={customer.id} 
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-3 items-start justify-between">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-zinc-800 dark:text-white">{customer.name}</h5>
                        <span className="text-[10px] text-zinc-400 block font-medium">Customer ID: {customer.id}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenEditModal(customer)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id, customer.name)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* contact info */}
                  <div className="mt-4 space-y-1.5 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{customer.phone || 'Hakuna Simu'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{customer.address || 'Hakuna Anuani'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Salio / Malipo Madeni</span>
                    {customer.balance === 0 ? (
                      <span className="text-xs text-zinc-500 font-bold block">Safi (Tsh 0)</span>
                    ) : (
                      <span className={`text-xs font-bold block ${owesDebts ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {owesDebts ? `Mteja anadaiwa: -${formatMoney(absoluteBalance)}` : `Ziada (Ameweka amana): +${formatMoney(absoluteBalance)}`}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectCustomer(customer)}
                    className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold text-[10px] text-zinc-700 dark:text-zinc-200 rounded-lg transition"
                  >
                    Historia ({customerSales.length})
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Insert or edit customer Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingCustomer ? 'Hariri Taarifa za Mteja' : 'Nisajili Mteja Mpya'}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-semibold mb-1">Jina kamili la Mteja *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mf: Yusuf Bakari Moyo"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-semibold mb-1">Namba ya Simu</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mf: 0712345678"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-semibold mb-1">Anuani / Eneo la makazi</label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mf: Kariakoo, Dar es Salaam"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-semibold mb-1">Salio / Deni la mwanzo (Tsh negative ikiwa anadaiwa, positive ikiwa ameweka amana)</label>
                <input 
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  placeholder="Mf: -25000"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white font-bold text-xs"
                />
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
                  Hifadhi Mteja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Customer History Modal */}
      {inspectCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl text-xs">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Kumbukumbu ya Manunuzi: {inspectCustomer.name}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">Orodha ya bidhaa zote walizowahi kununua na njia ya malipo</p>
              </div>
              <button 
                onClick={() => setInspectCustomer(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 max-h-[350px] overflow-y-auto space-y-4">
              {sales.filter(s => s.customerId === inspectCustomer.id).length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                  Mteja huyu hajawahi kufanya manunuzi bado.
                </div>
              ) : (
                sales.filter(s => s.customerId === inspectCustomer.id).map((sale, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200">
                      <span>Invois: {sale.invoiceNo}</span>
                      <span className="font-mono text-zinc-500">{sale.date}</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                      {sale.items.map((it, i_idx) => (
                        <div key={i_idx} className="py-1.5 flex justify-between">
                          <span>{it.name} <strong className="text-zinc-400 font-mono">x {it.quantity}</strong></span>
                          <span>{formatMoney(it.sellingPrice * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50 dark:border-zinc-800 font-extrabold">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold">Njia: {sale.paymentMethod}</span>
                      <span className="text-blue-600 dark:text-blue-400">Jumla: {formatMoney(sale.totalAmount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/10 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectCustomer(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
