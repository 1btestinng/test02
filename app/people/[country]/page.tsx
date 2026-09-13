import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import PeopleIndex from '@/components/people/people-index';
import {getPeopleCountry, getPeopleByCountry, PEOPLE_COUNTRIES} from '@/lib/people';

type Props = {params: Promise<{country:string}>};

export function generateStaticParams() {
  return PEOPLE_COUNTRIES.map(country => ({country: country.slug}));
}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const {country:slug} = await params;
  const country = getPeopleCountry(slug);
  if (!country) return {};
  return {
    title: `People of ${country.name} | North Africa Hub`,
    description: `Explore researched people from ${country.name} across history, business, culture, cinema, science, sports, literature and politics.`,
  };
}

export default async function PeopleCountryPage({params}:Props) {
  const {country:slug} = await params;
  const country = getPeopleCountry(slug);
  if (!country) notFound();
  const count = getPeopleByCountry(country.slug).length;
  return <PeopleIndex title={`People of ${country.name}`} description={`A structured catalogue of people connected to ${country.name}.`} countrySlug={country.slug} />;
}
