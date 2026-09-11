'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {rankCompanies,marketSummary} from '@/lib/market';
import ThemeToggle from '@/components/theme-toggle';

const summary=marketSummary();
const TOP_LIMITS=[10,20,50,100,200,300,400,500,1000] as const;
const money=(n:number)=>n>=1e12?`EGP ${(n/1e12).toFixed(2)}T`:n>=1e9?`EGP ${(n/1e9).toFixed(2)}B`:`EGP ${(n/1e6).toFixed(0)}M`;
const usd=(n:number)=>n>=1e9?`$${(n/1e9).toFixed(2)}B`:`$${(n/1e6).toFixed(0)}M`;

function validLimit(value:string|null){const parsed=Number(value);return TOP_LIMITS.includes(parsed as (typeof TOP_LIMITS)[number])?parsed:100;}

export default function Home(){
  const [q,setQ]=useState('');
  const [industry,setIndustry]=useState('All');
  const [limit,setLimit]=useState(()=>typeof window==='undefined'?100:validLimit(new URLSearchParams(window.location.search).get('top')));
  const ranked=useMemo(()=>rankCompanies(),[]);
  const industries=[...new Set(ranked.map(c=>c.industry))].sort();
  const searchResults=useMemo(()=>ranked.filter(c=>(industry==='All'||c.industry===industry)&&(`${c.name} ${c.ticker}`.toLowerCase().includes(q.toLowerCase()))),[ranked,q,industry]);
  const rows=useMemo(()=>q?searchResults:searchResults.slice(0,limit),[q,searchResults,limit]);

  function changeLimit(next:number){
    setLimit(next);
    const params=new URLSearchParams(window.location.search);
    if(next===100) params.delete('top'); else params.set('top',String(next));
    window.history.replaceState({},'',`${window.location.pathname}${params.toString()?`?${params}`:''}${window.location.hash}`);
  }

  return <><div className="shell"><header className="header"><Link href="/" className="brand">EGYstocks</Link><nav className="nav"><Link href="#companies">Companies</Link><Link href="/industries">Industries</Link><Link href="/methodology">About</Link></nav><div className="headerRight"><div className="status"><i className="dot"/>Market closed</div><ThemeToggle/></div></header><main className="main"><section className="hero"><div><div className="eyebrow">Egyptian Exchange</div><h1>Egypt's largest<br/>listed companies.</h1><p>Ranked by market capitalization.</p></div><div className="heroMeta">Last verified snapshot<br/><strong>11 Sep 2026 · Cairo</strong><br/>Delayed data · source disclosed below</div></section><section className="summary"><div className="stat"><strong>{summary.count}</strong><span>Companies available</span></div><div className="stat"><strong>{money(summary.totalEGP)}</strong><span>Combined market cap</span></div><div className="stat"><strong>{usd(summary.totalUSD)}</strong><span>Combined USD value</span></div><div className="stat"><strong>{summary.industries}</strong><span>Industries</span></div></section><section id="companies"><div className="toolbar"><div className="filters"><select aria-label="Ranking depth" className="select" value={limit} onChange={e=>changeLimit(+e.target.value)}>{TOP_LIMITS.map(n=><option key={n} value={n}>Top {n.toLocaleString()}</option>)}</select><select aria-label="Filter by industry" className="select" value={industry} onChange={e=>setIndustry(e.target.value)}><option>All</option>{industries.map(x=><option key={x}>{x}</option>)}</select></div><input aria-label="Search companies" className="search" placeholder="Search companies…" value={q} onChange={e=>setQ(e.target.value)}/></div>{q&&searchResults.length>limit&&<div className="searchNote">Showing all matching companies across the full available universe. Ranking depth is ignored while searching.</div>}<div className="table"><div className="thead"><span>Rank</span><span>Company</span><span>Ticker</span><span>Industry</span><span>Price</span><span>Change</span><span>Market cap</span></div>{rows.map(c=><Link href={`/company/${c.ticker}`} className="row" key={c.ticker}><span className="rank">{String(c.rank).padStart(2,'0')}</span><span><div className="company">{c.name}</div><div className="sub">{c.ticker} · {c.industry}</div></span><span className="value muted">{c.ticker}</span><span className="value muted">{c.industry}</span><span className="value">EGP {c.price.toLocaleString('en-US',{maximumFractionDigits:2})}</span><span className={`change ${c.changePercent>0?'positive':c.changePercent<0?'negative':'muted'}`}>{c.changePercent>0?'+':''}{c.changePercent.toFixed(2)}%</span><span className="value"><b>{money(c.marketCapEGP)}</b><div className="sub">{usd(c.marketCapUSD)}</div></span></Link>)}</div></section></main><footer className="footer"><span>EGYstocks · Egypt's listed market, made simple.</span><span>Updated 17:01 EET · Delayed source snapshot · Calculated market caps</span></footer></div></>}
