'use client';

import React, { useState, useEffect } from 'react';
import { saleStorage, customerStorage, productStorage } from '@/lib/storage';
import { Sale, Customer, Product, SaleItem } from '@/types';
import { formatCurrency, formatDate } from '@/lib/calculations';

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // بيانات الفاتورة الجديدة
  const [newSale, setNewSale] = useState({
    customerId: '',
    customerName: '',
    items: [] as SaleItem[],
    discount: 0,
    tax: 15,
    paymentMethod: 'cash' as const,
    notes: ''
  });

  // بيانات المنتج الجديد في الفاتورة
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setSales(saleStorage.getAll());
      setCustomers(customerStorage.getAll());
      setProducts(productStorage.getAll());
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      alert('يرجى اختيار منتج وإدخال كمية صحيحة');
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) {
      alert('المنتج غير موجود');
      return;
    }

    if (product.quantity < newItem.quantity) {
      alert(`الكمية المتاحة من ${product.name} هي ${product.quantity} فقط`);
      return;
    }

    const existingItemIndex = newSale.items.findIndex(item => item.productId === newItem.productId);
    
    if (existingItemIndex >= 0) {
      // تحديث المنتج الموجود
      const updatedItems = [...newSale.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        total: (updatedItems[existingItemIndex].quantity + newItem.quantity) * newItem.unitPrice
      };
      setNewSale({ ...newSale, items: updatedItems });
    } else {
      // إضافة منتج جديد
      const saleItem: SaleItem = {
        productId: newItem.productId,
        productName: product.name,
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice || product.sellingPrice,
        total: newItem.quantity * (newItem.unitPrice || product.sellingPrice)
      };
      setNewSale({ ...newSale, items: [...newSale.items, saleItem] });
    }

    // إعادة تعيين النموذج
    setNewItem({
      productId: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = newSale.items.filter((_, i) => i !== index);
    setNewSale({ ...newSale, items: updatedItems });
  };

  const calculateTotals = () => {
    const subtotal = newSale.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * newSale.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * newSale.tax) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSaveSale = () => {
    if (newSale.items.length === 0) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    if (!newSale.customerName.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    const totals = calculateTotals();

    try {
      // إنشاء الفاتورة
      saleStorage.add({
        customerId: newSale.customerId || undefined,
        customerName: newSale.customerName,
        items: newSale.items,
        subtotal: totals.subtotal,
        discount: newSale.discount,
        tax: newSale.tax,
        total: totals.total,
        paid: totals.total, // افتراض الدفع الكامل
        remaining: 0,
        paymentMethod: newSale.paymentMethod,
        notes: newSale.notes
      });

      // تحديث المخزون
      newSale.items.forEach(item => {
        productStorage.update(item.productId, {
          quantity: products.find(p => p.id === item.productId)!.quantity - item.quantity
        });
      });

      // تحديث رصيد العميل إذا كان مسجلاً
      if (newSale.customerId) {
        const customer = customers.find(c => c.id === newSale.customerId);
        if (customer) {
          customerStorage.update(customer.id, {
            balance: customer.balance + totals.total
          });
        }
      }

      alert('تم حفظ الفاتورة بنجاح');
      setShowAddForm(false);
      setNewSale({
        customerId: '',
        customerName: '',
        items: [],
        discount: 0,
        tax: 15,
        paymentMethod: 'cash',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('حدث خطأ أثناء حفظ الفاتورة');
    }
  };

  const handleDeleteSale = (saleId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        saleStorage.delete(saleId);
        loadData();
        alert('تم حذف الفاتورة بنجاح');
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('حدث خطأ أثناء حذف الفاتورة');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المبيعات...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* أزرار التحكم */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">إدارة المبيعات</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <span>{showAddForm ? '❌' : '➕'}</span>
          {showAddForm ? 'إلغاء' : 'فاتورة جديدة'}
        </button>
      </div>

      {/* نموذج إضافة فاتورة جديدة */}
      {showAddForm && (
        <div className="system-card p-6 space-y-6">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">إضافة فاتورة مبيعات جديدة</h4>

          {/* معلومات العميل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العميل المسجل (اختياري)</label>
              <select
                value={newSale.customerId}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setNewSale({
                    ...newSale,
                    customerId: e.target.value,
                    customerName: customer ? customer.name : ''
                  });
                }}
                className="form-input w-full"
              >
                <option value="">اختر عميل مسجل</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل *</label>
              <input
                type="text"
                value={newSale.customerName}
                onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                className="form-input w-full"
                placeholder="أدخل اسم العميل"
                required
              />
            </div>
          </div>

          {/* إضافة منتجات */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-800 mb-4">إضافة منتجات</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنتج</label>
                <select
                  value={newItem.productId}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setNewItem({
                      ...newItem,
                      productId: e.target.value,
                      unitPrice: product ? product.sellingPrice : 0
                    });
                  }}
                  className="form-input w-full"
                >
                  <option value="">اختر منتج</option>
                  {products.filter(p => p.quantity > 0).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (متاح: {product.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="form-input w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سعر الوحدة</label>
                <input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="form-input w-full"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  className="btn-primary w-full"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* جدول المنتجات المضافة */}
          {newSale.items.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="font-medium text-gray-800 mb-4">المنتجات المضافة</h5>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr className="table-header">
                      <th className="px-4 py-3 text-right">المنتج</th>
                      <th className="px-4 py-3 text-right">الكمية</th>
                      <th className="px-4 py-3 text-right">سعر الوحدة</th>
                      <th className="px-4 py-3 text-right">المجموع</th>
                      <th className="px-4 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newSale.items.map((item, index) => (
                      <tr key={index} className="table-row">
                        <td className="px-4 py-3">{item.productName}</td>
                        <td className="px-4 py-3 arabic-numbers">{item.quantity}</td>
                        <td className="px-4 py-3 arabic-numbers">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 font-bold arabic-numbers">{formatCurrency(item.total)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="action-btn action-btn-delete"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* الحسابات والإعدادات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخصم (%)</label>
              <input
                type="number"
                value={newSale.discount}
                onChange={(e) => setNewSale({ ...newSale, discount: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الضريبة (%)</label>
              <input
                type="number"
                value={newSale.tax}
                onChange={(e) => setNewSale({ ...newSale, tax: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
              <select
                value={newSale.paymentMethod}
                onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value as any })}
                className="form-input w-full"
              >
                <option value="cash">نقدي</option>
                <option value="credit">آجل</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>
          </div>

          {/* الملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={newSale.notes}
              onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
              className="form-input w-full"
              rows={3}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* ملخص الفاتورة */}
          {newSale.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="arabic-numbers">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الخصم ({newSale.discount}%):</span>
                    <span className="arabic-numbers">-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>الضريبة ({newSale.tax}%):</span>
                    <span className="arabic-numbers">{formatCurrency(totals.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>الإجمالي:</span>
                    <span className="arabic-numbers text-green-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* أزرار الحفظ */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveSale}
              className="btn-primary"
              disabled={newSale.items.length === 0}
            >
              حفظ الفاتورة
            </button>
          </div>
        </div>
      )}

      {/* جدول المبيعات */}
      <div className="system-card">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right">العميل</th>
                <th className="px-4 py-3 text-right">التاريخ</th>
                <th className="px-4 py-3 text-right">المجموع</th>
                <th className="px-4 py-3 text-right">طريقة الدفع</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="px-4 py-3 font-mono text-sm">#{sale.id.slice(-8)}</td>
                    <td className="px-4 py-3">{sale.customerName}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 font-bold text-green-600 arabic-numbers">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                        sale.paymentMethod === 'credit' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sale.paymentMethod === 'cash' ? 'نقدي' :
                         sale.paymentMethod === 'credit' ? 'آجل' :
                         sale.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'شيك'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="action-btn action-btn-view">عرض</button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="action-btn action-btn-delete"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    لا توجد مبيعات مسجلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ملخص سريع */}
      {sales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 arabic-numbers">
                {sales.length}
              </p>
              <p className="text-sm text-gray-600">إجمالي الفواتير</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 arabic-numbers">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}
              </p>
              <p className="text-sm text-gray-600">إجمالي المبيعات</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 arabic-numbers">
                {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length)}
              </p>
              <p className="text-sm text-gray-600">متوسط الفاتورة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}