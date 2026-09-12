'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {DEFAULT_NAVIGATION_ORDER,NAVIGATION_STORAGE_KEY,NORTH_AFRICA_SECTIONS} from '@/lib/north-africa';

type Item={id:string;label:string;href:string;group:string};
const iconPaths:Record<string,string>={history:'M4 6h16M4 12h16M4 18h10',markets:'M4 18V6m0 12h16M8 15l3-4 3 2 4-6',economy:'M5 20V10m7 10V5m7 15v-8',companies:'M4 20V8l8-4 8 4v12M8 20v-5h8v5',travel:'M3 11h18M5 7h14M7 15h10M9 19h6',culture:'M12 3a5 5 0 0 0 0 10 5 5 0 0 0 0-10zm0 10v8',geography:'M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z',people:'M16 21v-2a4 4 0 0 0-8 0v2m4-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8',data:'M4 19V5m0 14h16M8 16l3-4 3 2 4-6',map:'M4 6l6-3 4 3 6-3v15l-6 3-4-3-6 3V6z',about:'M12 20h9M12 4h9M4 8h5M4 16h5',methodology:'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4',sources:'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',government:'M3 21h18M5 21V9h14v12M3 9l9-6 9 6'};
function Icon({id}:{id:string}){return <svg viewBox="0 0 24 24" aria-hidden="true" className="naNavIcon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[id]??iconPaths.about}/></svg>}

export default function NorthAfricaShell({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const [collapsed,setCollapsed]=useState(false);const [mobileOpen,setMobileOpen]=useState(false);const [customizing,setCustomizing]=useState(false);const [order,setOrder]=useState<string[]>(DEFAULT_NAVIGATION_ORDER);const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{try{const raw=window.localStorage.getItem(NAVIGATION_STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);const ids=new Set(DEFAULT_NAVIGATION_ORDER);if(Array.isArray(parsed)&&parsed.length===DEFAULT_NAVIGATION_ORDER.length&&parsed.every(x=>typeof x==='string'&&ids.has(x))&&new Set(parsed).size===DEFAULT_NAVIGATION_ORDER.length)setOrder(parsed)}}catch{}finally{setHydrated(true)}},[]);
 useEffect(()=>{if(hydrated)try{window.localStorage.setItem(NAVIGATION_STORAGE_KEY,JSON.stringify(order))}catch{}},[order,hydrated]);
 useEffect(()=>{setMobileOpen(false)},[pathname]);
 const items=useMemo(()=>order.map(id=>NORTH_AFRICA_SECTIONS.find(x=>x.id===id)).filter(Boolean) as Item[],[order]);
 const move=(id:string,dir:-1|1)=>setOrder(current=>{const next=[...current];const i=next.indexOf(id);const j=i+dir;if(i<0||j<0||j>=next.length)return current;[next[i],next[j]]=[next[j],next[i]];return next});
 const reset=()=>setOrder(DEFAULT_NAVIGATION_ORDER);
 const active=(href:string,id:string)=>id==='markets'?pathname==='/':pathname===href||pathname.startsWith(`${href}/`);
 return <div className={`northAfricaFrame${collapsed?' navCollapsed':''}`}>
  <aside className={`northAfricaSidebar${mobileOpen?' mobileOpen':''}`} aria-label="North Africa navigation">
   <div className="naSidebarTop"><Link href="/" className="naBrand" aria-label="iStocks North Africa home"><strong>iStocks - North Africa</strong></Link><button className="naCollapse" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?'Expand navigation':'Collapse navigation'} title={collapsed?'Expand navigation':'Collapse navigation'}>{collapsed?'→':'←'}</button></div>
   <nav className="naNav" aria-label="Primary navigation">
    {(['explore','data','about'] as const).map(group=><div className="naNavGroup" key={group}><div className="naNavLabel">{group==='explore'?'Explore':group==='data'?'Data':'About'}</div>{items.filter(x=>x.group===group).map(item=><Link key={item.id} href={item.href} className={`naNavItem${active(item.href,item.id)?' active':''}`} title={collapsed?item.label:undefined}><Icon id={item.id}/><span>{item.label}</span></Link>)}</div>)}
   </nav>
   <div className="naSidebarBottom"><button className="naCustomize" onClick={()=>setCustomizing(true)}><Icon id="about"/><span>Customize</span></button></div>
  </aside>
  {mobileOpen&&<button className="naOverlay" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>} 
  <div className="northAfricaContent">
   <button className="naMobileMenu" onClick={()=>setMobileOpen(true)} aria-label="Open navigation"><span/><span/><span/></button>
   {children}
  </div>
  {customizing&&<div className="naModalBackdrop" role="presentation"><section className="naCustomizer" role="dialog" aria-modal="true" aria-labelledby="naCustomizeTitle">
    <div className="naCustomizerHead"><div><div className="eyebrow">Navigation</div><h2 id="naCustomizeTitle">Customize navigation</h2><p>Reorder sections for this browser. Your preference stays local to this device.</p></div><button className="naClose" onClick={()=>setCustomizing(false)} aria-label="Close">×</button></div>
    <div className="naReorderList">{items.map((item,i)=><div className="naReorderRow" key={item.id}><span className="naDrag" aria-hidden="true">☰</span><span>{item.label}</span><div className="naMoveButtons"><button onClick={()=>move(item.id,-1)} disabled={i===0} aria-label={`Move ${item.label} up`}>↑</button><button onClick={()=>move(item.id,1)} disabled={i===items.length-1} aria-label={`Move ${item.label} down`}>↓</button></div></div>)}</div>
    <div className="naCustomizerFoot"><button className="naSecondaryButton" onClick={reset}>Reset</button><button className="naPrimaryButton" onClick={()=>setCustomizing(false)}>Done</button></div>
  </section></div>}
 </div>
}
