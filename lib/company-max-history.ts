import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';
import {getInvestingMoroccoHistoricalPrices} from '@/lib/investing-morocco-history';
import {getMoroccoHistoricalPrices} from '@/lib/morocco-history';
import {getNorthAfricaHistoricalPrices} from '@/lib/north-africa-history';

type YahooInterval='1d'|'1mo';
type YahooChartResult={timestamp?:number[];indicators?:{quote?:Array<{close?:Array<number|null>}>};meta?:{symbol?:string}};
type YahooChartResponse={chart?:{result?:YahooChartResult[];error?:{description?:string}|null}};
type YahooSearchQuote={symbol?:string;shortname?:string;longname?:string;quoteType?:string;exchange?:string};
type YahooSearchResponse={quotes?:YahooSearchQuote[]};
type HistoryResult={history:HistoricalPricePoint[];source?:string;providerTicker?:string;error?:string};

const SUFFIX:Record<string,string>={EG:'.CA',MA:'.CS',TN:'.TN',DZ:'.AL'};
const SOURCE='Yahoo Finance';
const FIVE_YEARS_SECONDS=5*365*24*60*60;
const TWO_YEARS_SECONDS=2*365*24*60*60;

async function json<T>(url:string):Promise<T>{const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0',Accept:'application/json'},next:{revalidate:900}});if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);return (await response.json()) as T;}
async function chart(symbol:string,interval:YahooInterval='1d',period1?:number,period2?:number){const url=new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);if(period1!==undefined&&period2!==undefined){url.searchParams.set('period1',String(Math.max(0,Math.floor(period1))));url.searchParams.set('period2',String(Math.floor(period2)));}else url.searchParams.set('range','max');url.searchParams.set('interval',interval);url.searchParams.set('events','div,splits');const body=await json<YahooChartResponse>(url.toString());if(body.chart?.error)throw new Error(body.chart.error.description??`${SOURCE} chart error`);const result=body.chart?.result?.[0];if(!result)throw new Error('No historical observations returned');return result;}
function expectedSuffix(company:MarketCompany){return SUFFIX[company.countryCode.toUpperCase()];}
function tickerBase(symbol:string){return symbol.split('.')[0]?.toUpperCase()??symbol.toUpperCase();}
function nameTokens(name:string){return name.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(token=>token.length>=4).slice(0,5);}
function nameScore(company:MarketCompany,candidate:YahooSearchQuote){const hay=`${candidate.longname??''} ${candidate.shortname??''}`.toLowerCase();return nameTokens(company.name).reduce((score,token)=>score+(hay.includes(token)?1:0),0);}
async function resolve(company:MarketCompany){
  const clean=company.ticker.trim().toUpperCase(),suffix=expectedSuffix(company),direct=clean.includes('.')?clean:suffix?`${clean}${suffix}`:undefined,candidates:string[]=[];if(direct)candidates.push(direct);
  const url=new URL('https://query1.finance.yahoo.com/v1/finance/search');url.searchParams.set('q',`${company.ticker} ${company.name}`);url.searchParams.set('quotesCount','20');url.searchParams.set('newsCount','0');
  try{const body=await json<YahooSearchResponse>(url.toString());const equities=(body.quotes??[]).filter(q=>q.quoteType==='EQUITY'&&q.symbol);const exact=equities.filter(q=>q.symbol!.toUpperCase()===direct?.toUpperCase());const suffixMatches=suffix?equities.filter(q=>q.symbol!.toUpperCase().endsWith(suffix)):[];const tickerMatches=equities.filter(q=>tickerBase(q.symbol!)===clean);const nameMatches=equities.filter(q=>nameScore(company,q)>0);for(const q of [...exact,...suffixMatches,...tickerMatches,...nameMatches])if(q.symbol&&!candidates.includes(q.symbol))candidates.push(q.symbol);}catch{}
  for(const symbol of candidates){try{const result=await chart(symbol,'1d',Math.floor(Date.now()/1000)-86400*30,Math.floor(Date.now()/1000));if((result.timestamp?.length??0)>1)return symbol;}catch{}}
  return undefined;
}
function normalize(result:YahooChartResult):HistoricalPricePoint[]{const timestamps=result.timestamp??[],closes=result.indicators?.quote?.[0]?.close??[],points:HistoricalPricePoint[]=[];timestamps.forEach((timestamp,index)=>{const close=closes[index];if(!Number.isFinite(timestamp)||typeof close!=='number'||!Number.isFinite(close)||close<=0)return;points.push({date:new Date(timestamp*1000).toISOString(),close});});return points.sort((a,b)=>a.date.localeCompare(b.date));}
function mergePoints(...datasets:HistoricalPricePoint[][]){const byDate=new Map<string,HistoricalPricePoint>();for(const dataset of datasets)for(const point of dataset)byDate.set(point.date.slice(0,10),point);return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));}
async function fetchWindowedHistory(symbol:string,interval:YahooInterval,windowSeconds:number){const now=Math.floor(Date.now()/1000),firstWindowStart=0,points:HistoricalPricePoint[]=[];let end=now,emptyWindows=0;while(end>firstWindowStart){const start=Math.max(firstWindowStart,end-windowSeconds);try{const result=await chart(symbol,interval,start,end),rows=normalize(result);if(rows.length){points.push(...rows);emptyWindows=0;}else{emptyWindows++;if(emptyWindows>=3)break;}}catch{emptyWindows++;if(emptyWindows>=3)break;}if(start<=firstWindowStart)break;end=start+1;}return mergePoints(points);}
function yearsCovered(history:HistoricalPricePoint[]){if(history.length<2)return 0;const first=Date.parse(history[0].date),last=Date.parse(history[history.length-1].date);return Number.isFinite(first)&&Number.isFinite(last)?Math.max(0,(last-first)/(365.25*24*60*60*1000)):0;}
function latestAgeDays(history:HistoricalPricePoint[]){if(!history.length)return Number.POSITIVE_INFINITY;const last=Date.parse(history[history.length-1].date);return Number.isFinite(last)?Math.max(0,(Date.now()-last)/(24*60*60*1000)):Number.POSITIVE_INFINITY;}
function isValidHistory(history:HistoricalPricePoint[]){if(history.length<2)return false;for(let i=0;i<history.length;i++){const point=history[i];if(!point.date||!Number.isFinite(Date.parse(point.date))||!Number.isFinite(point.close)||point.close<=0)return false;if(i>0&&history[i-1].date.slice(0,10)>=point.date.slice(0,10))return false;}return true;}
function chooseBest(results:HistoryResult[]){const valid=results.filter(result=>isValidHistory(result.history));valid.sort((a,b)=>{const years=yearsCovered(b.history)-yearsCovered(a.history);if(Math.abs(years)>0.05)return years;const freshness=latestAgeDays(a.history)-latestAgeDays(b.history);if(Math.abs(freshness)>7)return freshness;return b.history.length-a.history.length;});return valid[0];}
async function getYahooHistory(symbol:string):Promise<HistoryResult>{try{const [daily,monthly]=await Promise.all([fetchWindowedHistory(symbol,'1d',TWO_YEARS_SECONDS),fetchWindowedHistory(symbol,'1mo',FIVE_YEARS_SECONDS)]);const history=mergePoints(monthly,daily);if(!isValidHistory(history))throw new Error('Yahoo Finance returned no usable historical observations');return {history,source:SOURCE,providerTicker:symbol};}catch(error){return {history:[],source:undefined,providerTicker:symbol,error:error instanceof Error?error.message:`${SOURCE} historical request failed`};}}

export async function getCompanyMaxHistory(company:MarketCompany){
  const country=company.countryCode.toUpperCase();
  const symbol=await resolve(company);

  // Egypt is the proven reference path: explicit Yahoo date windows, merged
  // daily/monthly, normalized and deduplicated. Keep this path unchanged.
  if(country==='EG'){
    if(symbol){const yahoo=await getYahooHistory(symbol);if(yahoo.history.length>1)return yahoo;}
    const fallback=await getNorthAfricaHistoricalPrices(company);if(fallback.history.length>1)return {history:fallback.history,source:fallback.source,providerTicker:fallback.source,error:''};
    return {history:[] as HistoricalPricePoint[],source:undefined,providerTicker:symbol,error:fallback.error??`No verified historical market-data provider returned usable data for ${country} ${company.ticker}.`};
  }

  // For North Africa, a provider is not accepted merely because it returned
  // rows. Compare valid coverage and keep the deepest genuine dataset.
  const candidates:Promise<HistoryResult>[]=[];if(symbol)candidates.push(getYahooHistory(symbol));candidates.push(getInvestingMoroccoHistoricalPrices(company));
  const primary=await Promise.all(candidates);const bestPrimary=chooseBest(primary);
  if(bestPrimary&&yearsCovered(bestPrimary.history)>=4)return bestPrimary;

  const exchangeResults:HistoryResult[]=[];
  if(country==='MA')exchangeResults.push(await getMoroccoHistoricalPrices(company));
  exchangeResults.push(await getNorthAfricaHistoricalPrices(company));
  const best=chooseBest([...(bestPrimary?[bestPrimary]:[]),...exchangeResults]);
  if(best)return best;

  return {history:[] as HistoricalPricePoint[],source:undefined,providerTicker:symbol,error:primary.map(result=>result.error).filter(Boolean).join(' | ')||`No verified historical market-data provider returned usable data for ${country} ${company.ticker}.`};
}
