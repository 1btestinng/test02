import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

type YahooChartResult={timestamp?:number[];indicators?:{quote?:Array<{close?:Array<number|null>}>};meta?:{symbol?:string}};
type YahooChartResponse={chart?:{result?:YahooChartResult[];error?:{description?:string}|null}};
type YahooSearchResponse={quotes?:Array<{symbol?:string;shortname?:string;longname?:string;quoteType?:string}>};

const SUFFIX:Record<string,string>={EG:'.CA',MA:'.CS',TN:'.TN'};
const SOURCE='Yahoo Finance';

async function json<T>(url:string):Promise<T>{
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0',Accept:'application/json'},next:{revalidate:900}});
  if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);
  return (await response.json()) as T;
}

async function chart(symbol:string){
  const url=new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set('range','max');
  url.searchParams.set('interval','1d');
  url.searchParams.set('events','div,splits');
  const body=await json<YahooChartResponse>(url.toString());
  if(body.chart?.error)throw new Error(body.chart.error.description??`${SOURCE} chart error`);
  const result=body.chart?.result?.[0];
  if(!result)throw new Error('No historical observations returned');
  return result;
}

async function resolve(company:MarketCompany){
  const clean=company.ticker.trim().toUpperCase();
  const suffix=SUFFIX[company.countryCode.toUpperCase()];
  const direct=suffix&&!clean.includes('.')?`${clean}${suffix}`:clean.includes('.')?clean:undefined;
  if(direct){try{const result=await chart(direct);if(result.timestamp?.length)return direct;}catch{}}
  const url=new URL('https://query1.finance.yahoo.com/v1/finance/search');
  url.searchParams.set('q',`${company.ticker} ${company.name}`);
  url.searchParams.set('quotesCount','10');
  url.searchParams.set('newsCount','0');
  try{
    const body=await json<YahooSearchResponse>(url.toString());
    const candidates=(body.quotes??[]).filter(q=>q.quoteType==='EQUITY'&&q.symbol);
    const sameTicker=candidates.find(q=>q.symbol!.split('.')[0].toUpperCase()===clean.split('.')[0]);
    const sameName=candidates.find(q=>`${q.longname??''} ${q.shortname??''}`.toLowerCase().includes(company.name.toLowerCase().split(' ')[0]));
    return sameTicker?.symbol??sameName?.symbol;
  }catch{return undefined;}
}

function normalize(result:YahooChartResult):HistoricalPricePoint[]{
  const timestamps=result.timestamp??[];
  const closes=result.indicators?.quote?.[0]?.close??[];
  const points:HistoricalPricePoint[]=[];
  timestamps.forEach((timestamp,index)=>{
    const close=closes[index];
    if(!Number.isFinite(timestamp)||typeof close!=='number'||!Number.isFinite(close))return;
    points.push({date:new Date(timestamp*1000).toISOString(),close});
  });
  return points.sort((a,b)=>a.date.localeCompare(b.date));
}

export async function getCompanyMaxHistory(company:MarketCompany){
  const symbol=await resolve(company);
  if(!symbol)return {history:[] as HistoricalPricePoint[],providerTicker:undefined as string|undefined,error:`No compatible Yahoo Finance historical symbol was found for ${company.countryCode} ${company.ticker}.`};
  try{
    const points=normalize(await chart(symbol));
    return {history:points,providerTicker:symbol,error:points.length?'':`Yahoo Finance returned no historical observations for ${symbol}.`};
  }catch(error){
    return {history:[] as HistoricalPricePoint[],providerTicker:symbol,error:error instanceof Error?error.message:'Unknown historical market-data provider error'};
  }
}
