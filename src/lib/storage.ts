// مكتبة إدارة التخزين المحلي لبرنامج أطلس يو بي سي

import { Customer, Product, Sale, Purchase, Settings } from '@/types';

// مفاتيح التخزين
const STORAGE_KEYS = {
  CUSTOMERS: 'atlas_customers',
  PRODUCTS: 'atlas_products',
  SALES: 'atlas_sales',
  PURCHASES: 'atlas_purchases',
  PAYMENTS: 'atlas_payments',
  SETTINGS: 'atlas_settings',
  PASSWORD: 'atlas_password',
  IS_AUTHENTICATED: 'atlas_auth',
} as const;

// تشفير بسيط للبيانات الحساسة
const encrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const decrypt = (encodedText: string): string => {
  try {
    return decodeURIComponent(atob(encodedText));
  } catch {
    return '';
  }
};

// دوال التخزين العامة
export const storage = {
  // حفظ البيانات
  set: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // استرجاع البيانات
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // حذف البيانات
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // مسح جميع البيانات
  clear: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// دوال إدارة كلمة المرور
export const passwordManager = {
  // تعيين كلمة مرور جديدة
  setPassword: (password: string): void => {
    const encryptedPassword = encrypt(password);
    storage.set(STORAGE_KEYS.PASSWORD, encryptedPassword);
  },

  // التحقق من كلمة المرور
  verifyPassword: (password: string): boolean => {
    const storedPassword = storage.get(STORAGE_KEYS.PASSWORD, '');
    if (!storedPassword) return false;
    
    const decryptedPassword = decrypt(storedPassword);
    return decryptedPassword === password;
  },

  // التحقق من وجود كلمة مرور
  hasPassword: (): boolean => {
    const password = storage.get(STORAGE_KEYS.PASSWORD, '');
    return password !== '';
  },

  // تسجيل الدخول
  login: (password: string): boolean => {
    if (passwordManager.verifyPassword(password)) {
      storage.set(STORAGE_KEYS.IS_AUTHENTICATED, true);
      return true;
    }
    return false;
  },

  // تسجيل الخروج
  logout: (): void => {
    storage.remove(STORAGE_KEYS.IS_AUTHENTICATED);
  },

  // التحقق من حالة تسجيل الدخول
  isAuthenticated: (): boolean => {
    return storage.get(STORAGE_KEYS.IS_AUTHENTICATED, false);
  }
};

// دوال إدارة العملاء
export const customerStorage = {
  // الحصول على جميع العملاء
  getAll: (): Customer[] => {
    return storage.get(STORAGE_KEYS.CUSTOMERS, []);
  },

  // إضافة عميل جديد
  add: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = customerStorage.getAll();
    const newCustomer: Customer = {
      ...customer,
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    customers.push(newCustomer);
    storage.set(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  // تحديث عميل
  update: (id: string, updates: Partial<Customer>): Customer | null => {
    const customers = customerStorage.getAll();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.CUSTOMERS, customers);
    return customers[index];
  },

  // حذف عميل
  delete: (id: string): boolean => {
    const customers = customerStorage.getAll();
    const filteredCustomers = customers.filter(c => c.id !== id);
    
    if (filteredCustomers.length === customers.length) return false;
    
    storage.set(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
    return true;
  },

  // البحث عن عميل
  findById: (id: string): Customer | null => {
    const customers = customerStorage.getAll();
    return customers.find(c => c.id === id) || null;
  },

  // البحث بالاسم
  findByName: (name: string): Customer[] => {
    const customers = customerStorage.getAll();
    return customers.filter(c => 
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  }
};

// دوال إدارة المنتجات
export const productStorage = {
  // الحصول على جميع المنتجات
  getAll: (): Product[] => {
    return storage.get(STORAGE_KEYS.PRODUCTS, []);
  },

  // إضافة منتج جديد
  add: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const products = productStorage.getAll();
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    storage.set(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  // تحديث منتج
  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = productStorage.getAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },

  // حذف منتج
  delete: (id: string): boolean => {
    const products = productStorage.getAll();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    storage.set(STORAGE_KEYS.PRODUCTS, filteredProducts);
    return true;
  },

  // البحث عن منتج
  findById: (id: string): Product | null => {
    const products = productStorage.getAll();
    return products.find(p => p.id === id) || null;
  },

  // تحديث الكمية
  updateQuantity: (id: string, quantity: number): boolean => {
    const product = productStorage.findById(id);
    if (!product) return false;
    
    return productStorage.update(id, { quantity }) !== null;
  }
};

// دوال إدارة المبيعات
export const saleStorage = {
  // الحصول على جميع المبيعات
  getAll: (): Sale[] => {
    return storage.get(STORAGE_KEYS.SALES, []);
  },

  // إضافة مبيعة جديدة
  add: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Sale => {
    const sales = saleStorage.getAll();
    const newSale: Sale = {
      ...sale,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sales.push(newSale);
    storage.set(STORAGE_KEYS.SALES, sales);
    return newSale;
  },

  // تحديث مبيعة
  update: (id: string, updates: Partial<Sale>): Sale | null => {
    const sales = saleStorage.getAll();
    const index = sales.findIndex(s => s.id === id);
    
    if (index === -1) return null;
    
    sales[index] = {
      ...sales[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.SALES, sales);
    return sales[index];
  },

  // حذف مبيعة
  delete: (id: string): boolean => {
    const sales = saleStorage.getAll();
    const filteredSales = sales.filter(s => s.id !== id);
    
    if (filteredSales.length === sales.length) return false;
    
    storage.set(STORAGE_KEYS.SALES, filteredSales);
    return true;
  }
};

// دوال إدارة المشتريات
export const purchaseStorage = {
  // الحصول على جميع المشتريات
  getAll: (): Purchase[] => {
    return storage.get(STORAGE_KEYS.PURCHASES, []);
  },

  // إضافة مشترى جديد
  add: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>): Purchase => {
    const purchases = purchaseStorage.getAll();
    const newPurchase: Purchase = {
      ...purchase,
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    purchases.push(newPurchase);
    storage.set(STORAGE_KEYS.PURCHASES, purchases);
    return newPurchase;
  },

  // تحديث مشترى
  update: (id: string, updates: Partial<Purchase>): Purchase | null => {
    const purchases = purchaseStorage.getAll();
    const index = purchases.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    purchases[index] = {
      ...purchases[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    storage.set(STORAGE_KEYS.PURCHASES, purchases);
    return purchases[index];
  },

  // حذف مشترى
  delete: (id: string): boolean => {
    const purchases = purchaseStorage.getAll();
    const filteredPurchases = purchases.filter(p => p.id !== id);
    
    if (filteredPurchases.length === purchases.length) return false;
    
    storage.set(STORAGE_KEYS.PURCHASES, filteredPurchases);
    return true;
  }
};

// دوال إدارة الإعدادات
export const settingsStorage = {
  // الحصول على الإعدادات
  get: (): Settings => {
    const defaultSettings: Settings = {
      companyName: 'أطلس يو بي سي',
      companyPhone: '',
      companyAddress: '',
      currency: 'ريال',
      taxRate: 0.15,
      password: '',
      theme: 'light',
      language: 'ar'
    };
    
    return storage.get(STORAGE_KEYS.SETTINGS, defaultSettings);
  },

  // تحديث الإعدادات
  update: (updates: Partial<Settings>): Settings => {
    const currentSettings = settingsStorage.get();
    const newSettings = { ...currentSettings, ...updates };
    storage.set(STORAGE_KEYS.SETTINGS, newSettings);
    return newSettings;
  }
};

// دوال النسخ الاحتياطي
export const backup = {
  // تصدير البيانات
  export: (): string => {
    const data = {
      customers: customerStorage.getAll(),
      products: productStorage.getAll(),
      sales: saleStorage.getAll(),
      purchases: purchaseStorage.getAll(),
      settings: settingsStorage.get(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  },

  // استيراد البيانات
  import: (backupData: string): boolean => {
    try {
      const data = JSON.parse(backupData);
      
      if (data.customers) storage.set(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.products) storage.set(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.sales) storage.set(STORAGE_KEYS.SALES, data.sales);
      if (data.purchases) storage.set(STORAGE_KEYS.PURCHASES, data.purchases);
      if (data.settings) storage.set(STORAGE_KEYS.SETTINGS, data.settings);
      
      return true;
    } catch (error) {
      console.error('Error importing backup data:', error);
      return false;
    }
  }
};