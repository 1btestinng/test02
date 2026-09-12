import Link from 'next/link';
import {NORTH_AFRICA_COUNTRIES,SECTION_CONTENT} from '@/lib/north-africa';

export default function NorthAfricaSectionPage({section}:{section:string}){
 const content=SECTION_CONTENT[section]??{eyebrow:'North Africa',title:section,description:'This section is part of the North Africa platform architecture.',topics:[]};
 return <main className="naSectionPage"><div className="naBreadcrumb">North Africa / {content.title}</div><div className="naSectionHero"><div><div className="eyebrow">{content.eyebrow}</div><h1>{content.title}</h1><p>{content.description}</p></div></div><section className="naCountryGrid" aria-label={`${content.title} by country`}>{NORTH_AFRICA_COUNTRIES.map(country=>{const supported=country.availableSections.includes(section);return <Link key={country.code} href={`/${section}/${country.slug}`} className="naCountryCard"><span className="naCountryFlag" aria-hidden="true">{country.flag}</span><div><strong>{country.name}</strong><span>{supported?'Explore section':'Coverage coming soon'}</span></div><span className="naArrow" aria-hidden="true">→</span></Link>})}</section><section className="naTopics"><div className="eyebrow">Planned coverage</div><div className="naTopicGrid">{content.topics.map(topic=><div key={topic} className="naTopic"><span>{topic}</span><small>Coming soon</small></div>)}</div></section></main>;
}
