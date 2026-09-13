import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import PeopleIndex from '@/components/people/people-index';
import {getPeopleCategory, PEOPLE_CATEGORIES} from '@/lib/people';

type Props = {params: Promise<{category:string}>};

export function generateStaticParams() {
  return PEOPLE_CATEGORIES.map(category => ({category: category.slug}));
}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const {category:slug} = await params;
  const category = getPeopleCategory(slug);
  if (!category) return {};
  return {
    title: `${category.label} | People | North Africa Hub`,
    description: `${category.description} Explore the North Africa Hub People catalogue.`,
  };
}

export default async function PeopleCategoryPage({params}:Props) {
  const {category:slug} = await params;
  const category = getPeopleCategory(slug);
  if (!category) notFound();
  return <PeopleIndex title={`People / ${category.label}`} description={category.description} categorySlug={category.slug} />;
}
