import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './vision.module.css';

export const metadata:Metadata={
 title:'Vision — iStocks - North Africa',
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
] as const;

const countries=[['🇪🇬','Egypt'],['🇱🇾','Libya'],['🇹🇳','Tunisia'],['🇩🇿','Algeria'],['🇲🇦','Morocco']] as const;

const principles=['No fabricated data','Transparent calculations','Source-aware information','Clear methodology','Historical context','Comparable data','Explicit uncertainty','Continuous improvement'];

export default function VisionPage(){
 return <main className={styles.page}>
  <div className={styles.breadcrumb}>iStocks / Vision</div>
  <section className={styles.hero}>
   <div className={styles.heroEyebrow}>OUR VISION</div>
   <h1>Building the digital intelligence platform for North Africa.</h1>
   <p className={styles.heroLead}>iStocks brings together the markets, companies, economies, history, geography, culture, people and data of North Africa into one structured, transparent and accessible platform.</p>
   <p className={styles.heroNote}>From financial markets to the wider information landscape of the region.</p>
  </section>

  <section className={styles.statement} aria-labelledby="vision-statement">
   <div className="eyebrow">Our Vision</div>
   <h2 id="vision-statement">To build the digital intelligence platform for North Africa.</h2>
  </section>

  <article className={styles.article}>
   <h2>Our Vision</h2>
   <p>North Africa is home to hundreds of millions of people, thousands of companies, diverse economies, ancient civilizations, rapidly changing societies, and enormous untapped potential.</p>
   <p>Yet information about the region remains fragmented across financial exchanges, government websites, databases, news outlets, research papers, and countless disconnected sources.</p>
   <p><strong>iStocks exists to bring that information together.</strong></p>
   <p>We are building a single, structured, data-driven platform where people can understand North Africa — its <strong>markets, companies, economies, history, geography, culture, people, governments, and data.</strong></p>
   <p>We are starting with financial markets because markets provide one of the clearest ways to understand an economy.</p>
   <p>Our first product is therefore a comprehensive platform for North African stocks and companies: prices, market capitalization, historical performance, financial information, company profiles, and transparent data.</p>
   <p>But the ambition goes far beyond stocks.</p>
   <p>Over time, iStocks will evolve into a <strong>living information layer for North Africa</strong> — connecting financial data with economic, geographic, historical, cultural, and demographic information to create a deeper understanding of the region.</p>
   <p>We want someone researching Egypt, Morocco, Tunisia, Algeria, Libya, or eventually the wider region to be able to come to one place and understand:</p>
   <div className={styles.questions}>
    <strong>What is happening?</strong><strong>Who are the important companies and people?</strong><strong>How does the economy work?</strong><strong>Where is the region heading?</strong><strong>And how did it get here?</strong>
   </div>
   <p>Our goal is not simply to collect information.</p>
   <p><strong>Our goal is to organize North Africa's information into something understandable, searchable, comparable, and useful.</strong></p>
   <p>We believe the region deserves world-class digital infrastructure for its information.</p>
   <p><strong>iStocks is building it.</strong></p>
  </article>

  <section className={styles.section}>
   <div className="eyebrow">01 / Foundation</div>
   <h2>We start with markets.</h2>
   <p className={styles.sectionIntro}>Financial markets are one of the clearest windows into an economy.</p>
   <p>They reveal where capital is flowing, which companies are growing, how industries are evolving, and how investors value the businesses shaping the region.</p>
   <p>That is why markets are the foundation of iStocks.</p>
   <p>But they are only the beginning.</p>
   <div className={styles.sequence} aria-label="Platform development sequence">{['Markets','Companies','Economy','Data','History','Geography','Culture','People','North Africa'].map((item,index)=><div key={item} className={styles.sequenceItem}><span>{String(index+1).padStart(2,'0')}</span><strong>{item}</strong></div>)}</div>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">02 / Platform</div>
   <h2>What we are building.</h2>
   <div className={styles.areaGrid}>{areas.map(([title,description])=><div className={styles.area} key={title}><h3>{title}</h3><p>{description}</p></div>)}</div>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">03 / Geography</div>
   <h2>Starting with North Africa.</h2>
   <p className={styles.sectionIntro}>iStocks begins with five countries at the heart of North Africa: Egypt, Libya, Tunisia, Algeria and Morocco.</p>
   <p>Each country has its own history, economy, culture and identity.</p>
   <p>But they are also connected by geography, trade, migration, language, history and shared regional dynamics.</p>
   <p>iStocks is designed to make both the differences and the connections easier to understand.</p>
   <div className={styles.countryGrid}>{countries.map(([flag,name])=><div className={styles.country} key={name}><span aria-hidden="true">{flag}</span><strong>{name}</strong></div>)}</div>
  </section>

  <section className={`${styles.section} ${styles.integrity}`}>
   <div className="eyebrow">04 / Data integrity</div>
   <h2>Built on trustworthy information.</h2>
   <div className={styles.principleLead}><strong>Verified data first.</strong><strong>Clear presentation second.</strong><strong>Scale without duplication.</strong></div>
   <p>We do not believe a larger database is automatically a better database.</p>
   <p>Information should be traceable, understandable and honest about its limitations.</p>
   <p>When reliable data exists, we present it clearly.</p>
   <p>When a value is calculated, we explain how.</p>
   <p>When data is unavailable, we do not invent it.</p>
   <p>When sources differ, methodology matters.</p>
   <div className={styles.principles}><div className="eyebrow">Our principles</div><ul>{principles.map(item=><li key={item}>{item}</li>)}</ul></div>
  </section>

  <section className={`${styles.section} ${styles.ambition}`}>
   <div className="eyebrow">05 / Long-term ambition</div>
   <h2>A platform for understanding the region.</h2>
   <p className={styles.sectionIntro}>The long-term goal is simple:</p>
   <p>If someone wants to understand North Africa, they should have a place to start.</p>
   <p>A place where financial markets connect to companies.</p>
   <p>Companies connect to industries.</p>
   <p>Industries connect to economies.</p>
   <p>Economies connect to geography and history.</p>
   <p>And all of it connects to the people who shape the region.</p>
   <div className={styles.motto}><span>One region.</span><span>One information layer.</span><span>One platform.</span></div>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">06 / The future</div>
   <h2>This is only the beginning.</h2>
   <p>Today, iStocks begins with markets.</p>
   <p>Tomorrow, it can become something much larger.</p>
   <p>A place to research a company.</p>
   <p>Understand an economy.</p>
   <p>Explore a country.</p>
   <p>Study a civilization.</p>
   <p>Discover a city.</p>
   <p>Compare regions.</p>
   <p>Follow the movement of capital.</p>
   <p>Understand the forces shaping North Africa.</p>
   <p>And eventually, understand the region as a connected whole.</p>
   <div className={styles.final}><p>North Africa deserves world-class digital infrastructure for its information.</p><strong>iStocks is building it.</strong></div>
  </section>

  <nav className={styles.cta} aria-label="Explore iStocks">
   <Link href="/" className={styles.ctaPrimary}>Explore the markets <span aria-hidden="true">→</span></Link>
   <Link href="/" className={styles.ctaSecondary}>Explore North Africa <span aria-hidden="true">→</span></Link>
  </nav>
 </main>;
}
