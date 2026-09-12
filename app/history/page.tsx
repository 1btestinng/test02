'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import styles from './page.module.css';

type Era = {year:string; title:string; text:string; image:string; tags:string[]};
type Item = {title:string; meta:string; text:string; image:string; tags:string[]};

const historicalImage = (query:string,fallback:string) => `/api/images/pixabay?q=${encodeURIComponent(query)}&fallback=${encodeURIComponent(fallback)}`;

const img = {
  giza:historicalImage('Giza pyramids Egypt','https://commons.wikimedia.org/wiki/Special:FilePath/All%20Gizah%20Pyramids.jpg'),
  carthage:historicalImage('Carthage ruins Tunisia','https://commons.wikimedia.org/wiki/Special:FilePath/Carthage%20ruins%20Tunisia.jpg'),
  alexandria:historicalImage('Alexandria Egypt library','https://commons.wikimedia.org/wiki/Special:FilePath/Alexandria%20Egypt%20Bibliotheca.jpg'),
  lepcis:historicalImage('Leptis Magna Libya Roman ruins','https://commons.wikimedia.org/wiki/Special:FilePath/Leptis%20Magna%20Roman%20theatre.jpg'),
  volubilis:historicalImage('Volubilis Morocco ruins','https://commons.wikimedia.org/wiki/Special:FilePath/Volubilis%20Morocco.jpg'),
  kairouan:historicalImage('Great Mosque Kairouan Tunisia','https://commons.wikimedia.org/wiki/Special:FilePath/Great%20Mosque%20of%20Kairouan.jpg'),
  casbah:historicalImage('Casbah Algiers Algeria','https://commons.wikimedia.org/wiki/Special:FilePath/Casbah%20of%20Algiers.jpg'),
  tunis:historicalImage('Tunis medina Tunisia','https://commons.wikimedia.org/wiki/Special:FilePath/Tunis%20medina.jpg'),
  cairo:historicalImage('Cairo Egypt citadel','https://commons.wikimedia.org/wiki/Special:FilePath/Cairo%20Egypt%20citadel.jpg'),
  fez:historicalImage('Fez Morocco medina','https://commons.wikimedia.org/wiki/Special:FilePath/Fez%20Morocco%20medina.jpg'),
  desert:historicalImage('Sahara desert Algeria','https://commons.wikimedia.org/wiki/Special:FilePath/Sahara%20desert%20Algeria.jpg'),
  med:historicalImage('Mediterranean coast Tunisia','https://commons.wikimedia.org/wiki/Special:FilePath/Mediterranean%20Sea%20coast%20Tunisia.jpg'),
};

const eras: Era[] = [
 {year:'c. 10,000–3,000 BCE',title:'Before Kingdoms',text:'The landscapes of North Africa were once considerably wetter than today. Hunter-gatherer communities, pastoralists and early farming societies occupied the Nile Valley, Mediterranean coast, central Maghreb and Saharan zones. Rock art preserves evidence of changing environments, animals and human activity across the Sahara.',image:img.desert,tags:['Prehistory','Sahara','Archaeology']},
 {year:'c. 3100–30 BCE',title:'Ancient Egypt',text:'The unification of Upper and Lower Egypt created one of the ancient world’s most enduring states. Egypt developed powerful institutions, monumental architecture, writing, long-distance trade and a sophisticated religious culture centered on the Nile. Its influence repeatedly reached westward into Libya and across the Mediterranean.',image:img.giza,tags:['Egypt','Pharaohs','Nile']},
 {year:'c. 1000–146 BCE',title:'Phoenicians & Carthage',text:'Phoenician merchants and settlers established ports around the western Mediterranean. Carthage, traditionally founded in the late 9th century BCE, became the dominant maritime power of the central and western Mediterranean and the political center of a wider Punic world.',image:img.carthage,tags:['Carthage','Phoenicians','Mediterranean']},
 {year:'3rd–1st century BCE',title:'Numidia & Hellenistic North Africa',text:'Numidian kingdoms emerged in the central Maghreb while the Greek-speaking Hellenistic world shaped Cyrenaica and Egypt. The region was not one political unit: kingdoms, cities and commercial networks competed and interacted across the Mediterranean.',image:img.alexandria,tags:['Numidia','Cyrenaica','Hellenistic']},
 {year:'146 BCE–4th century CE',title:'Roman Africa',text:'After Carthage fell in 146 BCE, Rome expanded across much of North Africa. Provinces such as Africa Proconsularis became major agricultural and commercial regions, while cities, roads, amphitheaters, ports and estates transformed the landscape.',image:img.lepcis,tags:['Rome','Carthage','Africa']},
 {year:'1st–7th centuries CE',title:'Christian North Africa',text:'Christianity spread through North African cities and rural communities. The region produced influential theologians and bishops, including Augustine of Hippo. Christian communities developed distinctive intellectual and ecclesiastical traditions before the political changes of the 5th and 7th centuries.',image:img.med,tags:['Christianity','Augustine','Late Antiquity']},
 {year:'439–533 CE',title:'Vandals & Late Antiquity',text:'The Vandals established a kingdom centered on Carthage after crossing into North Africa. Their rule was followed by Byzantine reconquest under Justinian in the 6th century, reconnecting parts of the region to the eastern Roman Empire.',image:img.carthage,tags:['Vandals','Byzantines','Late Antiquity']},
 {year:'7th–10th centuries',title:'The Arab Conquests & New Islamic Centers',text:'Arab armies conquered Egypt in the 7th century and gradually expanded westward. Islam and Arabic spread alongside existing Amazigh, Coptic and other local traditions. New centers of political and intellectual power emerged, including Kairouan and later Cairo.',image:img.kairouan,tags:['Islam','Arab conquest','Kairouan']},
 {year:'909–1171',title:'Fatimids & the Rise of Cairo',text:'The Fatimid dynasty emerged in Ifriqiya before conquering Egypt in 969 and founding Cairo as a new imperial capital. Their realm connected North Africa with Egypt and the wider eastern Mediterranean, Red Sea and Islamic world.',image:img.cairo,tags:['Fatimids','Cairo','Ifriqiya']},
 {year:'11th–13th centuries',title:'Almoravids & Almohads',text:'The Almoravid and Almohad movements built large political formations spanning parts of the Maghreb and Iberia. Their period linked cities, scholars, merchants and military networks across the western Islamic Mediterranean and Sahara.',image:img.volubilis,tags:['Almoravids','Almohads','Maghreb']},
 {year:'13th–16th centuries',title:'The Medieval Maghreb',text:'Marinids, Zayyanids and Hafsids governed major parts of the western and central Maghreb. Fez, Tlemcen and Tunis became important centers of learning, commerce and political power, while trans-Saharan trade connected the Mediterranean to West Africa.',image:img.fez,tags:['Hafsids','Marinids','Trade']},
 {year:'16th–19th centuries',title:'The Ottoman Era',text:'Ottoman power expanded into North Africa, especially Algeria, Tunisia and Libya, while Morocco remained outside direct Ottoman rule. Local rulers, corsair fleets, merchant networks and European powers interacted in a changing Mediterranean political system.',image:img.tunis,tags:['Ottoman','Mediterranean','Regencies']},
 {year:'19th–20th centuries',title:'Colonial Transformation',text:'European imperial expansion reshaped North Africa through military conquest, protectorates, settlement, infrastructure projects and new administrative borders. France controlled Algeria, Tunisia and Morocco in different legal forms; Italy conquered Libya; Egypt experienced British occupation and influence.',image:img.casbah,tags:['Colonialism','France','Italy','Britain']},
 {year:'1920s–1970s',title:'Nationalism & Independence',text:'North African societies developed powerful nationalist movements. Political struggle, diplomacy, armed resistance and international pressure eventually produced independence for Libya, Egypt, Tunisia, Morocco, Algeria and Mauritania at different moments.',image:img.cairo,tags:['Nationalism','Independence','20th century']},
 {year:'1950s–Today',title:'Modern North Africa',text:'Independent states developed distinct political systems and economic models while remaining connected by language, migration, trade, family networks and shared Mediterranean and Saharan geography. The region today contains both deep historical continuities and sharply modern identities.',image:img.med,tags:['Modern','States','Identity']},
];

const countries: Item[] = [
 {title:'Egypt',meta:'Nile Valley · Mediterranean · Red Sea',text:'Egypt’s history is anchored by the Nile Valley but has always been connected to the wider Mediterranean, Levant, Sahara and Red Sea. Ancient pharaonic kingdoms were followed by Persian, Hellenistic, Roman, Byzantine, Islamic and Ottoman periods. The country became a major center of Islamic scholarship under successive dynasties and later entered the modern era through Muhammad Ali’s state-building, European intervention and the 1952 revolution.',image:img.giza,tags:['Egypt','Nile']},
 {title:'Libya',meta:'Tripolitania · Cyrenaica · Fezzan',text:'Modern Libya brings together several historical regions with different Mediterranean and Saharan connections. Ancient Cyrenaica had strong Greek links, while Tripolitania developed important Phoenician and Roman cities such as Leptis Magna and Sabratha. The Ottoman period and Italian colonization left further layers before independence in 1951.',image:img.lepcis,tags:['Libya','Tripolitania','Cyrenaica']},
 {title:'Tunisia',meta:'Carthage · Ifriqiya · Mediterranean',text:'Tunisia occupies a strategic position at the center of the Mediterranean. Carthage became a major Punic power; Rome later made the region one of its richest African provinces. Kairouan became an early Islamic center, while the Hafsid period gave Tunis major regional importance. Tunisia became a French protectorate in 1881 and independent in 1956.',image:img.carthage,tags:['Tunisia','Carthage','Kairouan']},
 {title:'Algeria',meta:'Maghreb · Sahara · Mediterranean',text:'Algeria contains some of North Africa’s richest archaeological landscapes, from Numidian and Roman sites to medieval Islamic cities. Ottoman Algiers developed as a major Mediterranean political and naval center. French conquest began in 1830 and was followed by a long and violent struggle for independence, achieved in 1962.',image:img.casbah,tags:['Algeria','Ottoman','Independence']},
 {title:'Morocco',meta:'Atlantic · Maghreb · Sahara',text:'Morocco developed through Amazigh kingdoms, Islamic dynasties and strong Atlantic and Saharan connections. The Almoravid and Almohad empires projected power across the Maghreb and Iberia. Marinid, Saadian and Alaouite periods followed. Morocco entered a French and Spanish protectorate system in 1912 and regained independence in 1956.',image:img.volubilis,tags:['Morocco','Almohads','Atlantic']},
 {title:'Mauritania',meta:'Sahara · Sahel · Atlantic',text:'Mauritania sits at the meeting point of the Maghreb, Sahara and western Sahel. Ancient and medieval routes connected its desert communities to North African and West African markets. The region became part of French West Africa before independence in 1960, while the ancient city of Chinguetti remains a symbol of Saharan scholarship.',image:img.desert,tags:['Mauritania','Sahara','Sahel']},
];

const civilizations: Item[] = [
 {title:'Ancient Egyptians',meta:'Nile Valley · c. 3100–30 BCE',text:'A long-lived civilization organized around the Nile, with powerful kingship, writing, monumental architecture, temples, administrative institutions and extensive trade networks.',image:img.giza,tags:['Ancient']},
 {title:'Amazigh Peoples',meta:'Across the Maghreb and Sahara',text:'Amazigh communities and kingdoms have formed a foundational part of North African history for millennia. Their languages, social structures, artistic traditions and political organizations interacted with Phoenician, Roman, Arab, Ottoman and European worlds.',image:img.desert,tags:['Amazigh']},
 {title:'Phoenicians & Punic Cities',meta:'Mediterranean · 1st millennium BCE',text:'Phoenician settlements created a network of ports and trading communities. Carthage grew from this world into an independent Punic power with its own institutions, culture and overseas interests.',image:img.carthage,tags:['Punic']},
 {title:'Numidians',meta:'Central Maghreb · Antiquity',text:'Numidian kingdoms occupied important parts of present-day Algeria and Tunisia. Kings such as Massinissa played decisive roles in the politics of the western Mediterranean during the Punic Wars and their aftermath.',image:img.med,tags:['Numidia']},
 {title:'Romans',meta:'146 BCE onward',text:'Roman rule integrated large parts of North Africa into an imperial system of provinces, roads, ports, agriculture and cities. North African grain, olive oil and other products supported Mediterranean markets.',image:img.lepcis,tags:['Rome']},
 {title:'Byzantines',meta:'6th–7th centuries',text:'The eastern Roman Empire reconquered much of the former Vandal kingdom under Justinian. Fortifications, churches and administrative centers marked this final major phase of Roman imperial rule in Africa.',image:img.carthage,tags:['Byzantium']},
 {title:'Fatimids',meta:'10th–12th centuries',text:'The Fatimids began in Ifriqiya and later conquered Egypt, founding Cairo. Their state connected North Africa and Egypt to a wider network stretching across the Mediterranean and Islamic world.',image:img.cairo,tags:['Islamic']},
 {title:'Almoravids',meta:'11th–12th centuries',text:'Originating in the Saharan and western Maghreb environment, the Almoravids built a major empire extending into al-Andalus and founded or transformed important centers including Marrakesh.',image:img.desert,tags:['Maghreb']},
 {title:'Almohads',meta:'12th–13th centuries',text:'The Almohads replaced Almoravid power and created one of the largest medieval states in the western Islamic world, linking the Maghreb and Iberia.',image:img.fez,tags:['Maghreb']},
 {title:'Hafsid Ifriqiya',meta:'13th–16th centuries',text:'The Hafsids ruled much of modern Tunisia and neighboring regions from Tunis. Their era was important for Mediterranean commerce, scholarship and the growth of Tunis as a regional capital.',image:img.tunis,tags:['Tunisia']},
 {title:'Ottoman North Africa',meta:'16th–19th centuries',text:'Ottoman institutions and local dynasties shaped Algeria, Tunisia and Libya, while maritime competition with European powers transformed the central Mediterranean.',image:img.tunis,tags:['Ottoman']},
];

const events: Item[] = [
 {title:'Foundation of Carthage',meta:'Traditionally 814 BCE',text:'Carthage emerged as a major Phoenician-founded city on the Gulf of Tunis and eventually became the center of a powerful Punic state.',image:img.carthage,tags:['Carthage']},
 {title:'Battle of Cannae',meta:'216 BCE',text:'Hannibal’s victory over Rome became one of the most famous battles of the Second Punic War and demonstrated Carthaginian tactical brilliance at the height of the conflict.',image:img.med,tags:['Hannibal','Rome']},
 {title:'Destruction of Carthage',meta:'146 BCE',text:'Rome destroyed Carthage at the end of the Third Punic War. The territory became a Roman province and the political map of the western Mediterranean changed dramatically.',image:img.carthage,tags:['Rome']},
 {title:'Arab Conquest of Egypt',meta:'639–642 CE',text:'Arab forces conquered Byzantine Egypt. The foundation of Fustat created a new political center near the future Cairo and began a profound transformation of Egypt’s religious and linguistic landscape.',image:img.cairo,tags:['Egypt','Islam']},
 {title:'Foundation of Kairouan',meta:'c. 670 CE',text:'Kairouan became one of the earliest major Islamic cities in the Maghreb and an enduring center of religious learning.',image:img.kairouan,tags:['Tunisia','Islam']},
 {title:'Fatimid Conquest of Egypt',meta:'969 CE',text:'The Fatimids conquered Egypt and founded Cairo, establishing a new imperial capital that would become one of the most important cities in the Islamic world.',image:img.cairo,tags:['Fatimids','Cairo']},
 {title:'Almohad Expansion',meta:'12th century',text:'The Almohads unified large parts of the Maghreb and al-Andalus, creating an unusually extensive political sphere across the western Mediterranean.',image:img.fez,tags:['Almohads']},
 {title:'Ottoman Capture of Algiers',meta:'16th century',text:'Algiers became a major Ottoman-linked center in the central Mediterranean, with local political authority operating alongside Ottoman imperial structures.',image:img.casbah,tags:['Algeria','Ottoman']},
 {title:'French Conquest of Algeria',meta:'1830 onward',text:'The French invasion began a prolonged conquest and colonization that transformed Algeria’s political, economic and demographic structures.',image:img.casbah,tags:['Algeria','France']},
 {title:'Libyan Independence',meta:'1951',text:'Libya became an independent kingdom under Idris, becoming one of the earliest post-colonial states in North Africa.',image:img.lepcis,tags:['Libya']},
 {title:'Tunisian Independence',meta:'1956',text:'Tunisia ended the French protectorate and established an independent state under Habib Bourguiba.',image:img.tunis,tags:['Tunisia']},
 {title:'Moroccan Independence',meta:'1956',text:'Morocco ended the French and Spanish protectorate arrangements and restored sovereign statehood under the Alaouite monarchy.',image:img.fez,tags:['Morocco']},
 {title:'Algerian Independence',meta:'1962',text:'After the Algerian War and the Evian Accords, Algeria became independent from France in 1962.',image:img.casbah,tags:['Algeria']},
 {title:'Mauritanian Independence',meta:'1960',text:'Mauritania became independent from France in 1960, entering the post-colonial era as a new Saharan-Sahelian state.',image:img.desert,tags:['Mauritania']},
];

const cities: Item[] = [
 {title:'Alexandria',meta:'Egypt · Mediterranean',text:'Founded by Alexander the Great in 331 BCE, Alexandria became a major Hellenistic, Roman, Christian and later Islamic-era Mediterranean city.',image:img.alexandria,tags:['Egypt']},
 {title:'Carthage',meta:'Tunisia · Punic/Roman',text:'A strategic port and the heart of Punic power before becoming a major Roman city rebuilt near the site of the destroyed Carthage.',image:img.carthage,tags:['Tunisia']},
 {title:'Leptis Magna',meta:'Libya · Roman',text:'A major ancient port that flourished under Roman rule and is famous for monumental public architecture.',image:img.lepcis,tags:['Libya']},
 {title:'Kairouan',meta:'Tunisia · Islamic',text:'An early Islamic foundation and one of the Maghreb’s great centers of religious scholarship.',image:img.kairouan,tags:['Tunisia']},
 {title:'Fez',meta:'Morocco · Medieval',text:'A historic Moroccan city and major center of scholarship, crafts and commerce, especially under medieval dynasties.',image:img.fez,tags:['Morocco']},
 {title:'Tunis',meta:'Tunisia · Mediterranean',text:'A major city of Ifriqiya whose medina, ports and political institutions reflect centuries of Mediterranean and Islamic history.',image:img.tunis,tags:['Tunisia']},
 {title:'Algiers',meta:'Algeria · Mediterranean',text:'A strategically located Mediterranean city shaped by Ottoman rule, maritime activity and French colonialism.',image:img.casbah,tags:['Algeria']},
 {title:'Cairo',meta:'Egypt · Islamic world',text:'Founded by the Fatimids in 969, Cairo grew into a political, commercial and intellectual capital of enormous regional importance.',image:img.cairo,tags:['Egypt']},
 {title:'Volubilis',meta:'Morocco · Ancient',text:'An exceptionally preserved archaeological city whose remains reflect Mauritanian, Roman, Christian and later Islamic phases.',image:img.volubilis,tags:['Morocco']},
];

const people: Item[] = [
 {title:'Hannibal Barca',meta:'Carthaginian general · 3rd–2nd century BCE',text:'One of antiquity’s most famous commanders, Hannibal led Carthaginian forces across the Alps during the Second Punic War and won major victories against Rome.',image:img.carthage,tags:['Carthage']},
 {title:'Massinissa',meta:'King of Numidia · c. 238–148 BCE',text:'A major Numidian ruler who helped shape the political order of North Africa during the transition from Carthaginian to Roman dominance.',image:img.med,tags:['Numidia']},
 {title:'Augustine of Hippo',meta:'354–430 CE',text:'Born in North Africa and bishop of Hippo, Augustine became one of the most influential Christian thinkers of late antiquity.',image:img.med,tags:['Christianity']},
 {title:'Ibn Khaldun',meta:'1332–1406',text:'A North African historian and political thinker whose Muqaddimah developed influential ideas about society, state formation, group solidarity and historical change.',image:img.tunis,tags:['Maghreb']},
 {title:'Ibn Battuta',meta:'1304–c. 1368/69',text:'Born in Tangier, Ibn Battuta traveled across North Africa, the Middle East, Africa and Asia, leaving one of the medieval world’s most important travel accounts.',image:img.fez,tags:['Morocco']},
 {title:'Omar Mukhtar',meta:'1858–1931',text:'A prominent Libyan resistance leader who became a symbol of resistance to Italian colonial rule.',image:img.desert,tags:['Libya']},
 {title:'Habib Bourguiba',meta:'1903–2000',text:'Leader of Tunisia’s independence movement and the country’s first president, associated with state-building and major social reforms.',image:img.tunis,tags:['Tunisia']},
 {title:'Abdelkader',meta:'1808–1883',text:'Algerian religious and military leader who organized resistance to the French conquest before later living in exile.',image:img.casbah,tags:['Algeria']},
];

const allSections = [
 {key:'eras',label:'Eras',items:eras.map(e=>({title:e.title,meta:e.year,text:e.text,image:e.image,tags:e.tags}))},
 {key:'countries',label:'Countries',items:countries},
 {key:'civilizations',label:'Civilizations',items:civilizations},
 {key:'events',label:'Events',items:events},
 {key:'cities',label:'Cities',items:cities},
 {key:'people',label:'People',items:people},
];

function SafeImage({src,alt,className}:{src:string;alt:string;className?:string}){
 const [failed,setFailed]=useState(!src);
 if(failed||!src)return null;
 return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={()=>setFailed(true)} />;
}

function SafeImagePanel({src,className,children}:{src:string;className:string;children?:React.ReactNode}){
 const [failed,setFailed]=useState(!src);
 if(failed||!src)return null;
 return <div className={className}><img src={src} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)} />{children}</div>;
}

function Card({item,large=false}:{item:Item;large?:boolean}){
 const [imageFailed,setImageFailed]=useState(!item.image);
 return <article className={`${styles.card} ${large?styles.cardLarge:''}`}>
  {!imageFailed&&<div className={styles.cardImage}><img src={item.image} alt="" loading="lazy" decoding="async" onError={()=>setImageFailed(true)} /></div>}
  <div className={styles.cardBody}>
   <div className={styles.cardMeta}>{item.meta}</div>
   <h3>{item.title}</h3>
   <p>{item.text}</p>
   <div className={styles.tags}>{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
  </div>
 </article>;
}

export default function HistoryPage(){
 const [section,setSection]=useState('eras');
 const [query,setQuery]=useState('');
 const [country,setCountry]=useState('All');
 const [era,setEra]=useState('All');
 const active = allSections.find(s=>s.key===section) ?? allSections[0];
 const filtered = useMemo(()=>active.items.filter(item=>{
   const hay=`${item.title} ${item.meta} ${item.text} ${item.tags.join(' ')}`.toLowerCase();
   const q=!query || hay.includes(query.toLowerCase());
   const c=country==='All' || hay.includes(country.toLowerCase());
   const e=era==='All' || hay.includes(era.toLowerCase());
   return q&&c&&e;
 }),[active,query,country,era]);

 return <main className={styles.page}>
  <section className={styles.hero}>
   <SafeImagePanel src={img.carthage} className={styles.heroImage} />
   <div className={styles.heroOverlay}/>
   <div className={styles.heroContent}>
    <div className={styles.eyebrow}>NORTH AFRICA · HISTORY · c. 10,000 BCE → TODAY</div>
    <h1>North Africa<br/><em>Through Time.</em></h1>
    <p>From the Nile kingdoms and the rise of Carthage to the Islamic dynasties, Ottoman Mediterranean and modern nation-states — explore a region shaped by movement, exchange, conquest and extraordinary cultural continuity.</p>
    <div className={styles.heroActions}><a href="#timeline">Explore the timeline ↓</a><Link href="/history/maps">Historical maps ↗</Link></div>
   </div>
  </section>

  <section className={styles.intro}>
   <div className={styles.kicker}>A region, not a single story</div>
   <h2>North Africa has never been isolated.</h2>
   <div className={styles.introGrid}>
    <p>North Africa is a geographic bridge between the Mediterranean, the Sahara, the Nile Valley, the Red Sea and the Atlantic. Its history is therefore a story of connections: merchants crossing seas and deserts, armies moving between political centers, languages meeting, religions spreading, cities rising and falling, and communities preserving older traditions while adapting to new worlds.</p>
    <p>The modern borders of Egypt, Libya, Tunisia, Algeria, Morocco and Mauritania are recent compared with the thousands of years of movement that came before them. A historical atlas should make those layers visible rather than treating today’s borders as timeless.</p>
   </div>
  </section>

  <section className={styles.stats}>
   <div><strong>6</strong><span>modern North African states</span></div><div><strong>4</strong><span>major geographic worlds meet here: Mediterranean, Sahara, Nile & Atlantic</span></div><div><strong>30+</strong><span>featured historical subjects</span></div><div><strong>∞</strong><span>connections across cultures and centuries</span></div>
  </section>

  <section id="timeline" className={styles.timelineSection}>
   <div className={styles.sectionHead}><div><div className={styles.kicker}>01 · The master timeline</div><h2>Thousands of years in one view.</h2></div><p>Move through the major eras that transformed North Africa.</p></div>
   <div className={styles.timelineRail}>{eras.map((item,i)=><a href={`#era-${i}`} key={item.title} className={styles.timelineNode}><span>{item.year}</span><i/><b>{item.title}</b></a>)}</div>
   <div className={styles.eraList}>{eras.map((item,i)=><article id={`era-${i}`} className={styles.eraBlock} key={item.title}>
    <div className={styles.eraNumber}>{String(i+1).padStart(2,'0')}</div><div><div className={styles.cardMeta}>{item.year}</div><h3>{item.title}</h3><p>{item.text}</p><div className={styles.tags}>{item.tags.map(t=><span key={t}>{t}</span>)}</div></div><SafeImage src={item.image} alt="" />
   </article>)}</div>
  </section>

  <section className={styles.mapTeaser}>
   <div><div className={styles.kicker}>02 · Historical geography</div><h2>See the borders change.</h2><p>History is easier to understand when political space moves with time. The dedicated map explorer lets you investigate historical maps and compare places across periods.</p><Link href="/history/maps">Open the historical map explorer ↗</Link></div>
   <SafeImagePanel src={img.med} className={styles.mapVisual}><div className={styles.mapLines}><span>CARTHAGE</span><span>ROME</span><span>IFRIQIYA</span><span>OTTOMAN</span><span>MODERN STATES</span></div></SafeImagePanel>
  </section>

  <section className={styles.explorer}>
   <div className={styles.sectionHead}><div><div className={styles.kicker}>03 · Explore the archive</div><h2>Search North African history.</h2></div><p>Filter by country, era or subject. Every card is designed to open a path into a larger historical story.</p></div>
   <div className={styles.controls}>
    <div className={styles.tabs}>{allSections.map(s=><button className={section===s.key?styles.active:''} onClick={()=>setSection(s.key)} key={s.key}>{s.label}</button>)}</div>
    <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search history…" aria-label="Search history" />
    <select value={country} onChange={e=>setCountry(e.target.value)}><option>All</option><option>Egypt</option><option>Libya</option><option>Tunisia</option><option>Algeria</option><option>Morocco</option><option>Mauritania</option></select>
    <select value={era} onChange={e=>setEra(e.target.value)}><option>All</option><option>Ancient</option><option>Roman</option><option>Islamic</option><option>Medieval</option><option>Ottoman</option><option>Colonial</option><option>Independence</option></select>
   </div>
   <div className={styles.results}>{filtered.map((item,i)=><Card item={item} large={i===0 && !query && country==='All' && era==='All'} key={`${item.title}-${i}`}/>)}</div>
   {!filtered.length && <div className={styles.empty}>No historical subjects match those filters. Try another country, era or keyword.</div>}
  </section>

  <section className={styles.connectionSection}>
   <div className={styles.sectionHead}><div><div className={styles.kicker}>04 · The connections</div><h2>Six countries. One connected region.</h2></div><p>The most important stories often cross a modern border.</p></div>
   <div className={styles.countryGrid}>{countries.map(item=><Card item={item} key={item.title}/>)}</div>
  </section>

  <section className={styles.thenNow}>
   <SafeImagePanel src={img.carthage} className={styles.thenNowImage}><div><span>THEN</span><strong>Carthage & the Mediterranean</strong></div></SafeImagePanel>
   <div className={styles.thenNowCenter}><div className={styles.kicker}>05 · Then ↔ now</div><h2>Old landscapes.<br/>New borders.</h2><p>Modern North Africa is the product of many older political geographies. The map you know today is only the latest layer.</p></div>
   <SafeImagePanel src={img.med} className={styles.thenNowImage}><div><span>NOW</span><strong>Six modern states</strong></div></SafeImagePanel>
  </section>

  <section className={styles.featureGrid}>
   <div><div className={styles.kicker}>06 · Cultural memory</div><h2>Cities, people & places that carry the past forward.</h2><p>Ruins are not the whole story. Cities, languages, scholarship, architecture, foodways, religious traditions and family networks preserve historical connections long after political systems disappear.</p></div>
   <div className={styles.smallGrid}>{cities.slice(0,6).map(item=><Card item={item} key={item.title}/>)}</div>
  </section>

  <section className={styles.sources}>
   <div className={styles.kicker}>07 · Research notes</div><h2>History should be curious, but careful.</h2>
   <p>This section is designed as an educational atlas rather than a substitute for specialist scholarship. Dates and interpretations can be debated, ancient sources can be fragmentary, and modern national narratives sometimes describe the same past differently. The goal is to show the strongest broad historical structure while leaving room for deeper study.</p>
   <div className={styles.sourceLinks}><a href="https://whc.unesco.org/" target="_blank" rel="noreferrer">UNESCO World Heritage</a><a href="https://www.britannica.com/place/North-Africa" target="_blank" rel="noreferrer">Encyclopaedia Britannica</a><a href="https://www.metmuseum.org/toah/" target="_blank" rel="noreferrer">The Metropolitan Museum of Art · Heilbrunn Timeline</a><a href="https://www.oldmapsonline.org/" target="_blank" rel="noreferrer">OldMapsOnline</a></div>
  </section>
 </main>;
}
