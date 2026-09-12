import type {Metadata} from 'next';
import HomeClient from './home-client';
import {hasMarket,getMarketCompanies} from '@/lib/markets/registry';

const allowedTop=[10,20,50,100,200,300,400,500,1000];
const country=(value:string|undefined)=>value&&hasMarket(value.toUpperCase())?value.toUpperCase():'EG';

export async function generateMetadata({searchParams}:{searchParams:Promise<{country?:string}>}):Promise<Metadata>{
  await searchParams;
  return {title:'iStocks - North Africa',description:'The United States of North Africa'};
}

export default async function Home({searchParams}:{searchParams:Promise<{country?:string;top?:string;sector?:string;search?:string;exchange?:string}>}){
  const params=await searchParams;const selected=country(params.country);const top=allowedTop.includes(Number(params.top))?Number(params.top):100;
  let initialCompanies:Awaited<ReturnType<typeof getMarketCompanies>>=[];
  try{initialCompanies=await getMarketCompanies(selected);}catch{}
  return <HomeClient initialCountry={selected} initialTop={top} initialSector={params.sector??'All'} initialSearch={params.search??''} initialExchange={params.exchange??'All'} initialCompanies={initialCompanies}/>;
}
