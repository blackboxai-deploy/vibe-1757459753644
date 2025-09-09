'use client';

import React, { useState, useEffect } from 'react';
import { calculateDashboardStats, formatCurrency, getTopSellingProducts, getTopCustomers } from '@/lib/calculations';
import { DashboardStats } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const dashboardStats = calculateDashboardStats();
        const bestProducts = getTopSellingProducts(5);
        const bestCustomers = getTopCustomers(5);

        setStats(dashboardStats);
        setTopProducts(bestProducts);
        setTopCustomers(bestCustomers);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: stats?.totalSales || 0,
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'إجمالي الأرباح',
      value: stats?.totalProfit || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: '📈',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'مديونية العملاء',
      value: stats?.totalCustomerDebt || 0,
      change: '-3.1%',
      changeType: 'negative',
      icon: '👥',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'منتجات منخفضة المخزون',
      value: stats?.lowStockItems || 0,
      change: '+2',
      changeType: stats?.lowStockItems && stats.lowStockItems > 0 ? 'negative' : 'neutral',
      icon: '📦',
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* رسالة ترحيب */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">مرحباً بك في نظام أطلس يو بي سي</h3>
            <p className="text-teal-100">إليك نظرة عامة على أداء عملك اليوم</p>
          </div>
          <div className="text-6xl opacity-20">🏢</div>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="stats-card group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 arabic-numbers">
                  {typeof card.value === 'number' && card.title.includes('مبيعات') || card.title.includes('أرباح') || card.title.includes('مديونية')
                    ? formatCurrency(card.value)
                    : card.value
                  }
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    card.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                    card.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="text-3xl opacity-70 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r ${card.color} rounded-b-xl`}></div>
          </div>
        ))}
      </div>

      {/* الإحصائيات اليومية والشهرية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* مبيعات اليوم */}
        <div className="system-card p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📅</span>
            إحصائيات اليوم
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">المبيعات</span>
              <span className="font-bold text-green-600 arabic-numbers">
                {formatCurrency(stats?.todaySales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">الأرباح</span>
              <span className="font-bold text-blue-600 arabic-numbers">
                {formatCurrency(stats?.todayProfit || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* مبيعات الشهر */}
        <div className="system-card p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            إحصائيات الشهر الحالي
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">المبيعات</span>
              <span className="font-bold text-green-600 arabic-numbers">
                {formatCurrency(stats?.thisMonthSales || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">الأرباح</span>
              <span className="font-bold text-blue-600 arabic-numbers">
                {formatCurrency(stats?.thisMonthProfit || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* أفضل المنتجات والعملاء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات مبيعاً */}
        <div className="system-card p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏆</span>
            أفضل المنتجات مبيعاً
          </h4>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 font-medium">{product.productName}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">الكمية: {product.totalSold}</p>
                    <p className="text-sm font-bold text-green-600 arabic-numbers">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد مبيعات بعد</p>
          )}
        </div>

        {/* أفضل العملاء */}
        <div className="system-card p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⭐</span>
            أفضل العملاء
          </h4>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-800 font-medium">{customer.customerName}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">المشتريات: {customer.totalPurchases}</p>
                    <p className="text-sm font-bold text-blue-600 arabic-numbers">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد عملاء بعد</p>
          )}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="system-card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span>
          إجراءات سريعة
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium">مبيعة جديدة</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">🛒</div>
            <div className="text-sm font-medium">مشترى جديد</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">عميل جديد</div>
          </button>
          <button className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-medium">عرض التقارير</div>
          </button>
        </div>
      </div>

      {/* تنبيهات المخزون */}
      {stats && stats.lowStockItems > 0 && (
        <div className="alert-warning">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold">تنبيه مخزون منخفض</h4>
              <p className="text-sm">
                هناك {stats.lowStockItems} منتج يحتاج إلى إعادة تخزين
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}