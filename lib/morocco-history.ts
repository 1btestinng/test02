import type {HistoricalPricePoint,MarketCompany} from '@/lib/markets/types';

const API_BASE='https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data';
const SOURCE='Bourse de Casablanca';
const PAGE_SIZE=250;
const MAX_YEARS=3;

type JsonApiResource={
  id?:string;
  type?:string;
  attributes?:Record<string,unknown>;
  relationships?:Record<string,{data?:{id?:string;type?:string}|Array<{id?:string;type?:string}>|null}>;
};

type JsonApiResponse={
  data?:JsonApiResource[];
  included?:JsonApiResource[];
  links?:{next?:{href?:string}|string|null};
};

function asString(value:unknown){return typeof value==='string'&&value.trim()?value.trim():undefined;}
function asNumber(value:unknown){
  if(typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value!=='string')return undefined;
  const n=Number(value.replace(/,/g,'').replace(/\s+/g,''));
  return Number.isFinite(n)?n:undefined;
}
function toIsoDate(value:unknown){
  const text=asString(value);if(!text)return undefined;
  const date=new Date(text);return Number.isNaN(date.getTime())?undefined:date.toISOString();
}

async function getJson<T>(url:string):Promise<T>{
  const response=await fetch(url,{headers:{Accept:'application/vnd.api+json','User-Agent':'Mozilla/5.0 iStocks/1.0'},next:{revalidate:3600}});
  if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);
  return (await response.json()) as T;
}

function extractSymbolId(resource:JsonApiResource,response:JsonApiResponse){
  const direct=resource.relationships?.symbol?.data;
  const directId=Array.isArray(direct)?direct[0]?.id:direct?.id;
  if(directId)return directId;

  const included=response.included??[];
  const resourceSymbol=asString(resource.attributes?.symbol)?.toUpperCase();
  const includedSymbol=included.find(item=>item.type==='symbol'&&(
    asString(item.attributes?.symbol)?.toUpperCase()===resourceSymbol ||
    item.id===resource.id
  ));
  if(includedSymbol?.id)return includedSymbol.id;

  // Some versions of the CSE JSON:API response expose the internal symbol
  // identifier directly on the instrument resource instead of as a
  // relationship. Keep this as the final resolution path rather than
  // silently falling through to a less authoritative provider.
  return resource.id;
}

async function resolveInstrument(ticker:string){
  const url=new URL(`${API_BASE}/instrument`);
  url.searchParams.set('page[limit]','200');
  url.searchParams.set('fields[instrument]','symbol,libelleFR,libelleEN,codeISIN');
  url.searchParams.set('include','symbol');
  const response=await getJson<JsonApiResponse>(url.toString());
  const clean=ticker.trim().toUpperCase();
  const resource=(response.data??[]).find(item=>asString(item.attributes?.symbol)?.toUpperCase()===clean);
  if(!resource)throw new Error(`${SOURCE} instrument ${clean} was not found`);
  const symbolId=extractSymbolId(resource,response);
  if(!symbolId)throw new Error(`${SOURCE} symbol identifier for ${clean} was not returned`);
  return {symbolId,isin:asString(resource.attributes?.codeISIN)};
}

function parseHistory(rows:JsonApiResource[]):HistoricalPricePoint[]{
  const points:HistoricalPricePoint[]=[];
  for(const row of rows){
    const attrs=row.attributes??{};
    const date=toIsoDate(attrs.created??attrs.field_seance_date??attrs.date);
    const close=asNumber(attrs.closingPrice??attrs.coursCourant??attrs.coursAjuste);
    if(!date||close===undefined)continue;
    points.push({
      date,
      close,
      open:asNumber(attrs.openingPrice),
      high:asNumber(attrs.highPrice),
      low:asNumber(attrs.lowPrice),
      adjustedClose:asNumber(attrs.coursAjuste),
      volume:asNumber(attrs.cumulVolumeEchange)
    });
  }
  return points;
}

async function fetchHistoryPage(symbolId:string,startDate:string,offset:number){
  const url=new URL(`${API_BASE}/instrument_history`);
  url.searchParams.set('fields[instrument_history]','symbol,created,openingPrice,coursCourant,highPrice,lowPrice,cumulTitresEchanges,cumulVolumeEchange,totalTrades,capitalisation,coursAjuste,closingPrice,ratioConsolide');
  url.searchParams.set('fields[instrument]','symbol,libelleFR,libelleAR,libelleEN,emetteur_url,instrument_url');
  url.searchParams.set('include','symbol');
  url.searchParams.set('sort[date-seance][path]','created');
  url.searchParams.set('sort[date-seance][direction]','DESC');
  url.searchParams.set('filter[filter-historique-instrument-emetteur][condition][path]','symbol.meta.drupal_internal__target_id');
  url.searchParams.set('filter[filter-historique-instrument-emetteur][condition][operator]','=');
  url.searchParams.set('filter[filter-historique-instrument-emetteur][condition][value]',symbolId);
  url.searchParams.set('filter[instrument-history-class][condition][path]','symbol.codeClasse.field_code');
  url.searchParams.set('filter[instrument-history-class][condition][operator]','=');
  url.searchParams.set('filter[instrument-history-class][condition][value]','1');
  url.searchParams.set('filter[published]','1');
  url.searchParams.set('filter[filter-date-start-vh-select][condition][path]','field_seance_date');
  url.searchParams.set('filter[filter-date-start-vh-select][condition][operator]','>=');
  url.searchParams.set('filter[filter-date-start-vh-select][condition][value]',startDate);
  url.searchParams.set('page[offset]',String(offset));
  url.searchParams.set('page[limit]',String(PAGE_SIZE));
  return getJson<JsonApiResponse>(url.toString());
}

export async function getMoroccoHistoricalPrices(company:MarketCompany){
  const cutoff=new Date();
  cutoff.setFullYear(cutoff.getFullYear()-MAX_YEARS);
  const startDate=cutoff.toISOString().slice(0,10);
  try{
    const {symbolId}=await resolveInstrument(company.ticker);
    const byDate=new Map<string,HistoricalPricePoint>();
    for(let offset=0;offset<=PAGE_SIZE*12;offset+=PAGE_SIZE){
      const response=await fetchHistoryPage(symbolId,startDate,offset);
      const rows=parseHistory(response.data??[]);
      if(!rows.length)break;
      const before=byDate.size;
      for(const point of rows)byDate.set(point.date.slice(0,10),point);
      if(byDate.size===before)break;
      if((response.data??[]).length<PAGE_SIZE)break;
    }
    const history=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
    if(history.length<2)throw new Error(`${SOURCE} returned fewer than two historical observations for ${company.ticker}`);
    return {history,source:SOURCE,providerTicker:`CSE:${company.ticker.toUpperCase()}`,error:undefined as string|undefined};
  }catch(error){
    return {history:[] as HistoricalPricePoint[],source:undefined as string|undefined,providerTicker:undefined as string|undefined,error:error instanceof Error?error.message:`${SOURCE} historical data request failed`};
  }
}
