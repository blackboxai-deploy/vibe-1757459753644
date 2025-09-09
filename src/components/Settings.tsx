'use client';

import React, { useState, useEffect } from 'react';
import { settingsStorage, passwordManager, backup } from '@/lib/storage';
import { Settings } from '@/types';

export default function SettingsComponent() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const currentSettings = settingsStorage.get();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = () => {
    if (!settings) return;

    try {
      settingsStorage.update(settings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    if (!passwordManager.verifyPassword(passwordForm.currentPassword)) {
      alert('كلمة المرور الحالية غير صحيحة');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      alert('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('كلمتا المرور الجديدتان غير متطابقتان');
      return;
    }

    try {
      passwordManager.setPassword(passwordForm.newPassword);
      alert('تم تغيير كلمة المرور بنجاح');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const handleExportData = () => {
    try {
      const exportData = backup.export();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `اطلس_نسخة_احتياطية_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        if (backup.import(data)) {
          alert('تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
          window.location.reload();
        } else {
          alert('فشل في استيراد البيانات. تأكد من صحة الملف.');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('حدث خطأ أثناء استيراد البيانات');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
      if (confirm('تأكيد أخير: سيتم حذف جميع المبيعات والمشتريات والعملاء والمنتجات!')) {
        try {
          // الاحتفاظ بكلمة المرور والإعدادات
          const currentPassword = passwordManager.hasPassword();
          const currentSettings = settingsStorage.get();
          
          // مسح البيانات
          localStorage.clear();
          
          // استعادة كلمة المرور والإعدادات
          if (currentPassword) {
            passwordManager.setPassword(passwordForm.currentPassword || 'admin');
          }
          settingsStorage.update(currentSettings);
          
          alert('تم حذف جميع البيانات. سيتم إعادة تحميل الصفحة.');
          window.location.reload();
        } catch (error) {
          console.error('Error resetting data:', error);
          alert('حدث خطأ أثناء حذف البيانات');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* إعدادات الشركة */}
      <div className="system-card p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          🏢 معلومات الشركة
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="form-input w-full"
              placeholder="أطلس يو بي سي"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">هاتف الشركة</label>
            <input
              type="tel"
              value={settings.companyPhone}
              onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              className="form-input w-full"
              placeholder="رقم الهاتف"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الشركة</label>
          <textarea
            value={settings.companyAddress}
            onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
            className="form-input w-full"
            rows={3}
            placeholder="عنوان الشركة"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="form-input w-full"
            >
              <option value="ريال">ريال سعودي</option>
              <option value="درهم">درهم إماراتي</option>
              <option value="دينار">دينار كويتي</option>
              <option value="جنيه">جنيه مصري</option>
              <option value="دولار">دولار أمريكي</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">معدل الضريبة (%)</label>
            <input
              type="number"
              value={settings.taxRate * 100}
              onChange={(e) => setSettings({ ...settings, taxRate: (parseFloat(e.target.value) || 0) / 100 })}
              className="form-input w-full"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={handleSaveSettings} className="btn-primary">
            حفظ الإعدادات
          </button>
        </div>
      </div>

      {/* إعدادات الأمان */}
      <div className="system-card p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          🔒 إعدادات الأمان
        </h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">تغيير كلمة المرور</p>
              <p className="text-sm text-gray-600">قم بتحديث كلمة المرور لحماية أفضل</p>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="btn-secondary"
            >
              {showPasswordChange ? 'إلغاء' : 'تغيير كلمة المرور'}
            </button>
          </div>

          {showPasswordChange && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="form-input w-full"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="form-input w-full"
                    placeholder="كلمة المرور الجديدة"
                    minLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="form-input w-full"
                    placeholder="أعد إدخال كلمة المرور"
                    minLength={4}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handlePasswordChange} className="btn-primary">
                  تحديث كلمة المرور
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* إدارة البيانات */}
      <div className="system-card p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          💾 إدارة البيانات
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl mb-2">📥</div>
            <h5 className="font-medium text-gray-800 mb-2">تصدير البيانات</h5>
            <p className="text-sm text-gray-600 mb-4">احفظ نسخة احتياطية من جميع البيانات</p>
            <button onClick={handleExportData} className="btn-primary w-full">
              تصدير
            </button>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-2">📤</div>
            <h5 className="font-medium text-gray-800 mb-2">استيراد البيانات</h5>
            <p className="text-sm text-gray-600 mb-4">استعادة البيانات من نسخة احتياطية</p>
            <label className="btn-secondary w-full cursor-pointer block">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              اختر ملف
            </label>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl mb-2">🗑️</div>
            <h5 className="font-medium text-gray-800 mb-2">حذف جميع البيانات</h5>
            <p className="text-sm text-gray-600 mb-4">إعادة تعيين النظام بالكامل</p>
            <button 
              onClick={handleResetData} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full"
            >
              حذف البيانات
            </button>
          </div>
        </div>
      </div>

      {/* معلومات النظام */}
      <div className="system-card p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          ℹ️ معلومات النظام
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">اسم النظام:</span>
              <span className="font-medium">أطلس يو بي سي</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الإصدار:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نوع التخزين:</span>
              <span className="font-medium">محلي (Browser Storage)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">تاريخ آخر تحديث:</span>
              <span className="font-medium">{new Date().toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">حالة النظام:</span>
              <span className="font-medium text-green-600">نشط</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المطور:</span>
              <span className="font-medium">أطلس يو بي سي</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <h5 className="font-medium text-teal-800 mb-2">ملاحظات مهمة:</h5>
          <ul className="text-sm text-teal-700 space-y-1">
            <li>• جميع البيانات محفوظة محلياً على جهازك</li>
            <li>• قم بعمل نسخ احتياطية دورية لحماية بياناتك</li>
            <li>• لا تشارك كلمة المرور مع الآخرين</li>
            <li>• في حالة مشاكل تقنية، تواصل مع الدعم الفني</li>
          </ul>
        </div>
      </div>
    </div>
  );
}