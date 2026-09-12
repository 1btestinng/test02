import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

const SOURCE='Investing.com';
const SEARCH_URL='https://api.investing.com/api/search/v2/search';
const HISTORY_URL='https://api.investing.com/api/financialdata/historical';
const REQUEST_YEARS=30;
const MAX_REQUESTS=15;
const WINDOW_DAYS=365*3;

type SupportedMarket='MA'|'TN'|'DZ';
type SearchQuote={id?:number|string;pairId?:number|string;instrument_id?:number|string;symbol?:string;description?:string;exchange?:string;flag?:string;type?:string;url?:string};
type SearchResponse={quotes?:SearchQuote[]};
type InvestingRow={rowDateTimestamp?:string|number;last_close?:string|number;last_open?:string|number;last_max?:string|number;last_min?:string|number};
type HistoryResponse={data?:InvestingRow[]};

function asString(value:unknown){return typeof value==='string'&&value.trim()?value.trim():undefined;}
function asNumber(value:unknown){if(typeof value==='number'&&Number.isFinite(value))return value;if(typeof value!=='string')return undefined;const n=Number(value.replace(/,/g,'').replace(/\s+/g,'').replace(/%/g,''));return Number.isFinite(n)?n:undefined;}
function normalizeText(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function quoteId(quote:SearchQuote){const value=quote.pairId??quote.id??quote.instrument_id;const id=typeof value==='number'?value:Number(value);return Number.isInteger(id)&&id>0?id:undefined;}
function marketFor(company:MarketCompany):SupportedMarket|undefined{const market=company.countryCode.trim().toUpperCase();return market==='MA'||market==='TN'||market==='DZ'?market:undefined;}
function marketMatch(company:MarketCompany,quote:SearchQuote){
  const market=marketFor(company);if(!market)return false;
  const flag=(quote.flag??'').toUpperCase();const exchange=normalizeText(quote.exchange??'');const description=normalizeText(quote.description??'');
  if(market==='MA')return flag==='MA'||exchange.includes('casablanca')||exchange.includes('morocco')||description.includes('casablanca');
  if(market==='TN')return flag==='TN'||exchange.includes('tunis')||exchange.includes('bvmt')||description.includes('tunisia')||description.includes('tunisie');
  return flag==='DZ'||exchange.includes('algiers')||exchange.includes('algeria')||exchange.includes('algerie')||exchange.includes('sgbv');
}
function scoreQuote(company:MarketCompany,quote:SearchQuote){
  const ticker=company.ticker.trim().toUpperCase(),name=normalizeText(company.name),description=normalizeText(quote.description??''),symbol=(quote.symbol??'').toUpperCase();let score=0;
  if(symbol===ticker)score+=100;if(marketMatch(company,quote))score+=80;if(description===name)score+=30;const firstName=name.split(' ')[0];if(firstName&&description.includes(firstName))score+=10;if(quote.type?.toLowerCase().includes('equity'))score+=5;return score;
}
async function getJson<T>(url:string){const response=await fetch(url,{headers:{Accept:'application/json, text/plain, */*','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153.0.0.0 Safari/537.36','domain-id':'www',Referer:'https://www.investing.com/'},next:{revalidate:3600}});if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);return (await response.json()) as T;}
async function resolvePairId(company:MarketCompany){
  const query=encodeURIComponent(`${company.ticker} ${company.name}`),response=await getJson<SearchResponse>(`${SEARCH_URL}?q=${query}`),candidates=(response.quotes??[]).filter(q=>quoteId(q));
  const marketCandidates=candidates.filter(q=>marketMatch(company,q));if(!marketCandidates.length)throw new Error(`${SOURCE} did not return a market-qualified instrument for ${company.countryCode} ${company.ticker}`);
  const ranked=marketCandidates.sort((a,b)=>scoreQuote(company,b)-scoreQuote(company,a)),best=ranked[0],id=best?quoteId(best):undefined;if(!id)throw new Error(`${SOURCE} instrument was not found for ${company.countryCode} ${company.ticker}`);return {id};
}
function parseTimestamp(value:unknown){const n=asNumber(value);if(n!==undefined){const date=new Date(n>10_000_000_000?n:n*1000);if(!Number.isNaN(date.getTime()))return date.toISOString();}const text=asString(value);if(text){const date=new Date(text);if(!Number.isNaN(date.getTime()))return date.toISOString();}return undefined;}
function parseRows(response:HistoryResponse){const points:HistoricalPricePoint[]=[];for(const row of response.data??[]){const date=parseTimestamp(row.rowDateTimestamp),close=asNumber(row.last_close);if(!date||close===undefined||close<=0)continue;points.push({date,close,open:asNumber(row.last_open),high:asNumber(row.last_max),low:asNumber(row.last_min)});}return points;}
function merge(points:HistoricalPricePoint[]){const byDate=new Map<string,HistoricalPricePoint>();for(const point of points)byDate.set(point.date.slice(0,10),point);return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));}
async function fetchRange(pairId:number,startDate:string,endDate:string){const url=new URL(`${HISTORY_URL}/${pairId}`);url.searchParams.set('start-date',startDate);url.searchParams.set('end-date',endDate);url.searchParams.set('time-frame','Daily');url.searchParams.set('add-missing-rows','false');return parseRows(await getJson<HistoryResponse>(url.toString()));}

/** Isolated secondary provider for North African equities. Its internal endpoints are undocumented. */
export async function getInvestingMoroccoHistoricalPrices(company:MarketCompany){
  if(!marketFor(company))return {history:[] as HistoricalPricePoint[],source:undefined as string|undefined,providerTicker:undefined as string|undefined,error:undefined as string|undefined};
  try{
    const {id}=await resolvePairId(company),points:HistoricalPricePoint[]=[];const earliest=new Date();earliest.setFullYear(earliest.getFullYear()-REQUEST_YEARS);let end=new Date();
    for(let request=0;request<MAX_REQUESTS&&end>earliest;request++){const start=new Date(end);start.setDate(start.getDate()-WINDOW_DAYS);if(start<earliest)start.setTime(earliest.getTime());const rows=await fetchRange(id,start.toISOString().slice(0,10),end.toISOString().slice(0,10));if(rows.length)points.push(...rows);if(start<=earliest)break;end=new Date(start);end.setDate(end.getDate()-1);}
    const history=merge(points);if(history.length<2)throw new Error(`${SOURCE} returned fewer than two historical observations for ${company.countryCode} ${company.ticker}`);return {history,source:SOURCE,providerTicker:`INV:${id}`,error:undefined as string|undefined};
  }catch(error){return {history:[] as HistoricalPricePoint[],source:undefined as string|undefined,providerTicker:undefined as string|undefined,error:error instanceof Error?error.message:`${SOURCE} historical data request failed`};}
}
