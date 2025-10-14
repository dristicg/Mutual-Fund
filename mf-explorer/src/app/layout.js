import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from './theme/ThemeRegistry';
import Navigation from '@/components/Navigation';
import ToastProvider from '@/components/ToastProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'MF Explorer - Mutual Fund Portfolio Manager',
  description: 'Track, analyze and manage your mutual fund investments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRegistry>
          <Navigation />
          {children}
          <ToastProvider />
        </ThemeRegistry>
      </body>
    </html>
  );
}