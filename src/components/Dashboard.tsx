import React, { useState } from 'react';
import { Product, Sale, Expense, Customer } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Target, 
  ArrowUpRight,
  TrendingUp as ProfitIcon,
  Layers
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  formatMoney: (amount: number) => string;
}

export default function Dashboard({ products, sales, expenses, customers, formatMoney }: DashboardProps) {
  const { language, t } = useLanguage();
  const [chartPeriod, setChartPeriod] = useState<'month' | 'week'>('month');

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

  // Sales calculations
  const salesToday = sales
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const salesThisWeek = sales
    .filter(s => new Date(s.date) >= startOfWeek)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const salesThisMonth = sales
    .filter(s => new Date(s.date) >= startOfMonth)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const salesThisYear = sales
    .filter(s => new Date(s.date) >= startOfYear)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  // Profit/Loss calculations (for all duration)
  const totalSalesVal = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfitVal = sales.reduce((sum, s) => sum + s.profit, 0); // COGS subtracted
  const totalExpensesVal = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = totalProfitVal - totalExpensesVal;

  // Let's identify Total Loss if netProfit is negative
  const overallLoss = netProfit < 0 ? Math.abs(netProfit) : 0;
  const overallProfit = netProfit > 0 ? netProfit : 0;

  // Inventory numbers
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);

  // Best Selling Products calculation
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.quantity * item.sellingPrice * (1 - item.discountPercent / 100);
    });
  });

  const bestSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Graph Data generation (last 7 or 15 days)
  const daysToGraph = chartPeriod === 'month' ? 12 : 7;
  const graphLabels: string[] = [];
  const graphSales: number[] = [];
  const graphProfits: number[] = [];

  for (let i = daysToGraph - 1; i >= 0; i--) {
    const d = getDaysAgoDate(chartPeriod === 'month' ? i * 2.5 : i);
    const dateFormatted = d.toISOString().split('T')[0];
    const displayLabel = d.toLocaleDateString('sw-TZ', { 
      day: 'numeric', 
      month: 'short' 
    });
    
    graphLabels.push(displayLabel);

    // Sum matching sales
    const daySales = sales.filter(s => {
      if (chartPeriod === 'month') {
        // approximate date buckets for a smoother graph
        const diffDays = Math.abs(new Date(s.date).getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 1.25;
      } else {
        return s.date === dateFormatted;
      }
    });

    const sumSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const sumProfit = daySales.reduce((sum, s) => sum + s.profit, 0);

    graphSales.push(sumSales);
    graphProfits.push(sumProfit);
  }

  // Find max value for scaling SVG chart
  const maxVal = Math.max(...graphSales, ...graphProfits, 10000);

  return (
    <div className="space-y-6">
      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-section">
        {/* Sales Overview */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between" id="card-mauzo-leo">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">{t('db.today_sales')}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{formatMoney(salesToday)}</h3>
            </div>
            <span className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex justify-between">
            <span>{language === 'sw' ? 'Wiki' : 'Week'}: <strong>{formatMoney(salesThisWeek)}</strong></span>
            <span>{language === 'sw' ? 'Mwezi' : 'Month'}: <strong>{formatMoney(salesThisMonth)}</strong></span>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between" id="card-faida">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">
                {language === 'sw' ? 'Jumla ya Faida Safi' : 'Total Net Profit'}
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${overallProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                {formatMoney(overallProfit)}
              </h3>
            </div>
            <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ProfitIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {language === 'sw' ? 'Faida Ghafi (Gross)' : 'Gross Profit'}: <strong>{formatMoney(totalProfitVal)}</strong>
            </span>
          </div>
        </div>

        {/* Loss / Expense Card */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between" id="card-hasara">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">
                {language === 'sw' ? 'Hasara / Matumizi' : 'Loss / Expenses'}
              </p>
              <h3 className={`text-2xl font-bold mt-1 ${overallLoss > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
                {overallLoss > 0 ? formatMoney(overallLoss) : formatMoney(totalExpensesVal)}
              </h3>
            </div>
            <span className={`p-3 rounded-xl ${overallLoss > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span>{overallLoss > 0 ? (language === 'sw' ? 'Mfumo una hasara ya jumla' : 'System has an overall loss') : (language === 'sw' ? 'Jumla ya matumizi yote yaliyorekodiwa' : 'Total of all recorded expenses')}</span>
          </div>
        </div>

        {/* Quantities Overview */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between" id="card-bidhaa">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">{language === 'sw' ? 'Hifadhi (Inventory)' : 'Inventory'}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {totalProducts} {language === 'sw' ? 'Bidhaa' : 'Products'}
              </h3>
            </div>
            <span className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              {language === 'sw' ? 'Wateja' : 'Customers'}: <strong>{customers.length}</strong>
            </span>
            {lowStockProducts.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockProducts.length} {language === 'sw' ? 'Chini' : 'Low'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Graph & Top Products grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Glowing Charts and Statistics */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                {language === 'sw' ? 'Mwelekeo wa Mauzo na Faida' : 'Sales & Profit Trends'}
              </h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {language === 'sw' ? 'Mchanganuo wa mabadiliko ya mauzo na faida nchini' : 'Breakdown of total sales and net profit margins'}
              </p>
            </div>
            <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 mt-2 sm:mt-0">
              <button 
                onClick={() => setChartPeriod('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartPeriod === 'week' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {language === 'sw' ? 'Siku 7' : '7 Days'}
              </button>
              <button 
                onClick={() => setChartPeriod('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${chartPeriod === 'month' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {language === 'sw' ? 'Siku 30' : '30 Days'}
              </button>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="h-64 w-full relative flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="195" x2="500" y2="195" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" />

              {/* Area Under Sales Curve */}
              <path 
                d={`M 0,200 ${graphSales.map((val, idx) => {
                  const x = (idx / (daysToGraph - 1)) * 500;
                  const y = 195 - (val / maxVal) * 170;
                  return `L ${x},${y}`;
                }).join(' ')} L 500,200 Z`}
                fill="url(#salesAreaGrad)"
                opacity="0.15"
              />

              {/* Sales Curve Line */}
              <path 
                d={graphSales.map((val, idx) => {
                  const x = (idx / (daysToGraph - 1)) * 500;
                  const y = 195 - (val / maxVal) * 170;
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Profits Curve Line */}
              <path 
                d={graphProfits.map((val, idx) => {
                  const x = (idx / (daysToGraph - 1)) * 500;
                  const y = 195 - (val / maxVal) * 170;
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="1 1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points for Sales */}
              {graphSales.map((val, idx) => {
                const x = (idx / (daysToGraph - 1)) * 500;
                const y = 195 - (val / maxVal) * 170;
                return (
                  <g key={`pt-sales-${idx}`} className="group/node cursor-pointer">
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="4.5" 
                      fill="#3b82f6" 
                      stroke="#ffffff" 
                      strokeWidth="1.5"
                      className="transition-all duration-200 group-hover/node:r-6" 
                    />
                    <title>{`${language === 'sw' ? 'Mauzo' : 'Sales'}: ${formatMoney(val)}`}</title>
                  </g>
                );
              })}

              {/* Gradient Declarations */}
              <defs>
                <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels overlay bottom */}
            <div className="absolute inset-x-0 -bottom-6 flex justify-between text-[10px] text-zinc-400 font-mono tracking-tighter">
              {graphLabels.map((lbl, idx) => (
                <span key={idx} style={{ left: `${(idx / (daysToGraph - 1)) * 95}%`, position: 'absolute' }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>

          {/* Legenda details */}
          <div className="flex gap-6 mt-8 justify-start text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-zinc-600 dark:text-zinc-300">
                {language === 'sw' ? 'Mauzo Jumla' : 'Total Sales'} ({formatMoney(graphSales.reduce((a, b) => a + b, 0))})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-zinc-600 dark:text-zinc-300">
                {language === 'sw' ? 'Faida Ghafi' : 'Gross Profit'} ({formatMoney(graphProfits.reduce((a, b) => a + b, 0))})
              </span>
            </div>
          </div>
        </div>

        {/* Best Selling Products Panel */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between" id="bestselling-section">
          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              {language === 'sw' ? 'Bidhaa Zinazotoka Zaidi' : 'Top Selling Products'}
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
              {language === 'sw' ? 'Bidhaa zilizorekodiwa mauzo mengi zaidi' : 'Products with the highest recorded sales quantity'}
            </p>

            <div className="space-y-4">
              {bestSellingProducts.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-sm">
                  {language === 'sw' ? 'Hakuna mauzo yaliyorekodiwa bado.' : 'No sales recorded yet.'}
                </div>
              ) : (
                bestSellingProducts.map((p, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100/50 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 font-bold flex items-center justify-center text-sm text-zinc-600 dark:text-zinc-300">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-zinc-800 dark:text-white line-clamp-1">{p.name}</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {p.quantity} {language === 'sw' ? 'bidhaa zimeuzwa' : 'items sold'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">{formatMoney(p.revenue)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Alert for low stock */}
          {lowStockProducts.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <div>
                {language === 'sw' ? 'Nje ya Stoki:' : 'Low Stock:'} <strong>{lowStockProducts[0].name}</strong> {language === 'sw' ? `na zingine ${lowStockProducts.length - 1} zimepungua sana!` : `and ${lowStockProducts.length - 1} others are running very low!`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick guide and quick stats summary bottom */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-zinc-900/60 dark:to-emerald-950/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h5 className="text-sm font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            {language === 'sw' ? 'Utendaji wa Biashara Safi (Performance Net Margin)' : 'Net Business Performance (Performance Net Margin)'}
          </h5>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {language === 'sw' 
              ? `Mtawanyiko wa mtiririko wa pesa: Mauzo (${formatMoney(totalSalesVal)}) minus gharama za bidhaa na matumizi (${formatMoney(totalExpensesVal)}).`
              : `Cash flow breakdown: Sales (${formatMoney(totalSalesVal)}) minus cost of goods and expenses (${formatMoney(totalExpensesVal)}).`
            }
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Net Margin</span>
          <span className="block text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalSalesVal > 0 ? `${((netProfit / totalSalesVal) * 100).toFixed(1)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
}
