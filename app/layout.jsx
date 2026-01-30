import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ClientIntlProvider from "./components/ClientIntlProvider";
import { LocaleProvider } from "./context/LocaleContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "SatyaLay",
  description: "Personal Portal of Satya Lay",
};

export default function RootLayout({ children, params }) {
  const serverLocale = params?.locale || 'en';
  
  return (
    <html lang={serverLocale} data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LocaleProvider locale={serverLocale}>
            <ClientIntlProvider locale={serverLocale}>
              {children}
            </ClientIntlProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
