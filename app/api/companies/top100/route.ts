import {NextRequest,NextResponse} from 'next/server';
import {rankCompanies} from '@/lib/market';

const ALLOWED_LIMITS=[10,20,50,100,200,300,400,500,1000] as const;

export async function GET(req:NextRequest){
  const requested=Number(req.nextUrl.searchParams.get('limit')??'100');
  const limit=ALLOWED_LIMITS.includes(requested as (typeof ALLOWED_LIMITS)[number])?requested:100;
  const ranked=rankCompanies();
  const data=ranked.slice(0,limit);
  return NextResponse.json({
    data,
    meta:{count:data.length,available:ranked.length,requestedLimit:limit,calculated:true,delay:'Delayed snapshot'}
  });
}
