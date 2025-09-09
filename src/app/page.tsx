'use client';

import React, { useState, useEffect } from 'react';
import { passwordManager } from '@/lib/storage';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // التحقق من وجود كلمة مرور محفوظة
    if (!passwordManager.hasPassword()) {
      setIsFirstTime(true);
    } else {
      // التحقق من تسجيل الدخول المسبق
      if (passwordManager.isAuthenticated()) {
        window.location.href = '/dashboard';
      }
    }
  }, []);

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // التحقق من صحة كلمة المرور
    if (newPassword.length < 4) {
      setError('كلمة المرور يجب أن تكون على الأقل 4 أحرف');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتان');
      setIsLoading(false);
      return;
    }

    // حفظ كلمة المرور وتسجيل الدخول
    passwordManager.setPassword(newPassword);
    passwordManager.login(newPassword);
    
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      setIsLoading(false);
      return;
    }

    // محاولة تسجيل الدخول
    if (passwordManager.login(password)) {
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } else {
      setError('كلمة المرور غير صحيحة');
      setIsLoading(false);
    }
  };

  return (
    <div className="main-background flex items-center justify-center min-h-screen p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-white bg-opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white bg-opacity-5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* البطاقة الرئيسية */}
      <div className="system-card w-full max-w-md p-8 relative z-10 fade-in">
        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="أطلس يو بي سي" 
              className="w-24 h-12"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden">
              <div className="w-24 h-12 bg-gradient-to-r from-teal-700 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">أطلس</span>
              </div>
            </div>
          </div>
          
          <h1 className="atlas-logo text-2xl mb-2">أطلس يو بي سي</h1>
          <p className="text-gray-600 text-sm">نظام المحاسبة الشامل</p>
        </div>

        {isFirstTime ? (
          // نموذج إنشاء كلمة مرور جديدة
          <form onSubmit={handleSetupPassword} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">مرحباً بك</h2>
              <p className="text-sm text-gray-600">يرجى إنشاء كلمة مرور لحماية النظام</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input w-full"
                placeholder="أدخل كلمة المرور (4 أحرف على الأقل)"
                minLength={4}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input w-full"
                placeholder="أعد إدخال كلمة المرور"
                minLength={4}
                required
              />
            </div>

            {error && (
              <div className="alert-error text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء كلمة المرور'
              )}
            </button>
          </form>
        ) : (
          // نموذج تسجيل الدخول
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">تسجيل الدخول</h2>
              <p className="text-sm text-gray-600">أدخل كلمة المرور للوصول إلى النظام</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                placeholder="أدخل كلمة المرور"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="alert-error text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'دخول'
              )}
            </button>
          </form>
        )}

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            نظام محاسبة آمن ومحلي
          </p>
          <p className="text-xs text-gray-400 mt-1">
            جميع البيانات محفوظة بأمان على جهازك
          </p>
        </div>
      </div>
    </div>
  );
}