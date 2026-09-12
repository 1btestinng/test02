'use client';

import {useEffect,useState} from 'react';

type World='matrix'|'atlas';
const STORAGE_KEY='north-africa-hub-mode';
const WORLD_EVENT='north-africa-hub-world-change';

function readWorld():World{
  try{
    const stored=window.localStorage.getItem(STORAGE_KEY);
    if(stored==='atlas'||stored==='matrix')return stored;
    return window.localStorage.getItem('egystocks-theme')==='light'?'atlas':'matrix';
  }catch{return 'matrix'}
}

function applyWorld(world:World){
  document.documentElement.dataset.theme=world;
  try{
    window.localStorage.setItem(STORAGE_KEY,world);
    window.localStorage.setItem('egystocks-theme',world==='matrix'?'dark':'light');
  }catch{}
  window.dispatchEvent(new CustomEvent(WORLD_EVENT,{detail:world}));
}

export default function ThemeToggle(){
  const [world,setWorld]=useState<World>('matrix');

  useEffect(()=>{
    const initial=readWorld();
    document.documentElement.dataset.theme=initial;
    setWorld(initial);
    const onWorldChange=(event:Event)=>{
      const next=(event as CustomEvent<World>).detail;
      if(next==='atlas'||next==='matrix')setWorld(next);
    };
    const onStorage=(event:StorageEvent)=>{if(event.key===STORAGE_KEY)setWorld(readWorld());};
    window.addEventListener(WORLD_EVENT,onWorldChange);
    window.addEventListener('storage',onStorage);
    return()=>{window.removeEventListener(WORLD_EVENT,onWorldChange);window.removeEventListener('storage',onStorage)};
  },[]);

  const next:World=world==='matrix'?'atlas':'matrix';
  return <button type="button" className="themeToggle" onClick={()=>applyWorld(next)} aria-label={`Switch to ${next==='atlas'?'Atlas':'Matrix'}`} title={`Switch to ${next==='atlas'?'Atlas':'Matrix'}`}><span className="themeToggleGlyph" aria-hidden="true">{world==='matrix'?'◈':'⌁'}</span><span className="themeToggleText">{next==='atlas'?'Atlas':'Matrix'}</span></button>;
}
