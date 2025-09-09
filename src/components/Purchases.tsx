'use client';

import React, { useState, useEffect } from 'react';
import { purchaseStorage, productStorage } from '@/lib/storage';
import { Purchase, Product, PurchaseItem } from '@/types';
import { formatCurrency, formatDate } from '@/lib/calculations';

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newPurchase, setNewPurchase] = useState({
    supplierName: '',
    supplierPhone: '',
    items: [] as PurchaseItem[],
    discount: 0,
    tax: 15,
    paymentMethod: 'cash' as const,
    notes: ''
  });

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
      setPurchases(purchaseStorage.getAll());
      setProducts(productStorage.getAll());
    } catch (error) {
      console.error('Error loading purchases data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      alert('يرجى اختيار منتج وإدخال كمية وسعر صحيح');
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) {
      alert('المنتج غير موجود');
      return;
    }

    const purchaseItem: PurchaseItem = {
      productId: newItem.productId,
      productName: product.name,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice
    };

    setNewPurchase({ ...newPurchase, items: [...newPurchase.items, purchaseItem] });
    setNewItem({ productId: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = newPurchase.items.filter((_, i) => i !== index);
    setNewPurchase({ ...newPurchase, items: updatedItems });
  };

  const calculateTotals = () => {
    const subtotal = newPurchase.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * newPurchase.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * newPurchase.tax) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSavePurchase = () => {
    if (newPurchase.items.length === 0) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    if (!newPurchase.supplierName.trim()) {
      alert('يرجى إدخال اسم المورد');
      return;
    }

    const totals = calculateTotals();

    try {
      purchaseStorage.add({
        supplierName: newPurchase.supplierName,
        supplierPhone: newPurchase.supplierPhone,
        items: newPurchase.items,
        subtotal: totals.subtotal,
        discount: newPurchase.discount,
        tax: newPurchase.tax,
        total: totals.total,
        paid: totals.total,
        remaining: 0,
        paymentMethod: newPurchase.paymentMethod,
        notes: newPurchase.notes
      });

      // تحديث المخزون وأسعار التكلفة
      newPurchase.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          productStorage.update(item.productId, {
            quantity: product.quantity + item.quantity,
            costPrice: item.unitPrice // تحديث سعر التكلفة
          });
        }
      });

      alert('تم حفظ المشترى بنجاح');
      setShowAddForm(false);
      setNewPurchase({
        supplierName: '',
        supplierPhone: '',
        items: [],
        discount: 0,
        tax: 15,
        paymentMethod: 'cash',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('حدث خطأ أثناء حفظ المشترى');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المشتريات...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">إدارة المشتريات</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <span>{showAddForm ? '❌' : '➕'}</span>
          {showAddForm ? 'إلغاء' : 'مشترى جديد'}
        </button>
      </div>

      {showAddForm && (
        <div className="system-card p-6 space-y-6">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">إضافة مشترى جديد</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المورد *</label>
              <input
                type="text"
                value={newPurchase.supplierName}
                onChange={(e) => setNewPurchase({ ...newPurchase, supplierName: e.target.value })}
                className="form-input w-full"
                placeholder="أدخل اسم المورد"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">هاتف المورد</label>
              <input
                type="tel"
                value={newPurchase.supplierPhone}
                onChange={(e) => setNewPurchase({ ...newPurchase, supplierPhone: e.target.value })}
                className="form-input w-full"
                placeholder="رقم الهاتف"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h5 className="font-medium text-gray-800 mb-4">إضافة منتجات</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنتج</label>
                <select
                  value={newItem.productId}
                  onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                  className="form-input w-full"
                >
                  <option value="">اختر منتج</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">سعر الشراء</label>
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
                <button onClick={handleAddItem} className="btn-primary w-full">إضافة</button>
              </div>
            </div>
          </div>

          {newPurchase.items.length > 0 && (
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
                  {newPurchase.items.map((item, index) => (
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
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخصم (%)</label>
              <input
                type="number"
                value={newPurchase.discount}
                onChange={(e) => setNewPurchase({ ...newPurchase, discount: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الضريبة (%)</label>
              <input
                type="number"
                value={newPurchase.tax}
                onChange={(e) => setNewPurchase({ ...newPurchase, tax: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
              <select
                value={newPurchase.paymentMethod}
                onChange={(e) => setNewPurchase({ ...newPurchase, paymentMethod: e.target.value as any })}
                className="form-input w-full"
              >
                <option value="cash">نقدي</option>
                <option value="credit">آجل</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              value={newPurchase.notes}
              onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
              className="form-input w-full"
              rows={3}
            />
          </div>

          {newPurchase.items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-right space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="arabic-numbers">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>الخصم:</span>
                  <span className="arabic-numbers">-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span className="arabic-numbers">{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>الإجمالي:</span>
                  <span className="arabic-numbers text-blue-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">إلغاء</button>
            <button
              onClick={handleSavePurchase}
              className="btn-primary"
              disabled={newPurchase.items.length === 0}
            >
              حفظ المشترى
            </button>
          </div>
        </div>
      )}

      <div className="system-card">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-right">رقم المشترى</th>
                <th className="px-4 py-3 text-right">المورد</th>
                <th className="px-4 py-3 text-right">التاريخ</th>
                <th className="px-4 py-3 text-right">المجموع</th>
                <th className="px-4 py-3 text-right">طريقة الدفع</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="table-row">
                    <td className="px-4 py-3 font-mono text-sm">#{purchase.id.slice(-8)}</td>
                    <td className="px-4 py-3">{purchase.supplierName}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(purchase.createdAt)}</td>
                    <td className="px-4 py-3 font-bold text-blue-600 arabic-numbers">
                      {formatCurrency(purchase.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {purchase.paymentMethod === 'cash' ? 'نقدي' :
                         purchase.paymentMethod === 'credit' ? 'آجل' : 'أخرى'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="action-btn action-btn-view">عرض</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    لا توجد مشتريات مسجلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}