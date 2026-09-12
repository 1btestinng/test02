import type {Metadata} from 'next';
import HomeClient from '../home-client';
import {hasMarket,getMarketCompanies} from '@/lib/markets/registry';

export const metadata:Metadata={
  title:'North Africa Hub | Stock Market',
  description:'North Africa Hub stock-market rankings, company data and North African market intelligence.',
};

const allowedTop=[10,20,50,100,200,300,400,500,1000];
const country=(value:string|undefined)=>value&&hasMarket(value.toUpperCase())?value.toUpperCase():'EG';

export default async function MarketsPage({searchParams}:{searchParams:Promise<{country?:string;top?:string;sector?:string;search?:string;exchange?:string}>}){
  const params=await searchParams;
  const selected=country(params.country);
  const top=allowedTop.includes(Number(params.top))?Number(params.top):100;
  let initialCompanies:Awaited<ReturnType<typeof getMarketCompanies>>=[];
  try{initialCompanies=await getMarketCompanies(selected)}catch{}
  return <HomeClient initialCountry={selected} initialTop={top} initialSector={params.sector??'All'} initialSearch={params.search??''} initialExchange={params.exchange??'All'} initialCompanies={initialCompanies}/>;
}
