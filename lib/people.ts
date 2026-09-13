export const PEOPLE_CATEGORIES = [
  {slug:'history',label:'History',description:'People who shaped North African history, states and societies.'},
  {slug:'business',label:'Business',description:'Business leaders, founders, investors and economic figures.'},
  {slug:'culture',label:'Culture',description:'Artists and cultural figures who shaped North African identity.'},
  {slug:'cinema',label:'Cinema',description:'Actors, directors, producers and major cinema figures.'},
  {slug:'science',label:'Science',description:'Scientists, researchers and innovators.'},
  {slug:'sports',label:'Sports',description:'Athletes, coaches and sports figures.'},
  {slug:'literature',label:'Literature',description:'Writers, poets, thinkers and literary figures.'},
  {slug:'politics',label:'Politics',description:'Political leaders and public figures, presented factually and neutrally.'},
  {slug:'entrepreneurship',label:'Entrepreneurship',description:'Founders and entrepreneurs who built important organizations and ventures.'},
] as const;

export type PeopleCategory = (typeof PEOPLE_CATEGORIES)[number]['slug'];

export const PEOPLE_COUNTRIES = [
  {slug:'egypt',name:'Egypt',code:'EG',flag:'🇪🇬'},
  {slug:'libya',name:'Libya',code:'LY',flag:'🇱🇾'},
  {slug:'tunisia',name:'Tunisia',code:'TN',flag:'🇹🇳'},
  {slug:'algeria',name:'Algeria',code:'DZ',flag:'🇩🇿'},
  {slug:'morocco',name:'Morocco',code:'MA',flag:'🇲🇦'},
] as const;

export type PeopleCountrySlug = (typeof PEOPLE_COUNTRIES)[number]['slug'];

export type PersonSource = {
  title: string;
  url: string;
  publisher: string;
};

export type Person = {
  slug: string;
  name: string;
  country: PeopleCountrySlug[];
  categories: PeopleCategory[];
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupations?: string[];
  biography?: string;
  image?: string;
  sources: PersonSource[];
  relatedPeople?: string[];
};

// Phase 1 intentionally starts with an empty published catalogue. Profiles are added only after they have been researched and source-checked.
export const PEOPLE: Person[] = [];

export function getPeopleCountry(slug:string) {
  return PEOPLE_COUNTRIES.find(country => country.slug === slug.toLowerCase());
}

export function getPeopleCategory(slug:string) {
  return PEOPLE_CATEGORIES.find(category => category.slug === slug.toLowerCase());
}

export function getPeopleByCountry(slug:string) {
  return PEOPLE.filter(person => person.country.includes(slug as PeopleCountrySlug));
}

export function getPeopleByCategory(slug:string) {
  return PEOPLE.filter(person => person.categories.includes(slug as PeopleCategory));
}

export function getPerson(slug:string) {
  return PEOPLE.find(person => person.slug === slug.toLowerCase());
}
