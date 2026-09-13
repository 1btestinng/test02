import type {Metadata} from 'next';
import PeopleIndex from '@/components/people/people-index';

export const metadata: Metadata = {
  title: 'People | North Africa Hub',
  description: 'Explore the people who shaped North Africa across history, business, culture, cinema, science, sports, literature and politics.',
};

export default function PeoplePage() {
  return <PeopleIndex />;
}
