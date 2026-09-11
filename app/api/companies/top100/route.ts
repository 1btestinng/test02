import {NextRequest,NextResponse} from 'next/server';
import {getMarket, getMarketCompaniesSync,rankMarketCompanies} from '@/lib/markets/registry';

export async function GET(req:NextRequest){
  const url=new URL(req.url);const market=getMarket('EG');const requested=url.searchParams.get('limit')??'100';
  const target=new URL(`/api/markets/${market.config.countryCode}/companies`,url);target.searchParams.set('top',requested);
  const ranked=rankMarketCompanies(getMarketCompaniesSync('EG'));const limit=Math.min(Number(requested)||100,1000);const data=ranked.slice(0,limit);
  return NextResponse.json({data,meta:{count:data.length,available:ranked.length,requestedLimit:limit,calculated:true,delay:market.config.delay,market:market.config.countryCode}});
}
