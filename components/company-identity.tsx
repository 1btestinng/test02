'use client';

import {useState} from 'react';
import type {MarketCompany} from '@/lib/markets/types';

function initials(name:string){
  const words=name.replace(/[^\p{L}\p{N}\s&-]/gu,' ').trim().split(/\s+/).filter(Boolean);
  if(!words.length)return '—';
  if(words.length===1)return words[0].slice(0,2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function logoCandidates(company:MarketCompany){
  const ticker=company.ticker.toLowerCase().replace(/[^a-z0-9.-]/g,'');
  const base=`https://s3-symbol-logo.tradingview.com/${ticker}.svg`;
  return [base];
}

export default function CompanyIdentity({company}:{company:MarketCompany}){
  const candidates=logoCandidates(company);
  const [sourceIndex,setSourceIndex]=useState(0);
  const [failed,setFailed]=useState(false);
  const fallback=initials(company.name);

  return <span className="companyIdentity">
    <span className="companyLogo" aria-hidden={failed}>
      {!failed&&<img src={candidates[sourceIndex]} alt={`${company.name} logo`} loading="lazy" decoding="async" onError={()=>{if(sourceIndex<candidates.length-1)setSourceIndex(sourceIndex+1);else setFailed(true);}}/>}
      {failed&&<span className="companyLogoFallback" aria-hidden="true">{fallback}</span>}
    </span>
    <span className="companyIdentityName">{company.name}</span>
  </span>;
}
