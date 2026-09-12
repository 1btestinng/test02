'use client';

import {useMemo,useState} from 'react';
import type {MarketCompany,HistoricalPricePoint} from '@/lib/markets/types';
import {filterHistoryByRange} from '@/lib/company-chart-utils';
import AdvancedFinancialChart from '@/components/advanced-financial-chart';

type Metric='Price'|'Market Cap';
type Range='1D'|'1W'|'1M'|'3M'|'6M'|'1Y'|'3Y'|'5Y'|'MAX';
const metrics:Metric[]=['Price','Market Cap'];
const ranges:Range[]=['1D','1W','1M','3M','6M','1Y','3Y','5Y','MAX'];

function fmt(value:number|undefined,maximumFractionDigits=2){
  if(value===undefined||!Number.isFinite(value))return '—';
  return value.toLocaleString('en-US',{maximumFractionDigits});
}

function compact(value:number|undefined,currency='USD'){
  if(value===undefined||!Number.isFinite(value))return '—';
  const prefix=currency==='USD'?'$':currency?`${currency} `:'';
  const abs=Math.abs(value);
  if(abs>=1e12)return `${prefix}${(value/1e12).toFixed(2)}T`;
  if(abs>=1e9)return `${prefix}${(value/1e9).toFixed(2)}B`;
  if(abs>=1e6)return `${prefix}${(value/1e6).toFixed(0)}M`;
  return `${prefix}${Math.round(value).toLocaleString('en-US')}`;
}

function MetricGrid({items}:{items:Array<{label:string;value:string;note?:string}>}){
  return <div className="metricGrid">{items.map(item=><div className="metricCell" key={item.label}><span>{item.label}</span><strong className="mono">{item.value}</strong>{item.note&&<small>{item.note}</small>}</div>)}</div>;
}

export default function CompanyIntelligence({company,history,exchangeName,countryName,currency,fxRate,lastUpdated,dataSource,delay,providerTicker,dataError}:{company:MarketCompany;history:HistoricalPricePoint[];exchangeName:string;countryName:string;currency:string;fxRate?:number;lastUpdated:string;dataSource:string;delay:string;providerTicker?:string;dataError?:string}){
  const [metric,setMetric]=useState<Metric>('Price');
  const [range,setRange]=useState<Range>('MAX');
  const [logoFailed,setLogoFailed]=useState(false);

  const visibleHistory=useMemo(()=>filterHistoryByRange(history,range),[history,range]);
  const quote=company.price;
  const change=company.changePercent;
  const changeText=change===undefined?'—':`${change>0?'+':''}${change.toFixed(2)}%`;
  const hasPriceHistory=history.length>1;

  const providerShares=company.sharesOutstanding;
  const impliedShares=company.marketCapLocal!==undefined&&quote!==undefined&&quote>0?company.marketCapLocal/quote:undefined;
  const shares=providerShares??impliedShares;
  const sharesAreImplied=providerShares===undefined&&impliedShares!==undefined;
  const chartFxRate=fxRate??(company.marketCapLocal!==undefined&&company.marketCapUSD!==undefined&&company.marketCapUSD>0?company.marketCapLocal/company.marketCapUSD:undefined);
  const usdPrice=quote!==undefined&&chartFxRate&&chartFxRate>0?quote/chartFxRate:undefined;
  const currentMarketCapLocal=company.marketCapLocal;
  const usdMarketCap=currentMarketCapLocal!==undefined&&chartFxRate&&chartFxRate>0?currentMarketCapLocal/chartFxRate:company.marketCapUSD;

  const marketCapHistory=useMemo(()=>shares!==undefined?visibleHistory.filter(point=>Number.isFinite(point.close)).map(point=>({date:point.date,value:point.close*shares})):[],[visibleHistory,shares]);
  const priceChartPoints=useMemo(()=>visibleHistory.filter(point=>Number.isFinite(point.close)).map(point=>({date:point.date,value:point.close})),[visibleHistory]);

  const logoUrl=`https://s3-symbol-logo.tradingview.com/${company.ticker.toLowerCase().replace(/[^a-z0-9.-]/g,'')}.svg`;

  return <div className="companyIntel">
    <div className="companyHero">
      <div className="companyHeroMain">
        <div className="eyebrow">{countryName} · {company.exchangeCode}</div>
        <div className="companyHeroIdentity">
          <div className="companyHeroMark">{!logoFailed&&<img src={logoUrl} alt={`${company.name} logo`} loading="lazy" decoding="async" onError={()=>setLogoFailed(true)} />}{logoFailed&&company.name.slice(0,2).toUpperCase()}</div>
          <div><h1>{company.name}</h1><div className="companySubline">{company.ticker} · {company.sector??'—'} · {exchangeName}</div></div>
        </div>
      </div>
      <div className="companyHeroQuote">
        <div className="heroPrice mono">{quote===undefined?'—':`${currency} ${fmt(quote)}`}</div>
        <div className="companyUsdQuote mono">{usdPrice===undefined?'USD —':`$${fmt(usdPrice)}`}</div>
        <div className={change===undefined?'muted':change>=0?'positive':'negative'}>{changeText}</div>
      </div>
    </div>

    <div className="dataStatus"><span>● {delay}</span><span>Last updated {lastUpdated}</span><span>Source: {dataSource}</span>{providerTicker&&<span>Symbol: {providerTicker}</span>}{chartFxRate!==undefined&&<span>FX: {fmt(chartFxRate,4)} {currency}/USD</span>}</div>
    {dataError&&<div className="dataNote" style={{border:'1px solid var(--line)',padding:'12px 14px',marginTop:14}}><strong>Some market data is unavailable.</strong> {dataError}</div>}

    <section className="intelChartPanel">
      <div className="chartHeader">
        <div><div className="intelSectionTitle">Historical market data</div><div className="chartMetricLabel">{metric}</div></div>
        <div className="controlGroup">{ranges.map(r=><button type="button" key={r} className={range===r?'control active':'control'} onClick={()=>setRange(r)}>{r}</button>)}</div>
      </div>
      <div className="metricTabs">{metrics.map(m=><button type="button" key={m} className={metric===m?'metricTab active':'metricTab'} onClick={()=>setMetric(m)}>{m}</button>)}</div>
      {metric==='Price'&&<AdvancedFinancialChart points={priceChartPoints} interactionPoints={priceChartPoints} localCurrency={currency} fxRate={chartFxRate}/>} 
      {metric==='Market Cap'&&shares!==undefined&&<AdvancedFinancialChart points={marketCapHistory} interactionPoints={marketCapHistory} localCurrency={currency} fxRate={chartFxRate} marketCap/>}
      {metric==='Market Cap'&&shares===undefined&&<div className="emptyChart"><div><strong>Market-cap history unavailable</strong><p>Verified outstanding shares are not available for this company, so historical market capitalization cannot be calculated without inventing data.</p></div></div>}
      {metric==='Price'&&priceChartPoints.length===0&&<div className="emptyChart"><div><strong>Historical price data unavailable</strong><p>No verified historical price observations are currently connected for this company.</p></div></div>}
      {hasPriceHistory&&metric==='Price'&&<div className="dataNote">{priceChartPoints.length.toLocaleString('en-US')} complete visible observations. MAX uses the maximum verified provider history available; no interpolation or fabricated values are used.</div>}
      {metric==='Market Cap'&&marketCapHistory.length>1&&<div className="dataNote">{marketCapHistory.length.toLocaleString('en-US')} complete visible observations · Historical market cap is calculated as historical share price × the currently verified outstanding-share count{sharesAreImplied?' (implied from the current verified market-cap snapshot and price)':''}.</div>}
    </section>

    <section className="intelSection">
      <div className="intelSectionTitle">Key market data</div>
      <MetricGrid items={[
        {label:'Market Cap',value:compact(currentMarketCapLocal,currency),note:company.marketCapSource==='calculated'?'Calculated from price × shares':'Provider/snapshot'},
        {label:'USD Market Cap',value:compact(usdMarketCap,'USD'),note:chartFxRate!==undefined?'Converted using current market FX reference':'Provider/snapshot'},
        {label:'Price',value:quote===undefined?'—':`${currency} ${fmt(quote)}`},
        {label:'USD Price',value:usdPrice===undefined?'—':`$${fmt(usdPrice)}`},
        {label:'Shares Outstanding',value:shares?.toLocaleString('en-US')??'—',note:sharesAreImplied?'Calculated implied share count':'Provider supplied'},
        {label:'Previous Close',value:company.previousClose===undefined?'—':`${currency} ${fmt(company.previousClose)}`},
        {label:'Open',value:company.open===undefined?'—':`${currency} ${fmt(company.open)}`},
        {label:'High',value:company.high===undefined?'—':`${currency} ${fmt(company.high)}`},
        {label:'Low',value:company.low===undefined?'—':`${currency} ${fmt(company.low)}`},
        {label:'Volume',value:company.volume===undefined?'—':company.volume.toLocaleString('en-US')}
      ]}/>
    </section>
  </div>;
}
