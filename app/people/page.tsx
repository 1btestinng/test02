import type {Metadata} from 'next';
import PeopleIndex from '@/components/people/people-index';

export const metadata: Metadata = {
  title: 'People | North Africa Hub',
  description: 'Explore the people who shaped North Africa across history, business, culture, cinema, science, sports, literature and politics.',
};

type Props = {searchParams: Promise<{q?:string}>};

export default async function PeoplePage({searchParams}:Props) {
  const {q} = await searchParams;
  return <PeopleIndex query={q} />;
}
