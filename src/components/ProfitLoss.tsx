import React, { useState } from 'react';
import { Sale, Expense } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  AlertOctagon, 
  Calculator, 
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ProfitLossProps {
  sales: Sale[];
  expenses: Expense[];
  formatMoney: (amount: number) => string;
}

export default function ProfitLoss({ sales, expenses, formatMoney }: ProfitLossProps) {
  const [period, setPeriod] = useState<'All' | 'Leo' | 'Wiki' | 'Mwezi' | 'Mwaka'>('All');

  // Relative dates
  const todayStr = new Date().toISOString().split('T')[0];
  const getDaysAgoDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };
  const startOfWeek = getDaysAgoDate(7);
  const startOfMonth = getDaysAgoDate(30);
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  // Filters
  const periodFilteredSales = sales.filter(s => {
    if (period === 'Leo') return s.date === todayStr;
    if (period === 'Wiki') return new Date(s.date) >= startOfWeek;
    if (period === 'Mwezi') return new Date(s.date) >= startOfMonth;
    if (period === 'Mwaka') return new Date(s.date) >= startOfYear;
    return true;
  });

  const periodFilteredExpenses = expenses.filter(e => {
    if (period === 'Leo') return e.date === todayStr;
    if (period === 'Wiki') return new Date(e.date) >= startOfWeek;
    if (period === 'Mwezi') return new Date(e.date) >= startOfMonth;
    if (period === 'Mwaka') return new Date(e.date) >= startOfYear;
    return true;
  });

  // Math equations
  const totalSalesAmount = periodFilteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  
  // Cost of Goods Sold (Buying price * qty)
  const totalCOGS = periodFilteredSales.reduce((sum, s) => {
    const saleCOGS = s.items.reduce((itemSum, item) => itemSum + (item.buyingPrice * item.quantity), 0);
    return sum + saleCOGS;
  }, 0);

  // Gross profit
  const grossProfit = periodFilteredSales.reduce((sum, s) => sum + s.profit, 0);

  // Total expenses
  const totalExpenses = periodFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Profit
  const netProfit = grossProfit - totalExpenses;

  // Margin percentages
  const profitMarginPercent = totalSalesAmount > 0 ? (netProfit / totalSalesAmount) * 100 : 0;
  const isLoss = netProfit < 0;
  const lossPercentage = isLoss ? Math.abs(profitMarginPercent) : 0;

  // Render expenses breakdown
  const categoryExpensesMap: Record<string, number> = {};
  periodFilteredExpenses.forEach(e => {
    categoryExpensesMap[e.category] = (categoryExpensesMap[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-bold text-zinc-900 dark:text-white">Mchanganuo wa Faida na Hasara</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Mhasibu wa kiotomatiki wa kufanyia hesabu za Gross Profit, Expenses, na Net Profit</p>
        </div>
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 shrink-0 self-start sm:self-auto">
          {(['All', 'Leo', 'Wiki', 'Mwezi', 'Mwaka'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === p ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              {p === 'All' ? 'Zote' : p === 'Leo' ? 'Leo' : p === 'Wiki' ? 'Wiki Hii' : p === 'Mwezi' ? 'Mwezi Huu' : 'Mwaka Huu'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Income Statement Alert */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isLoss 
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-300' 
          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300'
      }`} id="pl-main-alert">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isLoss ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400'}`}>
            {isLoss ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Utendaji wa Kipindi</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black">{isLoss ? 'KUNA HASARA (NET LOSS)' : 'KUNA FAIDA (NET PROFIT)'}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isLoss ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'}`}>
                {isLoss ? `${lossPercentage.toFixed(1)}% Loss` : `${profitMarginPercent.toFixed(1)}% Margin`}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-1">
              {isLoss 
                ? 'Gharama za duka na manunuzi vimezidi kipato au uuzaji wa bidhaa kwa sasa. Inashauriwa kupunguza matumizi yasiyo ya lazima.'
                : 'Biashara inajiendesha kwa faida salama baada ya kufidia gharama zote za bidhaa na gharama za duka.'}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right shrink-0 mt-2 md:mt-0">
          <span className="text-xs uppercase tracking-wider opacity-60">Net Amount ({period === 'All' ? 'Muda wote' : period})</span>
          <h1 className={`text-3xl font-black mt-1 ${isLoss ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {formatMoney(Math.abs(netProfit))}
          </h1>
        </div>
      </div>

      {/* Grid of 4 formula inputs details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Mauzo Kamili (Revenue)</span>
          <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1.5">{formatMoney(totalSalesAmount)}</h4>
          <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
            <ShoppingCart className="w-3.5 h-3.5 text-zinc-400" />
            {periodFilteredSales.length} Transactions
          </p>
        </div>

        {/* Cost of goods sold (COGS) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Cost of Goods Sold (COGS)</span>
          <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1.5">{formatMoney(totalCOGS)}</h4>
          <p className="text-[10px] text-zinc-500 mt-2">Gharama halisi ya kununulia bidhaa zilizouzwa</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Gross Profit (Faida Ghafi)</span>
          <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatMoney(grossProfit)}</h4>
          <p className="text-[10px] text-zinc-500 mt-2">Sales − Cost of Goods Sold</p>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Matumizi (Total Expenses)</span>
          <h4 className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1.5">{formatMoney(totalExpenses)}</h4>
          <p className="text-[10px] text-zinc-500 mt-2">Umeme, kodi, mishahara na kodi zinginezo</p>
        </div>
      </div>

      {/* Structured Ledger details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Income Statement Sheet */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <h5 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-1.5">
            <Calculator className="w-5 h-5 text-zinc-400" />
            Jedwali la Faida na Hasara ({period === 'All' ? 'Muda Wote' : period})
          </h5>

          <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">(+) Mauzo Jumla ya Bidhaa</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">{formatMoney(totalSalesAmount)}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 pl-4 text-zinc-500">
              <span>(-) Punguzo la Jumla lililotolewa duka</span>
              <span className="font-mono">-{formatMoney(periodFilteredSales.reduce((sum, s) => sum + s.discountAmount, 0))}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">(-) Gharama ya Bidhaa (Cost of Goods Sold)</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">-{formatMoney(totalCOGS)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 px-3 rounded-lg font-bold">
              <span className="text-zinc-800 dark:text-zinc-200">(=) Faida Ghafi (Gross Profit)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(grossProfit)}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">(-) Jumla ya Matumizi ya Uendeshaji</span>
              <span className="font-mono text-rose-500 font-semibold">-{formatMoney(totalExpenses)}</span>
            </div>

            <div className="flex justify-between items-center py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/80 px-3 rounded-lg font-black text-sm">
              <span className="text-zinc-900 dark:text-white">(=) FAIDA/HASARA SAFI (Net Profit/Loss)</span>
              <span className={`font-mono text-base ${isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isLoss ? '-' : ''}{formatMoney(Math.abs(netProfit))}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Expense Breakdown list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <h5 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-1.5">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            Mgao wa Matumizi (Expense Breakdown)
          </h5>

          {Object.keys(categoryExpensesMap).length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-xs text-balance">
              Hakuna matumizi yaliyorekodiwa kwa kipindi hiki cha &ldquo;{period}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(categoryExpensesMap).map(([cat, val], idx) => {
                const ratio = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">{cat}</span>
                      <span className="font-mono text-zinc-500 font-semibold">{formatMoney(val)} <em className="text-[10px] text-zinc-400">({ratio.toFixed(0)}%)</em></span>
                    </div>
                    {/* progress bar */}
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full" 
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
