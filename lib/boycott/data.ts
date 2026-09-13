import type {BoycottCategory,BoycottEntry,BoycottVisibility} from './types';

export const SOURCE_URL='https://www.is-boycott.com/en/all/companies';
export const SOURCE_LABEL='Is-Boycott company database';
export const BDS_URL='https://bdsmovement.net/Guide-to-BDS-Boycott';
export const DATASET_POLICY='Source-backed company inclusion; visibility is an editorial consumer-prominence ranking and must not be presented as audited sales data.';

export const CATEGORY_LABELS:Record<BoycottCategory,string>={food:'Food & Restaurants',beverages:'Beverages',grocery:'Grocery & Supermarkets',fashion:'Fashion & Clothing',beauty:'Beauty & Personal Care',household:'Household',baby:'Baby & Family',technology:'Technology',software:'Software & Internet',finance:'Finance & Banking',travel:'Travel & Hospitality',automotive:'Transportation & Automotive',energy:'Energy',media:'Entertainment & Media',healthcare:'Healthcare & Pharmaceuticals',industrial:'Industrial',construction:'Construction & Real Estate',agriculture:'Agriculture',logistics:'Logistics',retail:'Retail',other:'Other'};

// Editorial consumer-visibility ordering. This is deliberately separate from boycott status.
// It is based on consumer-facing prominence and everyday visibility, not audited North-African sales.
const VISIBILITY_ORDER=["McDonald's",'Coca-Cola','Starbucks','Burger King','Carrefour','PepsiCo','Nestlé','ZARA','Microsoft','Google','Amazon','Disney','Sony','Puma','Reebok','Hewlett Packard (HP & HP-E)','Dell','Intel','Ford Motor Company','Toyota Motor Corporation','Volkswagen Group','Pizza Hut',"Papa John's",'Airbnb','Booking.com','Booking Holdings','Expedia Group','TripAdvisor','Wix','YouTube','Xbox','OpenAI','GitHub','LinkedIn','Oracle','IBM','Cisco','Motorola Solutions','Siemens AG','Chevron','BP PLC','Barclays','AXA','J.C. Bamford Excavators (JCB)','Caterpillar','Volvo Group','General Motors Company','Mitsubishi Motors Corporation','Jaguar Land Rover Automotive PLC','FANUC Corporation','Maersk (Mærsk)','Sony Corporation','Spotify','Stradivarius','Massimo Dutti','Pull & Bear','Bershka','Oysho','Lefties','Swarovski','Forever 21','Nautica','Roxy','Volcom','KAYAK','Hotels.com','OpenTable','ExpressVPN','Vercel','Waze','DeepMind','Palantir Technologies'];
const VISIBILITY_SCORE=new Map(VISIBILITY_ORDER.map((name,index)=>[name,1000-index*10]));
const PRODUCT_LABELS:Record<string,string>={"McDonald's":"McDonald's",'Coca-Cola':'Coca-Cola','Starbucks':'Starbucks','Burger King':'Burger King','Carrefour':'Carrefour','PepsiCo':'Pepsi / PepsiCo','Nestlé':'Nestlé products','ZARA':'Zara','Microsoft':'Windows / Azure / Xbox','Google':'Google services','Amazon':'Amazon / AWS','Disney':'Disney','Sony Corporation':'Sony products','Puma':'Puma','Reebok':'Reebok','Dell':'Dell Technologies','Intel':'Intel','Ford Motor Company':'Ford','Toyota Motor Corporation':'Toyota','Volkswagen Group':'Volkswagen','Pizza Hut':'Pizza Hut',"Papa John's":"Papa John's",'Airbnb':'Airbnb','Booking.com':'Booking.com','Booking Holdings':'Booking','Expedia Group':'Expedia','TripAdvisor':'Tripadvisor','Wix':'Wix','YouTube':'YouTube','Xbox':'Xbox','OpenAI':'OpenAI','GitHub':'GitHub','LinkedIn':'LinkedIn','Oracle':'Oracle','IBM':'IBM','Cisco':'Cisco','Motorola Solutions':'Motorola Solutions','Siemens AG':'Siemens','Chevron':'Chevron','BP PLC':'BP','Barclays':'Barclays','AXA':'AXA','Spotify':'Spotify','Waze':'Waze','Vercel':'Vercel'};

const BDS_REASONS:Record<string,string>={
 'Chevron':'BDS identifies Chevron as a priority target because of its role in extracting gas claimed by Israel.','Intel':'BDS identifies Intel as a consumer boycott priority target because of its long-running investment and operations in Israel.','Dell':'BDS identifies Dell as a consumer boycott priority target and documents its technology supply relationship with the Israeli military.','Siemens AG':'BDS identifies Siemens as a consumer boycott priority target because of its role in the Euro-Asia electricity interconnector.','Microsoft':'BDS identifies Microsoft as a priority pressure target because of technology and cloud services supplied to Israel.','Hewlett Packard (HP & HP-E)':'BDS identifies HP/HPE as a consumer boycott priority target because of technology and services supplied to Israeli state institutions.','Carrefour':'BDS documents Carrefour Israel franchise activity, settlement links and support for Israeli soldiers.','McDonald\'s':'BDS supports the grassroots boycott campaign against McDonald\'s.','Coca-Cola':'BDS supports the grassroots boycott campaign against Coca-Cola.','Burger King':'BDS supports the grassroots boycott campaign against Burger King.','Papa John\'s':'BDS supports the grassroots boycott campaign against Papa John\'s.','Pizza Hut':'BDS supports the grassroots boycott campaign against Pizza Hut.','Wix':'BDS supports the grassroots boycott campaign against WIX.','Google':'BDS calls for pressure on Google because of Project Nimbus and related technology services.','Amazon':'BDS calls for pressure on Amazon because of Project Nimbus and related technology services.','Booking.com':'BDS identifies Booking.com as a pressure target because it lists properties in illegal Israeli settlements.','Booking Holdings':'BDS identifies Booking Holdings as a pressure target because its services include listings in illegal Israeli settlements.','Expedia Group':'BDS identifies Expedia as a pressure target because it lists properties in illegal Israeli settlements.','Airbnb':'BDS identifies Airbnb as a pressure target because it lists properties in illegal Israeli settlements.'};
const BDS_INSTITUTIONAL=new Set(['Boeing','Caterpillar','Ford Motor Company','Toyota Motor Corporation','General Motors Company','Lockheed Martin','Leonardo S.p.A','Rheinmetall','ThyssenKrupp AG','IBM','Cisco','Oracle','Motorola Solutions','Palantir Technologies','BP PLC','Chevron','Siemens AG','Maersk (Mærsk)','Volvo Group','J.C. Bamford Excavators (JCB)','Alstom S.A.','Cemex','HD Hyundai','Heidelberg Materials (formerly HeidelbergCement)','TripAdvisor','WSP Global Inc.']);

const CATEGORY_RULES:Array<[BoycottCategory,RegExp]>=[
 ['food',/mcdonald|burger|restaurant|pizza|starbucks|coffee|dunkin|caribou|hardee|domino|papa john|subway|wendy|taco|bakery|winery|nestl|purina|cereal|buitoni/i],
 ['beverages',/coca.?cola|pepsi|red bull|nestle|aquafina|dasani|fanta|sprite|7up|mirinda|mountain dew|tempo beverage/i],
 ['grocery',/carrefour|supermarket|grocery|shufersal|rami levy|spinneys|panda|metro|lulu|kazyon/i],
 ['fashion',/zara|puma|reebok|fashion|clothing|pull.?bear|stradivarius|lefties|aéropostale|aeropostale|swarovski|brooks brothers|salomon|quiksilver|volcom|roxy|dockers|bershka|massimo dutti|oysho|forever 21|nautica/i],
 ['beauty',/l.?oreal|loreal|cerave|maybelline|garnier|dove|rexona|axe|vaseline|gillette|olay|pantene|schwarzkopf|neutrogena|beauty|cosmetic/i],
 ['household',/unilever|henkel|sc johnson|persil|pril|ariel|tide|downy|comfort|cif|vanish|clorox|cleaning|household/i],
 ['technology',/samsung|apple|sony|lg|toshiba|hp|dell|intel|microsoft|google|alphabet|meta|palantir|mobileye|hitachi|dji|technology|electronics|cisco|oracle|ibm|motorola|openai|github|vercel|wix|linkedin/i],
 ['software',/github|vercel|linkedin|youtube|netflix|spotify|waze|wix|opentable|tripadvisor|trivago|software|cloud|vpn|cyberghost|xbox|deepmind/i],
 ['finance',/bank|banking|insurance|pimco|ishares|etoro|barclays|finance|capital|axa/i],
 ['travel',/booking|hotel|airbnb|expedia|orbitz|priceline|kayak|ebookers|hotels\.com|rentalcars|cheapflights|tripadvisor|travel|cruise|tui/i],
 ['automotive',/toyota|volkswagen|ford|jaguar|land rover|mitsubishi|general motors|hyundai|volvo|automotive/i],
 ['energy',/bp|chevron|caltex|exxon|mobil|solar|energix|renewable|energy|oil|gas|delek/i],
 ['media',/disney|espn|politico|spotify|youtube|media|broadcast|publishing|morning brew/i],
 ['healthcare',/teva|roche|bayer|pharmaceutical|pharma|medical|health|hospital|laborator/i],
 ['industrial',/abb|fanuc|atlas copco|bomag|cnh|doosan|fassi|general electric|garrett|terex|liebher|manitou|industrial|systems/i],
 ['construction',/building|construction|cement|materials|ashtrom|shapir|shikun|real estate|properties/i],
 ['agriculture',/agro|fertilizer|grower|agriculture|rivulis|hadiklaim/i],
 ['logistics',/maersk|zim|shipping|logistics|rail|egged/i],
 ['retail',/retail|stores|market|shopping/i]
];
function cleanCompanyName(value:string){return value.replace(/\s*Company\s*$/i,'').replace(/\s*\([^)]*\)\s*$/g,'').replace(/Company$/i,'').trim();}
function slugify(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function inferCategory(company:string):BoycottCategory{for(const [category,pattern] of CATEGORY_RULES)if(pattern.test(company))return category;return 'other';}
function aliasesFor(company:string){const aliases:Record<string,string[]>={"Coca-Cola":['Coke','Coca Cola'],"McDonald's":['McDonalds','McD'],Google:['YouTube'],"Hewlett Packard (HP & HP-E)":['HP','HPE'],"L’Oréal":['L Oreal',"L'Oreal"]};return aliases[company]??[];}
function visibilityFor(company:string){const score=VISIBILITY_SCORE.get(company)??100;return {score,visibility:(score>=700?'very-high':score>=350?'high':score>=180?'medium':'low') as BoycottVisibility};}
function classificationFor(company:string){if(BDS_REASONS[company])return 'BDS priority / supported campaign';if(BDS_INSTITUTIONAL.has(company))return 'BDS institutional pressure target';return 'Third-party research database entry';}

export async function getBoycottEntries():Promise<BoycottEntry[]>{
 try{
  const response=await fetch(SOURCE_URL,{next:{revalidate:21600},headers:{'user-agent':'North-Africa-Hub-Boycott-Reference/2.0'}});
  if(!response.ok)throw new Error(`Boycott source returned ${response.status}`);
  const html=await response.text();
  const matches=Array.from(html.matchAll(/<a[^>]+href=["'](\/en\/c\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const entries:BoycottEntry[]=[];const seen=new Set<string>();
  for(const match of matches){
   const raw=match[2].replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
   const company=cleanCompanyName(raw);if(!company||company.length<2)continue;
   const key=company.toLowerCase();if(seen.has(key))continue;seen.add(key);
   const {score,visibility}=visibilityFor(company);
   entries.push({id:`source-${slugify(company)}`,rank:0,company,product:PRODUCT_LABELS[company]??'—',category:inferCategory(company),aliases:aliasesFor(company),reason:BDS_REASONS[company]??'The cited research database lists this company; see the source record for the documented rationale.',status:'Documented source entry',source:SOURCE_LABEL,sourceUrl:`https://www.is-boycott.com${match[1]}`,confidence:BDS_REASONS[company]?'high':'medium',campaignType:classificationFor(company),visibility,visibilityScore:score});
  }
  entries.sort((a,b)=>(b.visibilityScore??0)-(a.visibilityScore??0)||a.company.localeCompare(b.company));
  return entries.map((entry,index)=>({...entry,rank:index+1}));
 }catch{return [];}
}

export const BOYCOTT_ENTRIES:BoycottEntry[]=[];
