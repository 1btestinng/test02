'use client';

import {useEffect,useState} from 'react';

type World = 'matrix' | 'atlas';
const STORAGE_KEY = 'north-africa-hub-mode';

export default function ThemeToggle(){
  const [world,setWorld]=useState<World>('matrix');

  useEffect(()=>{
    try{
      const stored=window.localStorage.getItem(STORAGE_KEY);
      const initial:World=stored==='atlas'||stored==='matrix' ? stored : window.localStorage.getItem('egystocks-theme')==='light' ? 'atlas' : 'matrix';
      document.documentElement.dataset.theme=initial;
      setWorld(initial);
    }catch{
      document.documentElement.dataset.theme='matrix';
    }
  },[]);

  function toggle(){
    const next:World=world==='matrix'?'atlas':'matrix';
    document.documentElement.dataset.theme=next;
    try{
      window.localStorage.setItem(STORAGE_KEY,next);
      window.localStorage.setItem('egystocks-theme',next==='matrix'?'dark':'light');
    }catch{}
    setWorld(next);
  }

  const next=world==='matrix'?'Atlas':'Matrix';
  return <button type="button" className="themeToggle" onClick={toggle} aria-label={`Switch to ${next}`} title={`Switch to ${next}`}><span aria-hidden>{world==='matrix'?'◈':'⌁'}</span></button>;
}
