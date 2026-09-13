import type {Metadata} from 'next';
import BoycottExplorer from '@/components/boycott/boycott-explorer';
import {getBoycottEntries} from '@/lib/boycott/data';
import styles from './page.module.css';

export const metadata:Metadata={
  title:'Boycott | North Africa Hub',
  description:'Search and explore companies and products appearing in documented boycott campaigns and research databases across North Africa.',
};

export default async function BoycottPage(){
  const entries=await getBoycottEntries();
  const categories=new Set(entries.map(entry=>entry.category??'other')).size;
  const sources=new Set(entries.map(entry=>entry.source).filter(Boolean)).size;
  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="boycott-title">
      <div>
        <p className={styles.eyebrow}>North Africa · Research</p>
        <h1 id="boycott-title">Boycott</h1>
        <p className={styles.description}>Search and explore companies and products appearing in documented boycott campaigns and research databases.</p>
      </div>
      <div className={styles.meta} aria-label="Dataset status">
        <span>Reference dataset</span>
        <strong>{entries.length.toLocaleString()} companies</strong>
        <small>{categories} categories · {sources} sources</small>
      </div>
    </section>

    <section className={styles.intro} aria-label="Dataset note">
      <p><strong>Search first.</strong> Type a company or product name to check the database, then narrow the results by category, campaign, or source.</p>
      <p>This reference combines documented boycott campaigns and research databases. Inclusion does not mean every entry is an official BDS consumer boycott target.</p>
    </section>

    <BoycottExplorer entries={entries}/>
  </main>;
}
