'use client';

import React, { useState, useEffect } from 'react';
import { generateProfitReport, getTopSellingProducts, getTopCustomers, formatCurrency } from '@/lib/calculations';
import { ProfitReport } from '@/types';

export default function Reports() {
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<{
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
  }>({
    period: 'monthly',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      // تقرير الأرباح
      const report = generateProfitReport(
        reportPeriod.period,
        reportPeriod.startDate,
        reportPeriod.endDate
      );
      setProfitReport(report);

      // أفضل المنتجات والعملاء
      setTopProducts(getTopSellingProducts(10));
      setTopCustomers(getTopCustomers(10));
    } catch (error) {
      console.error('Error generating reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    switch (period) {
      case 'daily':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'weekly':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    setReportPeriod({
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const exportReport = () => {
    if (!profitReport) return;

    const reportData = {
      company: 'أطلس يو بي سي',
      reportTitle: 'تقرير الأرباح والخسائر',
      period: reportPeriod,
      summary: {
        totalRevenue: profitReport.totalRevenue,
        totalCost: profitReport.totalCost,
        totalProfit: profitReport.totalProfit,
        profitMargin: profitReport.profitMargin
      },
      breakdown: profitReport.breakdown,
      topProducts,
      topCustomers,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_أطلس_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري إنشاء التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(period => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportPeriod.period === period
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period === 'daily' ? 'يومي' :
               period === 'weekly' ? 'أسبوعي' :
               period === 'monthly' ? 'شهري' : 'سنوي'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={generateReport}
            className="btn-primary flex items-center gap-2"
          >
            🔄 تحديث التقرير
          </button>
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center gap-2"
          >
            📥 تصدير
          </button>
        </div>
      </div>

      {/* تواريخ مخصصة */}
      <div className="system-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
            <input
              type="date"
              value={reportPeriod.startDate}
              onChange={(e) => setReportPeriod({ ...reportPeriod, startDate: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
            <input
              type="date"
              value={reportPeriod.endDate}
              onChange={(e) => setReportPeriod({ ...reportPeriod, endDate: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div>
            <button
              onClick={generateReport}
              className="btn-primary w-full"
            >
              إنشاء التقرير
            </button>
          </div>
        </div>
      </div>

      {profitReport && (
        <>
          {/* ملخص الأرباح */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stats-card bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <p className="text-lg font-bold text-green-700 arabic-numbers">
                  {formatCurrency(profitReport.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-center">
                <div className="text-3xl mb-2">💸</div>
                <p className="text-lg font-bold text-red-700 arabic-numbers">
                  {formatCurrency(profitReport.totalCost)}
                </p>
                <p className="text-sm text-gray-600">إجمالي التكاليف</p>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-lg font-bold text-blue-700 arabic-numbers">
                  {formatCurrency(profitReport.totalProfit)}
                </p>
                <p className="text-sm text-gray-600">صافي الربح</p>
              </div>
            </div>

            <div className="stats-card bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-lg font-bold text-purple-700 arabic-numbers">
                  {profitReport.profitMargin.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">هامش الربح</p>
              </div>
            </div>
          </div>

          {/* الرسم البياني للأرباح اليومية */}
          <div className="system-card p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📈 تطور الأرباح خلال الفترة
            </h4>
            
            {profitReport.breakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex items-end space-x-2 min-w-full" style={{ height: '200px' }}>
                  {profitReport.breakdown.map((day, index) => {
                    const maxProfit = Math.max(...profitReport.breakdown.map(d => d.profit));
                    const height = maxProfit > 0 ? (day.profit / maxProfit) * 150 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center min-w-16">
                        <div 
                          className="bg-gradient-to-t from-teal-600 to-teal-400 rounded-t w-12 min-h-4 relative group cursor-pointer"
                          style={{ height: Math.max(height, 4) + 'px' }}
                          title={`التاريخ: ${day.date}\nالربح: ${formatCurrency(day.profit)}`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatCurrency(day.profit)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 transform rotate-45 origin-left">
                          {new Date(day.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد بيانات للفترة المحددة</p>
            )}
          </div>
        </>
      )}

      {/* أفضل المنتجات والعملاء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أفضل المنتجات */}
        <div className="system-card p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏆 أفضل المنتجات مبيعاً
          </h4>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{product.productName}</p>
                      <p className="text-sm text-gray-600">كمية: {product.totalSold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 arabic-numbers">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-500">إجمالي المبيعات</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد مبيعات</p>
          )}
        </div>

        {/* أفضل العملاء */}
        <div className="system-card p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ⭐ أفضل العملاء
          </h4>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{customer.customerName}</p>
                      <p className="text-sm text-gray-600">مشتريات: {customer.totalPurchases}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 arabic-numbers">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">إجمالي الإنفاق</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لا توجد عملاء</p>
          )}
        </div>
      </div>

      {/* تفاصيل إضافية */}
      {profitReport && (
        <div className="system-card p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📋 ملخص مفصل للفترة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-medium text-gray-700 border-b pb-2">معلومات المبيعات</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-bold arabic-numbers">{formatCurrency(profitReport.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي التكاليف:</span>
                  <span className="font-bold arabic-numbers">{formatCurrency(profitReport.totalCost)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>صافي الربح:</span>
                  <span className="font-bold text-green-600 arabic-numbers">{formatCurrency(profitReport.totalProfit)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-700 border-b pb-2">نسب الأداء</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>هامش الربح الإجمالي:</span>
                  <span className="font-bold arabic-numbers">{profitReport.profitMargin.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>متوسط الربح اليومي:</span>
                  <span className="font-bold arabic-numbers">
                    {formatCurrency(profitReport.totalProfit / (profitReport.breakdown.length || 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>أفضل يوم:</span>
                  <span className="font-bold text-blue-600">
                    {profitReport.breakdown.length > 0 ? 
                      new Date(profitReport.breakdown.reduce((best, current) => 
                        current.profit > best.profit ? current : best
                      ).date).toLocaleDateString('ar-SA') : '-'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}