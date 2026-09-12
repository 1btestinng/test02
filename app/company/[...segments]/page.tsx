import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getMarket,getMarketCompanySync,getMarketCompanies,rankMarketCompanies} from '@/lib/markets/registry';
import {getCompanyMarketData} from '@/lib/company-market-data';
import CompanyIntelligence from '@/components/company-intelligence';

function resolveSegments(segments:string[]){return segments.length===1?{country:'EG',ticker:segments[0]}:segments.length===2?{country:segments[0],ticker:segments[1]}:null;}
function formatTimestamp(value:string|undefined,timezone:string){if(!value)return '—';const date=new Date(value);if(Number.isNaN(date.getTime()))return value;return new Intl.DateTimeFormat('en-GB',{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(date);}

export async function generateMetadata({params}:{params:Promise<{segments:string[]}>}){
  const resolved=resolveSegments((await params).segments);if(!resolved)return {title:'Company · North Africa Hub'};
  const market=getMarket(resolved.country);const company=getMarketCompanySync(resolved.country,resolved.ticker);
  return {title:company?`${company.name} (${company.ticker}) · ${market.config.countryName} · North Africa Hub`:`Company · ${market.config.countryName} · North Africa Hub`,description:company?`${company.name} (${company.ticker}) stock price, historical prices and market capitalization on North Africa Hub.`:undefined};
}

export default async function CompanyPage({params}:{params:Promise<{segments:string[]}>}){
  const resolved=resolveSegments((await params).segments);if(!resolved)notFound();
  const market=getMarket(resolved.country);const ticker=resolved.ticker.toUpperCase();
  const rows=rankMarketCompanies(await getMarketCompanies(resolved.country));
  const baseCompany=rows.find(x=>x.ticker.toUpperCase()===ticker);if(!baseCompany)notFound();
  const [marketData,fxRate]=await Promise.all([getCompanyMarketData(baseCompany),market.provider.getFX()]);
  const company={...baseCompany,...marketData.quote};
  const lastUpdated=formatTimestamp(company.timestamp??marketData.retrievedAt,market.config.timezone);

  return <div className="shell"><header className="header"><Link href={`/markets?country=${market.config.countryCode}`} className="brand">North Africa Hub</Link><Link href={`/markets?country=${market.config.countryCode}`} className="muted" style={{fontSize:12}}>Back to Stock Market</Link></header><main className="detail"><CompanyIntelligence company={company} history={marketData.history} exchangeName={market.config.exchangeName} countryName={`${market.config.flag} ${market.config.countryName}`} currency={market.config.currencyCode} fxRate={fxRate} lastUpdated={lastUpdated} dataSource={marketData.source} delay={marketData.delay} providerTicker={marketData.providerTicker} dataError={marketData.error}/><p className="sub" style={{marginTop:24,lineHeight:1.7}}>Quote/history source: {marketData.source}. {marketData.providerTicker?`Market-data symbol: ${marketData.providerTicker}. `:''}Historical charts use the maximum verified provider history available.</p></main></div>;
}
