'use client';

import {useMemo,useState} from 'react';
import type {MarketCompany} from '@/lib/markets/types';

type Metric='Price'|'Market Cap'|'P/E'|'P/S'|'Revenue'|'Earnings'|'EPS';
type Range='1D'|'1W'|'1M'|'3M'|'6M'|'1Y'|'3Y'|'5Y'|'MAX';

const metrics:Metric[]=['Price','Market Cap','P/E','P/S','Revenue','Earnings','EPS'];
const ranges:Range[]=['1D','1W','1M','3M','6M','1Y','3Y','5Y','MAX'];

function fmt(value:number|undefined,maximumFractionDigits=2){
  if(value===undefined||!Number.isFinite(value))return '—';
  return value.toLocaleString('en-US',{maximumFractionDigits});
}
function compact(value:number|undefined,currency='USD'){
  if(value===undefined||!Number.isFinite(value))return '—';
  const prefix=currency==='USD'?'$':`${currency} `;
  const abs=Math.abs(value);
  if(abs>=1e12)return `${prefix}${(value/1e12).toFixed(2)}T`;
  if(abs>=1e9)return `${prefix}${(value/1e9).toFixed(2)}B`;
  if(abs>=1e6)return `${prefix}${(value/1e6).toFixed(0)}M`;
  return `${prefix}${Math.round(value).toLocaleString('en-US')}`;
}

function Section({title,children}:{title:string;children:React.ReactNode}){
  return <section className="intelSection"><div className="intelSectionTitle">{title}</div>{children}</section>;
}
function MetricGrid({items}:{items:Array<{label:string;value:string;note?:string}>}){
  return <div className="metricGrid">{items.map(item=><div className="metricCell" key={item.label}><span>{item.label}</span><strong className="mono">{item.value}</strong>{item.note&&<small>{item.note}</small>}</div>)}</div>;
}
function Missing({children='Not available'}){return <span className="missing">{children}</span>}

export default function CompanyIntelligence({company,exchangeName,countryName,currency,lastUpdated,dataSource,delay}:{company:MarketCompany;exchangeName:string;countryName:string;currency:string;lastUpdated:string;dataSource:string;delay:string}){
  const [metric,setMetric]=useState<Metric>('Price');
  const [range,setRange]=useState<Range>('1Y');
  const [period,setPeriod]=useState<'Annual'|'Quarterly'>('Annual');
  const quote=company.price;
  const change=company.changePercent;
  const changeText=change===undefined?'—':`${change>0?'+':''}${change.toFixed(2)}%`;
  const chartMessage=useMemo(()=>{
    if(metric==='Price')return 'Historical price data is not supplied by the configured provider.';
    return `Historical ${metric.toLowerCase()} data is not supplied by the configured provider.`;
  },[metric]);

  return <div className="companyIntel">
    <div className="companyHero">
      <div className="companyHeroMain">
        <div className="eyebrow">{countryName} · {company.exchangeCode}</div>
        <div className="companyHeroIdentity"><div className="companyHeroMark">{company.name.slice(0,2).toUpperCase()}</div><div><h1>{company.name}</h1><div className="companySubline">{company.ticker} · {company.sector??'—'} · {exchangeName}</div></div></div>
      </div>
      <div className="companyHeroQuote"><div className="heroPrice mono">{quote===undefined?'—':`${currency} ${fmt(quote)}`}</div><div className={change===undefined?'muted':change>=0?'positive':'negative'}>{changeText}</div></div>
    </div>
    <div className="dataStatus"><span>● {delay}</span><span>Last updated {lastUpdated}</span><span>Source: {dataSource}</span></div>

    <section className="intelChartPanel">
      <div className="chartHeader"><div><div className="intelSectionTitle">Historical intelligence</div><div className="chartMetricLabel">{metric}</div></div><div className="controlGroup">{ranges.map(r=><button type="button" key={r} className={range===r?'control active':'control'} onClick={()=>setRange(r)}>{r}</button>)}</div></div>
      <div className="metricTabs">{metrics.map(m=><button type="button" key={m} className={metric===m?'metricTab active':'metricTab'} onClick={()=>setMetric(m)}>{m}</button>)}</div>
      <div className="emptyChart"><div className="emptyChartLine"/><div><strong>Historical data unavailable</strong><p>{chartMessage}</p><small>{range} selected · No synthetic values are displayed.</small></div></div>
    </section>

    <Section title="Key metrics"><MetricGrid items={[
      {label:'Market Cap',value:compact(company.marketCapLocal,currency)},
      {label:'USD Market Cap',value:compact(company.marketCapUSD,'USD')},
      {label:'Shares Outstanding',value:company.sharesOutstanding?.toLocaleString('en-US')??'—'},
      {label:'Previous Close',value:company.previousClose===undefined?'—':`${currency} ${fmt(company.previousClose)}`},
      {label:'P/E',value:'—',note:'Not available'},
      {label:'P/S',value:'—',note:'Not available'},
      {label:'P/B',value:'—',note:'Not available'},
      {label:'Enterprise Value',value:'—',note:'Not available'}
    ]}/></Section>

    <Section title="Valuation"><MetricGrid items={[
      {label:'P/E',value:'—'},
      {label:'P/S',value:'—'},
      {label:'P/B',value:'—'},
      {label:'P/FCF',value:'—'},
      {label:'EV / Revenue',value:'—'},
      {label:'EV / EBITDA',value:'—'}
    ]}/><p className="dataNote"><Missing>Verified historical valuation is not available from the current provider.</Missing> iStocks does not calculate P/E or P/S from mismatched periods.</p></Section>

    <Section title="Financial statements"><div className="periodBar"><button type="button" className={period==='Annual'?'period active':'period'} onClick={()=>setPeriod('Annual')}>Annual</button><button type="button" className={period==='Quarterly'?'period active':'period'} onClick={()=>setPeriod('Quarterly')}>Quarterly</button></div><div className="financialTableWrap"><table className="financialTable"><thead><tr><th>Metric</th><th>{period}</th><th>Prior period</th><th>Currency</th></tr></thead><tbody>{['Revenue','Gross Profit','Operating Income','EBITDA','Net Income','EPS','Cash','Total Debt','Total Assets','Total Liabilities','Equity','Operating Cash Flow','Capital Expenditure','Free Cash Flow'].map(label=><tr key={label}><th>{label}</th><td><Missing/></td><td><Missing/></td><td>{currency}</td></tr>)}</tbody></table></div><p className="dataNote">Financial statements are shown only when reliable provider data is available. No placeholder financial values are inserted.</p></Section>

    <Section title="Profitability"><MetricGrid items={[{label:'ROE',value:'—'},{label:'ROA',value:'—'},{label:'ROIC',value:'—'},{label:'Gross Margin',value:'—'},{label:'Operating Margin',value:'—'},{label:'Net Margin',value:'—'}]}/></Section>
    <Section title="Balance sheet"><MetricGrid items={[{label:'Cash',value:'—'},{label:'Total Debt',value:'—'},{label:'Net Debt',value:'—'},{label:'Total Assets',value:'—'},{label:'Total Liabilities',value:'—'},{label:"Shareholders' Equity",value:'—'},{label:'Book Value',value:'—'},{label:'Book Value / Share',value:'—'}]}/></Section>
    <Section title="Cash flow"><MetricGrid items={[{label:'Operating Cash Flow',value:'—'},{label:'Capital Expenditure',value:'—'},{label:'Free Cash Flow',value:'—'},{label:'FCF Margin',value:'—'}]}/></Section>
    <Section title="Shareholder data"><MetricGrid items={[{label:'Shares Outstanding',value:company.sharesOutstanding?.toLocaleString('en-US')??'—'},{label:'Dividend / Share',value:'—'},{label:'Dividend Yield',value:'—'},{label:'Payout Ratio',value:'—'},{label:'Buybacks',value:'—'}]}/></Section>
  </div>;
}
