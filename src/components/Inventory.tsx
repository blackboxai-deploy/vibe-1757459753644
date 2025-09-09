'use client';

import React, { useState, useEffect } from 'react';
import { productStorage } from '@/lib/storage';
import { Product } from '@/types';
import { formatCurrency, calculateLowStockItems } from '@/lib/calculations';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    unit: 'قطعة',
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minQuantity: 5
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    try {
      setProducts(productStorage.getAll());
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    if (newProduct.sellingPrice <= newProduct.costPrice) {
      alert('سعر البيع يجب أن يكون أكبر من سعر الشراء');
      return;
    }

    try {
      productStorage.add({
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        unit: newProduct.unit,
        costPrice: newProduct.costPrice,
        sellingPrice: newProduct.sellingPrice,
        quantity: newProduct.quantity,
        minQuantity: newProduct.minQuantity
      });

      alert('تم إضافة المنتج بنجاح');
      setNewProduct({
        name: '',
        category: '',
        unit: 'قطعة',
        costPrice: 0,
        sellingPrice: 0,
        quantity: 0,
        minQuantity: 5
      });
      setShowAddForm(false);
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('حدث خطأ أثناء إضافة المنتج');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        productStorage.delete(productId);
        alert('تم حذف المنتج بنجاح');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      alert('الكمية لا يمكن أن تكون سالبة');
      return;
    }

    try {
      productStorage.update(productId, { quantity: newQuantity });
      loadProducts();
    } catch (error) {
      console.error('Error updating product quantity:', error);
      alert('حدث خطأ أثناء تحديث الكمية');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المخزون...</p>
        </div>
      </div>
    );
  }

  const lowStockItems = calculateLowStockItems(products);
  const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.costPrice), 0);
  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">إدارة المخزون</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <span>{showAddForm ? '❌' : '➕'}</span>
          {showAddForm ? 'إلغاء' : 'منتج جديد'}
        </button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stats-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 arabic-numbers">{products.length}</p>
            <p className="text-sm text-gray-600">إجمالي المنتجات</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 arabic-numbers">{totalItems}</p>
            <p className="text-sm text-gray-600">إجمالي الكميات</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 arabic-numbers">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-sm text-gray-600">قيمة المخزون</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 arabic-numbers">{lowStockItems.length}</p>
            <p className="text-sm text-gray-600">منتجات منخفضة</p>
          </div>
        </div>
      </div>

      {/* تنبيهات المخزون المنخفض */}
      {lowStockItems.length > 0 && (
        <div className="alert-warning">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold">تنبيه: منتجات تحتاج إعادة تخزين</h4>
              <div className="mt-2 space-y-1">
                {lowStockItems.map((item) => (
                  <p key={item.productId} className="text-sm">
                    • {item.productName}: الكمية الحالية {item.currentQuantity} (الحد الأدنى {item.minQuantity})
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="system-card p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">إضافة منتج جديد</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="form-input w-full"
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="form-input w-full"
                placeholder="فئة المنتج"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وحدة القياس</label>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="form-input w-full"
              >
                <option value="قطعة">قطعة</option>
                <option value="كيلو">كيلو</option>
                <option value="جرام">جرام</option>
                <option value="لتر">لتر</option>
                <option value="متر">متر</option>
                <option value="علبة">علبة</option>
                <option value="كرتون">كرتون</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الكمية الابتدائية</label>
              <input
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                className="form-input w-full"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للكمية</label>
              <input
                type="number"
                value={newProduct.minQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, minQuantity: parseInt(e.target.value) || 1 })}
                className="form-input w-full"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سعر الشراء *</label>
              <input
                type="number"
                value={newProduct.costPrice}
                onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سعر البيع *</label>
              <input
                type="number"
                value={newProduct.sellingPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {newProduct.costPrice > 0 && newProduct.sellingPrice > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                هامش الربح: {formatCurrency(newProduct.sellingPrice - newProduct.costPrice)} 
                ({(((newProduct.sellingPrice - newProduct.costPrice) / newProduct.costPrice) * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddProduct}
              className="btn-primary"
            >
              حفظ المنتج
            </button>
          </div>
        </div>
      )}

      <div className="system-card">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-right">المنتج</th>
                <th className="px-4 py-3 text-right">الفئة</th>
                <th className="px-4 py-3 text-right">الكمية</th>
                <th className="px-4 py-3 text-right">الوحدة</th>
                <th className="px-4 py-3 text-right">سعر الشراء</th>
                <th className="px-4 py-3 text-right">سعر البيع</th>
                <th className="px-4 py-3 text-right">هامش الربح</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => {
                  const profitMargin = product.sellingPrice - product.costPrice;
                  const profitPercentage = (profitMargin / product.costPrice) * 100;
                  
                  return (
                    <tr key={product.id} className="table-row">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.category || '-'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-center arabic-numbers"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">{product.unit}</td>
                      <td className="px-4 py-3 arabic-numbers">{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 arabic-numbers">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3 arabic-numbers">
                        <span className="text-green-600">
                          {formatCurrency(profitMargin)} ({profitPercentage.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.quantity === 0 ? 'bg-red-100 text-red-700' :
                          product.quantity <= product.minQuantity ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {product.quantity === 0 ? 'نفدت الكمية' :
                           product.quantity <= product.minQuantity ? 'كمية منخفضة' : 'متوفر'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="action-btn action-btn-delete"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    لا توجد منتجات في المخزون بعد
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