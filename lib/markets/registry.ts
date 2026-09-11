import {rankCompanies} from '@/lib/market';
import {MOROCCO_CONFIG, MOROCCO_FX_USD_MAD, moroccoCompanies} from './morocco';
import type {MarketCompany, MarketConfig, MarketDataProvider, MarketSummary} from './types';

export const EGYPT_CONFIG: MarketConfig = {
  countryCode:'EG', countryName:'Egypt', flag:'🇪🇬', exchangeCode:'EGX', exchangeName:'Egyptian Exchange',
  currencyCode:'EGP', currencySymbol:'EGP', timezone:'Africa/Cairo', benchmark:'EGX 30',
  dataSource:'StockAnalysis EGX actively traded securities snapshot; market caps sourced directly', delay:'Delayed snapshot', lastUpdated:'2026-09-11T17:01:00+03:00'
};

const egyptProvider: MarketDataProvider = {
  async getCompanies(){
    return rankCompanies().map((c:any)=>({
      id:`EG-EGX-${c.ticker}`, countryCode:'EG', exchangeCode:'EGX', ticker:c.ticker, name:c.name,
      sector:c.industry, industry:c.industry, currency:'EGP', price:c.price, changePercent:c.changePercent,
      sharesOutstanding:c.sharesOutstanding, marketCapLocal:c.marketCapEGP, marketCapUSD:c.marketCapUSD,
      marketCapSource:'provider', timestamp:EGYPT_CONFIG.lastUpdated, dataSource:EGYPT_CONFIG.dataSource
    }));
  },
  async getCompany(ticker){return (await this.getCompanies()).find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());},
  async getMarketSummary(){
    const rows=await this.getCompanies();
    return {count:rows.length,totalLocal:rows.reduce((s,c)=>s+(c.marketCapLocal??0),0),totalUSD:rows.reduce((s,c)=>s+(c.marketCapUSD??0),0),industries:new Set(rows.map(c=>c.sector).filter(Boolean)).size,fxRate:51.36,fxSource:'Configured EGP/USD snapshot',lastUpdated:EGYPT_CONFIG.lastUpdated,dataSource:EGYPT_CONFIG.dataSource,delay:EGYPT_CONFIG.delay};
  },
  async getFX(){return 51.36;},
  async getMarketStatus(){return 'closed';}
};

const moroccoProvider: MarketDataProvider = {
  async getCompanies(){
    return moroccoCompanies.map(c=>({...c,marketCapUSD:c.marketCapLocal?c.marketCapLocal/MOROCCO_FX_USD_MAD:undefined}));
  },
  async getCompany(ticker){return (await this.getCompanies()).find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());},
  async getMarketSummary(){
    const rows=await this.getCompanies();
    return {count:rows.length,totalLocal:rows.reduce((s,c)=>s+(c.marketCapLocal??0),0),totalUSD:rows.reduce((s,c)=>s+(c.marketCapUSD??0),0),industries:new Set(rows.map(c=>c.sector).filter(Boolean)).size,fxRate:MOROCCO_FX_USD_MAD,fxSource:'USD/MAD market snapshot',lastUpdated:MOROCCO_CONFIG.lastUpdated,dataSource:MOROCCO_CONFIG.dataSource,delay:MOROCCO_CONFIG.delay};
  },
  async getFX(){return MOROCCO_FX_USD_MAD;},
  async getMarketStatus(){return 'closed';}
};

export const MARKET_REGISTRY: Record<string,{config:MarketConfig;provider:MarketDataProvider}> = {
  EG:{config:EGYPT_CONFIG,provider:egyptProvider},
  MA:{config:MOROCCO_CONFIG,provider:moroccoProvider}
};

export function getMarket(code:string){return MARKET_REGISTRY[code.toUpperCase()]??MARKET_REGISTRY.EG;}
export function marketCodes(){return Object.keys(MARKET_REGISTRY);}
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
