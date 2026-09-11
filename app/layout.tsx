import './globals.css';
import type {Metadata} from 'next';

export const metadata:Metadata={title:'EGYstocks — Egyptian Stock Market Rankings',description:"Track Egypt's largest publicly listed companies by market capitalization."};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
