import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './vision.module.css';

export const metadata:Metadata={
 title:'Koshary and Couscous | Vision',
 description:'Our founding vision for building a digital home for North Africa — connecting its countries, people, history, culture, economies, markets and stories.',
};

export default function VisionPage(){
 return <main className={styles.page}>
  <div className={styles.breadcrumb}>Koshary and Couscous / Vision</div>

  <section className={styles.hero}>
   <div className={styles.heroEyebrow}>OUR VISION</div>
   <h1>The United States of North Africa.</h1>
   <p className={styles.heroLead}>We believe North Africa deserves to be seen differently — not as five countries on a map, but as a living civilization connected by history, culture, geography, trade, language, food, ideas and people.</p>
   <p className={styles.heroNote}>A digital home for understanding, exploring and connecting North Africa.</p>
  </section>

  <article className={styles.article}>
   <div className="eyebrow">01 / The idea</div>
   <h2>We are building a home for North Africa.</h2>
   <p>A place where you can discover Egypt without forgetting Libya.</p>
   <p>Where Tunisia can lead you toward Algeria.</p>
   <p>Where Morocco is not the end of the map, but another part of the same story.</p>
   <p>A place where history connects to the present.</p>
   <p>Where culture connects to economics.</p>
   <p>Where companies connect to cities.</p>
   <p>Where markets connect to people.</p>
   <p>Where information connects the region.</p>
   <div className={styles.manifestoLine}><strong>One place. One region. Thousands of stories.</strong></div>
  </article>

  <section className={styles.section}>
   <div className="eyebrow">02 / Where we begin</div>
   <h2>We start with markets.</h2>
   <p>Because markets tell stories.</p>
   <p>Behind every company is an industry.</p>
   <p>Behind every industry is an economy.</p>
   <p>Behind every economy are millions of people.</p>
   <p>And behind every number is a country with a history, a culture, a future and an ambition.</p>
   <p>We started by looking at markets.</p>
   <p>But we quickly realized that markets were only the beginning.</p>
   <p>There is a much bigger picture waiting to be connected.</p>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">03 / Understanding</div>
   <h2>We want to make North Africa understandable.</h2>
   <p>Information about our region is everywhere.</p>
   <p>But it is fragmented.</p>
   <p>One website tells you about a company. Another tells you about a city. Another tells you about history. Another gives you economic statistics. Another shows you a map. Another tells you where to travel.</p>
   <p className={styles.emphasis}>The story is scattered.</p>
   <p>We want to bring the pieces together.</p>
   <p>Not to make the world smaller.</p>
   <p>But to make it easier to understand.</p>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">04 / Connection</div>
   <h2>We believe information can create connection.</h2>
   <p>A person in Cairo should be able to discover Tunis.</p>
   <p>Someone in Casablanca should be able to understand Alexandria.</p>
   <p>Someone in Algiers should be able to explore Tripoli.</p>
   <p>Someone in Sfax should be able to discover Marrakesh.</p>
   <p>And someone from anywhere in the world should be able to open one place and begin understanding <strong>North Africa.</strong></p>
   <p>Because you cannot love what you cannot discover.</p>
   <p>And you cannot connect with what you cannot understand.</p>
  </section>

  <section className={`${styles.section} ${styles.countries}`}>
   <div className="eyebrow">05 / Five countries</div>
   <h2>One region.</h2>
   <p>Egypt. Libya. Tunisia. Algeria. Morocco.</p>
   <p>Five modern states.</p>
   <p>Thousands of years of shared history.</p>
   <p>Different identities. Different languages and dialects. Different economies. Different experiences.</p>
   <p>Yet countless connections running beneath the surface.</p>
   <p>We don't want to erase those differences.</p>
   <p className={styles.emphasis}>We want to reveal the connections between them.</p>
   <div className={styles.countryGrid}>
    {['🇪🇬 Egypt','🇱🇾 Libya','🇹🇳 Tunisia','🇩🇿 Algeria','🇲🇦 Morocco'].map(country=><div className={styles.country} key={country}>{country}</div>)}
   </div>
  </section>

  <section className={`${styles.section} ${styles.idea}`}>
   <div className="eyebrow">06 / The United States of North Africa</div>
   <h2>An idea before it is anything else.</h2>
   <p>This is not a political project.</p>
   <p>It is not a government.</p>
   <p>It is not a proposal to redraw borders.</p>
   <p>It is an idea.</p>
   <p>A way of looking at the region.</p>
   <p>A belief that North Africa can be understood as something larger than the sum of its countries.</p>
   <p>A digital space where the borders become less important than the connections.</p>
   <div className={styles.manifestoLine}><strong>The United States of North Africa is an idea before it is anything else.</strong></div>
   <p className={styles.largeQuote}>We belong to the same story.</p>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">07 / How we build</div>
   <h2>We want to build slowly.</h2>
   <p>We don't want to pretend that we already have everything.</p>
   <p>We don't.</p>
   <p>There is a tremendous amount of work ahead.</p>
   <p>More data. More history. More cities. More companies. More maps. More languages. More stories. More people. More connections.</p>
   <p>We will build them one by one.</p>
   <p>And we will care about the details.</p>
   <p>Because if we are going to build something for an entire region, <strong>it deserves to be built properly.</strong></p>
  </section>

  <section className={styles.section}>
   <div className="eyebrow">08 / Curiosity</div>
   <h2>We believe in curiosity.</h2>
   <p>Curiosity about where we came from.</p>
   <p>Curiosity about who we are.</p>
   <p>Curiosity about our neighbors.</p>
   <p>Curiosity about what we can become.</p>
   <p>We want a young person discovering the history of Carthage to become curious about Tunisia.</p>
   <p>Someone studying an Egyptian company to discover the Moroccan market.</p>
   <p>A traveler searching for the Sahara to discover the cultures that surround it.</p>
   <p>An investor comparing economies to discover the people behind the numbers.</p>
   <p className={styles.emphasis}>Curiosity is where connection begins.</p>
  </section>

  <section className={`${styles.section} ${styles.future}`}>
   <div className="eyebrow">09 / The future</div>
   <h2>And this is only the beginning.</h2>
   <p>Today, we are building a website.</p>
   <p>Tomorrow, we want to build an information layer for an entire region.</p>
   <p>A place where markets, history, economics, travel, culture, geography and people are not isolated subjects.</p>
   <p>They are connected.</p>
   <p>Because that's how the real world works.</p>
   <p className={styles.largeQuote}>Everything is connected.</p>
   <div className={styles.connectionList}>
    <span>A company is connected to an economy.</span>
    <span>An economy is connected to a city.</span>
    <span>A city is connected to its people.</span>
    <span>People are connected to culture.</span>
    <span>Culture is connected to history.</span>
    <span>And history is connected to everything that comes next.</span>
   </div>
  </section>

  <section className={`${styles.section} ${styles.ambition}`}>
   <div className="eyebrow">10 / The ambition</div>
   <h2>We don't know exactly how far this can go.</h2>
   <p>And that's part of the point.</p>
   <p>We don't want to build something small enough to know its ending.</p>
   <p>We want to build something that can grow with the region.</p>
   <p>Something that can become more useful every year.</p>
   <p>Something that future generations can look back at and say:</p>
   <div className={styles.largeQuote}>This helped us see our region differently.</div>
  </section>

  <section className={`${styles.finalSection} ${styles.section}`}>
   <div className="eyebrow">11 / Our beginning</div>
   <h2>This is our beginning.</h2>
   <p>We start with markets.</p>
   <p>We expand into information.</p>
   <p>We connect the countries.</p>
   <p>We document the stories.</p>
   <p>We make the data understandable.</p>
   <p>We make the region easier to explore.</p>
   <p>And slowly, piece by piece,</p>
   <div className={styles.finalStatement}>we build a digital home for North Africa.</div>
   <p>Not for one country.</p>
   <p>Not for one generation.</p>
   <p>Not for one kind of person.</p>
   <p className={styles.largeQuote}>For everyone.</p>
  </section>

  <section className={styles.food}>
   <h2>Koshary and Couscous.</h2>
   <p>Two foods.</p>
   <p>Two words.</p>
   <p>A little strange together.</p>
   <p>And somehow, perfectly North African.</p>
   <p>Because this region has always been a meeting place.</p>
   <p>Of civilizations.</p>
   <p>Of languages.</p>
   <p>Of cultures.</p>
   <p>Of people.</p>
   <p>Of ideas.</p>
   <div className={styles.closingThought}>
    <strong>We are different.</strong>
    <strong>We are connected.</strong>
    <strong>And there is something beautiful about both being true at the same time.</strong>
   </div>
  </section>

  <section className={styles.closing}>
   <div className={styles.closingTitle}>The United States of North Africa.</div>
   <div className={styles.closingSub}>Five countries. One region. One shared story. And a future that has not been written yet.</div>
   <div className={styles.closingPromise}>We want to help tell it.</div>
   <div className={styles.closingLove}>We love koshary and couscous.<br/>We love North Africa.<br/>We love you all.</div>
  </section>

  <nav className={styles.cta} aria-label="Explore Koshary and Couscous">
   <Link href="/markets" className={styles.ctaPrimary}>Explore the markets <span aria-hidden="true">→</span></Link>
   <Link href="/" className={styles.ctaSecondary}>Explore North Africa <span aria-hidden="true">→</span></Link>
  </nav>
 </main>;
}
