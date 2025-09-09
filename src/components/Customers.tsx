'use client';

import React, { useState, useEffect } from 'react';
import { customerStorage } from '@/lib/storage';
import { Customer } from '@/types';
import { formatCurrency, formatDate, generateCustomerStatement } from '@/lib/calculations';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    try {
      setCustomers(customerStorage.getAll());
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    try {
      customerStorage.add({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email.trim(),
        address: newCustomer.address.trim(),
        balance: newCustomer.balance
      });

      alert('تم إضافة العميل بنجاح');
      setNewCustomer({ name: '', phone: '', email: '', address: '', balance: 0 });
      setShowAddForm(false);
      loadCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('حدث خطأ أثناء إضافة العميل');
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        customerStorage.delete(customerId);
        alert('تم حذف العميل بنجاح');
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('حدث خطأ أثناء حذف العميل');
      }
    }
  };

  const handleShowStatement = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowStatement(true);
  };

  const getCustomerStatement = () => {
    if (!selectedCustomer) return null;
    return generateCustomerStatement(selectedCustomer.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  const customerStatement = getCustomerStatement();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">إدارة العملاء</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <span>{showAddForm ? '❌' : '➕'}</span>
          {showAddForm ? 'إلغاء' : 'عميل جديد'}
        </button>
      </div>

      {showAddForm && (
        <div className="system-card p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">إضافة عميل جديد</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل *</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="form-input w-full"
                placeholder="أدخل اسم العميل"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="form-input w-full"
                placeholder="رقم الهاتف"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                className="form-input w-full"
                placeholder="البريد الإلكتروني"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الرصيد الابتدائي</label>
              <input
                type="number"
                value={newCustomer.balance}
                onChange={(e) => setNewCustomer({ ...newCustomer, balance: parseFloat(e.target.value) || 0 })}
                className="form-input w-full"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
            <textarea
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              className="form-input w-full"
              rows={3}
              placeholder="عنوان العميل"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              إلغاء
            </button>
            <button
              onClick={handleAddCustomer}
              className="btn-primary"
            >
              حفظ العميل
            </button>
          </div>
        </div>
      )}

      {showStatement && selectedCustomer && (
        <div className="system-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              كشف حساب العميل: {selectedCustomer.name}
            </h4>
            <button
              onClick={() => setShowStatement(false)}
              className="btn-secondary"
            >
              إغلاق
            </button>
          </div>

          {customerStatement ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">إجمالي المدين</p>
                  <p className="text-lg font-bold text-blue-600 arabic-numbers">
                    {formatCurrency(customerStatement.totalDebit)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">إجمالي الدائن</p>
                  <p className="text-lg font-bold text-green-600 arabic-numbers">
                    {formatCurrency(customerStatement.totalCredit)}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">الرصيد النهائي</p>
                  <p className={`text-lg font-bold arabic-numbers ${
                    customerStatement.finalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(customerStatement.finalBalance))}
                    {customerStatement.finalBalance < 0 ? ' (مدين)' : ' (دائن)'}
                  </p>
                </div>
              </div>

              {customerStatement.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr className="table-header">
                        <th className="px-4 py-3 text-right">التاريخ</th>
                        <th className="px-4 py-3 text-right">الوصف</th>
                        <th className="px-4 py-3 text-right">مدين</th>
                        <th className="px-4 py-3 text-right">دائن</th>
                        <th className="px-4 py-3 text-right">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerStatement.transactions.map((transaction) => (
                        <tr key={transaction.id} className="table-row">
                          <td className="px-4 py-3 text-sm">{formatDate(transaction.date)}</td>
                          <td className="px-4 py-3">{transaction.description}</td>
                          <td className="px-4 py-3 arabic-numbers text-red-600">
                            {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                          </td>
                          <td className="px-4 py-3 arabic-numbers text-green-600">
                            {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                          </td>
                          <td className="px-4 py-3 arabic-numbers font-bold">
                            {formatCurrency(Math.abs(transaction.balance))}
                            {transaction.balance < 0 ? ' (مدين)' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد معاملات لهذا العميل</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات كشف حساب</p>
          )}
        </div>
      )}

      <div className="system-card">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">الهاتف</th>
                <th className="px-4 py-3 text-right">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right">الرصيد</th>
                <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="table-row">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3">{customer.phone || '-'}</td>
                    <td className="px-4 py-3">{customer.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold arabic-numbers ${
                        customer.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(customer.balance))}
                        {customer.balance < 0 ? ' (مدين)' : customer.balance > 0 ? ' (دائن)' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleShowStatement(customer)}
                          className="action-btn action-btn-view"
                        >
                          كشف الحساب
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
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
                    لا توجد عملاء مسجلين بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 arabic-numbers">{customers.length}</p>
              <p className="text-sm text-gray-600">إجمالي العملاء</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 arabic-numbers">
                {customers.filter(c => c.balance > 0).length}
              </p>
              <p className="text-sm text-gray-600">عملاء دائنين</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 arabic-numbers">
                {customers.filter(c => c.balance < 0).length}
              </p>
              <p className="text-sm text-gray-600">عملاء مدينين</p>
            </div>
          </div>
          <div className="stats-card">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 arabic-numbers">
                {formatCurrency(customers
                  .filter(c => c.balance < 0)
                  .reduce((sum, c) => sum + Math.abs(c.balance), 0)
                )}
              </p>
              <p className="text-sm text-gray-600">إجمالي المديونية</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}