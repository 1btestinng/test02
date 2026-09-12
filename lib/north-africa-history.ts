import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

type StockAnalysisMarket='cbse'|'bvmt';

const MARKET_MAP:Record<string,StockAnalysisMarket>={MA:'cbse',TN:'bvmt'};
const SOURCE='StockAnalysis / S&P Global Market Intelligence';

function finite(value:number|undefined):value is number{return typeof value==='number'&&Number.isFinite(value);}

function marketFor(company:MarketCompany):StockAnalysisMarket|undefined{return MARKET_MAP[company.countryCode.toUpperCase()];}

function parseNumber(value:string|undefined){
  if(!value)return undefined;
  const cleaned=value.replace(/,/g,'').trim();
  if(cleaned==='-'||cleaned==='—'||cleaned==='')return undefined;
  const parsed=Number(cleaned);
  return Number.isFinite(parsed)?parsed:undefined;
}

function parseDate(value:string){
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return undefined;
  return date.toISOString();
}

function extractRows(html:string):HistoricalPricePoint[]{
  const tableMatch=html.match(/Date\s*\|\s*Open\s*\|\s*High\s*\|\s*Low\s*\|\s*Close[\s\S]*?(?=\n\s*\d+\s+of\s+\d+|Data Source:|$)/i);
  const source=tableMatch?.[0]??html;
  const rows:HistoricalPricePoint[]=[];
  for(const line of source.split(/\r?\n/)){
    const parts=line.split('|').map(part=>part.trim());
    if(parts.length<5||!/^\w{3}\s+\d{1,2},\s+\d{4}$/i.test(parts[0]))continue;
    const date=parseDate(parts[0]);
    const open=parseNumber(parts[1]);
    const high=parseNumber(parts[2]);
    const low=parseNumber(parts[3]);
    const close=parseNumber(parts[4]);
    const adjustedClose=parseNumber(parts[5]);
    const volume=parseNumber(parts[7]);
    if(!date||!finite(close))continue;
    rows.push({date,close,open,high,low,adjustedClose,volume});
  }
  return rows;
}

async function fetchPage(company:MarketCompany,page:number){
  const market=marketFor(company);
  if(!market)return [];
  const url=`https://stockanalysis.com/quote/${market}/${encodeURIComponent(company.ticker.toUpperCase())}/history/${page>1?`?p=${page}`:''}`;
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0','Accept':'text/html'},next:{revalidate:900}});
  if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);
  return extractRows(await response.text());
}

/**
 * StockAnalysis exposes a public human-readable historical table for CSE/BVMT.
 * We intentionally use only the rendered historical rows; no synthetic data or
 * undocumented JSON endpoint is consumed. The free history surface is paginated,
 * so the first three pages provide a useful verified daily-history fallback while
 * keeping request volume bounded.
 */
export async function getNorthAfricaHistoricalPrices(company:MarketCompany){
  if(!marketFor(company))return {history:[] as HistoricalPricePoint[],source:undefined as string|undefined,error:undefined as string|undefined};
  const pages=await Promise.all([1,2,3].map(page=>fetchPage(company,page).catch(()=>[] as HistoricalPricePoint[])));
  const byDate=new Map<string,HistoricalPricePoint>();
  for(const point of pages.flat())byDate.set(point.date.slice(0,10),point);
  const history=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
  if(!history.length)return {history,source:undefined,error:`${SOURCE} returned no verified historical observations for ${company.countryCode} ${company.ticker}.`};
  return {history,source:SOURCE,error:undefined};
}
