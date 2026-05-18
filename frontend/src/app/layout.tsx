import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

import { STORE } from '@/lib/config';

export const metadata: Metadata = {
  title: `${STORE.name} — ${STORE.tagline} | ${STORE.area}`,
  description: STORE.description,
  keywords: `${STORE.name}, textile, chudithar, tops, lehenga, crop top, party wear, Texvalley, Gangapuram, women fashion`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fff9f2] min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#1a0800',
                  border: '1px solid #f0e0d4',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 4px 20px rgba(139,21,56,0.12)',
                },
                success: {
                  iconTheme: { primary: '#8b1538', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#c62828', secondary: '#fff' },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
