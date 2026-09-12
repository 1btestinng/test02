import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import NorthAfricaSectionPage from '@/components/north-africa-section-page';
import {SECTION_CONTENT} from '@/lib/north-africa';

const sections=Object.keys(SECTION_CONTENT);
export async function generateStaticParams(){return sections.map(section=>({section}))}
export async function generateMetadata({params}:{params:Promise<{section:string}>}):Promise<Metadata>{const {section}=await params;const content=SECTION_CONTENT[section];return content?{title:`Koshary and Couscous | ${content.title}`,description:content.description}:{title:'Koshary and Couscous',description:'Koshary and Couscous is a North Africa information and intelligence platform.'}}
export default async function SectionPage({params}:{params:Promise<{section:string}>}){const {section}=await params;if(section==='markets')redirect('/markets');if(!SECTION_CONTENT[section])notFound();return <NorthAfricaSectionPage section={section}/>}
