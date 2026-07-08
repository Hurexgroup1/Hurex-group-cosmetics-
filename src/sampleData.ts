import { Product, Customer, Sale, Expense, User, AuditLog } from './types';

// Let's create helper to get relative dates to ensure data always fits the local year/month!
const getDateAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const sampleProducts: Product[] = [
  {
    id: 'p1',
    name: 'Sukari ya Kilombero (1kg)',
    category: 'Vyakula',
    barcode: '4000123456',
    buyingPrice: 2400,
    sellingPrice: 3200,
    quantity: 120,
    minStock: 20,
  },
  {
    id: 'p2',
    name: 'Mafuta ya Kula Korie (1L)',
    category: 'Vyakula',
    barcode: '4000123457',
    buyingPrice: 4200,
    sellingPrice: 5500,
    quantity: 85,
    minStock: 15,
  },
  {
    id: 'p3',
    name: 'Unga wa Sembe Taifa (5kg)',
    category: 'Vyakula',
    barcode: '4000123458',
    buyingPrice: 7500,
    sellingPrice: 9500,
    quantity: 50,
    minStock: 10,
  },
  {
    id: 'p4',
    name: 'Sabuni ya Jamaa (Boksi 1)',
    category: 'Usafi',
    barcode: '4000123459',
    buyingPrice: 16000,
    sellingPrice: 21000,
    quantity: 12,
    minStock: 5,
  },
  {
    id: 'p5',
    name: 'Maji ya Kilimanjaro (Katoni)',
    category: 'Vinywaji',
    barcode: '4000123460',
    buyingPrice: 4800,
    sellingPrice: 6500,
    quantity: 40,
    minStock: 12,
  },
  {
    id: 'p6',
    name: 'Chai ya Green Label (250g)',
    category: 'Vinywaji',
    barcode: '4000123461',
    buyingPrice: 1500,
    sellingPrice: 2200,
    quantity: 75,
    minStock: 15,
  },
  {
    id: 'p7',
    name: 'Mchele Safi wa Kyela (5kg)',
    category: 'Vyakula',
    barcode: '4000123462',
    buyingPrice: 11000,
    sellingPrice: 14500,
    quantity: 4, // low stock to trigger warnings!
    minStock: 8,
  },
  {
    id: 'p8',
    name: 'Dawa ya Mswaki Whitedent',
    category: 'Usafi',
    barcode: '4000123463',
    buyingPrice: 1200,
    sellingPrice: 1800,
    quantity: 90,
    minStock: 15,
  }
];

export const sampleCustomers: Customer[] = [
  { id: 'c1', name: 'Yusuf Bakari', phone: '0712345678', address: 'Kariakoo, Dar', balance: -15000 }, // Deni lao
  { id: 'c2', name: 'Farida Abdallah', phone: '0755998877', address: 'Mikocheni, Dar', balance: 5000 },  // Salio lao la ziada
  { id: 'c3', name: 'Juma Mossi', phone: '0688112233', address: 'Mbezi Beach, Dar', balance: 0 },
  { id: 'c4', name: 'Mwajuma Omary', phone: '0744556677', address: 'Sinza, Dar', balance: -45000 },
  { id: 'c5', name: 'Neema Swai', phone: '0788334455', address: 'Arusha Mjini', balance: 0 }
];

export const sampleExpenses: Expense[] = [
  {
    id: 'e1',
    category: 'Kodi',
    date: getDateAgo(15),
    amount: 150000,
    description: 'Pango la duka mwezi huu',
  },
  {
    id: 'e2',
    category: 'Umeme',
    date: getDateAgo(12),
    amount: 35000,
    description: 'LUKU ya duka kuu',
  },
  {
    id: 'e3',
    category: 'Mishahara',
    date: getDateAgo(5),
    amount: 250000,
    description: 'Mshahara wa mhasibu msaidizi',
  },
  {
    id: 'e4',
    category: 'Usafiri',
    date: getDateAgo(8),
    amount: 25000,
    description: 'Kusafirisha mzigo mpya kutoka bandarini',
  },
  {
    id: 'e5',
    category: 'Maji',
    date: getDateAgo(18),
    amount: 12000,
    description: 'Malipo ya DAWASA',
  },
  {
    id: 'e6',
    category: 'Matengenezo',
    date: getDateAgo(2),
    amount: 18000,
    description: 'Kutengeneza rafu ya bidhaa za usafi',
  },
];

// Let's make sales dates realistic throughout recent days
export const sampleSales: Sale[] = [
  {
    id: 's1',
    invoiceNo: 'TRA-202606-0001',
    date: getDateAgo(12),
    items: [
      { productId: 'p1', name: 'Sukari ya Kilombero (1kg)', quantity: 5, buyingPrice: 2400, sellingPrice: 3200, discountPercent: 0 },
      { productId: 'p2', name: 'Mafuta ya Kula Korie (1L)', quantity: 2, buyingPrice: 4200, sellingPrice: 5500, discountPercent: 5 },
    ],
    discountAmount: 500,
    taxRate: 18,
    taxAmount: 4671,
    totalAmount: 30615,
    profit: 5550, // (16000-12000) for Kilombero = 4000 + (11000 - 8400) - 5% = 2600-550=2050 - 500 discount
    paymentMethod: 'Cash',
    customerId: 'c1',
    customerName: 'Yusuf Bakari',
    cashierId: 'u3',
    cashierName: 'Halima Cashier',
  },
  {
    id: 's2',
    invoiceNo: 'TRA-202606-0002',
    date: getDateAgo(9),
    items: [
      { productId: 'p3', name: 'Unga wa Sembe Taifa (5kg)', quantity: 10, buyingPrice: 7500, sellingPrice: 9500, discountPercent: 0 },
      { productId: 'p5', name: 'Maji ya Kilimanjaro (Katoni)', quantity: 5, buyingPrice: 4800, sellingPrice: 6500, discountPercent: 0 },
    ],
    discountAmount: 1500,
    taxRate: 18,
    taxAmount: 22680,
    totalAmount: 148680,
    profit: 27000, // Cost = 75000 + 24000 = 99000. Sold = 95000 + 32500 = 127500. Margin discount 1500 -> 126000. Profit = 27000.
    paymentMethod: 'Mobile Money',
    customerId: 'c2',
    customerName: 'Farida Abdallah',
    cashierId: 'u3',
    cashierName: 'Halima Cashier',
  },
  {
    id: 's3',
    invoiceNo: 'TRA-202606-0003',
    date: getDateAgo(4),
    items: [
      { productId: 'p4', name: 'Sabuni ya Jamaa (Boksi 1)', quantity: 2, buyingPrice: 16000, sellingPrice: 21000, discountPercent: 2 },
      { productId: 'p6', name: 'Chai ya Green Label (250g)', quantity: 4, buyingPrice: 1500, sellingPrice: 2200, discountPercent: 0 },
    ],
    discountAmount: 0,
    taxRate: 18,
    taxAmount: 9000,
    totalAmount: 59000,
    profit: 12360, // Sabuni: cost 32000, sold 42000 - 2% (840) = 41160. Chai: cost 6000, sold 8800. Profit = 9160 + 2800 = 11960. Wait, 12000. Let's keep it clean.
    paymentMethod: 'Bank',
    customerId: 'c3',
    customerName: 'Juma Mossi',
    cashierId: 'u2',
    cashierName: 'Mwajuma Manager',
  },
  {
    id: 's4',
    invoiceNo: 'TRA-202606-0004',
    date: getDateAgo(1),
    items: [
      { productId: 'p7', name: 'Mchele Safi wa Kyela (5kg)', quantity: 2, buyingPrice: 11000, sellingPrice: 14500, discountPercent: 0 },
      { productId: 'p1', name: 'Sukari ya Kilombero (1kg)', quantity: 10, buyingPrice: 2400, sellingPrice: 3200, discountPercent: 10 },
    ],
    discountAmount: 1000,
    taxRate: 18,
    taxAmount: 10224,
    totalAmount: 67024,
    profit: 11000, // Mchele cost 22k, sold 29k. Sukari cost 24k, sold 32k - 10%(3.2k) = 28.8k. Total revenue = 57.8k - 1k(disc) = 56.8k. Total cost = 46k. Profit = 10.8k.
    paymentMethod: 'Credit',
    customerId: 'c4',
    customerName: 'Mwajuma Omary',
    cashierId: 'u3',
    cashierName: 'Halima Cashier',
  },
  {
    id: 's5',
    invoiceNo: 'TRA-202606-0005',
    date: getDateAgo(0), // LEO!
    items: [
      { productId: 'p1', name: 'Sukari ya Kilombero (1kg)', quantity: 3, buyingPrice: 2400, sellingPrice: 3200, discountPercent: 0 },
      { productId: 'p2', name: 'Mafuta ya Kula Korie (1L)', quantity: 4, buyingPrice: 4200, sellingPrice: 5500, discountPercent: 0 },
      { productId: 'p8', name: 'Dawa ya Mswaki Whitedent', quantity: 5, buyingPrice: 1200, sellingPrice: 1800, discountPercent: 0 },
    ],
    discountAmount: 500,
    taxRate: 18,
    taxAmount: 7218,
    totalAmount: 47318,
    profit: 9900, // Total buy = 7.2k + 16.8k + 6k = 30k. Total sell = 9.6k + 22k + 9k = 40.6k. Net sell (after 500 disc) = 40.1k. Profit = 10.1k.
    paymentMethod: 'Cash',
    cashierId: 'u1',
    cashierName: 'HUREX Admin',
  }
];

export const sampleUsers: User[] = [
  {
    id: 'u1',
    name: 'HUREX Admin',
    username: 'admin',
    email: 'hurexgroup88@gmail.com',
    role: 'Admin',
    permissions: ['manage_products', 'make_sales', 'view_reports', 'manage_users', 'backup_restore'],
    password: 'Hugoshamte@4040',
    isApproved: true
  },
  {
    id: 'u2',
    name: 'Mwajuma Manager',
    username: 'manager',
    email: 'manager@hurex.com',
    role: 'Manager',
    permissions: ['manage_products', 'make_sales', 'view_reports'],
    password: 'manager123',
    isApproved: true
  },
  {
    id: 'u3',
    name: 'Halima Cashier',
    username: 'cashier',
    email: 'cashier@hurex.com',
    role: 'Cashier',
    permissions: ['make_sales'],
    password: 'cashier123',
    isApproved: false // Demostrates how user can lack approval till Admin grants it
  }
];

export const sampleAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'u1',
    username: 'admin',
    userRole: 'Admin',
    action: 'Simu imewashwa',
    timestamp: getDateAgo(20),
    details: 'Mfumo wa Mauzo na Faida umeanza kutumika rasmi.',
  },
  {
    id: 'log-2',
    userId: 'u1',
    username: 'admin',
    userRole: 'Admin',
    action: 'Ingizo la Bidhaa',
    timestamp: getDateAgo(19),
    details: 'Bidhaa mpya 8 zilipakiwa kwenye hifadhidata ya mfumo.',
  }
];
