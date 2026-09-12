'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {DEFAULT_NAVIGATION_ORDER,NAVIGATION_STORAGE_KEY,NORTH_AFRICA_SECTIONS} from '@/lib/north-africa';
import styles from './north-africa-shell.module.css';

type NavigationId=typeof DEFAULT_NAVIGATION_ORDER[number];
type Item={id:NavigationId;label:string;href:string;group:string};
const iconPaths:Record<string,string>={history:'M4 6h16M4 12h16M4 18h10',markets:'M4 18V6m0 12h16M8 15l3-4 3 2 4-6',economy:'M5 20V10m7 10V5m7 15v-8',companies:'M4 20V8l8-4 8 4v12M8 20v-5h8v5',travel:'M3 11h18M5 7h14M7 15h10M9 19h6',culture:'M12 3a5 5 0 0 0 0 10 5 5 0 0 0 0-10zm0 10v8',geography:'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z',people:'M16 21v-2a4 4 0 0 0-8 0v2m4-8a4 4 0 1 0-8 0 4 4 0 0 0 8 0',data:'M4 19V5m0 14h16M8 16l3-4 3 2 4-6',map:'M4 6l6-3 4 3 6-3v15l-6 3-4-3-6 3V6z',vision:'M4 12h16M12 4l8 8-8 8',about:'M12 20h9M12 4h9M4 8h5M4 16h5'};
function Icon({id}:{id:string}){return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[id]??iconPaths.vision}/></svg>}
export default function NorthAfricaShell({children}:{children:React.ReactNode}){
 const pathname=usePathname();const [collapsed,setCollapsed]=useState(false);const [mobileOpen,setMobileOpen]=useState(false);const [customizing,setCustomizing]=useState(false);const [order,setOrder]=useState<NavigationId[]>(DEFAULT_NAVIGATION_ORDER);const [hydrated,setHydrated]=useState(false);const [dragged,setDragged]=useState<NavigationId|null>(null);
 useEffect(()=>{try{const raw=window.localStorage.getItem(NAVIGATION_STORAGE_KEY);if(raw){const parsed:unknown=JSON.parse(raw);if(Array.isArray(parsed)){const allowed=new Set<string>(DEFAULT_NAVIGATION_ORDER);const saved=parsed.filter((value):value is NavigationId=>typeof value==='string'&&allowed.has(value));const unique=[...new Set(saved)];const missing=DEFAULT_NAVIGATION_ORDER.filter(id=>!unique.includes(id));setOrder([...unique,...missing])}}}catch{}finally{setHydrated(true)}},[]);
 useEffect(()=>{if(hydrated)try{window.localStorage.setItem(NAVIGATION_STORAGE_KEY,JSON.stringify(order))}catch{}},[order,hydrated]);
 useEffect(()=>{setMobileOpen(false)},[pathname]);
 const items=useMemo(()=>order.map(id=>NORTH_AFRICA_SECTIONS.find(x=>x.id===id)).filter(Boolean) as Item[],[order]);
 const move=(id:NavigationId,dir:-1|1)=>setOrder(current=>{const next=[...current];const i=next.indexOf(id);const j=i+dir;if(i<0||j<0||j>=next.length)return current;[next[i],next[j]]=[next[j],next[i]];return next});
 const drop=(target:NavigationId)=>{if(!dragged||dragged===target)return;setOrder(current=>{const next=[...current];const from=next.indexOf(dragged);const to=next.indexOf(target);if(from<0||to<0)return current;next.splice(from,1);next.splice(to,0,dragged);return next})};
 const active=(href:string)=>pathname===href||pathname.startsWith(`${href}/`);
 return <div className={`${styles.frame}${collapsed?` ${styles.collapsed}`:''}`}>
  <aside className={`${styles.sidebar}${mobileOpen?` ${styles.open}`:''}`} aria-label="North Africa navigation">
   <div className={styles.top}><Link href="/" className={styles.brand} aria-label="Koshary and Couscous home"><span className={styles.brandLine}>Koshary and</span><span className={styles.brandLine}>Couscous</span></Link><button className={styles.collapse} onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand navigation':'Collapse navigation'} title={collapsed?'Expand navigation':'Collapse navigation'}>{collapsed?'→':'←'}</button></div>
   <nav className={styles.nav} aria-label="Primary navigation">
    <div className={styles.group}><div className={styles.label}>Explore</div>{items.filter(x=>x.group==='explore').map(item=><Link key={item.id} href={item.href} className={`${styles.item}${active(item.href)?` ${styles.active}`:''}`} title={collapsed?item.label:undefined}><Icon id={item.id}/><span>{item.label}</span></Link>)}</div>
    <div className={`${styles.group} ${styles.visionGroup}`}>{items.filter(x=>x.group==='vision').map(item=><Link key={item.id} href={item.href} className={`${styles.item}${active(item.href)?` ${styles.active}`:''}`} title={collapsed?item.label:undefined}><Icon id={item.id}/><span>{item.label}</span></Link>)}</div>
   </nav>
   <div className={styles.bottom}><button className={styles.customize} onClick={()=>setCustomizing(true)}><Icon id="about"/><span>Customize</span></button></div>
  </aside>
  {mobileOpen&&<button className={styles.overlay} aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}<div className={styles.content}><button className={styles.mobileMenu} onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><span/><span/><span/></button>{children}</div>
  {customizing&&<div className={styles.modalBackdrop} role="presentation"><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="naCustomizeTitle"><div className={styles.modalHead}><div><div className="eyebrow">Navigation</div><h2 id="naCustomizeTitle">Customize navigation</h2><p>Drag sections to reorder them, or use the move buttons. Your preference stays local to this device.</p></div><button className={styles.close} onClick={()=>setCustomizing(false)} aria-label="Close">×</button></div><div className={styles.list}>{items.map((item,i)=><div key={item.id} className={styles.row} draggable onDragStart={()=>setDragged(item.id)} onDragOver={event=>event.preventDefault()} onDrop={()=>drop(item.id)} onDragEnd={()=>setDragged(null)}><span className={styles.drag} aria-hidden="true">☰</span><span>{item.label}</span><div className={styles.moves}><button onClick={()=>move(item.id,-1)} disabled={i===0} aria-label={`Move ${item.label} up`}>↑</button><button onClick={()=>move(item.id,1)} disabled={i===items.length-1} aria-label={`Move ${item.label} down`}>↓</button></div></div>)}</div><div className={styles.foot}><button className={styles.secondary} onClick={()=>setOrder(DEFAULT_NAVIGATION_ORDER)}>Reset</button><button className={styles.primary} onClick={()=>setCustomizing(false)}>Done</button></div></section></div>}
 </div>;
}
