import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'North Africa Through Time | History',
  description: 'An interactive historical atlas exploring North Africa from prehistory and antiquity to the modern era.',
};

export default function HistoryLayout({children}: {children: React.ReactNode}) {
  return children;
}
