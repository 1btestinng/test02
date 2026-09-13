import Link from 'next/link';
import {PEOPLE, PEOPLE_CATEGORIES, PEOPLE_COUNTRIES} from '@/lib/people';
import styles from './people-index.module.css';

export default function PeopleIndex({title='People',description='The people who shaped North Africa.',countrySlug,categorySlug,query}:{title?:string;description?:string;countrySlug?:string;categorySlug?:string;query?:string}) {
  const normalizedQuery = query?.trim().toLowerCase() ?? '';
  const scopedPeople = countrySlug
    ? PEOPLE.filter(person => person.country.includes(countrySlug as never))
    : categorySlug
      ? PEOPLE.filter(person => person.categories.includes(categorySlug as never))
      : PEOPLE;
  const filteredPeople = normalizedQuery
    ? scopedPeople.filter(person => person.name.toLowerCase().includes(normalizedQuery))
    : scopedPeople;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>North Africa Hub / People</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className={styles.heroMeta}>
          <span>{filteredPeople.length}</span>
          <small>{normalizedQuery ? 'matching profiles' : 'published profiles'}</small>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="people-search-title">
        <div className={styles.sectionHeading}>
          <h2 id="people-search-title">Search people</h2>
          <span>Catalogue search</span>
        </div>
        <form className={styles.search} action="/people" method="get">
          <label className={styles.srOnly} htmlFor="people-query">Search people</label>
          <input id="people-query" name="q" type="search" placeholder="Search a person..." autoComplete="off" defaultValue={query ?? ''} />
          <button type="submit">SEARCH</button>
        </form>
        <p className={styles.note}>Search is connected to the published catalogue. Profiles are added only after factual research and source verification.</p>
      </section>

      <section className={styles.section} aria-labelledby="people-categories-title">
        <div className={styles.sectionHeading}>
          <h2 id="people-categories-title">Explore by category</h2>
        </div>
        <div className={styles.categoryGrid}>
          {PEOPLE_CATEGORIES.map(category => (
            <Link key={category.slug} href={`/people/category/${category.slug}`} className={styles.category}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
              <b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="people-countries-title">
        <div className={styles.sectionHeading}>
          <h2 id="people-countries-title">Explore by country</h2>
        </div>
        <div className={styles.countryList}>
          {PEOPLE_COUNTRIES.map(country => (
            <Link key={country.slug} href={`/people/${country.slug}`} className={styles.country}>
              <span className={styles.flag} aria-hidden="true">{country.flag}</span>
              <span>{country.name}</span>
              <b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.empty} aria-live="polite">
        <span>CATALOGUE</span>
        <strong>{normalizedQuery && filteredPeople.length === 0 ? `No published profiles match “${query}”` : 'No profiles published yet'}</strong>
        <p>{normalizedQuery && filteredPeople.length === 0 ? 'Try another name. The catalogue is intentionally empty until researched profiles are ready.' : 'Phase 1 establishes the People architecture. Profiles will be added progressively after factual research and source verification.'}</p>
      </section>
    </div>
  );
}
