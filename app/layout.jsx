import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ClientIntlProvider from "./components/ClientIntlProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "SatyaLay",
  description: "Personal Portal of Satya Lay",
};

export default function RootLayout({ children, params }) {
  const locale = params?.locale || 'en'; // App Router param if you use dynamic locale
  return (
    <html lang={locale} data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ClientIntlProvider locale={locale}>
            {children}
          </ClientIntlProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
