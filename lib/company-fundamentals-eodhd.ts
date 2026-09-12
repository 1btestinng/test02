import type {CompanyFinancialData,FinancialPeriod,FinancialValue,MarketCompany} from '@/lib/markets/types';

type JsonRecord=Record<string,unknown>;
type EodExchange={Code?:string;Name?:string;CountryISO2?:string;Country?:string;Currency?:string};
type EodTicker={Code?:string;Name?:string;Exchange?:string;Currency?:string;Type?:string;Isin?:string|null};

const API='https://eodhd.com/api';
const SOURCE='EOD Historical Data';
const CACHE_SECONDS=21600;

function num(value:unknown):number|undefined{
  if(typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value==='string'&&value.trim()!==''){
    const parsed=Number(value.replace(/,/g,''));
    return Number.isFinite(parsed)?parsed:undefined;
  }
  return undefined;
}
function obj(value:unknown):JsonRecord{return value&&typeof value==='object'&&!Array.isArray(value)?value as JsonRecord:{};}
function records(value:unknown):JsonRecord[]{return Object.values(obj(value)).map(obj).filter(x=>Object.keys(x).length>0);}
function latest(value:unknown):JsonRecord|undefined{return records(value).sort((a,b)=>String(b.date??b.Date??'').localeCompare(String(a.date??a.Date??'')))[0];}
function sumLastFour(value:unknown,field:string):number|undefined{
  const rows=records(value).sort((a,b)=>String(b.date??'').localeCompare(String(a.date??''))).slice(0,4);
  const values=rows.map(x=>num(x[field])).filter((x):x is number=>x!==undefined);
  return values.length===4?values.reduce((a,b)=>a+b,0):undefined;
}
function period(date:unknown,type:'annual'|'quarterly'):FinancialPeriod|undefined{
  if(typeof date!=='string')return undefined;
  const d=new Date(date);if(Number.isNaN(d.getTime()))return undefined;
  return {label:type==='annual'?`FY ${d.getUTCFullYear()}`:`Q${Math.floor(d.getUTCMonth()/3)+1} ${d.getUTCFullYear()}`,periodType:type,endDate:date,fiscalYear:d.getUTCFullYear(),quarter:type==='quarterly'?Math.floor(d.getUTCMonth()/3)+1:undefined};
}
function fv(value:unknown,periodName:string|undefined,type:'annual'|'quarterly'|'ttm'|undefined,currency:string|undefined,methodology:'provider'|'calculated'='provider'):FinancialValue|undefined{
  const n=num(value);return n===undefined?undefined:{value:n,period:periodName,periodType:type,currency,source:SOURCE,retrievedAt:new Date().toISOString(),methodology};
}
async function getJson<T>(url:string):Promise<T>{
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'iStocks/1.0'},next:{revalidate:CACHE_SECONDS}} as RequestInit & {next?:{revalidate:number}});
  if(!response.ok)throw new Error(`${SOURCE} returned HTTP ${response.status}`);
  return await response.json() as T;
}

async function resolveExchange(countryCode:string):Promise<string|undefined>{
  const configured=process.env[`EODHD_${countryCode.toUpperCase()}_EXCHANGE`];
  if(configured?.trim())return configured.trim().toUpperCase();
  const apiKey=process.env.EODHD_API_KEY;if(!apiKey)return undefined;
  const url=new URL(`${API}/exchanges-list/`);url.searchParams.set('api_token',apiKey);url.searchParams.set('fmt','json');
  const exchanges=await getJson<EodExchange[]>(url.toString());
  return exchanges.find(x=>x.CountryISO2?.toUpperCase()===countryCode.toUpperCase())?.Code?.toUpperCase();
}

async function resolveTicker(company:MarketCompany):Promise<string|undefined>{
  const apiKey=process.env.EODHD_API_KEY;if(!apiKey)return undefined;
  const exchange=await resolveExchange(company.countryCode);if(!exchange)return undefined;
  const tickerKey=company.ticker.toUpperCase().replace(/[^A-Z0-9]/g,'_');
  const configuredTicker=process.env[`EODHD_${company.countryCode.toUpperCase()}_${tickerKey}`];
  if(configuredTicker)return configuredTicker.includes('.')?configuredTicker:`${configuredTicker}.${exchange}`;
  const url=new URL(`${API}/exchange-symbol-list/${encodeURIComponent(exchange)}`);url.searchParams.set('api_token',apiKey);url.searchParams.set('fmt','json');url.searchParams.set('type','common_stock');
  const tickers=await getJson<EodTicker[]>(url.toString());
  const clean=company.ticker.toUpperCase().replace(/\.(CA|CS|TN)$/,'');
  const exact=tickers.find(x=>x.Code?.toUpperCase()===clean);
  const nameToken=company.name.toLowerCase().split(/\s+/).find(x=>x.length>=4);
  const byName=nameToken?tickers.find(x=>x.Name?.toLowerCase().includes(nameToken)):undefined;
  return exact?.Code?`${exact.Code}.${exchange}`:byName?.Code?`${byName.Code}.${exchange}`:undefined;
}

function empty(error?:string):CompanyFinancialData{
  return {valuation:{},incomeStatement:{},profitability:{},balanceSheet:{},cashFlow:{},shareholder:{},periods:[],capabilities:{quote:false,historicalPrices:false,valuation:false,incomeStatement:false,balanceSheet:false,cashFlow:false,dividends:false},source:SOURCE,retrievedAt:new Date().toISOString(),error};
}

export async function getEodhdCompanyFundamentals(company:MarketCompany):Promise<CompanyFinancialData|undefined>{
  const apiKey=process.env.EODHD_API_KEY;if(!apiKey)return undefined;
  try{
    const symbol=await resolveTicker(company);
    if(!symbol)return empty(`No EODHD symbol mapping was found for ${company.countryCode} ${company.ticker}. Configure EODHD_${company.countryCode.toUpperCase()}_EXCHANGE or a ticker override.`);
    const url=new URL(`${API}/v1.1/fundamentals/${encodeURIComponent(symbol)}`);url.searchParams.set('api_token',apiKey);url.searchParams.set('fmt','json');url.searchParams.set('filter','General,Highlights,Valuation,SharesStats,SplitsDividends,outstandingShares,Financials');
    const data=await getJson<JsonRecord>(url.toString());
    const highlights=obj(data.Highlights);const valuation=obj(data.Valuation);const sharesStats=obj(data.SharesStats);const dividends=obj(data.SplitsDividends);const financials=obj(data.Financials);const income=obj(financials.Income_Statement);const balance=obj(financials.Balance_Sheet);const cash=obj(financials.Cash_Flow);
    const latestIncome=latest(income.quarterly)??latest(income.yearly);const latestBalance=latest(balance.quarterly)??latest(balance.yearly);const latestCash=latest(cash.quarterly)??latest(cash.yearly);
    const annualPeriods=records(income.yearly).map(x=>period(x.date,'annual')).filter((x):x is FinancialPeriod=>Boolean(x));
    const quarterPeriods=records(income.quarterly).map(x=>period(x.date,'quarterly')).filter((x):x is FinancialPeriod=>Boolean(x));
    const periods=[...annualPeriods,...quarterPeriods].sort((a,b)=>(b.endDate??'').localeCompare(a.endDate??''));
    const currency=String(income.currency_symbol??balance.currency_symbol??cash.currency_symbol??company.currency||'');
    const revenueTTM=sumLastFour(income.quarterly,'totalRevenue')??num(latestIncome?.totalRevenue);
    const grossProfitTTM=sumLastFour(income.quarterly,'grossProfit')??num(latestIncome?.grossProfit);
    const operatingIncomeTTM=sumLastFour(income.quarterly,'operatingIncome')??num(latestIncome?.operatingIncome);
    const ebitdaTTM=sumLastFour(income.quarterly,'ebitda')??num(latestIncome?.ebitda);
    const netIncomeTTM=sumLastFour(income.quarterly,'netIncome')??num(latestIncome?.netIncome);
    const ocfTTM=sumLastFour(cash.quarterly,'totalCashFromOperatingActivities')??num(latestCash?.totalCashFromOperatingActivities);
    const capexTTM=sumLastFour(cash.quarterly,'capitalExpenditures')??num(latestCash?.capitalExpenditures);
    const fcfTTM=sumLastFour(cash.quarterly,'freeCashFlow')??num(latestCash?.freeCashFlow);
    const epsTTM=num(highlights.EarningsShare);const shares=num(sharesStats.SharesOutstanding);const cashValue=num(latestBalance?.cash);
    const debt=num(latestBalance?.netDebt)!==undefined?num(latestBalance?.netDebt):((num(latestBalance?.longTermDebt)??0)+(num(latestBalance?.shortTermDebt)??0)||undefined);
    const netDebt=num(latestBalance?.netDebt)??(debt!==undefined&&cashValue!==undefined?debt-cashValue:undefined);
    const assets=num(latestBalance?.totalAssets);const liabilities=num(latestBalance?.totalLiab);const equity=num(latestBalance?.totalStockholderEquity);
    const pe=num(valuation.TrailingPE??highlights.PERatio);const ps=num(valuation.PriceSalesTTM);const pb=num(valuation.PriceBookMRQ);const ev=num(valuation.EnterpriseValue);const evRevenue=num(valuation.EnterpriseValueRevenue);const evEbitda=num(valuation.EnterpriseValueEbitda);
    const dividendPerShare=num(dividends.ForwardAnnualDividendRate);const dividendYield=num(dividends.ForwardAnnualDividendYield);const payout=num(dividends.PayoutRatio);
    const qRows=records(income.quarterly).sort((a,b)=>String(b.date??'').localeCompare(String(a.date??'')));const latestRevenue=num(qRows[0]?.totalRevenue);const yearAgoRevenue=num(qRows[4]?.totalRevenue);const revenueGrowth=latestRevenue!==undefined&&yearAgoRevenue!==undefined&&yearAgoRevenue!==0?latestRevenue/yearAgoRevenue-1:undefined;
    const roe=equity&&equity!==0&&netIncomeTTM!==undefined?netIncomeTTM/equity:undefined;const roa=assets&&assets!==0&&netIncomeTTM!==undefined?netIncomeTTM/assets:undefined;
    const fcfMargin=fcfTTM!==undefined&&revenueTTM!==undefined&&revenueTTM!==0?fcfTTM/revenueTTM:undefined;const bookValuePerShare=shares&&equity?equity/shares:undefined;
    const capabilities={quote:false,historicalPrices:false,valuation:[pe,ps,pb,ev,evRevenue,evEbitda].some(x=>x!==undefined),incomeStatement:[revenueTTM,grossProfitTTM,operatingIncomeTTM,ebitdaTTM,netIncomeTTM,epsTTM].some(x=>x!==undefined),balanceSheet:[cashValue,debt,netDebt,assets,liabilities,equity].some(x=>x!==undefined),cashFlow:[ocfTTM,capexTTM,fcfTTM].some(x=>x!==undefined),dividends:[dividendPerShare,dividendYield,payout].some(x=>x!==undefined)};
    const hasStatements=capabilities.incomeStatement||capabilities.balanceSheet||capabilities.cashFlow;
    return {valuation:{pe:fv(pe,'TTM','ttm',currency),ps:fv(ps,'TTM','ttm',currency),pb:fv(pb,'MRQ','quarterly',currency),evRevenue:fv(evRevenue,'TTM','ttm',currency),evEbitda:fv(evEbitda,'TTM','ttm',currency),enterpriseValue:fv(ev,'MRQ','quarterly',currency)},incomeStatement:{revenue:fv(revenueTTM,'TTM','ttm',currency),revenueGrowth:fv(revenueGrowth,'TTM','ttm'),grossProfit:fv(grossProfitTTM,'TTM','ttm',currency),operatingIncome:fv(operatingIncomeTTM,'TTM','ttm',currency),ebitda:fv(ebitdaTTM,'TTM','ttm',currency),netIncome:fv(netIncomeTTM,'TTM','ttm',currency),eps:fv(epsTTM,'TTM','ttm',currency),grossMargin:fv(grossProfitTTM!==undefined&&revenueTTM?grossProfitTTM/revenueTTM:undefined,'TTM','ttm'),operatingMargin:fv(operatingIncomeTTM!==undefined&&revenueTTM?operatingIncomeTTM/revenueTTM:undefined,'TTM','ttm'),netMargin:fv(netIncomeTTM!==undefined&&revenueTTM?netIncomeTTM/revenueTTM:undefined,'TTM','ttm')},profitability:{roe:fv(roe,'TTM','ttm',undefined,'calculated'),roa:fv(roa,'TTM','ttm',undefined,'calculated')},balanceSheet:{cash:fv(cashValue,'MRQ','quarterly',currency),totalDebt:fv(debt,'MRQ','quarterly',currency),netDebt:fv(netDebt,'MRQ','quarterly',currency,'calculated'),totalAssets:fv(assets,'MRQ','quarterly',currency),totalLiabilities:fv(liabilities,'MRQ','quarterly',currency),equity:fv(equity,'MRQ','quarterly',currency),bookValue:fv(equity,'MRQ','quarterly',currency),bookValuePerShare:fv(bookValuePerShare,'MRQ','quarterly',currency,'calculated')},cashFlow:{operatingCashFlow:fv(ocfTTM,'TTM','ttm',currency),capitalExpenditure:fv(capexTTM,'TTM','ttm',currency),freeCashFlow:fv(fcfTTM,'TTM','ttm',currency),fcfMargin:fv(fcfMargin,'TTM','ttm',undefined,'calculated')},shareholder:{sharesOutstanding:fv(shares,'MRQ','quarterly'),dividendPerShare:fv(dividendPerShare,'TTM','ttm',currency),dividendYield:fv(dividendYield,'TTM','ttm'),payoutRatio:fv(payout,'TTM','ttm')},periods,capabilities,source:SOURCE,retrievedAt:new Date().toISOString(),error:hasStatements?undefined:`EODHD returned no usable financial statements for ${symbol}.`};
  }catch(error){return empty(error instanceof Error?error.message:'Unknown EODHD fundamentals error');}
}
