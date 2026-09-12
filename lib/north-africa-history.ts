import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

type StockAnalysisMarket='cbse'|'bvmt';
const MARKET_MAP:Record<string,StockAnalysisMarket>={MA:'cbse',TN:'bvmt'};
const SOURCE='StockAnalysis / S&P Global Market Intelligence';
const MAX_PAGES=120;

function finite(value:number|undefined):value is number{return typeof value==='number'&&Number.isFinite(value);}
function marketFor(company:MarketCompany):StockAnalysisMarket|undefined{return MARKET_MAP[company.countryCode.toUpperCase()];}
function parseNumber(value:string|undefined){
  if(!value)return undefined;
  const cleaned=value.replace(/,/g,'').replace(/\s+/g,'').trim();
  if(cleaned==='-'||cleaned==='—'||cleaned==='')return undefined;
  const parsed=Number(cleaned);
  return Number.isFinite(parsed)?parsed:undefined;
}
function stripHtml(value:string){return value.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();}
function parseDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?undefined:date.toISOString();}

function extractRows(html:string):HistoricalPricePoint[]{
  const rows:HistoricalPricePoint[]=[];
  const rowMatches=html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)??[];
  for(const row of rowMatches){
    const cells=(row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi)??[]).map(stripHtml);
    if(cells.length<5)continue;
    if(!/^\w{3}\s+\d{1,2},\s+\d{4}$/i.test(cells[0]))continue;
    const date=parseDate(cells[0]);
    const open=parseNumber(cells[1]);
    const high=parseNumber(cells[2]);
    const low=parseNumber(cells[3]);
    const close=parseNumber(cells[4]);
    const adjustedClose=parseNumber(cells[5]);
    const volume=parseNumber(cells[7]);
    if(!date||!finite(close))continue;
    rows.push({date,close,open,high,low,adjustedClose,volume});
  }
  return rows;
}

async function fetchPage(company:MarketCompany,page:number){
  const market=marketFor(company);
  if(!market)return [];
  const query=page>1?`?p=${page}`:'';
  const url=`https://stockanalysis.com/quote/${market}/${encodeURIComponent(company.ticker.toUpperCase())}/history/${query}`;
  const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 iStocks/1.0','Accept':'text/html'},next:{revalidate:900}});
  if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);
  return extractRows(await response.text());
}

/**
 * Verified public historical fallback for CSE/BVMT.
 * Fetch every available history page until the provider stops returning new
 * observations. We never manufacture or interpolate observations.
 *
 * Note: the provider itself may expose only a bounded public history window;
 * in that case this function returns exactly that verified window rather than
 * pretending it is longer.
 */
export async function getNorthAfricaHistoricalPrices(company:MarketCompany){
  if(!marketFor(company))return {history:[] as HistoricalPricePoint[],source:undefined as string|undefined,error:undefined as string|undefined};

  const byDate=new Map<string,HistoricalPricePoint>();
  let previousSize=0;

  for(let page=1;page<=MAX_PAGES;page++){
    let rows:HistoricalPricePoint[]=[];
    try{rows=await fetchPage(company,page);}catch{}
    if(!rows.length)break;

    for(const point of rows)byDate.set(point.date.slice(0,10),point);
    if(byDate.size===previousSize)break;
    previousSize=byDate.size;
  }

  const history=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
  if(!history.length)return {history,source:undefined,error:`${SOURCE} returned no verified historical observations for ${company.countryCode} ${company.ticker}.`};
  return {history,source:SOURCE,error:undefined};
}
