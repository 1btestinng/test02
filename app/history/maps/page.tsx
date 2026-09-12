'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import type {CSSProperties} from 'react';
import styles from './page.module.css';

const periods = [
  {year:'10,000 BCE',label:'Before Kingdoms',power:'Early North Africa',desc:'Hunter-gatherer societies, early pastoralism and the first long-distance ecological networks.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Sahara%20desert%20from%20space.jpg',cities:['Nabta Playa','Nile Valley'],tone:'prehistory'},
  {year:'3000 BCE',label:'First Kingdoms',power:'Ancient Egypt',desc:'The Nile Valley becomes one of the world’s earliest centers of state formation, writing and monumental architecture.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Giza%20pyramids%20%28view%20from%20a%20distance%29.jpg',cities:['Memphis','Thebes','Nabta Playa'],tone:'egypt'},
  {year:'300 BCE',label:'Carthage & Numidia',power:'Punic & Numidian Worlds',desc:'Carthage dominates Mediterranean commerce while Numidian kingdoms rise across the central Maghreb.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Carthage%20ruins%20Tunisia.jpg',cities:['Carthage','Cirta','Alexandria'],tone:'punic'},
  {year:'100 CE',label:'Roman Africa',power:'Roman Empire',desc:'Rome controls a chain of wealthy provinces, ports and agricultural regions stretching from Egypt to the western Maghreb.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Leptis%20Magna%20Roman%20theatre.jpg',cities:['Leptis Magna','Carthage','Alexandria','Volubilis'],tone:'rome'},
  {year:'700',label:'Islamic Transformation',power:'Early Islamic North Africa',desc:'New Islamic centers emerge as Arab armies and local populations reshape political, religious and commercial networks.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Mosque%20of%20Kairouan%20Tunisia.jpg',cities:['Kairouan','Fustat','Tripoli'],tone:'islamic'},
  {year:'1200',label:'Maghreb Empires',power:'Almohad World',desc:'A powerful Maghrebi empire links Morocco, Algeria, Tunisia and parts of Iberia under one political sphere.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Koutoubia%20Mosque%20Marrakesh.jpg',cities:['Marrakesh','Fez','Tlemcen','Tunis'],tone:'almohad'},
  {year:'1600',label:'Ottoman North Africa',power:'Ottoman Regencies',desc:'Ottoman influence dominates much of the central and eastern Maghreb while Morocco follows its own imperial trajectory.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Casbah%20of%20Algiers%20Algeria.jpg',cities:['Algiers','Tunis','Tripoli','Cairo'],tone:'ottoman'},
  {year:'1900',label:'Colonial Era',power:'European Colonial Powers',desc:'European empires redraw political boundaries and transform economies, cities and infrastructure across North Africa.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Tunis%20Avenue%20Habib%20Bourguiba.jpg',cities:['Algiers','Tunis','Cairo','Casablanca'],tone:'colonial'},
  {year:'Today',label:'Modern North Africa',power:'Six Modern States',desc:'Egypt, Libya, Tunisia, Algeria, Morocco and Mauritania form the modern political geography of North Africa.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Cairo%20skyline%20Egypt.jpg',cities:['Cairo','Tripoli','Tunis','Algiers','Rabat','Nouakchott'],tone:'modern'},
];

const countries = [
  ['🇪🇬','Egypt','Nile Valley · Mediterranean · Red Sea'],
  ['🇱🇾','Libya','Tripolitania · Cyrenaica · Fezzan'],
  ['🇹🇳','Tunisia','Ifriqiya · Carthage · Tunis'],
  ['🇩🇿','Algeria','Numidia · Maghreb · Algiers'],
  ['🇲🇦','Morocco','Mauretania Tingitana · Maghreb'],
  ['🇲🇷','Mauritania','Sahara · Western Sahel · Atlantic'],
];

const events = [
  ['146 BCE','Carthage falls','Rome destroys Punic Carthage and absorbs its territories.'],
  ['642 CE','Egypt conquered','Arab-Muslim forces take control of Egypt, beginning a major political transformation.'],
  ['670','Kairouan founded','A new military and religious center becomes a gateway into the Maghreb.'],
  ['909','Fatimids rise','The Fatimid movement emerges in Ifriqiya before conquering Egypt.'],
  ['1171','Saladin in Egypt','The Fatimid caliphate ends and Egypt enters the Ayyubid era.'],
  ['1830','Algeria invaded','France begins the conquest of Ottoman Algeria.'],
  ['1956','Maghreb independence','Morocco and Tunisia gain independence from French rule.'],
  ['1960','Mauritania independence','Mauritania becomes independent from France.'],
];

export default function HistoricalMapsPage(){
 const [index,setIndex]=useState(4);
 const [country,setCountry]=useState('All');
 const current=periods[index];
 const progress=(index/(periods.length-1))*100;
 const filteredCountries=useMemo(()=>country==='All'?countries:countries.filter(c=>c[1]===country),[country]);

 return <main className={styles.page}>
  <div className={styles.breadcrumb}><Link href="/history">History</Link><span>/</span> Historical Atlas</div>

  <header className={styles.hero}>
   <div className={styles.heroKicker}>NORTH AFRICA · 10,000 BCE → TODAY</div>
   <h1>One region.<br/><em>Thousands of years.</em></h1>
   <p>Drag through time and watch North Africa transform — kingdoms rise, trade routes move, cities appear, empires expand and modern borders take shape.</p>
   <div className={styles.heroRule}><span>THE HISTORICAL ATLAS</span><span>INTERACTIVE EDITION · 01</span></div>
  </header>

  <section className={styles.atlas} aria-label="Interactive historical atlas">
   <div className={styles.atlasTop}>
    <div><div className="eyebrow">Map / {current.year}</div><h2>{current.label}</h2></div>
    <div className={styles.power}>{current.power}</div>
   </div>

   <div className={styles.mapStage}>
    <div className={`${styles.mapGlow} ${styles[current.tone]}`} />
    <img className={styles.mapImage} src={current.image} alt={`${current.label} historical North Africa`} />
    <div className={styles.mapShade} />
    <div className={styles.mapTitle}><span>{current.year}</span><strong>{current.power}</strong></div>
    <div className={styles.regionLabel}><span>NORTH AFRICA</span><i /></div>
    {current.cities.slice(0,5).map((city,i)=><div key={city} className={`${styles.city} ${styles[`city${i}`]}`}><b /><span>{city}</span></div>)}
    <div className={styles.mapLegend}><span><i className={styles.dot} /> major center</span><span><i className={styles.line} /> sphere of influence</span></div>
   </div>

   <div className={styles.controls}>
    <button onClick={()=>setIndex(Math.max(0,index-1))} disabled={index===0} aria-label="Previous period">←</button>
    <div className={styles.sliderWrap}>
      <div className={styles.sliderLabels}>{periods.map((p,i)=><button key={p.year} className={i===index?styles.activeTick:''} onClick={()=>setIndex(i)}>{p.year}</button>)}</div>
      <input aria-label="Historical period" type="range" min="0" max={periods.length-1} step="1" value={index} onChange={e=>setIndex(Number(e.target.value))} style={{'--progress':`${progress}%`} as CSSProperties}/>
    </div>
    <button onClick={()=>setIndex(Math.min(periods.length-1,index+1))} disabled={index===periods.length-1} aria-label="Next period">→</button>
   </div>
  </section>

  <section className={styles.periodIntro}>
   <div><span className={styles.bigYear}>{current.year}</span><span className={styles.periodName}>{current.label}</span></div>
   <p>{current.desc}</p>
  </section>

  <section className={styles.gridSection}>
   <div className={styles.sectionHead}><div><div className="eyebrow">Places on the map</div><h2>Where history happened</h2></div><span>{current.cities.length} featured centers</span></div>
   <div className={styles.cityGrid}>{current.cities.map((city,i)=><article key={city} className={styles.cityCard}><span>0{i+1}</span><h3>{city}</h3><p>{i===0?'Political, commercial or cultural center of its age.':'A strategic node in the changing North African network.'}</p></article>)}</div>
  </section>

  <section className={styles.countrySection}>
   <div className={styles.sectionHead}><div><div className="eyebrow">Modern geography</div><h2>Six countries, one connected region</h2></div></div>
   <div className={styles.countryTabs}><button className={country==='All'?styles.selected:''} onClick={()=>setCountry('All')}>All</button>{countries.map(c=><button key={c[1]} className={country===c[1]?styles.selected:''} onClick={()=>setCountry(c[1])}>{c[0]} {c[1]}</button>)}</div>
   <div className={styles.countryGrid}>{filteredCountries.map(c=><div key={c[1]} className={styles.countryCard}><span>{c[0]}</span><div><h3>{c[1]}</h3><p>{c[2]}</p></div></div>)}</div>
  </section>

  <section className={styles.eventSection}>
   <div className={styles.sectionHead}><div><div className="eyebrow">Crossroads</div><h2>Moments that changed the map</h2></div></div>
   <div className={styles.events}>{events.map(e=><article key={e[0]}><time>{e[0]}</time><div><h3>{e[1]}</h3><p>{e[2]}</p></div></article>)}</div>
  </section>

  <section className={styles.sources}>
   <div><div className="eyebrow">Research layer</div><h2>History should be explored, not just read.</h2></div>
   <p>This atlas is designed as a visual gateway. Use the period slider to orient yourself, then jump into the detailed History archive for civilizations, people, cities and events. Historical boundaries are presented as an educational visualization and are not intended as precise political-border reconstructions.</p>
   <div className={styles.sourceLinks}><a href="https://whc.unesco.org/" target="_blank" rel="noreferrer">UNESCO World Heritage ↗</a><a href="https://www.metmuseum.org/toah/" target="_blank" rel="noreferrer">Met Heilbrunn Timeline ↗</a><a href="https://www.oldmapsonline.org/" target="_blank" rel="noreferrer">OldMapsOnline ↗</a></div>
  </section>
 </main>;
}
