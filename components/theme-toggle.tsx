'use client';

import {useEffect,useState} from 'react';

export default function ThemeToggle(){
  const [dark,setDark]=useState(false);

  useEffect(()=>{
    const saved=window.localStorage.getItem('egystocks-theme');
    const initial=saved==='dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme=initial?'dark':'light';
    setDark(initial);
  },[]);

  function toggle(){
    const next=!dark;
    document.documentElement.dataset.theme=next?'dark':'light';
    window.localStorage.setItem('egystocks-theme',next?'dark':'light');
    setDark(next);
  }

  return <button type="button" className="themeToggle" onClick={toggle} aria-label={dark?'Switch to light theme':'Switch to dark theme'} title={dark?'Light theme':'Dark theme'}><span aria-hidden>{dark?'☼':'◐'}</span></button>;
}
