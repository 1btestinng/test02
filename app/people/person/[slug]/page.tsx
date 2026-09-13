import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPerson} from '@/lib/people';

export const metadata: Metadata = {
  title: 'Person | People | North Africa Hub',
  description: 'A researched North African person profile with biography, timeline, relationships and sources.',
};

type Props = {params: Promise<{slug:string}>};

export default async function PersonPage({params}:Props) {
  const {slug} = await params;
  const person = getPerson(slug);
  if (!person) notFound();

  return (
    <article style={{width:'min(900px,calc(100% - 40px))',margin:'0 auto',padding:'72px 0'}}>
      <div style={{fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:'var(--muted)'}}>North Africa Hub / People</div>
      <h1 style={{fontSize:'clamp(44px,8vw,82px)',lineHeight:.92,letterSpacing:'-.07em',margin:'16px 0'}}> {person.name}</h1>
      <p style={{color:'var(--muted)',lineHeight:1.7}}>This profile route is reserved for researched, source-checked biographies. No placeholder information is published.</p>
    </article>
  );
}
