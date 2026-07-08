import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Network, Play, RefreshCw, FileCode, CheckCircle2, 
  Search, ShieldCheck, Cpu, HardDrive, HelpCircle, Save, 
  Terminal, Sparkles, BookOpen, AlertCircle, Copy, Download, ChevronRight
} from 'lucide-react';

// Definitions for the complete 2026 Enterprise ERP database schema
export interface ColumnDefinition {
  name: string;
  type: string;
  constraints?: string[];
  description: string;
  isPK?: boolean;
  isFK?: boolean;
  references?: string;
}

export interface TableDefinition {
  name: string;
  category: string;
  description: string;
  columns: ColumnDefinition[];
  indexes: string[];
  swahiliName: string;
}

const DATABASE_CATEGORIES = [
  'Core System',
  'CRM & Suppliers',
  'Products & Inventory',
  'Sales & Purchases',
  'Accounting & Financials',
  'Loan Management',
  'Affiliate & MLM',
  'Human Resources & Payroll',
  'E-Commerce',
  'System Logging'
];

const ERP_TABLES_SCHEMA: TableDefinition[] = [
  // --- CORE SYSTEM ---
  {
    name: 'businesses',
    category: 'Core System',
    swahiliName: 'Biashara',
    description: 'Stores core business configurations, registration numbers, tax compliance information, and tenant structures.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique identifier for each business tenant.', isPK: true },
      { name: 'business_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Registered business or enterprise trade name.' },
      { name: 'business_code', type: 'VARCHAR(50)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Alphanumeric shortcode used for subdomains or prefixes.' },
      { name: 'registration_number', type: 'VARCHAR(100)', description: 'Official government corporate registration number.' },
      { name: 'tax_number', type: 'VARCHAR(100)', description: 'Tax Identification Number (TIN/VAT number).' },
      { name: 'email', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Primary corporate contact email.' },
      { name: 'phone', type: 'VARCHAR(50)', description: 'Primary business mobile or office telephone number.' },
      { name: 'address', type: 'TEXT', description: 'Headquarters physical address.' },
      { name: 'country', type: 'VARCHAR(100)', constraints: ["DEFAULT 'Tanzania'"], description: 'Country of operation.' },
      { name: 'currency', type: 'VARCHAR(10)', constraints: ["DEFAULT 'TZS'"], description: 'Primary system bookkeeping currency code.' },
      { name: 'language', type: 'VARCHAR(10)', constraints: ["DEFAULT 'sw'"], description: 'Default system interface language.' },
      { name: 'logo', type: 'TEXT', description: 'Secure URL or object storage path to company brand logo.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'Business subscription/operational state (active, suspended, trial).' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Record creation date and time.' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Automatic timestamp updating upon records alteration.' }
    ],
    indexes: [
      'CREATE INDEX idx_businesses_code ON businesses(business_code);',
      'CREATE INDEX idx_businesses_status ON businesses(status);'
    ]
  },
  {
    name: 'branches',
    category: 'Core System',
    swahiliName: 'Matawi',
    description: 'Supports multi-branch accounting and inventories, isolating sales counters, stocks, and local employees.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique branch identifier.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Foreign Key linking back to the parent business tenant.', isFK: true, references: 'businesses(id)' },
      { name: 'branch_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Name of branch (e.g., Kariakoo Branch, Arusha Outlet).' },
      { name: 'branch_code', type: 'VARCHAR(50)', constraints: ['NOT NULL'], description: 'Alphanumeric branch identifier.' },
      { name: 'location', type: 'TEXT', description: 'Physical street address coordinates.' },
      { name: 'phone', type: 'VARCHAR(50)', description: 'Local branch customer support telephone.' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Local branch email inbox.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'Branch operational status.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Branch setup timestamp.' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Record modification time.' }
    ],
    indexes: [
      'CREATE INDEX idx_branches_business_id ON branches(business_id);',
      'CREATE UNIQUE INDEX idx_branches_business_code ON branches(business_id, branch_code);'
    ]
  },
  {
    name: 'users',
    category: 'Core System',
    swahiliName: 'Watumiaji',
    description: 'System accounts for administrators, managers, cashiers, affiliate partners, and accounting personnel.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique user key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Reference to business scope.', isFK: true, references: 'businesses(id)' },
      { name: 'branch_id', type: 'UUID', description: 'Assigned operational branch (null if multi-branch supermanager).', isFK: true, references: 'branches(id)' },
      { name: 'first_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Given name.' },
      { name: 'last_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Family name.' },
      { name: 'username', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Unique system login handle.' },
      { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'User login email verification endpoint.' },
      { name: 'phone', type: 'VARCHAR(50)', description: 'Primary telephone with country code.' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Secure argon2id or bcrypt password digest hash.' },
      { name: 'profile_photo', type: 'TEXT', description: 'URL to avatar image asset.' },
      { name: 'language', type: 'VARCHAR(10)', constraints: ["DEFAULT 'sw'"], description: 'Individual localized preference (Swahili, English).' },
      { name: 'theme', type: 'VARCHAR(20)', constraints: ["DEFAULT 'light'"], description: 'Visual style choice (light, dark, warm).' },
      { name: 'role_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Associated system permission level.', isFK: true, references: 'roles(id)' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'pending'"], description: 'Account validation state (active, pending, suspended).' },
      { name: 'last_login', type: 'TIMESTAMP WITH TIME ZONE', description: 'Timestamp tracking security login histories.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Record initialization date.' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Update trigger timestamp.' }
    ],
    indexes: [
      'CREATE INDEX idx_users_business ON users(business_id);',
      'CREATE INDEX idx_users_email ON users(email);',
      'CREATE INDEX idx_users_username ON users(username);'
    ]
  },
  {
    name: 'roles',
    category: 'Core System',
    swahiliName: 'Majukumu',
    description: 'System roles catalog for hierarchical RBAC privilege settings (Owner, Accountant, Cashier, Affiliate).',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique role UUID.', isPK: true },
      { name: 'role_name', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Role identifier string.' },
      { name: 'description', type: 'TEXT', description: 'Short detail of the operational duties of the role.' }
    ],
    indexes: []
  },
  {
    name: 'permissions',
    category: 'Core System',
    swahiliName: 'Ruhusa',
    description: 'Granular policy permission catalog mapping module features to specific functional toggles.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique permission record.', isPK: true },
      { name: 'permission_name', type: 'VARCHAR(150)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Privilege token (e.g. create_sale, manage_inventory).' },
      { name: 'module_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'ERP module logical grouping category.' }
    ],
    indexes: []
  },
  {
    name: 'role_permissions',
    category: 'Core System',
    swahiliName: 'Ruhusa za Majukumu',
    description: 'Bridge junction table establishing many-to-many linkages between system Roles and granular module Permissions.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Junction row key.', isPK: true },
      { name: 'role_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Associated role relationship reference.', isFK: true, references: 'roles(id)' },
      { name: 'permission_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Granular policy relationship reference.', isFK: true, references: 'permissions(id)' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_role_permissions_composite ON role_permissions(role_id, permission_id);'
    ]
  },

  // --- CRM & SUPPLIERS ---
  {
    name: 'customers',
    category: 'CRM & Suppliers',
    swahiliName: 'Wateja',
    description: 'Aggregates retail, wholesale, credit buyers profiles, tracking balances, limits, and CRM engagement.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique customer record key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Linked business scope.', isFK: true, references: 'businesses(id)' },
      { name: 'customer_code', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Autogenerated business customer ID prefix.' },
      { name: 'first_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'First name.' },
      { name: 'last_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Surname.' },
      { name: 'company_name', type: 'VARCHAR(255)', description: 'Corporate customer enterprise business name.' },
      { name: 'phone', type: 'VARCHAR(50)', constraints: ['NOT NULL'], description: 'Contact phone line.' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Customer billing/newsletter email.' },
      { name: 'address', type: 'TEXT', description: 'Customer physical postal coordinates.' },
      { name: 'credit_limit', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Maximum allowable outstanding debt allowance.' },
      { name: 'current_balance', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Real-time ledger balance (negative for debts, positive for advance prepayments).' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'CRM customer credit state.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Date registered.' },
      { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Date modified.' }
    ],
    indexes: [
      'CREATE INDEX idx_customers_business ON customers(business_id);',
      'CREATE UNIQUE INDEX idx_customers_code ON customers(business_id, customer_code);',
      'CREATE INDEX idx_customers_phone ON customers(phone);'
    ]
  },
  {
    name: 'customer_transactions',
    category: 'CRM & Suppliers',
    swahiliName: 'Miamala ya Wateja',
    description: 'Double entry sub-ledger tracks debit/credit transactions, invoices, and payments on account for credit customers.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Transaction record ID.', isPK: true },
      { name: 'customer_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Customer account target.', isFK: true, references: 'customers(id)' },
      { name: 'transaction_type', type: 'VARCHAR(50)', constraints: ['NOT NULL'], description: 'Type: Invoice, Payment, Debt_Writeoff, Refund.' },
      { name: 'amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Monetary figure associated with movement.' },
      { name: 'balance', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Resulting customer ledger balance after this transaction.' },
      { name: 'description', type: 'TEXT', description: 'Audit breakdown notes, linking transaction to sales orders or receipts.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Transaction time.' }
    ],
    indexes: [
      'CREATE INDEX idx_cust_trans_customer ON customer_transactions(customer_id);',
      'CREATE INDEX idx_cust_trans_date ON customer_transactions(created_at);'
    ]
  },
  {
    name: 'suppliers',
    category: 'CRM & Suppliers',
    swahiliName: 'Wauzaji',
    description: 'Manages supplier entities, contacts, procurement parameters, and real-time ledger liabilities balances.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Supplier primary key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Business owner identity.', isFK: true, references: 'businesses(id)' },
      { name: 'supplier_code', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Unique procurement supplier index ID.' },
      { name: 'supplier_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Supplier business entity name.' },
      { name: 'contact_person', type: 'VARCHAR(150)', description: 'Wholesale accounts manager name.' },
      { name: 'phone', type: 'VARCHAR(50)', constraints: ['NOT NULL'], description: 'Contact telephone.' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Purchase order automated mailing inbox.' },
      { name: 'address', type: 'TEXT', description: 'Warehouse physical coordinates.' },
      { name: 'balance', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Outstanding financial liability owed to the supplier.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'Procurement status state.' }
    ],
    indexes: [
      'CREATE INDEX idx_suppliers_business ON suppliers(business_id);',
      'CREATE UNIQUE INDEX idx_suppliers_code ON suppliers(business_id, supplier_code);'
    ]
  },

  // --- PRODUCTS & INVENTORY ---
  {
    name: 'categories',
    category: 'Products & Inventory',
    swahiliName: 'Jamii za Bidhaa',
    description: 'Hierarchical product organization categorizing inventory for retail indexing, pricing and reports.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Category identifier.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent business catalog mapping.', isFK: true, references: 'businesses(id)' },
      { name: 'category_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Group title (e.g., Electronics, Beverages).' },
      { name: 'parent_id', type: 'UUID', description: 'Recursive parent ID support for infinite nested sub-categories.', isFK: true, references: 'categories(id)' },
      { name: 'description', type: 'TEXT', description: 'Inventory section breakdown.' }
    ],
    indexes: [
      'CREATE INDEX idx_categories_business ON categories(business_id);',
      'CREATE INDEX idx_categories_parent ON categories(parent_id);'
    ]
  },
  {
    name: 'brands',
    category: 'Products & Inventory',
    swahiliName: 'Chapa za Bidhaa',
    description: 'Catalog of manufacturers, distributors, and brands for robust analytical filtering and b2b inventory logs.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Brand database key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent enterprise reference.', isFK: true, references: 'businesses(id)' },
      { name: 'brand_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Brand trading label (e.g., Apple, Samsung, Hurex).' }
    ],
    indexes: []
  },
  {
    name: 'units',
    category: 'Products & Inventory',
    swahiliName: 'Vipimo vya Bidhaa',
    description: 'Unit of Measure (UOM) configurations (e.g., Box, Pieces, Kilograms) vital for stocktaking and packaging divisions.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'UOM identifier key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent business scoping.', isFK: true, references: 'businesses(id)' },
      { name: 'unit_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'UOM title (e.g. Kilogram, Carton).' },
      { name: 'abbreviation', type: 'VARCHAR(20)', constraints: ['NOT NULL'], description: 'Short indicator (e.g., kg, ctn, pcs).' }
    ],
    indexes: []
  },
  {
    name: 'products',
    category: 'Products & Inventory',
    swahiliName: 'Bidhaa',
    description: 'Core inventory directory, consolidating prices, SKU catalog codes, barcodes, taxes, and pricing policies.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Product primary UUID.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Associated tenant company catalog.', isFK: true, references: 'businesses(id)' },
      { name: 'category_id', type: 'UUID', description: 'Assigned category linkage.', isFK: true, references: 'categories(id)' },
      { name: 'brand_id', type: 'UUID', description: 'Assigned brand linkage.', isFK: true, references: 'brands(id)' },
      { name: 'unit_id', type: 'UUID', description: 'UOM mapping.', isFK: true, references: 'units(id)' },
      { name: 'sku', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Stock Keeping Unit unique retail barcode alpha code.' },
      { name: 'barcode', type: 'VARCHAR(100)', description: 'Standard UPC/EAN scan code.' },
      { name: 'product_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Trade product title.' },
      { name: 'description', type: 'TEXT', description: 'General marketing details and tech spec logs.' },
      { name: 'cost_price', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Production cost or purchasing cost.' },
      { name: 'selling_price', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Default retail shelf price.' },
      { name: 'wholesale_price', type: 'NUMERIC(15, 2)', description: 'Bulk sales rate pricing policy.' },
      { name: 'tax_rate', type: 'NUMERIC(5, 2)', constraints: ["DEFAULT 18.00"], description: 'Assigned taxation percentage (e.g., 18.00 for Tanzanian VAT).' },
      { name: 'reorder_level', type: 'NUMERIC(12, 3)', constraints: ["DEFAULT 5.00"], description: 'Safety threshold. Triggers low-stock alerts if stock drops beneath.' },
      { name: 'track_stock', type: 'BOOLEAN', constraints: ["DEFAULT TRUE"], description: 'Toggle to enable/disable real-time balance calculations.' },
      { name: 'image_url', type: 'TEXT', description: 'Public cloud storage CDN image address.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'Inventory state (active, archived, draft).' }
    ],
    indexes: [
      'CREATE INDEX idx_products_business ON products(business_id);',
      'CREATE UNIQUE INDEX idx_products_sku_composite ON products(business_id, sku);',
      'CREATE INDEX idx_products_barcode ON products(barcode);'
    ]
  },
  {
    name: 'product_variants',
    category: 'Products & Inventory',
    swahiliName: 'Aina za Bidhaa',
    description: 'Manages attributes such as sizing, colors, raw weights, material variants, modifying pricing dynamics.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Variant item identifier.', isPK: true },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent product target.', isFK: true, references: 'products(id)' },
      { name: 'variant_name', type: 'VARCHAR(150)', constraints: ['NOT NULL'], description: 'Variant attribute name (e.g., Size, Color).' },
      { name: 'variant_value', type: 'VARCHAR(150)', constraints: ['NOT NULL'], description: 'Variant attribute index value (e.g., Large, Crimson Red, Gold Edition).' }
    ],
    indexes: [
      'CREATE INDEX idx_product_variants_parent ON product_variants(product_id);'
    ]
  },
  {
    name: 'warehouses',
    category: 'Products & Inventory',
    swahiliName: 'Maghala',
    description: 'Logical and physical stock depots, sorting inventory stocks across multiple physical storage coordinates.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Warehouse primary key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent business scope identifier.', isFK: true, references: 'businesses(id)' },
      { name: 'warehouse_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Warehouse name (e.g. Main Warehouse A).' },
      { name: 'location', type: 'TEXT', description: 'Warehouse physical location details.' }
    ],
    indexes: [
      'CREATE INDEX idx_warehouses_business ON warehouses(business_id);'
    ]
  },
  {
    name: 'inventory',
    category: 'Products & Inventory',
    swahiliName: 'Kumbukumbu za Stoki',
    description: 'Real-time stock balance matrix tracking available, reserved, and average costs across multiple warehouses.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Inventory matrix record key.', isPK: true },
      { name: 'warehouse_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Physical depot storage point.', isFK: true, references: 'warehouses(id)' },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Stock item SKU lookup.', isFK: true, references: 'products(id)' },
      { name: 'quantity', type: 'NUMERIC(12, 3)', constraints: ["DEFAULT 0.000"], description: 'Total physical quantity located in the depot.' },
      { name: 'reserved_quantity', type: 'NUMERIC(12, 3)', constraints: ["DEFAULT 0.000"], description: 'Units locked in unfulfilled shopping carts or pending checkout.' },
      { name: 'available_quantity', type: 'NUMERIC(12, 3)', constraints: ["GENERATED ALWAYS AS (quantity - reserved_quantity) STORED"], description: 'Tradable active shelf stock calculated atomically.' },
      { name: 'average_cost', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Weighted moving average cost (AVCO) for exact profit & loss valuations.' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_inventory_warehouse_product ON inventory(warehouse_id, product_id);',
      'CREATE INDEX idx_inventory_product_balance ON inventory(product_id);'
    ]
  },
  {
    name: 'stock_movements',
    category: 'Products & Inventory',
    swahiliName: 'Mienendo ya Stoki',
    description: 'Audit trails of stock mutations including purchases, adjustments, sales orders, and inter-branch warehouse transfers.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Audit log key.', isPK: true },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Target stock mutated.', isFK: true, references: 'products(id)' },
      { name: 'warehouse_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Storage location involved.', isFK: true, references: 'warehouses(id)' },
      { name: 'transaction_type', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Movement type: Purchase, Sale, Transfer, Adjustment, Return.' },
      { name: 'quantity', type: 'NUMERIC(12, 3)', constraints: ['NOT NULL'], description: 'Movement quantity (positive for additions, negative for deductions).' },
      { name: 'unit_cost', type: 'NUMERIC(15, 2)', description: 'Exact value per unit at the time of movement.' },
      { name: 'reference_number', type: 'VARCHAR(100)', description: 'Associated Invoice, Purchase Order, or Transfer Slip ID.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Exact timestamp of ledger correction.' }
    ],
    indexes: [
      'CREATE INDEX idx_stock_move_product ON stock_movements(product_id);',
      'CREATE INDEX idx_stock_move_warehouse ON stock_movements(warehouse_id);',
      'CREATE INDEX idx_stock_move_type ON stock_movements(transaction_type);'
    ]
  },

  // --- SALES & PURCHASES ---
  {
    name: 'sales_orders',
    category: 'Sales & Purchases',
    swahiliName: 'Orodha ya Mauzo',
    description: 'Primary customer sales receipts tracking order status, taxes, discounts, offline sync parameters, and balances.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Sales master unique ID.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent enterprise company link.', isFK: true, references: 'businesses(id)' },
      { name: 'customer_id', type: 'UUID', description: 'Customer key (nullable for anonymous retail sales).', isFK: true, references: 'customers(id)' },
      { name: 'invoice_number', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Fiscal sequential invoice code.' },
      { name: 'subtotal', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Order gross figure excluding discount or tax additions.' },
      { name: 'tax', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Aggregate VAT taxation amount.' },
      { name: 'discount', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Deductions calculated over subtotal.' },
      { name: 'shipping', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Logistics delivery fees.' },
      { name: 'total', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Net payable customer cash amount (subtotal - discount + tax + shipping).' },
      { name: 'payment_status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'pending'"], description: 'States: paid, partially_paid, pending, unpaid.' },
      { name: 'order_status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'completed'"], description: 'States: pending, processing, shipped, completed, cancelled.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Sale transaction date.' }
    ],
    indexes: [
      'CREATE INDEX idx_sales_orders_business ON sales_orders(business_id);',
      'CREATE UNIQUE INDEX idx_sales_invoice_composite ON sales_orders(business_id, invoice_number);',
      'CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);'
    ]
  },
  {
    name: 'sales_order_items',
    category: 'Sales & Purchases',
    swahiliName: 'Vipengele vya Mauzo',
    description: 'Line item breakdown tracking quantities, customized line pricing, sales tax rates, and specific item discounts.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Item primary key.', isPK: true },
      { name: 'sale_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent sales transaction order reference.', isFK: true, references: 'sales_orders(id)' },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'SKU item sold reference.', isFK: true, references: 'products(id)' },
      { name: 'quantity', type: 'NUMERIC(12, 3)', constraints: ['NOT NULL'], description: 'Volume sold.' },
      { name: 'price', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Actual item price on transaction date.' },
      { name: 'tax', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Individual VAT calculation value.' },
      { name: 'discount', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Discount applied specifically to this item.' },
      { name: 'total', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Net line-item sum (qty * price - discount + tax).' }
    ],
    indexes: [
      'CREATE INDEX idx_sales_items_parent ON sales_order_items(sale_id);',
      'CREATE INDEX idx_sales_items_product ON sales_order_items(product_id);'
    ]
  },
  {
    name: 'payments',
    category: 'Sales & Purchases',
    swahiliName: 'Malipo',
    description: 'Monetary payments ledger supporting Cash, Mobile Money (TigoPesa, M-Pesa, AirtelMoney), Banks, or Store Credits.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Payment primary index.', isPK: true },
      { name: 'sale_id', type: 'UUID', description: 'Assigned invoice order (null if miscellaneous advance credit).', isFK: true, references: 'sales_orders(id)' },
      { name: 'payment_method', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Cash, Mobile Money, Bank Transfer, Card, Credit.' },
      { name: 'amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Total payment amount recorded.' },
      { name: 'reference', type: 'VARCHAR(150)', description: 'Electronic receipt reference (M-Pesa ID, Bank TT reference).' },
      { name: 'payment_date', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Time transaction processed.' }
    ],
    indexes: [
      'CREATE INDEX idx_payments_sale ON payments(sale_id);',
      'CREATE INDEX idx_payments_method ON payments(payment_method);'
    ]
  },
  {
    name: 'purchase_orders',
    category: 'Sales & Purchases',
    swahiliName: 'Agizo la Manunuzi',
    description: 'Procurement sheets managing wholesale supplier requisitions, purchase delivery state, and subtotal taxes.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Purchase database UUID.', isPK: true },
      { name: 'supplier_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Supply partner reference.', isFK: true, references: 'suppliers(id)' },
      { name: 'purchase_number', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Sequential b2b receipt indexing code.' },
      { name: 'subtotal', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Purchase net total.' },
      { name: 'tax', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Importation or purchase taxation.' },
      { name: 'total', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Net wholesale cost payable.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'pending'"], description: 'States: ordered, received, pending, partial.' }
    ],
    indexes: [
      'CREATE INDEX idx_purch_orders_supplier ON purchase_orders(supplier_id);',
      'CREATE UNIQUE INDEX idx_purch_num_supplier ON purchase_orders(supplier_id, purchase_number);'
    ]
  },
  {
    name: 'purchase_items',
    category: 'Sales & Purchases',
    swahiliName: 'Vipengele vya Manunuzi',
    description: 'Individual stock item rows detailing wholesale costs, purchase quantities, and received stock values.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Row identifier key.', isPK: true },
      { name: 'purchase_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent procurement relationship.', isFK: true, references: 'purchase_orders(id)' },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Stock item reference.', isFK: true, references: 'products(id)' },
      { name: 'quantity', type: 'NUMERIC(12, 3)', constraints: ['NOT NULL'], description: 'Purchased volume.' },
      { name: 'cost', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Wholesale cost price negotiated.' },
      { name: 'total', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Aggregate wholesale sum.' }
    ],
    indexes: [
      'CREATE INDEX idx_purch_items_parent ON purchase_items(purchase_id);'
    ]
  },

  // --- ACCOUNTING & FINANCIALS ---
  {
    name: 'chart_of_accounts',
    category: 'Accounting & Financials',
    swahiliName: 'Orodha ya Akaunti',
    description: 'The backbone double-entry ledger database classifying Assets, Liabilities, Equity, Revenues, and Expenses.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Account database identifier.', isPK: true },
      { name: 'account_code', type: 'VARCHAR(50)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Standard numerical system accounting identifier (e.g. 10100 for Cash, 40100 for Revenue).' },
      { name: 'account_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'General ledger account description.' },
      { name: 'account_type', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Assets, Liabilities, Equity, Revenue, Expense.' },
      { name: 'parent_account', type: 'UUID', description: 'Supports sub-accounts classifications.', isFK: true, references: 'chart_of_accounts(id)' }
    ],
    indexes: [
      'CREATE INDEX idx_coa_code ON chart_of_accounts(account_code);',
      'CREATE INDEX idx_coa_type ON chart_of_accounts(account_type);'
    ]
  },
  {
    name: 'journal_entries',
    category: 'Accounting & Financials',
    swahiliName: 'Madaftari ya Kila Siku',
    description: 'Double entry master journal tracking fiscal calendar events, payroll sheets, or credit ledger closures.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Journal unique index ID.', isPK: true },
      { name: 'journal_number', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Fiscal year sequential tracking journal index.' },
      { name: 'date', type: 'DATE', constraints: ['NOT NULL', 'DEFAULT CURRENT_DATE'], description: 'Record posting date.' },
      { name: 'description', type: 'TEXT', description: 'Double entry transaction narrative description.' },
      { name: 'created_by', type: 'UUID', description: 'System operator bookkeeping reference.', isFK: true, references: 'users(id)' }
    ],
    indexes: [
      'CREATE INDEX idx_journal_ent_date ON journal_entries(date);'
    ]
  },
  {
    name: 'journal_entry_lines',
    category: 'Accounting & Financials',
    swahiliName: 'Vipengele vya Shajara',
    description: 'Balanced bookkeeping detail lines ensuring Debits equal Credits for complete double-entry integrity.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Bookkeeping line item primary key.', isPK: true },
      { name: 'journal_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent double-entry accounting block.', isFK: true, references: 'journal_entries(id)' },
      { name: 'account_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Bookkeeping account affected.', isFK: true, references: 'chart_of_accounts(id)' },
      { name: 'debit', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Debit column.' },
      { name: 'credit', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Credit column.' }
    ],
    indexes: [
      'CREATE INDEX idx_journal_lines_parent ON journal_entry_lines(journal_id);',
      'CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);'
    ]
  },
  {
    name: 'bank_accounts',
    category: 'Accounting & Financials',
    swahiliName: 'Akaunti za Benki',
    description: 'Sub-ledgers of corporate physical bank deposits, cards, and corporate mobile float balances.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Bank asset key.', isPK: true },
      { name: 'bank_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Financial institution title (e.g. NMB Bank, CRDB Bank, MPesa Cash Account).' },
      { name: 'account_number', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Bank routing card account number.' },
      { name: 'account_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Account holder trading title.' },
      { name: 'current_balance', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Real-time ledger bank asset balance.' }
    ],
    indexes: []
  },
  {
    name: 'expenses',
    category: 'Accounting & Financials',
    swahiliName: 'Matumizi',
    description: 'Operational expenses ledger tracking miscellaneous outlays (e.g. Rent, Electricity, Water).',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Expense database key.', isPK: true },
      { name: 'category_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Account category reference.', isFK: true, references: 'chart_of_accounts(id)' },
      { name: 'amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Monetary cost.' },
      { name: 'description', type: 'TEXT', description: 'Purpose description.' },
      { name: 'expense_date', type: 'DATE', constraints: ['NOT NULL', 'DEFAULT CURRENT_DATE'], description: 'Date incurred.' }
    ],
    indexes: [
      'CREATE INDEX idx_expenses_category ON expenses(category_id);',
      'CREATE INDEX idx_expenses_date ON expenses(expense_date);'
    ]
  },

  // --- LOAN MANAGEMENT ---
  {
    name: 'loan_products',
    category: 'Loan Management',
    swahiliName: 'Bidhaa za Mikopo',
    description: 'Loan structures managing interest rates, repayment tenures, grace periods, and late penalty schedules.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Loan product code.', isPK: true },
      { name: 'loan_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Loan title (e.g., SME Growth Loan, Executive Cash-back).' },
      { name: 'interest_rate', type: 'NUMERIC(5, 2)', constraints: ['NOT NULL'], description: 'Percentage rate per cycle.' },
      { name: 'maximum_amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Maximum allowable loan disbursement.' },
      { name: 'duration', type: 'INTEGER', constraints: ['NOT NULL'], description: 'Term duration in months or weeks.' }
    ],
    indexes: []
  },
  {
    name: 'loans',
    category: 'Loan Management',
    swahiliName: 'Mikopo',
    description: 'Issued microfinance accounts tracking principal disbursement, outstanding balances, and active states.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Loan contract identifier.', isPK: true },
      { name: 'customer_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Customer borrowing reference.', isFK: true, references: 'customers(id)' },
      { name: 'loan_product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Loan parameters framework.', isFK: true, references: 'loan_products(id)' },
      { name: 'principal', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Principal amount borrowed.' },
      { name: 'interest', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Calculated interest addition.' },
      { name: 'total_payable', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Net payable asset (principal + interest).' },
      { name: 'disbursement_date', type: 'DATE', constraints: ['NOT NULL'], description: 'Date loans transferred to debtor.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'"], description: 'Status: active, paid, defaulted, restructuring.' }
    ],
    indexes: [
      'CREATE INDEX idx_loans_customer ON loans(customer_id);',
      'CREATE INDEX idx_loans_status ON loans(status);'
    ]
  },
  {
    name: 'loan_repayments',
    category: 'Loan Management',
    swahiliName: 'Marejesho ya Mikopo',
    description: 'Payment receipts ledger tracking loan debt reductions, penalties, and outstanding balance remaining.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Repayments record index.', isPK: true },
      { name: 'loan_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Target loan contract.', isFK: true, references: 'loans(id)' },
      { name: 'amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Installment payment amount.' },
      { name: 'payment_date', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Date installment submitted.' },
      { name: 'balance', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Remaining loan balance after this installment.' }
    ],
    indexes: [
      'CREATE INDEX idx_loan_repay_parent ON loan_repayments(loan_id);'
    ]
  },

  // --- AFFILIATE & MLM ---
  {
    name: 'affiliates',
    category: 'Affiliate & MLM',
    swahiliName: 'Washirika na Uuzaji wa Mtandao',
    description: 'Partners in Multi-Level Marketing (MLM), holding specific tracking codes and commission wallets.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Affiliates identifier ID.', isPK: true },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Associated system user account.', isFK: true, references: 'users(id)' },
      { name: 'affiliate_code', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Custom code (e.g. HUREX-09).' },
      { name: 'referral_link', type: 'TEXT', constraints: ['NOT NULL'], description: 'Tracking URL.' },
      { name: 'qr_code', type: 'TEXT', description: 'Base64 QR representation for mobile scans.' },
      { name: 'wallet_balance', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Unwithdrawn commission earnings.' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_affiliate_user ON affiliates(user_id);',
      'CREATE INDEX idx_affiliate_code ON affiliates(affiliate_code);'
    ]
  },
  {
    name: 'affiliate_clicks',
    category: 'Affiliate & MLM',
    swahiliName: 'Mibofyo ya Washirika',
    description: 'Tracks click telemetry, counting geographic locations, IP tracking, and conversion funnels.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Telemetry unique ID.', isPK: true },
      { name: 'affiliate_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Referring partner reference.', isFK: true, references: 'affiliates(id)' },
      { name: 'ip_address', type: 'VARCHAR(45)', description: 'IPv4 or IPv6 of viewer.' },
      { name: 'device', type: 'VARCHAR(100)', description: 'Viewer client device (Mobile, Desktop, Tablet).' },
      { name: 'browser', type: 'VARCHAR(100)', description: 'Browser application metadata (Chrome, Safari, Firefox).' },
      { name: 'country', type: 'VARCHAR(100)', description: 'Country geolocation based on IP address.' },
      { name: 'clicked_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Exact click timestamp.' }
    ],
    indexes: [
      'CREATE INDEX idx_affiliate_clicks_id ON affiliate_clicks(affiliate_id);',
      'CREATE INDEX idx_affiliate_click_date ON affiliate_clicks(clicked_at);'
    ]
  },
  {
    name: 'affiliate_commissions',
    category: 'Affiliate & MLM',
    swahiliName: 'Tume za Washirika',
    description: 'Calculates multi-level sales commissions, generating payroll logs or direct affiliate wallet additions.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Commission record ledger.', isPK: true },
      { name: 'affiliate_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Earning partner reference.', isFK: true, references: 'affiliates(id)' },
      { name: 'sale_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Trigger sales order invoice.', isFK: true, references: 'sales_orders(id)' },
      { name: 'commission_rate', type: 'NUMERIC(5, 2)', constraints: ['NOT NULL'], description: 'Percentage rate applied (e.g., 5.00%).' },
      { name: 'commission_amount', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Monetary value allocated.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'unpaid'"], description: 'Status: unpaid, paid, cancelled.' }
    ],
    indexes: [
      'CREATE INDEX idx_aff_comm_id ON affiliate_commissions(affiliate_id);',
      'CREATE INDEX idx_aff_comm_sale ON affiliate_commissions(sale_id);'
    ]
  },

  // --- HUMAN RESOURCES & PAYROLL ---
  {
    name: 'employees',
    category: 'Human Resources & Payroll',
    swahiliName: 'Wafanyakazi',
    description: 'Registry of business personnel, storing roles, departments, base salary parameters, and bio logs.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Employee database index ID.', isPK: true },
      { name: 'employee_number', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Business payroll number.' },
      { name: 'first_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Given name.' },
      { name: 'last_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Family surname.' },
      { name: 'department_id', type: 'UUID', description: 'Assigned company department scope.', isFK: true, references: 'departments(id)' },
      { name: 'position', type: 'VARCHAR(150)', description: 'Operational job title (e.g., Cashier, General Accountant).' },
      { name: 'salary', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Agreed monthly gross basic salary.' }
    ],
    indexes: [
      'CREATE INDEX idx_employees_number ON employees(employee_number);',
      'CREATE INDEX idx_employees_dept ON employees(department_id);'
    ]
  },
  {
    name: 'departments',
    category: 'Human Resources & Payroll',
    swahiliName: 'Idara',
    description: 'Logical company departments (e.g., Sales, Logistics, Finance) for structured company organization.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Department primary key.', isPK: true },
      { name: 'department_name', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Department title.' }
    ],
    indexes: []
  },
  {
    name: 'attendance',
    category: 'Human Resources & Payroll',
    swahiliName: 'Mahudhurio',
    description: 'Tracks employee check-in/out logs, crucial for automated payroll deductions or hours calculations.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Attendance row record.', isPK: true },
      { name: 'employee_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Staff target lookup.', isFK: true, references: 'employees(id)' },
      { name: 'check_in', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['NOT NULL'], description: 'Clock-in time.' },
      { name: 'check_out', type: 'TIMESTAMP WITH TIME ZONE', description: 'Clock-out time.' }
    ],
    indexes: [
      'CREATE INDEX idx_attendance_employee ON attendance(employee_id);',
      'CREATE INDEX idx_attendance_date ON attendance(check_in);'
    ]
  },
  {
    name: 'payroll',
    category: 'Human Resources & Payroll',
    swahiliName: 'Mishahara',
    description: 'Automated monthly payroll calculator tracking basic salary, allowances, tax deductions (PAYE, NSSF), and net.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Payroll database slip UUID.', isPK: true },
      { name: 'employee_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Staff target paid.', isFK: true, references: 'employees(id)' },
      { name: 'basic_salary', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Standard basic rate.' },
      { name: 'allowances', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Overtime, bonuses, or fuel allowances.' },
      { name: 'deductions', type: 'NUMERIC(15, 2)', constraints: ["DEFAULT 0.00"], description: 'Payroll deductions, insurance, taxes.' },
      { name: 'net_salary', type: 'NUMERIC(15, 2)', constraints: ['NOT NULL'], description: 'Take-home salary (basic + allowances - deductions).' },
      { name: 'payroll_date', type: 'DATE', constraints: ['NOT NULL'], description: 'Payroll issuance date.' }
    ],
    indexes: [
      'CREATE INDEX idx_payroll_employee ON payroll(employee_id);',
      'CREATE INDEX idx_payroll_date ON payroll(payroll_date);'
    ]
  },

  // --- E-COMMERCE ---
  {
    name: 'online_stores',
    category: 'E-Commerce',
    swahiliName: 'Maduka ya Mtandaoni',
    description: 'Configures public e-commerce store instances, managing visual themes, slugs, and domain routing integrations.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'E-com store primary key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Owner business reference.', isFK: true, references: 'businesses(id)' },
      { name: 'store_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Public storefront trade label.' },
      { name: 'slug', type: 'VARCHAR(150)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Web url identifier slug (e.g. hurex-mall).' },
      { name: 'domain', type: 'VARCHAR(255)', description: 'Custom public internet domain mapping.' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_online_slug ON online_stores(slug);'
    ]
  },
  {
    name: 'shopping_carts',
    category: 'E-Commerce',
    swahiliName: 'Vikapu vya Manunuzi',
    description: 'Manages temporary customer shopping sessions, backing cart state across mobile, web, and offline.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Cart database row key.', isPK: true },
      { name: 'customer_id', type: 'UUID', description: 'Linked customer index (nullable for guest viewers).', isFK: true, references: 'customers(id)' },
      { name: 'session_id', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Anonymous guest browsing browser tracking token.' }
    ],
    indexes: [
      'CREATE INDEX idx_shop_cart_session ON shopping_carts(session_id);'
    ]
  },
  {
    name: 'cart_items',
    category: 'E-Commerce',
    swahiliName: 'Vitu Kwenye Kikapu',
    description: 'Line item records nested inside Shopping Carts, tracking quantities requested by shoppers.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Cart item unique ID.', isPK: true },
      { name: 'cart_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Associated shopping cart session.', isFK: true, references: 'shopping_carts(id)' },
      { name: 'product_id', type: 'UUID', constraints: ['NOT NULL'], description: 'SKU item selected.', isFK: true, references: 'products(id)' },
      { name: 'quantity', type: 'INTEGER', constraints: ['NOT NULL', 'CHECK (quantity > 0)'], description: 'Shopper volume selected.' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_cart_items_composite ON cart_items(cart_id, product_id);'
    ]
  },

  // --- REPORTING, NOTIFICATIONS & AUDIT ---
  {
    name: 'saved_reports',
    category: 'System Logging',
    swahiliName: 'Ripoti Zilizohifadhiwa',
    description: 'Saves user customized analytical reports, tracking reporting parameters, queries, and periodic filters.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Saved report record key.', isPK: true },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Creator user identifier.', isFK: true, references: 'users(id)' },
      { name: 'report_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Report title.' },
      { name: 'report_type', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Type: Sales_Summary, ProfitLoss, InventoryBalance, TaxAudit.' },
      { name: 'parameters', type: 'JSONB', description: 'Embedded query filters (e.g. date ranges, branches, categories).' }
    ],
    indexes: []
  },
  {
    name: 'notifications',
    category: 'System Logging',
    swahiliName: 'Taarifa',
    description: 'Sends real-time popups, SMS, or emails for stock alerts, loan due alerts, or system security events.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Notification unique key.', isPK: true },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Target user account recipient.', isFK: true, references: 'users(id)' },
      { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Brief subject.' },
      { name: 'message', type: 'TEXT', constraints: ['NOT NULL'], description: 'Detailed notification content.' },
      { name: 'notification_type', type: 'VARCHAR(100)', description: 'Type: StockAlert, LoanReminder, NewSale, SystemAlert.' },
      { name: 'read_status', type: 'BOOLEAN', constraints: ["DEFAULT FALSE"], description: 'Unread or read toggle state.' }
    ],
    indexes: [
      'CREATE INDEX idx_notif_user_unread ON notifications(user_id) WHERE read_status = FALSE;'
    ]
  },
  {
    name: 'activity_logs',
    category: 'System Logging',
    swahiliName: 'Kumbukumbu za Matendo',
    description: 'High-security immutable audit trail mapping all system transactions, security logins, and modifications.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Activity entry ledger UUID.', isPK: true },
      { name: 'user_id', type: 'UUID', description: 'Operator performing action (nullable for anonymous visitor clicks).', isFK: true, references: 'users(id)' },
      { name: 'action', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Description of action (e.g. UPDATE, INSERT, EXPORT, LOGIN).' },
      { name: 'module', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Target system module grouping.' },
      { name: 'record_id', type: 'VARCHAR(100)', description: 'UUID reference to targeted row modified.' },
      { name: 'old_data', type: 'JSONB', description: 'Row state snapshot before modification.' },
      { name: 'new_data', type: 'JSONB', description: 'Row state snapshot after modification.' },
      { name: 'ip_address', type: 'VARCHAR(45)', description: 'IPv4 or IPv6 of executor.' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', constraints: ['DEFAULT CURRENT_TIMESTAMP'], description: 'Exact time of record modification.' }
    ],
    indexes: [
      'CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);',
      'CREATE INDEX idx_activity_logs_module ON activity_logs(module);',
      'CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);'
    ]
  },
  {
    name: 'settings',
    category: 'System Logging',
    swahiliName: 'Mipangilio ya Mfumo',
    description: 'Stores business parameters, localization options, tax defaults, and multi-tenant UI styling presets.',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Settings ID key.', isPK: true },
      { name: 'business_id', type: 'UUID', constraints: ['NOT NULL'], description: 'Parent tenant business.', isFK: true, references: 'businesses(id)' },
      { name: 'language', type: 'VARCHAR(10)', constraints: ["DEFAULT 'sw'"], description: 'Default system interface language.' },
      { name: 'currency', type: 'VARCHAR(10)', constraints: ["DEFAULT 'TZS'"], description: 'Reporting currency.' },
      { name: 'timezone', type: 'VARCHAR(100)', constraints: ["DEFAULT 'Africa/Dar_es_Salaam'"], description: 'Localized operational timezone.' },
      { name: 'tax_rate', type: 'NUMERIC(5, 2)', constraints: ["DEFAULT 18.00"], description: 'Default standard tax calculation rate.' },
      { name: 'theme', type: 'VARCHAR(50)', constraints: ["DEFAULT 'light'"], description: 'System UI visual design choice.' },
      { name: 'logo', type: 'TEXT', description: 'Logo link.' }
    ],
    indexes: [
      'CREATE UNIQUE INDEX idx_settings_business ON settings(business_id);'
    ]
  }
];

export default function DatabaseSchema({ language = 'sw' }: { language: 'sw' | 'en' }) {
  const [activeView, setActiveView] = useState<'tables' | 'erd' | 'simulator' | 'exporter'>('tables');
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(ERP_TABLES_SCHEMA[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Exporter choices
  const [dialect, setDialect] = useState<'postgresql' | 'mysql' | 'drizzle'>('postgresql');
  const [copiedText, setCopiedText] = useState(false);

  // Trigger Simulator States
  const [simProduct, setSimProduct] = useState('Product_A');
  const [simQty, setSimQty] = useState(2);
  const [simPrice, setSimPrice] = useState(15000);
  const [simAffiliateCode, setSimAffiliateCode] = useState('HUREX-09');
  const [simIsCredit, setSimIsCredit] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // Filter tables list
  const filteredTables = ERP_TABLES_SCHEMA.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          table.swahiliName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          table.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          table.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = activeCategory === 'All' || table.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const generateSQLTableDDL = (table: TableDefinition): string => {
    let sql = `-- Table Schema: ${table.name} (${table.swahiliName})\n`;
    sql += `-- ${table.description}\n`;
    sql += `CREATE TABLE ${table.name} (\n`;
    
    const colLines = table.columns.map(col => {
      let line = `  ${col.name} ${col.type}`;
      if (col.constraints && col.constraints.length > 0) {
        line += ` ${col.constraints.join(' ')}`;
      }
      if (col.isFK && col.references) {
        line += ` REFERENCES ${col.references}`;
      }
      line += ` -- ${col.description}`;
      return line;
    });

    sql += colLines.join(',\n');
    sql += '\n);\n\n';

    if (table.indexes.length > 0) {
      sql += `-- Indexes & Performance Optimization\n`;
      sql += table.indexes.join('\n') + '\n\n';
    }

    return sql;
  };

  const generateDrizzleTS = (table: TableDefinition): string => {
    let ts = `// Drizzle ORM Schema definition for table: ${table.name}\n`;
    ts += `import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, integer, jsonb } from 'drizzle-orm/pg-core';\n`;
    if (table.columns.some(col => col.isFK)) {
      ts += `import { relations } from 'drizzle-orm';\n`;
    }
    ts += `\nexport const ${table.name} = pgTable('${table.name}', {\n`;

    const colLines = table.columns.map(col => {
      let line = `  ${col.name}: `;
      if (col.type === 'UUID') {
        line += `uuid('${col.name}')`;
        if (col.isPK) line += `.primaryKey().defaultRandom()`;
      } else if (col.type.startsWith('VARCHAR')) {
        const len = col.type.match(/\d+/)?.[0] || '255';
        line += `varchar('${col.name}', { length: ${len} })`;
      } else if (col.type === 'TEXT') {
        line += `text('${col.name}')`;
      } else if (col.type.startsWith('NUMERIC')) {
        const matches = col.type.match(/\d+,\s*\d+/);
        const precisionScale = matches ? matches[0].split(',') : ['15', '2'];
        line += `numeric('${col.name}', { precision: ${precisionScale[0].trim()}, scale: ${precisionScale[1].trim()} })`;
      } else if (col.type === 'BOOLEAN') {
        line += `boolean('${col.name}')`;
      } else if (col.type === 'INTEGER') {
        line += `integer('${col.name}')`;
      } else if (col.type === 'JSONB') {
        line += `jsonb('${col.name}')`;
      } else if (col.type === 'DATE') {
        line += `timestamp('${col.name}', { mode: 'string' })`;
      } else {
        line += `timestamp('${col.name}', { withTimezone: true })`;
      }

      if (col.constraints?.includes('NOT NULL')) {
        line += `.notNull()`;
      }
      
      const defaultVal = col.constraints?.find(c => c.startsWith('DEFAULT'));
      if (defaultVal) {
        const val = defaultVal.replace('DEFAULT ', '');
        if (val === 'CURRENT_TIMESTAMP') {
          line += `.defaultNow()`;
        } else if (val === 'TRUE' || val === 'FALSE') {
          line += `.default(${val.toLowerCase()})`;
        } else if (val.startsWith("'") && val.endsWith("'")) {
          line += `.default(${val})`;
        } else if (!isNaN(Number(val))) {
          line += `.default(${val})`;
        }
      }

      line += `, // ${col.description}`;
      return line;
    });

    ts += colLines.join('\n');
    ts += '\n});\n';
    return ts;
  };

  const getFullMasterSQL = (): string => {
    let sql = `-- =========================================================================\n`;
    sql += `-- HUREX ENTERPRISE ERP DATABASE SCHEMA MASTER SCRIPT (2026 STANDARD)\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n`;
    sql += `-- Compatible with PostgreSQL, Supabase, Neon, AWS RDS PostgreSQL\n`;
    sql += `-- =========================================================================\n\n`;
    sql += `CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n`;

    ERP_TABLES_SCHEMA.forEach(table => {
      sql += generateSQLTableDDL(table);
      sql += `\n-- -----------------------------------------------------\n\n`;
    });

    return sql;
  };

  const getFullDrizzleSchema = (): string => {
    let ts = `// =========================================================================\n`;
    ts += `// HUREX ENTERPRISE ERP DRIZZLE ORM SCHEMAS (2026 STANDARD)\n`;
    ts += `// =========================================================================\n\n`;
    ts += `import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';\n\n`;

    ERP_TABLES_SCHEMA.forEach(table => {
      ts += generateDrizzleTS(table);
      ts += `\n// -----------------------------------------------------\n\n`;
    });

    return ts;
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadMaster = () => {
    const content = dialect === 'postgresql' ? getFullMasterSQL() : getFullDrizzleSchema();
    const filename = dialect === 'postgresql' ? 'hurex_erp_master_schema.sql' : 'schema.ts';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Run database automation trigger simulation!
  const runTriggerSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(0);
    setSimLogs([]);

    const timestamp = new Date().toISOString();
    const orderId = 'so-' + Math.random().toString(36).substr(2, 9);
    const totalPayable = simQty * simPrice;
    const taxValue = parseFloat((totalPayable * 0.18).toFixed(2));
    const commissionValue = parseFloat((totalPayable * 0.05).toFixed(2));

    const steps = [
      {
        msg: `INITIALIZING SIMULATION... Starting POS/Online sales order trigger chain.`,
        code: `BEGIN TRANSACTION;`
      },
      {
        msg: `STEP 1: Inserting new sales order into [sales_orders] table.`,
        code: `INSERT INTO sales_orders (id, customer_id, invoice_number, subtotal, tax, discount, total, payment_status, order_status)\nVALUES ('${orderId}', 'cust-9988', 'INV-${Date.now()}', ${totalPayable}, ${taxValue}, 0.00, ${totalPayable + taxValue}, '${simIsCredit ? 'unpaid' : 'paid'}', 'completed');`
      },
      {
        msg: `STEP 2: Automated trigger fired: update warehouse stock inventory. Deducting [quantity] from [inventory] inside product [${simProduct}].`,
        code: `UPDATE inventory \nSET quantity = quantity - ${simQty}, reserved_quantity = reserved_quantity - ${simQty} \nWHERE product_id = (SELECT id FROM products WHERE sku = '${simProduct}') AND warehouse_id = 'wh-main';\n\n-- Stock movement audit logging:\nINSERT INTO stock_movements (product_id, warehouse_id, transaction_type, quantity, unit_cost, reference_number)\nVALUES ('prod-id', 'wh-main', 'Sale', -${simQty}, ${simPrice}, '${orderId}');`
      },
      {
        msg: `STEP 3: Trigger rule fired: Create double-entry bookkeeping ledgers. Chart of Accounts Journal Entry.`,
        code: `INSERT INTO journal_entries (id, journal_number, date, description)\nVALUES ('je-${Date.now()}', 'JN-${Date.now()}', CURRENT_DATE, 'Sales Invoice INV-${orderId}');\n\n-- Account ledger entries:\nINSERT INTO journal_entry_lines (journal_id, account_id, debit, credit)\nVALUES \n  ('je-id', 'acc-cash-10100', ${simIsCredit ? '0.00' : totalPayable + taxValue}, 0.00), -- Cash Debit\n  ('je-id', 'acc-receivable-10300', ${simIsCredit ? totalPayable + taxValue : '0.00'}, 0.00), -- Credit account if credit purchase\n  ('je-id', 'acc-revenue-40100', 0.00, ${totalPayable}), -- Sales Revenue Credit\n  ('je-id', 'acc-vat-liability-20200', 0.00, ${taxValue}); -- Tax collected`
      },
      {
        msg: `STEP 4: Affiliate MLM automated trigger activated. Calculating MLM partner commission for code: [${simAffiliateCode}].`,
        code: `-- Calculate 5% MLM partner commission:\nINSERT INTO affiliate_commissions (id, affiliate_id, sale_id, commission_rate, commission_amount, status)\nVALUES ('comm-${Date.now()}', 'aff-9988', '${orderId}', 5.00, ${commissionValue}, 'unpaid');\n\n-- Update affiliate wallet balance instantly:\nUPDATE affiliates \nSET wallet_balance = wallet_balance + ${commissionValue} \nWHERE affiliate_code = '${simAffiliateCode}';`
      },
      {
        msg: `STEP 5: Customer balance tracker updated. Adjusting credit customer ledger.`,
        code: simIsCredit 
          ? `UPDATE customers \nSET current_balance = current_balance - ${totalPayable + taxValue} \nWHERE id = 'cust-9988';\n\nINSERT INTO customer_transactions (customer_id, transaction_type, amount, balance)\nVALUES ('cust-9988', 'Invoice', -${totalPayable + taxValue}, (SELECT current_balance FROM customers WHERE id = 'cust-9988'));`
          : `-- Customer paid in Cash. Subledger bypassed.`
      },
      {
        msg: `STEP 6: Dispatching system alerts & notifications for managers and sales audit trace log.`,
        code: `INSERT INTO notifications (user_id, title, message, notification_type)\nVALUES ('user-admin', 'Mauzo Mapya', 'Duka la Mtandaoni limepokea mauzo ya TZS ${totalPayable + taxValue}', 'NewSale');\n\nINSERT INTO activity_logs (user_id, action, module, record_id, new_data)\nVALUES ('current-cashier', 'INSERT_SALE', 'Sales', '${orderId}', '{"total": ${totalPayable + taxValue}}');`
      },
      {
        msg: `TRANSACTION FULLY COMMITTED! All 2026 ERP relational tables successfully updated synchronously without conflicts.`,
        code: `COMMIT;`
      }
    ];

    for (let i = 0; i < steps.length; i++) {
      setSimulationStep(i);
      setSimLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[i].msg}`, `\n${steps[i].code}\n`]);
      // small delay to make it readable and interactive
      await new Promise(resolve => setTimeout(resolve, 1400));
    }

    setIsSimulating(false);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-250 dark:border-zinc-800 shadow-xl overflow-hidden animate-fade-in p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Database className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                {language === 'sw' ? 'Jopo la Sanifu ya Hifadhidata ya ERP (2026 Standard)' : 'Master ERP Database Schema Platform'}
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-200/50 dark:border-blue-900/40">v3.5 PRO</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                {language === 'sw' 
                  ? 'Muundo wa kimataifa wa hifadhidata ya uhusiano (PostgreSQL & Drizzle ORM) kwa mifumo ya POS, Mikopo, MLM, na CRM.' 
                  : 'A global standard relational database architecture supporting multi-tenant ERP, MLM, POS, and HR operations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-250 dark:border-zinc-800/60 gap-1">
          <button
            onClick={() => setActiveView('tables')}
            className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeView === 'tables'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Database className="w-4 h-4" />
            {language === 'sw' ? 'Matawi & Jedwali' : 'Tables Explorer'}
          </button>
          
          <button
            onClick={() => setActiveView('erd')}
            className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeView === 'erd'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Network className="w-4 h-4" />
            {language === 'sw' ? 'Chati ya Uhusiano (ERD)' : 'Relational Map (ERD)'}
          </button>

          <button
            onClick={() => setActiveView('simulator')}
            className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeView === 'simulator'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <Cpu className="w-4 h-4 animate-spin-slow" />
            {language === 'sw' ? 'Kisimulizi cha Trigger' : 'Automation Simulator'}
          </button>

          <button
            onClick={() => setActiveView('exporter')}
            className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeView === 'exporter'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
            }`}
          >
            <FileCode className="w-4 h-4" />
            {language === 'sw' ? 'Hamisha SQL/Drizzle' : 'SQL Exporter'}
          </button>
        </div>
      </div>

      {/* VIEW 1: TABLES EXPLORER */}
      {activeView === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar navigation for tables */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={language === 'sw' ? 'Tafuta jedwali au safu...' : 'Search table or column...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-white rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <button
                onClick={() => setActiveCategory('All')}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  activeCategory === 'All'
                    ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {language === 'sw' ? 'Vyote' : 'All'}
              </button>
              {DATABASE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Table Buttons List */}
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredTables.map(table => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                    selectedTable.name === table.name
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 shadow-xs'
                      : 'bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 border-transparent'
                  }`}
                >
                  <span className="font-mono">{table.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md font-bold">
                    {table.columns.length} cols
                  </span>
                </button>
              ))}
              {filteredTables.length === 0 && (
                <div className="text-center py-8 text-zinc-400 text-xs font-bold">
                  {language === 'sw' ? 'Hakuna jedwali lililopatikana' : 'No tables found'}
                </div>
              )}
            </div>
          </div>

          {/* Table Schema Detail view */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {selectedTable.category}
                  </div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="font-mono">{selectedTable.name}</span>
                    <span className="text-xs font-bold text-zinc-400 font-sans">({selectedTable.swahiliName})</span>
                  </h3>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'sw' ? 'Salama & Thabiti' : 'Verified Secure'}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-bold leading-relaxed mb-6">
                {selectedTable.description}
              </p>

              {/* Columns list table */}
              <div className="overflow-x-auto border border-zinc-150 dark:border-zinc-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">{language === 'sw' ? 'Safu / Column' : 'Column Name'}</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Attributes</th>
                      <th className="px-4 py-3">{language === 'sw' ? 'Maelezo / Maana' : 'Description'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 font-bold">
                    {selectedTable.columns.map(col => (
                      <tr key={col.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                        <td className="px-4 py-3.5 font-mono text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {col.isPK && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase" title="Primary Key">PK</span>
                          )}
                          {col.isFK && (
                            <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase" title={`Foreign Key: links to ${col.references}`}>FK</span>
                          )}
                          <span>{col.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-blue-600 dark:text-blue-400 font-mono text-[11px]">{col.type}</td>
                        <td className="px-4 py-3.5">
                          {col.constraints && col.constraints.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {col.constraints.map(cons => (
                                <span key={cons} className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                                  {cons}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400 leading-normal text-[11px] font-sans">
                          {col.description}
                          {col.isFK && col.references && (
                            <span className="block mt-1 text-[10px] text-blue-500 dark:text-blue-400">
                              → References: {col.references}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show Code representation */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center bg-zinc-950 text-white rounded-t-2xl px-4 py-2 text-xs font-mono">
                  <span>{dialect === 'postgresql' ? 'SQL DDL Definition' : 'Drizzle schema.ts (TypeScript)'}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDialect('postgresql')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${dialect === 'postgresql' ? 'bg-blue-600' : 'bg-zinc-800'}`}
                    >
                      PostgreSQL
                    </button>
                    <button 
                      onClick={() => setDialect('drizzle')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${dialect === 'drizzle' ? 'bg-blue-600' : 'bg-zinc-800'}`}
                    >
                      Drizzle ORM
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-[11px] rounded-b-2xl overflow-x-auto max-h-[300px] leading-relaxed">
                    {dialect === 'postgresql' ? generateSQLTableDDL(selectedTable) : generateDrizzleTS(selectedTable)}
                  </pre>
                  <button
                    onClick={() => handleCopyText(dialect === 'postgresql' ? generateSQLTableDDL(selectedTable) : generateDrizzleTS(selectedTable))}
                    className="absolute top-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: ERD RELATIONSHIP VISUAL MAP */}
      {activeView === 'erd' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4.5 h-4.5 text-blue-500" />
                {language === 'sw' ? 'Chati Inayohusiana ya ERP Database (Visual Entity Relationship)' : 'Visual Relational Entity Relationship Diagram'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                {language === 'sw'
                  ? 'Bofya jedwali lolote ili kuona uhusiano wake thabiti, funguo za kigeni (FK), na jinsi linavyoungana na jedwali lingine katika mfumo.'
                  : 'Click on any table node to see its dynamic foreign keys, connections, and structural bonds across modules.'}
              </p>
            </div>
          </div>

          {/* Interactive Node Graph */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Visual Grid of Modules */}
            <div className="md:col-span-8 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 relative min-h-[450px] flex flex-col justify-between">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ERP_TABLES_SCHEMA.slice(0, 15).map(tbl => {
                  const isSelected = tbl.name === selectedTable.name;
                  const isRelated = tbl.columns.some(c => c.isFK && c.references?.startsWith(selectedTable.name)) ||
                                    selectedTable.columns.some(c => c.isFK && c.references?.startsWith(tbl.name));
                  
                  return (
                    <button
                      key={tbl.name}
                      onClick={() => setSelectedTable(tbl)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 scale-102 ring-4 ring-blue-500/25 shadow-lg' 
                          : isRelated 
                            ? 'bg-amber-50/80 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900/40 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Database className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-75 block max-w-full truncate">{tbl.category}</span>
                      </div>
                      <h4 className="text-[11px] font-black font-mono truncate">{tbl.name}</h4>
                      <p className="text-[9px] opacity-70 mt-1 truncate">{language === 'sw' ? tbl.swahiliName : tbl.name}</p>
                    </button>
                  );
                })}
              </div>

              {/* Legends explanation */}
              <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-800 text-[10px] font-bold mt-6">
                <span className="flex items-center gap-1 text-zinc-500">
                  <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                  {language === 'sw' ? 'Jedwali Lililochaguliwa' : 'Selected Table'}
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <span className="w-3 h-3 bg-amber-400 dark:bg-amber-850 rounded-sm"></span>
                  {language === 'sw' ? 'Uhusiano wa Moja kwa Moja (FK)' : 'Direct Relationship (FK)'}
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <span className="w-3 h-3 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-sm"></span>
                  {language === 'sw' ? 'Jedwali Lingine la ERP' : 'Independent ERP Table'}
                </span>
              </div>

            </div>

            {/* Relationship summary panel */}
            <div className="md:col-span-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-black text-zinc-850 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
                {language === 'sw' ? 'Tafsiri ya Uhusiano' : 'Relationship Context'}
              </h4>

              <div className="space-y-4 text-xs font-bold">
                
                {/* Outgoing relationships (Foreign Keys the selected table has) */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                    {language === 'sw' ? 'Funguo za Nje Inazochukua (FK Outgoing)' : 'References / Outgoing FKs'}
                  </div>
                  {selectedTable.columns.some(c => c.isFK) ? (
                    <div className="space-y-1.5">
                      {selectedTable.columns.filter(c => c.isFK).map(col => (
                        <div key={col.name} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <span className="font-mono text-[10px] text-zinc-900 dark:text-white">{col.name}</span>
                            <span className="text-[10px] text-zinc-400 mx-1">→</span>
                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{col.references}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-400 text-[11px]">
                      {language === 'sw' ? 'Jedwali hili halichukui funguo yoyote ya nje.' : 'No outgoing references.'}
                    </div>
                  )}
                </div>

                {/* Incoming relationships (Other tables referencing the selected table) */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                    {language === 'sw' ? 'Inayotumiwa na Jedwali Nyingine (FK Incoming)' : 'Referenced By / Incoming FKs'}
                  </div>
                  {ERP_TABLES_SCHEMA.some(tbl => tbl.columns.some(c => c.isFK && c.references?.startsWith(selectedTable.name))) ? (
                    <div className="space-y-1.5">
                      {ERP_TABLES_SCHEMA.filter(tbl => tbl.columns.some(c => c.isFK && c.references?.startsWith(selectedTable.name))).map(tbl => {
                        const col = tbl.columns.find(c => c.isFK && c.references?.startsWith(selectedTable.name));
                        return (
                          <div key={tbl.name} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                              <span className="font-mono text-[10px] text-zinc-900 dark:text-white">{tbl.name}</span>
                              <span className="text-[10px] text-zinc-400 mx-1">({col?.name})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-zinc-400 text-[11px]">
                      {language === 'sw' ? 'Hakuna jedwali linalorejelea hili kwa sasa.' : 'No tables reference this.'}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: AUTOMATION AND TRIGGER SIMULATOR */}
      {activeView === 'simulator' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-blue-500 animate-spin-slow" />
              {language === 'sw' ? 'Kisimulizi cha Trigger za Ndani ya Hifadhidata ya ERP' : 'Enterprise Relational Trigger & Automation Simulator'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-1">
              {language === 'sw'
                ? 'Jionee jinsi hifadhidata inavyosasisha stoki, hesabu, MLM, na kurekodi madaftari ya fedha atomically na synchronously kupitia sheria za database triggers.'
                : 'Simulate transactional workloads to witness inventory deductions, double-entry ledger balancing, and MLM payouts executing synchronously.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Simulation controls form */}
            <div className="lg:col-span-5 space-y-4 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs">
              
              <div className="space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">{language === 'sw' ? 'Bidhaa ya Mauzo' : 'Select Product SKU'}</label>
                <select
                  value={simProduct}
                  onChange={(e) => setSimProduct(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold"
                >
                  <option value="HUREX-SUNGURA-CEMENT">HUREX SUNGURA CEMENT (wh-main)</option>
                  <option value="HUREX-PIPE-25MM">HUREX CONDUIT PIPE 25MM (wh-main)</option>
                  <option value="HUREX-LED-PANEL">HUREX LED SMART PANEL 18W (wh-main)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-600 dark:text-zinc-400">{language === 'sw' ? 'Idadi / Quantity' : 'Sale Quantity'}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-600 dark:text-zinc-400">{language === 'sw' ? 'Bei / Price' : 'Unit Price (TZS)'}</label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">{language === 'sw' ? 'Msimbo wa Kushiriki MLM' : 'Affiliate Partner MLM Code'}</label>
                <input
                  type="text"
                  value={simAffiliateCode}
                  onChange={(e) => setSimAffiliateCode(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="sim_credit"
                  checked={simIsCredit}
                  onChange={(e) => setSimIsCredit(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="sim_credit" className="text-zinc-700 dark:text-zinc-300 select-none">
                  {language === 'sw' ? 'Mauzo ya Mkopo (Haitatumia Cash)' : 'Credit Sale (Invoice on Acc)'}
                </label>
              </div>

              <button
                onClick={runTriggerSimulation}
                disabled={isSimulating}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>
                  {isSimulating 
                    ? (language === 'sw' ? 'Kisimulizi Kinafanya Kazi...' : 'Running Live Triggers...') 
                    : (language === 'sw' ? 'Anzisha Kisimulizi cha Database' : 'Execute Database Workload')}
                </span>
              </button>

            </div>

            {/* Simulated Live Database Terminal log */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-950 text-emerald-400 p-5 rounded-3xl border border-zinc-800 relative min-h-[350px] font-mono text-[11px] leading-relaxed">
              
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-black">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>ERP SYSTEM CONSOLE</span>
              </div>

              <div className="space-y-4 max-h-[360px] overflow-y-auto scrollbar-thin pr-2 flex-1">
                {simLogs.length === 0 ? (
                  <div className="text-zinc-500 py-16 text-center select-none space-y-2">
                    <p className="font-bold text-xs uppercase tracking-widest text-zinc-400">System Ready / Hifadhi Ipo Tayari</p>
                    <p className="text-[10px]">Configure workload variables on the left, then click "Execute" to output transactional SQL queries and automated trigger sequences.</p>
                  </div>
                ) : (
                  simLogs.map((log, index) => {
                    const isCode = log.startsWith('\n') || log.startsWith('INSERT') || log.startsWith('UPDATE') || log.startsWith('BEGIN') || log.startsWith('COMMIT');
                    return (
                      <div key={index} className={isCode ? "text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900 overflow-x-auto whitespace-pre-wrap select-text" : "text-emerald-400 font-bold"}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>

              {isSimulating && (
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-zinc-400 text-[10px] select-none">
                  <span className="flex items-center gap-1.5 animate-pulse text-blue-400 font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    Executing Step {simulationStep + 1} of 8...
                  </span>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* VIEW 4: SYSTEM EXPORTER (SQL, TYPESCRIPT DRIZZLE) */}
      {activeView === 'exporter' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4.5 h-4.5 text-blue-500" />
                {language === 'sw' ? 'Hamisha Muundo Kamili (Master Exporter)' : 'Full Master Schema Exporter'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                {language === 'sw'
                  ? 'Nakili au pakua msimbo kamili wa madaftari ya database (SQL au Drizzle ORM) tayari kuanza kutumiwa katika mradi wako wa uzalishaji.'
                  : 'Copy or download the entire ERP relational database code (SQL scripts or Drizzle ORM models) ready for immediate production deployment.'}
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setDialect('postgresql')}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  dialect === 'postgresql'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                PostgreSQL Script (.sql)
              </button>
              <button
                onClick={() => setDialect('drizzle')}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  dialect === 'drizzle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                Drizzle ORM (schema.ts)
              </button>
            </div>
          </div>

          {/* Action buttons copy / download */}
          <div className="flex gap-3 justify-end text-xs font-black uppercase tracking-wider">
            <button
              onClick={() => handleCopyText(dialect === 'postgresql' ? getFullMasterSQL() : getFullDrizzleSchema())}
              className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-800 dark:text-white rounded-xl flex items-center gap-1.5 transition border border-zinc-200 dark:border-zinc-800"
            >
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>{copiedText ? (language === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (language === 'sw' ? 'Nakili Msimbo Kamili' : 'Copy Complete Code')}</span>
            </button>
            <button
              onClick={handleDownloadMaster}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-100" />
              <span>{language === 'sw' ? 'Pakua Faili Schema' : 'Download Schema File'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="p-6 bg-zinc-950 text-zinc-100 font-mono text-[10px] rounded-3xl overflow-x-auto max-h-[480px] leading-relaxed select-text">
              {dialect === 'postgresql' ? getFullMasterSQL() : getFullDrizzleSchema()}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
}
