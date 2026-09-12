import {NextRequest,NextResponse} from 'next/server';

const CACHE_SECONDS = 60 * 60 * 24;

function cachedHeaders(contentType:string){
  return {'Content-Type':contentType,'Cache-Control':`public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 7}`,'X-Content-Type-Options':'nosniff'};
}

async function fetchImage(url:string){
  const response = await fetch(url,{cache:'no-store',headers:{Accept:'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8'}});
  if(!response.ok) throw new Error(`Image upstream returned ${response.status}`);
  const contentType=response.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
  if(!contentType.startsWith('image/')) throw new Error('Upstream response was not an image');
  return new NextResponse(await response.arrayBuffer(),{status:200,headers:cachedHeaders(contentType)});
}

export async function GET(request:NextRequest){
  const query=request.nextUrl.searchParams.get('q')?.trim();
  const fallback=request.nextUrl.searchParams.get('fallback')?.trim();
  if(!query && !fallback) return NextResponse.json({error:'Missing image query'},{status:400});

  const key=process.env.PIXABAY_API_KEY?.trim();
  if(key && query){
    try{
      const params=new URLSearchParams({key,q:query,image_type:'photo',orientation:'horizontal',safesearch:'true',order:'popular',per_page:'3',page:'1'});
      const response=await fetch(`https://pixabay.com/api/?${params.toString()}`,{next:{revalidate:CACHE_SECONDS}});
      if(response.ok){
        const data=await response.json() as {hits?:Array<{largeImageURL?:string;webformatURL?:string}>};
        const selected=data.hits?.[0]?.largeImageURL || data.hits?.[0]?.webformatURL;
        if(selected) return await fetchImage(selected);
      }
    }catch{}
  }

  if(fallback){
    try{return await fetchImage(fallback);}catch{}
  }
  return new NextResponse(null,{status:404,headers:{'Cache-Control':'public, max-age=300'}});
}
