import type {Metadata} from 'next';
import {Suspense} from 'react';
import BoycottExplorer from '@/components/boycott/boycott-explorer';
import {getBoycottEntries} from '@/lib/boycott/data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Boycott | North Africa Hub',
  description: 'Search and explore companies and products appearing in documented boycott campaigns and research databases across North Africa.',
};

export default async function BoycottPage() {
  const entries = await getBoycottEntries();
  const categories = new Set(entries.map((entry) => entry.category ?? 'other')).size;
  const sources = new Set(entries.map((entry) => entry.source).filter(Boolean)).size;

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="boycott-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>North Africa · Research</p>
          <h1 id="boycott-title">Boycott</h1>
          <p className={styles.description}>
            A searchable reference for companies and products appearing in documented boycott campaigns and research databases.
          </p>
        </div>
        <div className={styles.meta} aria-label="Boycott research database">
          <span>Research database</span>
          <strong>{entries.length.toLocaleString()} companies</strong>
          <small>{categories} categories · {sources} sources</small>
        </div>
      </section>

      <section className={styles.intro} aria-label="Dataset note">
        <div className={styles.introLead}>
          <span>How to use</span>
          <p><strong>Search a company, product, or brand.</strong> Then narrow the reference by category, campaign, or source.</p>
        </div>
        <p className={styles.introNote}>
          Inclusion in this reference does not mean every entry is an official BDS consumer boycott target.
        </p>
      </section>

      <Suspense fallback={<div className={styles.loading} aria-live="polite">Loading research database…</div>}>
        <BoycottExplorer entries={entries} />
      </Suspense>
    </main>
  );
}
