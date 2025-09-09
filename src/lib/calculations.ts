// مكتبة الحسابات والإحصائيات لبرنامج أطلس يو بي سي

import { Sale, Purchase, Customer, Product, DashboardStats, StockAlert, ProfitReport } from '@/types';
import { customerStorage, productStorage, saleStorage, purchaseStorage } from './storage';

// حساب إجمالي المبيعات
export const calculateTotalSales = (sales: Sale[] = saleStorage.getAll()): number => {
  return sales.reduce((total, sale) => total + sale.total, 0);
};

// حساب إجمالي المشتريات
export const calculateTotalPurchases = (purchases: Purchase[] = purchaseStorage.getAll()): number => {
  return purchases.reduce((total, purchase) => total + purchase.total, 0);
};

// حساب إجمالي الأرباح
export const calculateTotalProfit = (
  sales: Sale[] = saleStorage.getAll(),
  products: Product[] = productStorage.getAll()
): number => {
  let totalProfit = 0;
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const profit = (item.unitPrice - product.costPrice) * item.quantity;
        totalProfit += profit;
      }
    });
  });
  
  return totalProfit;
};

// حساب إجمالي مديونية العملاء
export const calculateCustomerDebt = (customers: Customer[] = customerStorage.getAll()): number => {
  return customers.reduce((total, customer) => {
    return total + (customer.balance < 0 ? Math.abs(customer.balance) : 0);
  }, 0);
};

// حساب المبيعات اليوم
export const calculateTodaySales = (sales: Sale[] = saleStorage.getAll()): number => {
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt).toDateString();
    return saleDate === today;
  });
  
  return calculateTotalSales(todaySales);
};

// حساب أرباح اليوم
export const calculateTodayProfit = (
  sales: Sale[] = saleStorage.getAll(),
  products: Product[] = productStorage.getAll()
): number => {
  const today = new Date().toDateString();
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt).toDateString();
    return saleDate === today;
  });
  
  return calculateTotalProfit(todaySales, products);
};

// حساب المبيعات الشهرية
export const calculateMonthSales = (sales: Sale[] = saleStorage.getAll()): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  
  return calculateTotalSales(monthSales);
};

// حساب أرباح الشهر
export const calculateMonthProfit = (
  sales: Sale[] = saleStorage.getAll(),
  products: Product[] = productStorage.getAll()
): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  
  return calculateTotalProfit(monthSales, products);
};

// حساب المنتجات منخفضة المخزون
export const calculateLowStockItems = (products: Product[] = productStorage.getAll()): StockAlert[] => {
  return products.filter(product => product.quantity <= product.minQuantity)
    .map(product => ({
      productId: product.id,
      productName: product.name,
      currentQuantity: product.quantity,
      minQuantity: product.minQuantity,
      status: product.quantity === 0 ? 'out_of_stock' as const : 'low' as const
    }));
};

// إحصائيات لوحة التحكم
export const calculateDashboardStats = (): DashboardStats => {
  const sales = saleStorage.getAll();
  const purchases = purchaseStorage.getAll();
  const customers = customerStorage.getAll();
  const products = productStorage.getAll();
  
  return {
    totalSales: calculateTotalSales(sales),
    totalPurchases: calculateTotalPurchases(purchases),
    totalProfit: calculateTotalProfit(sales, products),
    totalCustomerDebt: calculateCustomerDebt(customers),
    totalSupplierDebt: 0, // سيتم حسابه لاحقاً من المشتريات غير المدفوعة
    lowStockItems: calculateLowStockItems(products).length,
    todaySales: calculateTodaySales(sales),
    todayProfit: calculateTodayProfit(sales, products),
    thisMonthSales: calculateMonthSales(sales),
    thisMonthProfit: calculateMonthProfit(sales, products)
  };
};

// حساب تقرير الأرباح
export const generateProfitReport = (
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate: string,
  endDate: string
): ProfitReport => {
  const sales = saleStorage.getAll();
  const products = productStorage.getAll();
  
  // تصفية المبيعات حسب الفترة
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return saleDate >= start && saleDate <= end;
  });
  
  // حساب الإجماليات
  const totalRevenue = calculateTotalSales(filteredSales);
  let totalCost = 0;
  
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalCost += product.costPrice * item.quantity;
      }
    });
  });
  
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // إنشاء التفصيل اليومي
  const breakdown: Array<{
    date: string;
    revenue: number;
    cost: number;
    profit: number;
  }> = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateStr = currentDate.toDateString();
    const daySales = filteredSales.filter(sale => {
      return new Date(sale.createdAt).toDateString() === dateStr;
    });
    
    const dayRevenue = calculateTotalSales(daySales);
    let dayCost = 0;
    
    daySales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          dayCost += product.costPrice * item.quantity;
        }
      });
    });
    
    breakdown.push({
      date: currentDate.toISOString().split('T')[0],
      revenue: dayRevenue,
      cost: dayCost,
      profit: dayRevenue - dayCost
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    period,
    startDate,
    endDate,
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    breakdown
  };
};

// حساب كشف حساب العميل
export const generateCustomerStatement = (customerId: string, startDate?: string, endDate?: string) => {
  const customer = customerStorage.findById(customerId);
  if (!customer) return null;
  
  const sales = saleStorage.getAll();
  
  // تصفية المبيعات للعميل
  let customerSales = sales.filter(sale => sale.customerId === customerId);
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    customerSales = customerSales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }
  
  // إنشاء المعاملات
  const transactions: Array<{
    id: string;
    date: string;
    type: 'sale' | 'payment';
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }> = [];
  
  let runningBalance = 0;
  
  customerSales.forEach(sale => {
    runningBalance += sale.total;
    transactions.push({
      id: sale.id,
      date: sale.createdAt,
      type: 'sale',
      description: `فاتورة مبيعات - ${sale.items.length} منتج`,
      debit: sale.total,
      credit: 0,
      balance: runningBalance
    });
    
    if (sale.paid > 0) {
      runningBalance -= sale.paid;
      transactions.push({
        id: `${sale.id}_payment`,
        date: sale.createdAt,
        type: 'payment',
        description: 'دفعة على الحساب',
        debit: 0,
        credit: sale.paid,
        balance: runningBalance
      });
    }
  });
  
  // ترتيب المعاملات حسب التاريخ
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalDebit = transactions.reduce((sum, trans) => sum + trans.debit, 0);
  const totalCredit = transactions.reduce((sum, trans) => sum + trans.credit, 0);
  
  return {
    customerId,
    customerName: customer.name,
    transactions,
    totalDebit,
    totalCredit,
    finalBalance: totalDebit - totalCredit
  };
};

// حساب معدل دوران المخزون
export const calculateInventoryTurnover = (productId: string): number => {
  const sales = saleStorage.getAll();
  const product = productStorage.findById(productId);
  
  if (!product) return 0;
  
  // حساب إجمالي الكمية المباعة في آخر 12 شهر
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const recentSales = sales.filter(sale => new Date(sale.createdAt) >= twelveMonthsAgo);
  
  const totalSold = recentSales.reduce((total, sale) => {
    const item = sale.items.find(i => i.productId === productId);
    return total + (item ? item.quantity : 0);
  }, 0);
  
  // معدل دوران المخزون = إجمالي المبيعات ÷ متوسط المخزون
  const averageInventory = product.quantity + (totalSold / 2);
  return averageInventory > 0 ? totalSold / averageInventory : 0;
};

// حساب أفضل المنتجات مبيعاً
export const getTopSellingProducts = (limit: number = 10): Array<{
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}> => {
  const sales = saleStorage.getAll();
  const products = productStorage.getAll();
  
  const productSales = new Map<string, { quantity: number; revenue: number }>();
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
      productSales.set(item.productId, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.total
      });
    });
  });
  
  return Array.from(productSales.entries())
    .map(([productId, data]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        productName: product ? product.name : 'منتج محذوف',
        totalSold: data.quantity,
        totalRevenue: data.revenue
      };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
};

// حساب أفضل العملاء
export const getTopCustomers = (limit: number = 10): Array<{
  customerId: string;
  customerName: string;
  totalPurchases: number;
  totalSpent: number;
}> => {
  const sales = saleStorage.getAll();
  const customers = customerStorage.getAll();
  
  const customerPurchases = new Map<string, { count: number; total: number }>();
  
  sales.forEach(sale => {
    if (sale.customerId) {
      const existing = customerPurchases.get(sale.customerId) || { count: 0, total: 0 };
      customerPurchases.set(sale.customerId, {
        count: existing.count + 1,
        total: existing.total + sale.total
      });
    }
  });
  
  return Array.from(customerPurchases.entries())
    .map(([customerId, data]) => {
      const customer = customers.find(c => c.id === customerId);
      return {
        customerId,
        customerName: customer ? customer.name : 'عميل محذوف',
        totalPurchases: data.count,
        totalSpent: data.total
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

// تنسيق الأرقام للعرض
export const formatCurrency = (amount: number, currency: string = 'ريال'): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

// تنسيق التاريخ
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// تنسيق التاريخ المختصر
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA');
};