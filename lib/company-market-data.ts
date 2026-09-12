import type {CompanyMarketData,HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

type YahooChartResult={
  meta?:{
    symbol?:string;
    currency?:string;
    regularMarketPrice?:number;
    previousClose?:number;
    chartPreviousClose?:number;
    regularMarketTime?:number;
    exchangeTimezoneName?:string;
    fullExchangeName?:string;
  };
  timestamp?:number[];
  indicators?:{
    quote?:Array<{
      open?:Array<number|null>;
      high?:Array<number|null>;
      low?:Array<number|null>;
      close?:Array<number|null>;
      volume?:Array<number|null>;
    }>;
    adjclose?:Array<{adjclose?:Array<number|null>}>;
  };
};

type YahooResponse={chart?:{result?:YahooChartResult[];error?:{description?:string}|null}};

const YAHOO_SUFFIX:Record<string,string>={EG:'.CA',MA:'.MA',TN:'.TN'};
const YAHOO_SOURCE='Yahoo Finance chart API';

function providerTicker(countryCode:string,ticker:string){
  const clean=ticker.trim().toUpperCase();
  if(clean.includes('.'))return clean;
  const suffix=YAHOO_SUFFIX[countryCode.toUpperCase()];
  return suffix?`${clean}${suffix}`:undefined;
}

function finite(value:number|null|undefined):value is number{
  return typeof value==='number'&&Number.isFinite(value);
}

function normalizeHistory(result:YahooChartResult):HistoricalPricePoint[]{
  const timestamps=result.timestamp??[];
  const quote=result.indicators?.quote?.[0]??{};
  const adjusted=result.indicators?.adjclose?.[0]?.adjclose??[];
  const points:HistoricalPricePoint[]=[];

  timestamps.forEach((timestamp,index)=>{
    const close=quote.close?.[index];
    if(!finite(close))return;
    const date=new Date(timestamp*1000).toISOString();
    points.push({
      date,
      close,
      open:finite(quote.open?.[index])?quote.open?.[index]:undefined,
      high:finite(quote.high?.[index])?quote.high?.[index]:undefined,
      low:finite(quote.low?.[index])?quote.low?.[index]:undefined,
      adjustedClose:finite(adjusted[index])?adjusted[index]:undefined,
      volume:finite(quote.volume?.[index])?quote.volume?.[index]:undefined,
    });
  });

  return points.sort((a,b)=>a.date.localeCompare(b.date));
}

async function fetchYahooChart(symbol:string,range:'1d'|'5d'|'1mo'|'3mo'|'6mo'|'1y'|'3y'|'5y'|'max'){
  const url=new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set('range',range);
  url.searchParams.set('interval',range==='1d'?'5m':'1d');
  url.searchParams.set('events','div,splits');

  const response=await fetch(url.toString(),{
    headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0'},
    next:{revalidate:300},
  });
  if(!response.ok)throw new Error(`Yahoo Finance returned HTTP ${response.status}`);
  const body=(await response.json()) as YahooResponse;
  if(body.chart?.error)throw new Error(body.chart.error.description??'Yahoo Finance returned an error');
  const result=body.chart?.result?.[0];
  if(!result)throw new Error('Yahoo Finance returned no chart data');
  return result;
}

function buildQuote(result:YahooChartResult,company:MarketCompany):Partial<MarketCompany>{
  const meta=result.meta??{};
  const latest=result.indicators?.quote?.[0];
  const close=latest?.close?.filter(finite).at(-1);
  const previous=finite(meta.previousClose)?meta.previousClose:finite(meta.chartPreviousClose)?meta.chartPreviousClose:undefined;
  const price=finite(meta.regularMarketPrice)?meta.regularMarketPrice:close;
  const open=latest?.open?.filter(finite).at(-1);
  const high=latest?.high?.filter(finite).at(-1);
  const low=latest?.low?.filter(finite).at(-1);
  const volume=latest?.volume?.filter(finite).at(-1);
  const changePercent=price!==undefined&&previous!==undefined&&previous!==0?((price-previous)/previous)*100:company.changePercent;
  const timestamp=meta.regularMarketTime?new Date(meta.regularMarketTime*1000).toISOString():new Date().toISOString();
  const marketCapLocal=price!==undefined&&company.sharesOutstanding!==undefined?price*company.sharesOutstanding:company.marketCapLocal;

  return {
    ...company,
    price,
    previousClose:previous??company.previousClose,
    changePercent,
    open,
    high,
    low,
    volume,
    marketCapLocal,
    marketCapUSD:marketCapLocal!==undefined&&company.marketCapUSD!==undefined&&company.marketCapLocal?company.marketCapUSD*(marketCapLocal/company.marketCapLocal):company.marketCapUSD,
    marketCapSource:marketCapLocal!==undefined&&company.sharesOutstanding!==undefined&&price!==undefined?'calculated':company.marketCapSource,
    timestamp,
    dataSource:YAHOO_SOURCE,
  };
}

export async function getCompanyMarketData(company:MarketCompany):Promise<CompanyMarketData>{
  const ticker=providerTicker(company.countryCode,company.ticker);
  if(!ticker){
    return {quote:company,history:[],source:company.dataSource??'Configured market snapshot',retrievedAt:new Date().toISOString(),delay:'Delayed snapshot',historyAvailable:false,error:`No historical provider mapping is configured for ${company.countryCode}.`};
  }

  try{
    const result=await fetchYahooChart(ticker,'5y');
    const history=normalizeHistory(result);
    const quote=buildQuote(result,company);
    if(history.length===0)throw new Error('Provider returned no usable historical observations');
    return {quote,history,source:YAHOO_SOURCE,retrievedAt:new Date().toISOString(),providerTicker:ticker,delay:'Delayed / provider-defined',historyAvailable:true};
  }catch(error){
    return {
      quote:company,
      history:[],
      source:company.dataSource??'Configured market snapshot',
      retrievedAt:new Date().toISOString(),
      providerTicker:ticker,
      delay:'Delayed snapshot',
      historyAvailable:false,
      error:error instanceof Error?error.message:'Unknown market-data provider error',
    };
  }
}

export function filterHistoryByRange(points:HistoricalPricePoint[],range:string){
  if(range==='MAX')return points;
  const days:Record<string,number>={
    '1D':1,'1W':7,'1M':31,'3M':92,'6M':184,'1Y':366,'3Y':1096,'5Y':1830,
  };
  const daysBack=days[range]??366;
  const latest=points.at(-1)?.date;
  if(!latest)return points;
  const cutoff=new Date(latest);
  cutoff.setUTCDate(cutoff.getUTCDate()-daysBack);
  return points.filter(point=>new Date(point.date)>=cutoff);
}

export function downsampleHistory(points:HistoricalPricePoint[],maxPoints=600){
  if(points.length<=maxPoints)return points;
  const step=(points.length-1)/(maxPoints-1);
  return Array.from({length:maxPoints},(_,index)=>points[Math.round(index*step)]).filter(Boolean);
}
