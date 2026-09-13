import type {Metadata} from 'next';
import InteractiveHomeHero from '@/components/homepage/interactive-home-hero';

export const metadata: Metadata = {
  title: 'North Africa Hub',
  description:
    'North Africa Hub is a North Africa information and intelligence platform covering markets, history, economy, travel, culture, geography, people and data.',
};

export default function Home() {
  return (
    <main>
      <InteractiveHomeHero />
    </main>
  );
}
