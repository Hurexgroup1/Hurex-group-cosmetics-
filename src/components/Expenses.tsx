import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Plus, Search, Calendar, Landmark, Trash2, Edit2, Zap, Droplet, UserCheck, Truck, Home, Wrench, FileText, BarChart } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  formatMoney: (amount: number) => string;
}

const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  'Umeme': Zap,
  'Maji': Droplet,
  'Mishahara': UserCheck,
  'Usafiri': Truck,
  'Kodi': Home,
  'Matengenezo': Wrench,
  'Mengineyo': FileText
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Umeme': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
  'Maji': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  'Mishahara': 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400',
  'Usafiri': 'bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400',
  'Kodi': 'bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400',
  'Matengenezo': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400',
  'Mengineyo': 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400'
};

export default function Expenses({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense, formatMoney }: ExpensesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form Fields
  const [category, setCategory] = useState<ExpenseCategory>('Umeme');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setCategory('Umeme');
    setDate(new Date().toISOString().split('T')[0]);
    setAmount(0);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setCategory(expense.category);
    setDate(expense.date);
    setAmount(expense.amount);
    setDescription(expense.description);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) {
      alert('Tafadhali jaza kiasi halali na maelezo ya matumizi.');
      return;
    }

    const payload = {
      category,
      date,
      amount: Number(amount),
      description
    };

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        ...payload
      });
    } else {
      onAddExpense(payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, detail: string) => {
    const doubleConfirm = window.confirm(`Je, una uhakika unataka kufuta matumizi haya "${detail}"?`);
    if (doubleConfirm) {
      onDeleteExpense(id);
    }
  };

  // Filter logic
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Udhibiti wa Matumizi (Expenses)</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Rekodi gharama za uendeshaji wa duka kama Umeme, Maji, Mishahara, na zaidi</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Ongeza Matumizi Mpya
        </button>
      </div>

      {/* Expenses KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Jumla ya Matumizi</span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {formatMoney(expenses.reduce((sum, e) => sum + e.amount, 0))}
            </span>
          </div>
          <span className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <BarChart className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Matumizi yaliyochujwa</span>
            <span className="text-xl font-black text-zinc-700 dark:text-zinc-300 mt-1 block">
              {formatMoney(totalFilteredAmount)}
            </span>
          </div>
          <span className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-xl">
            <Search className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Idadi ya Matukio</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white mt-1 block">
              {filteredExpenses.length} Kumbukumbu
            </span>
          </div>
          <span className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl">
            <Calendar className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Categories search Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Tafuta maelezo ya matumizi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto scrollbar-none overflow-x-auto shrink-0 pb-1 md:pb-0">
          {['All', 'Umeme', 'Maji', 'Mishahara', 'Usafiri', 'Kodi', 'Matengenezo', 'Mengineyo'].map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100'}`}
            >
              {cat === 'All' ? 'Zote' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xs">
        {/* Mobile Cards view */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800 animate-fade-in">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              Hakuna matumizi yaliyosajiliwa hapa.
            </div>
          ) : (
            filteredExpenses.map((e) => {
              const Icon = CATEGORY_ICONS[e.category] || FileText;
              const colorClass = CATEGORY_COLORS[e.category] || 'bg-zinc-100 text-zinc-800';
              return (
                <div key={e.id} className="p-3.5 flex items-start gap-3 hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-center gap-1.5">
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-white truncate block">{e.category}</span>
                      <span className="text-[10px] text-zinc-400 font-mono font-medium shrink-0">{e.date}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{e.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">TZS {formatMoney(e.amount)}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleOpenEditModal(e)}
                          className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition"
                          title="Hariri"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(e.id, e.description)}
                          className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition"
                          title="Futa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">Aina</th>
                <th className="p-4">Kundi la Matumizi</th>
                <th className="p-4">Tarehe</th>
                <th className="p-4">Maelezo Kamili</th>
                <th className="p-4">Kiasi (TZS)</th>
                <th className="p-4 text-center">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    Hakuna matumizi yaliyosajiliwa hapa.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => {
                  const Icon = CATEGORY_ICONS[e.category] || FileText;
                  const colorClass = CATEGORY_COLORS[e.category] || 'bg-zinc-100 text-zinc-800';
                  return (
                    <tr key={e.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center mx-auto`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-zinc-800 dark:text-zinc-200">
                        {e.category}
                      </td>
                      <td className="p-4 whitespace-nowrap font-mono text-zinc-500">
                        {e.date}
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">
                        {e.description}
                      </td>
                      <td className="p-4 whitespace-nowrap font-bold text-zinc-900 dark:text-white">
                        {formatMoney(e.amount)}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleOpenEditModal(e)}
                            className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-md transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(e.id, e.description)}
                            className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* New/Edit Expense Popup modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/10">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingExpense ? 'Hariri kumbukumbu la Matumizi' : 'Rekodi Matumizi Mapya'}
              </h4>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Aina ya Matumizi (Category) *</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm"
                >
                  <option value="Umeme">Umeme / Luku</option>
                  <option value="Maji">Maji / Dawasa</option>
                  <option value="Mishahara">Mishahara ya wafanyakazi</option>
                  <option value="Usafiri">Usafiri / Nauli ya mzigo</option>
                  <option value="Kodi">Kodi ya Pango / License</option>
                  <option value="Matengenezo">Matengenezo ya duka / Vifaa</option>
                  <option value="Mengineyo">Matumizi Mengineyo mbalimbali</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Tarehe *</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Kiasi cha pesa (TZS) *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Maelezo/Maelezo ya Kina juu ya Matumizi *</label>
                <textarea 
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mf. Nimelipia umeme kwa mwezi wa sita duka la Kariakoo."
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-white placeholder-zinc-400 text-sm"
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
                  Hifadhi Matumizi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
