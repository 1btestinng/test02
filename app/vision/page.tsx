import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './vision.module.css';

export const metadata:Metadata={
 title:'Koshary and Couscous | Vision',
 description:'Our vision is to build the digital intelligence platform for North Africa — connecting markets, companies, economies, history, geography, culture, people and data.',
};

const areas=[
 ['Markets','North African stock markets, companies, prices, market capitalization, historical performance and financial intelligence.'],
 ['Companies','A structured database for understanding important companies across the region.'],
 ['Economy','Economic indicators, sectors, trade, investment, currencies, growth and broader economic intelligence.'],
 ['History','The events, civilizations and transformations that shaped modern North Africa.'],
 ['Geography','Countries, cities, regions, borders, landscapes, resources and geographic relationships.'],
 ['Culture','Languages, traditions, food, music, art, architecture and cultural identity.'],
 ['People','Important historical and contemporary figures who have shaped the region.'],
 ['Government','Institutions, political structures and public information.'],
 ['Travel','Cities, destinations, landmarks and places worth understanding and exploring.'],
 ['Data','Structured datasets and comparable information about the region.'],
];

export default function VisionPage(){return <main className={styles.page}><article className={styles.article}><div className="eyebrow">Vision</div><h1>To build the digital intelligence platform for North Africa.</h1><p className={styles.lead}>Koshary and Couscous is building a structured, transparent and accessible information layer for understanding North Africa and its future.</p><div className={styles.body}><p>We are starting with financial markets and company intelligence because markets provide one of the clearest windows into the region's businesses, capital and economic development.</p><p>But the ambition is much larger. Koshary and Couscous is being designed to bring together the region's markets, companies, economies, history, geography, culture, people, travel and data in one coherent platform.</p><h2>We start with markets.</h2><p>The stock market is our first mature product. It gives users structured company rankings, market data, historical prices, market capitalization, company intelligence and verified financial information where available.</p><p>Over time, the platform can expand beyond financial markets without losing the same principles: structured information, transparent sourcing, reusable architecture and no fabricated facts.</p><h2>What we are building</h2><div className={styles.grid}>{areas.map(([title,description])=><section key={title}><h3>{title}</h3><p>{description}</p></section>)}</div><h2>Five countries, one information layer.</h2><p>The initial geographic scope is Egypt, Libya, Tunisia, Algeria and Morocco. The architecture is designed around shared country and section configurations so that the platform can grow without duplicating the application.</p><h2>Data integrity matters.</h2><p>Where verified data is unavailable, we would rather show that it is unavailable than invent a number. Provider limitations, delayed data and calculated values should remain visible and understandable.</p><h2>The long-term ambition</h2><p>The goal is to make Koshary and Couscous a place people can use to understand North Africa from multiple angles — not only as investors, but as researchers, students, travelers, founders, journalists and curious people.</p><p className={styles.quote}>Koshary and Couscous is not only building a better way to look at North African stocks. It is building a better way to understand North Africa.</p><h2>Our future</h2><p>Markets are the beginning, not the boundary. As verified content and data become available, the platform can develop into a broader digital reference layer for the region.</p><div className={styles.cta}><strong>Explore the platform.</strong><Link href="/markets">Open Stock Market →</Link></div></div></article></main>}
