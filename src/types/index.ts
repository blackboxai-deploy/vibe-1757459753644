// تعريف أنواع البيانات لبرنامج حسابات أطلس يو بي سي

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // الرصيد - موجب يعني دائن، سالب يعني مدين
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string; // وحدة القياس
  costPrice: number; // سعر الشراء
  sellingPrice: number; // سعر البيع
  quantity: number; // الكمية المتاحة
  minQuantity: number; // الحد الأدنى للكمية
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  paymentMethod: 'cash' | 'credit' | 'bank_transfer' | 'check';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  paymentMethod: 'cash' | 'credit' | 'bank_transfer' | 'check';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  type: 'sale' | 'purchase' | 'customer_payment' | 'expense';
  referenceId: string; // معرف الفاتورة أو العميل
  amount: number;
  method: 'cash' | 'credit' | 'bank_transfer' | 'check';
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalProfit: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
  lowStockItems: number;
  todaySales: number;
  todayProfit: number;
  thisMonthSales: number;
  thisMonthProfit: number;
}

export interface Settings {
  companyName: string;
  companyPhone: string;
  companyAddress: string;
  currency: string;
  taxRate: number;
  password: string;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
}

export interface StockAlert {
  productId: string;
  productName: string;
  currentQuantity: number;
  minQuantity: number;
  status: 'low' | 'out_of_stock';
}

export interface CustomerStatement {
  customerId: string;
  customerName: string;
  transactions: Array<{
    id: string;
    date: string;
    type: 'sale' | 'payment';
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
}

export interface ProfitReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  breakdown: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

export type NavigationItem = {
  id: string;
  name: string;
  icon: string;
  component: string;
};