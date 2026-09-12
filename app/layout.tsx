import './globals.css';
import './matrix-theme.css';
import type {Metadata} from 'next';
import Script from 'next/script';
import NorthAfricaShell from '@/components/navigation/north-africa-shell';

export const metadata: Metadata = {
  title: 'Koshary and Couscous',
  description: 'Koshary and Couscous is a North Africa information and intelligence platform covering markets, history, economy, travel, culture, geography, people, and data.',
  openGraph: {
    title: 'Koshary and Couscous',
    description: 'Koshary and Couscous is a North Africa information and intelligence platform covering markets, history, economy, travel, culture, geography, people, and data.',
    siteName: 'Koshary and Couscous',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Koshary and Couscous',
    description: 'Koshary and Couscous is a North Africa information and intelligence platform covering markets, history, economy, travel, culture, geography, people, and data.',
  },
  applicationName: 'Koshary and Couscous',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><NorthAfricaShell>{children}</NorthAfricaShell><Script id="google-adsense" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2107729320853151" strategy="beforeInteractive" async crossOrigin="anonymous" /></body></html>;
}
