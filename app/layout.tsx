import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'EGX 100 — Egypt’s Largest Listed Companies',description:"Track Egypt's 100 largest publicly listed companies by market capitalization."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
