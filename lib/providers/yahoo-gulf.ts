import type {MarketCompany,MarketDataProvider,MarketSummary} from '@/lib/markets/types';
import type {GulfCode} from '@/lib/markets/gulf';

type Seed=[string,string,string,number,string?];
type YahooQuote={symbol?:string;regularMarketPrice?:number;regularMarketPreviousClose?:number;regularMarketChangePercent?:number;regularMarketTime?:number;marketCap?:number;sharesOutstanding?:number;currency?:string};
type YahooResponse={quoteResponse?:{result?:YahooQuote[]}};
type YahooChart={chart?:{result?:Array<{meta?:{regularMarketPrice?:number;previousClose?:number;regularMarketTime?:number;currency?:string};indicators?:{quote?:Array<{close?:Array<number|null>}>}}>} };

const SUFFIX:{[K in GulfCode]?:string}={SA:'.SR',KW:'.KW',QA:'.QA',BH:'.BH',OM:'.OM'};
const UAE_SUFFIX={ADX:'.AB',DFM:'.AE'} as const;
function providerSymbol(code:GulfCode,ticker:string,exchangeCode:string){if(code==='AE')return `${ticker}${exchangeCode==='ADX'?UAE_SUFFIX.ADX:UAE_SUFFIX.DFM}`;return `${ticker}${SUFFIX[code]??''}`;}
function finite(value:unknown):value is number{return typeof value==='number'&&Number.isFinite(value);}

async function fetchQuotes(symbols:string[]):Promise<Map<string,YahooQuote>>{
  const result=new Map<string,YahooQuote>();
  if(!symbols.length)return result;
  const url=`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}&fields=symbol,regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent,regularMarketTime,marketCap,sharesOutstanding,currency`;
  try{
    const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0'},next:{revalidate:60}});
    if(response.ok){
      const payload=(await response.json()) as YahooResponse;
      for(const quote of payload.quoteResponse?.result??[]){if(quote.symbol)result.set(quote.symbol,quote);}
    }
  }catch{}
  return result;
}

async function fetchChartQuote(symbol:string):Promise<YahooQuote|undefined>{
  try{
    const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0'},next:{revalidate:60}});
    if(!response.ok)return undefined;
    const payload=(await response.json()) as YahooChart;
    const item=payload.chart?.result?.[0];
    if(!item)return undefined;
    const closes=(item.indicators?.quote?.[0]?.close??[]).filter(finite);
    const price=finite(item.meta?.regularMarketPrice)?item.meta!.regularMarketPrice:closes.at(-1);
    const previousClose=finite(item.meta?.previousClose)?item.meta!.previousClose:closes.length>1?closes.at(-2):undefined;
    if(!finite(price))return undefined;
    const changePercent=finite(previousClose)&&previousClose!==0?((price-previousClose)/previousClose)*100:undefined;
    return {symbol,regularMarketPrice:price,regularMarketPreviousClose:previousClose,regularMarketChangePercent:changePercent,regularMarketTime:item.meta?.regularMarketTime,currency:item.meta?.currency};
  }catch{return undefined;}
}

export async function getLiveGulfCompanies(code:GulfCode,seeds:Seed[],currency:string,localPerUsd:number):Promise<MarketCompany[]>{
  const mappings=seeds.map(([name,ticker,sector,_snapshot,exchangeCode])=>({name,ticker,sector,exchangeCode:exchangeCode??code,providerSymbol:providerSymbol(code,ticker,exchangeCode??code)}));
  const quotes=await fetchQuotes(mappings.map(x=>x.providerSymbol));
  const missing=mappings.filter(x=>!quotes.has(x.providerSymbol));
  if(missing.length){const fallback=await Promise.all(missing.map(async item=>[item.providerSymbol,await fetchChartQuote(item.providerSymbol)] as const));for(const [symbol,quote] of fallback)if(quote)quotes.set(symbol,quote);}
  const now=new Date().toISOString();
  return mappings.map(item=>{
    const quote=quotes.get(item.providerSymbol);
    const price=finite(quote?.regularMarketPrice)?quote!.regularMarketPrice:undefined;
    const previousClose=finite(quote?.regularMarketPreviousClose)?quote!.regularMarketPreviousClose:undefined;
    const changePercent=finite(quote?.regularMarketChangePercent)?quote!.regularMarketChangePercent:finite(price)&&finite(previousClose)&&previousClose!==0?((price-previousClose)/previousClose)*100:undefined;
    const marketCapLocal=finite(quote?.marketCap)?quote!.marketCap:finite(quote?.sharesOutstanding)&&finite(price)?quote!.sharesOutstanding!*price:undefined;
    const marketCapUSD=finite(marketCapLocal)?marketCapLocal/localPerUsd:undefined;
    return {id:`${code}-${item.exchangeCode}-${item.ticker}`,countryCode:code,exchangeCode:item.exchangeCode,ticker:item.ticker,name:item.name,sector:item.sector,industry:item.sector,currency,price,previousClose,changePercent,sharesOutstanding:finite(quote?.sharesOutstanding)?quote!.sharesOutstanding:undefined,marketCapLocal,marketCapUSD,marketCapSource:finite(quote?.marketCap)?'provider':'calculated',timestamp:finite(quote?.regularMarketTime)?new Date(quote!.regularMarketTime!*1000).toISOString():now,dataSource:'Yahoo Finance delayed market data'} satisfies MarketCompany;
  });
}

export function createYahooGulfProvider(code:GulfCode,seeds:Seed[],config:{currencyCode:string;timezone:string;dataSource:string;delay:string},localPerUsd:number):MarketDataProvider{
  const load=()=>getLiveGulfCompanies(code,seeds,config.currencyCode,localPerUsd);
  return {
    async getCompanies(){return load();},
    async getCompany(ticker){return (await load()).find(c=>c.ticker.toUpperCase()===ticker.toUpperCase());},
    async getMarketSummary(){const rows=await load();const lastUpdated=rows.reduce((latest,row)=>row.timestamp&&row.timestamp>latest?row.timestamp:latest,'');return {count:rows.length,totalLocal:rows.reduce((sum,row)=>sum+(row.marketCapLocal??0),0),totalUSD:rows.reduce((sum,row)=>sum+(row.marketCapUSD??0),0),industries:new Set(rows.map(row=>row.sector).filter(Boolean)).size,fxRate:localPerUsd,fxSource:`${config.currencyCode}/USD reference rate`,lastUpdated:lastUpdated||new Date().toISOString(),dataSource:config.dataSource,delay:config.delay} satisfies MarketSummary;},
    async getFX(){return localPerUsd;},
    async getMarketStatus(){const parts=new Intl.DateTimeFormat('en-US',{timeZone:config.timezone,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());const weekday=parts.find(p=>p.type==='weekday')?.value;const hour=Number(parts.find(p=>p.type==='hour')?.value??0);const minute=Number(parts.find(p=>p.type==='minute')?.value??0);const minutes=hour*60+minute;const weekend=weekday==='Fri'||weekday==='Sat';return weekend?'closed':minutes>=600&&minutes<900?'open':'closed';}
  };
}
