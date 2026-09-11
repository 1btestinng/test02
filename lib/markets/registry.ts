import {rankCompanies} from '@/lib/market';
import {MOROCCO_CONFIG, MOROCCO_FX_USD_MAD, moroccoCompanies} from './morocco';
import type {MarketCompany, MarketConfig, MarketDataProvider, MarketSummary} from './types';

export const EGYPT_CONFIG: MarketConfig = {
  countryCode:'EG', countryName:'Egypt', flag:'🇪🇬', exchangeCode:'EGX', exchangeName:'Egyptian Exchange',
  currencyCode:'EGP', currencySymbol:'EGP', timezone:'Africa/Cairo', benchmark:'EGX 30',
  dataSource:'StockAnalysis EGX actively traded securities snapshot; market caps sourced directly', delay:'Delayed snapshot', lastUpdated:'2026-09-11T17:01:00+03:00'
};

const egyptCompanies = (): MarketCompany[] => rankCompanies().map((c:any)=>({
  id:`EG-EGX-${c.ticker}`, countryCode:'EG', exchangeCode:'EGX', ticker:c.ticker, name:c.name,
  sector:c.industry, industry:c.industry, currency:'EGP', price:c.price, changePercent:c.changePercent,
  sharesOutstanding:c.sharesOutstanding, marketCapLocal:c.marketCapEGP, marketCapUSD:c.marketCapUSD,
  marketCapSource:'provider', timestamp:EGYPT_CONFIG.lastUpdated, dataSource:EGYPT_CONFIG.dataSource
}));

const moroccoCompaniesSnapshot = () => moroccoCompanies.map(c=>({...c,marketCapUSD:c.marketCapLocal?c.marketCapLocal/MOROCCO_FX_USD_MAD:undefined}));

const egyptProvider: MarketDataProvider = {
  async getCompanies(){return egyptCompanies();},
  async getCompany(ticker){return egyptCompanies().find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());},
  async getMarketSummary(){return summarize(egyptCompanies(),EGYPT_CONFIG,51.36,'Configured EGP/USD snapshot');},
  async getFX(){return 51.36;},
  async getMarketStatus(){return 'closed';}
};

const moroccoProvider: MarketDataProvider = {
  async getCompanies(){return moroccoCompaniesSnapshot();},
  async getCompany(ticker){return moroccoCompaniesSnapshot().find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());},
  async getMarketSummary(){return summarize(moroccoCompaniesSnapshot(),MOROCCO_CONFIG,MOROCCO_FX_USD_MAD,'USD/MAD market snapshot');},
  async getFX(){return MOROCCO_FX_USD_MAD;},
  async getMarketStatus(){return 'closed';}
};

function summarize(rows:MarketCompany[],config:MarketConfig,fxRate:number,fxSource:string):MarketSummary{
  return {count:rows.length,totalLocal:rows.reduce((s,c)=>s+(c.marketCapLocal??0),0),totalUSD:rows.reduce((s,c)=>s+(c.marketCapUSD??(c.marketCapLocal?c.marketCapLocal/fxRate:0)),0),industries:new Set(rows.map(c=>c.sector).filter(Boolean)).size,fxRate,fxSource,lastUpdated:config.lastUpdated,dataSource:config.dataSource,delay:config.delay};
}

export const MARKET_REGISTRY: Record<string,{config:MarketConfig;provider:MarketDataProvider}> = {
  EG:{config:EGYPT_CONFIG,provider:egyptProvider},
  MA:{config:MOROCCO_CONFIG,provider:moroccoProvider}
};

export function getMarket(code:string){return MARKET_REGISTRY[code.toUpperCase()]??MARKET_REGISTRY.EG;}
export function marketCodes(){return Object.keys(MARKET_REGISTRY);}
export function getMarketCompaniesSync(code:string){return code.toUpperCase()==='MA'?moroccoCompaniesSnapshot():egyptCompanies();}
export function getMarketCompanySync(code:string,ticker:string){return getMarketCompaniesSync(code).find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());}
export function getMarketSummarySync(code:string){const market=getMarket(code);return summarize(getMarketCompaniesSync(code),market.config,code.toUpperCase()==='MA'?MOROCCO_FX_USD_MAD:51.36,code.toUpperCase()==='MA'?'USD/MAD market snapshot':'Configured EGP/USD snapshot');}
export async function getMarketCompanies(code:string){return getMarket(code).provider.getCompanies();}
export async function getMarketCompany(code:string,ticker:string){return getMarket(code).provider.getCompany(ticker);}
export async function getMarketSummary(code:string){return getMarket(code).provider.getMarketSummary();}

export function rankMarketCompanies(companies:MarketCompany[]){
  return [...companies].sort((a,b)=>(b.marketCapLocal??-1)-(a.marketCapLocal??-1)).map((c,i)=>({...c,rank:c.marketCapLocal===undefined?undefined:i+1}));
}

export function formatMarketCap(value:number|undefined,currency:string){
  if(value===undefined||value===null||!Number.isFinite(value)) return '—';
  const prefix=currency==='USD'?'$':`${currency} `;
  if(Math.abs(value)>=1e12) return `${prefix}${(value/1e12).toFixed(2)}T`;
  if(Math.abs(value)>=1e9) return `${prefix}${(value/1e9).toFixed(2)}B`;
  if(Math.abs(value)>=1e6) return `${prefix}${(value/1e6).toFixed(0)}M`;
  return `${prefix}${Math.round(value).toLocaleString('en-US')}`;
}

export function formatPrice(value:number|undefined,currency:string){
  if(value===undefined||value===null||!Number.isFinite(value)) return '—';
  return `${currency} ${value.toLocaleString('en-US',{maximumFractionDigits:2})}`;
}
