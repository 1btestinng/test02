import type {Metadata} from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata:Metadata={
 title:'Historical North Africa | Koshary and Couscous',
 description:'Explore historical maps of Egypt, Libya, Tunisia, Algeria, and Morocco through time with Koshary and Couscous.',
};

const countries=[
 {flag:'🇪🇬',name:'Egypt'},
 {flag:'🇱🇾',name:'Libya'},
 {flag:'🇹🇳',name:'Tunisia'},
 {flag:'🇩🇿',name:'Algeria'},
 {flag:'🇲🇦',name:'Morocco'},
];

const eras=['Ancient','Medieval','Ottoman','Colonial','Independence','Modern'];

export default function HistoricalMapsPage(){
 return <main className={styles.page}>
  <div className={styles.breadcrumb}><Link href="/history">History</Link> / Historical Maps</div>
  <header className={styles.hero}>
   <div>
    <div className="eyebrow">North Africa · History</div>
    <h1>Historical North Africa</h1>
    <p>Explore historical maps of North Africa through time.</p>
   </div>
  </header>

  <nav className={styles.countries} aria-label="North African countries">
   {countries.map(country=><span key={country.name}><span aria-hidden="true">{country.flag}</span>{country.name}</span>)}
  </nav>

  <section className={styles.timeline} aria-label="Historical periods">
   {eras.map((era,index)=><div key={era} className={styles.era}><span>{era}</span>{index<eras.length-1&&<i aria-hidden="true"/>}</div>)}
  </section>

  <section className={styles.explorer} aria-labelledby="explorer-title">
   <div className={styles.sectionHeading}>
    <div><div className="eyebrow">Historical Map Explorer</div><h2 id="explorer-title">Search the archive</h2></div>
    <a href="https://demo.oldmapsonline.org/api/v1/geosearch" target="_blank" rel="noreferrer">Open full screen ↗</a>
   </div>
   <div className={styles.mapFrame}>
    <iframe
     title="OldMapsOnline historical map search"
     src="https://demo.oldmapsonline.org/api/v1/geosearch"
     loading="lazy"
     referrerPolicy="strict-origin-when-cross-origin"
     allowFullScreen
    />
   </div>
   <p className={styles.attribution}>Historical maps powered by <a href="https://www.oldmapsonline.org/" target="_blank" rel="noreferrer">OldMapsOnline</a> and its participating map collections. Map ownership and usage rights remain with the respective providers.</p>
  </section>

  <section className={styles.note}>
   <div className="eyebrow">How to use it</div>
   <p>Zoom to a place, choose a time range, search, and explore the historical maps available for that area. The map explorer supports touch devices and can display historical map overlays.</p>
  </section>
 </main>;
}
