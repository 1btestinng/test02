import './globals.css';
import type {Metadata} from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'EGYstocks — Egyptian Stock Market Rankings',
  description: "Track Egypt's largest publicly listed companies by market capitalization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="google-adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2107729320853151"
          strategy="beforeInteractive"
          async
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
