import './globals.css';
import './matrix-theme.css';
import type {Metadata} from 'next';
import Script from 'next/script';
import NorthAfricaShell from '@/components/navigation/north-africa-shell';

const description = 'North Africa Hub is a connected research platform covering North Africa’s markets, companies, countries, geography, history, civilizations and people.';

export const metadata: Metadata = {
  title: 'North Africa Hub',
  description,
  applicationName: 'North Africa Hub',
  metadataBase: new URL('https://egystocks.vercel.app'),
  openGraph: {
    title: 'North Africa Hub',
    description,
    siteName: 'North Africa Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'North Africa Hub',
    description,
  },
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><NorthAfricaShell>{children}</NorthAfricaShell><Script id="google-adsense" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2107729320853151" strategy="beforeInteractive" async crossOrigin="anonymous" /></body></html>;
}
