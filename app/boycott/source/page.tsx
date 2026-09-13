'use client';

import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import styles from './page.module.css';

function SourcePageContent(){
 const params=useSearchParams();
 const name=params.get('name')||'Documented source';
 const url=params.get('url')||'';
 return <main className={styles.page}>
  <div className={styles.shell}>
   <div className={styles.breadcrumb}>NORTH AFRICA HUB <span>/</span> BOYCOTT <span>/</span> SOURCE</div>
   <section className={styles.hero}>
    <p className={styles.eyebrow}>Research provenance</p>
    <h1>{name}</h1>
    <p className={styles.description}>Source information for the boycott research reference. This page keeps provenance inside the North Africa Hub research environment before you visit the original source.</p>
   </section>
   <section className={styles.metaGrid}>
    <div><span>Source</span><strong>{name}</strong></div>
    <div><span>Type</span><strong>External research source</strong></div>
    <div><span>Relationship</span><strong>Independent reference</strong></div>
   </section>
   <section className={styles.note}>
    <span>Important</span>
    <p>North Africa Hub does not operate or control this external source. Its inclusion here identifies provenance and does not make its classifications official BDS positions.</p>
   </section>
   <div className={styles.actions}>
    <a href="/boycott">← Back to Boycott</a>
    {url&&<a className={styles.primary} href={url} target="_blank" rel="noreferrer">View original source ↗</a>}
   </div>
  </div>
 </main>;
}

export default function BoycottSourcePage(){return <Suspense fallback={<main className={styles.page}><div className={styles.shell}><div className={styles.loading}>Loading source…</div></div></main>}><SourcePageContent/></Suspense>}
