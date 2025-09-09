import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '../styles/arabic.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'أطلس يو بي سي - نظام المحاسبة',
  description: 'برنامج محاسبة شامل لإدارة المبيعات والمشتريات والمخزون',
  keywords: 'محاسبة, مبيعات, مشتريات, مخزون, أطلس يو بي سي',
  authors: [{ name: 'أطلس يو بي سي' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="rtl">
      <head>
        {/* Google Fonts للعربية */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* أيقونة التطبيق */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        
        {/* Meta tags إضافية */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="أطلس يو بي سي" />
      </head>
      <body 
        className={`${inter.className} antialiased bg-gray-50 text-gray-900 rtl arabic-text`}
        suppressHydrationWarning={true}
      >
        <div className="min-h-screen">
          {children}
        </div>
        
        {/* Scripts لتحسين الأداء */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // تحسين عرض الأرقام العربية
              document.addEventListener('DOMContentLoaded', function() {
                const numbers = document.querySelectorAll('.arabic-numbers');
                numbers.forEach(function(el) {
                  el.style.fontFeatureSettings = '"tnum"';
                });
              });
              
              // تحسين الأداء للحقول النصية
              const inputs = document.querySelectorAll('input[type="text"], textarea');
              inputs.forEach(function(input) {
                input.setAttribute('autocomplete', 'off');
                input.setAttribute('spellcheck', 'false');
              });
            `
          }}
        />
      </body>
    </html>
  );
}