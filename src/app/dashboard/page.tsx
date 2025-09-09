'use client';

import React, { useState, useEffect } from 'react';
import { passwordManager } from '@/lib/storage';
import Dashboard from '@/components/Dashboard';
import Sales from '@/components/Sales';
import Purchases from '@/components/Purchases';
import Customers from '@/components/Customers';
import Inventory from '@/components/Inventory';
import Reports from '@/components/Reports';
import Settings from '@/components/Settings';
import { NavigationItem } from '@/types';

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: '🏠', component: 'Dashboard' },
  { id: 'sales', name: 'المبيعات', icon: '💰', component: 'Sales' },
  { id: 'purchases', name: 'المشتريات', icon: '🛒', component: 'Purchases' },
  { id: 'customers', name: 'العملاء', icon: '👥', component: 'Customers' },
  { id: 'inventory', name: 'المخزون', icon: '📦', component: 'Inventory' },
  { id: 'reports', name: 'التقارير', icon: '📊', component: 'Reports' },
  { id: 'settings', name: 'الإعدادات', icon: '⚙️', component: 'Settings' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const checkAuth = () => {
      if (!passwordManager.isAuthenticated()) {
        window.location.href = '/';
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      passwordManager.logout();
      window.location.href = '/';
    }
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'customers':
        return <Customers />;
      case 'inventory':
        return <Inventory />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="main-background flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* شريط التنقل العلوي */}
      <nav className="navbar border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* الشعار والعنوان */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
            >
              {sidebarOpen ? '❮' : '❯'}
            </button>
            
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="أطلس يو بي سي" 
                className="w-8 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-white font-bold text-lg">أطلس يو بي سي</h1>
                <p className="text-teal-200 text-sm">نظام المحاسبة</p>
              </div>
            </div>
          </div>

          {/* معلومات المستخدم وأزرار التحكم */}
          <div className="flex items-center gap-4">
            <div className="text-white text-right">
              <p className="font-medium">المدير العام</p>
              <p className="text-teal-200 text-sm">{new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-secondary bg-white bg-opacity-20 border-white text-white hover:bg-white hover:text-teal-700"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* الشريط الجانبي */}
        <aside 
          className={`bg-white shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          } min-h-screen border-l border-gray-200`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-right rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* معلومات الحالة في أسفل الشريط الجانبي */}
          {sidebarOpen && (
            <div className="absolute bottom-4 right-4 left-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 text-center">
                  آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* عنوان القسم الحالي */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {navigationItems.find(item => item.id === activeTab)?.icon}
                </span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {navigationItems.find(item => item.id === activeTab)?.name}
                </h2>
              </div>
              <div className="mt-2 h-1 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full w-20"></div>
            </div>

            {/* المحتوى التفاعلي */}
            <div className="slide-in">
              {renderActiveComponent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}