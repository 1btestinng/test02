import {redirect} from 'next/navigation';
const codes:Record<string,string>={egypt:'EG',tunisia:'TN',algeria:'DZ',morocco:'MA',libya:'LY'};
export default async function MarketCountryAlias({params}:{params:Promise<{country:string}>}){const {country}=await params;const code=codes[country.toLowerCase()];if(code==='LY')return <main className="naSectionPage"><div className="naSectionHero"><div><div className="eyebrow">🇱🇾 Libya</div><h1>Stock Market</h1><p>Market coverage is not currently available for Libya.</p></div></div></main>;if(code)redirect(`/?country=${code}`);redirect('/')}
