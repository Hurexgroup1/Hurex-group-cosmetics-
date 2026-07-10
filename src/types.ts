export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  image?: string;
  isUnlimited?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number; // Balance positive is advance/credit
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number; // custom discount per product in cart
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  discountPercent: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string; // ISO date
  items: SaleItem[];
  discountAmount: number; // Overall discount on the total
  taxRate: number; // e.g. 18% VAT
  taxAmount: number;
  totalAmount: number;
  profit: number; // automatically calculated: Net sale price - cost of goods sold
  paymentMethod: 'Cash' | 'Bank' | 'Mobile Money' | 'Credit';
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  note?: string;
  time?: string; // e.g. "13:09:50" or local time
}

export type ExpenseCategory = 'Umeme' | 'Maji' | 'Mishahara' | 'Usafiri' | 'Kodi' | 'Matengenezo' | 'Mengineyo';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  description: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Cashier';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[]; // e.g. 'manage_products', 'make_sales', 'view_reports', 'manage_users', 'backup_restore'
  password?: string;
  isApproved: boolean; // Ruhusa ya Admin
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  userRole: UserRole;
  action: string;
  timestamp: string; // ISO String
  details: string;
}

export interface SystemData {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  users: User[];
  auditLogs: AuditLog[];
}

export interface CustomPermission {
  key: string;
  name: string;
  desc: string;
}

export interface SavedDocument {
  id: string;
  name: string;
  category: string; // e.g. 'Risiti/Malipo', 'Invoisi', 'Mkataba', 'Mengineyo'
  fileType: string; // e.g. 'pdf', 'png', 'jpg', 'doc', 'csv'
  fileSize: string; // e.g. '1.5 MB'
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  description?: string;
  fileData?: string; // Base64 data URL for local storage persistence or file preview
}

export interface OnlineOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OnlineOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNote?: string;
  items: OnlineOrderItem[];
  totalAmount: number;
  paymentReceiptImage?: string; // base64 receipt if uploaded
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  promoCode?: string;
  discountAmount?: number;
  deliveryCharge?: number;
  taxAmount?: number;
  paymentMethod?: string;
  affiliateCode?: string;
  gpsLat?: number;
  gpsLng?: number;
  deliveryDistanceKm?: number;
  deliverySpeed?: 'Standard' | 'Express' | 'Same-Day';
  deliveryCompany?: string;
  courierName?: string;
  courierPhone?: string;
  courierVehiclePlate?: string;
  courierAssignStatus?: 'Pending' | 'Assigned' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Returned';
}

export interface Affiliate {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended' | 'Pending';
  commissionType: 'Percentage' | 'Fixed' | 'Tiered' | 'Product-Based' | 'Category-Based';
  commissionValue: number; // general rate (e.g. 10 for percentage, 5000 for fixed)
  walletBalance: number; // withdrawable
  walletPending: number; // outstanding orders
  walletPaid: number; // total payouts made
  dateRegistered: string; // YYYY-MM-DD
  recruitedBy?: string; // affiliate code of sponsor
  level: number; // 1, 2, or 3
  notes?: string;
}

export interface AffiliateClick {
  id: string;
  affiliateCode: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  timestamp: string; // ISO
  campaign?: string;
  productId?: string;
  categoryName?: string;
  isBot?: boolean;
  isDuplicate?: boolean;
}

export interface AffiliateCommission {
  id: string;
  orderNo: string;
  orderAmount: number;
  affiliateCode: string;
  level: number; // Level that earned this (1=direct, 2=parent, 3=grandparent)
  commissionRate: string; // e.g., "10%" or "Sh 5,000" or "Tier (5%)"
  amountEarned: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface AffiliateWithdrawal {
  id: string;
  affiliateCode: string;
  amount: number;
  paymentMethod: 'Mobile Money' | 'Bank Transfer' | 'Wallet Transfer';
  paymentDetails: string; // e.g. Phone number, Bank account
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  receiptNumber?: string;
  adminNote?: string;
}



