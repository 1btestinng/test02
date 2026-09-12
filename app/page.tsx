import type {Metadata} from 'next';
import styles from './page.module.css';

export const metadata:Metadata={
  title:'iStocks - North Africa',
  description:'iStocks is a North Africa information and intelligence platform covering markets, history, economy, travel, culture, geography, people and data.',
};

export default function Home(){
  return <main className={styles.home}>
    <section className={styles.statement} aria-label="iStocks North Africa statement">
      <h1>We are the United States of North Africa. We love koshary, and couscous. We love you all. <span aria-hidden="true">❤️</span></h1>
    </section>
  </main>;
}
