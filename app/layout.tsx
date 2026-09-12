import './globals.css';
import './matrix-theme.css';
import type {Metadata} from 'next';
import Script from 'next/script';
import NorthAfricaShell from '@/components/navigation/north-africa-shell';

export const metadata: Metadata = {
  title: 'iStocks - North Africa',
  description: 'North African markets, companies, history, economy, travel, culture and data.',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><NorthAfricaShell>{children}</NorthAfricaShell><Script id="google-adsense" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2107729320853151" strategy="beforeInteractive" async crossOrigin="anonymous" /></body></html>;
}
