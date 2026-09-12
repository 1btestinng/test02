'use client';

import {useEffect,useState} from 'react';

const THEME_KEY='north-africa-hub-theme';

export default function ThemeToggle(){
  const [dark,setDark]=useState(true);

  useEffect(()=>{
    const saved=window.localStorage.getItem(THEME_KEY);
    const initial=saved ? saved==='dark' : true;
    document.documentElement.dataset.theme=initial?'dark':'light';
    setDark(initial);
  },[]);

  function toggle(){
    const next=!dark;
    document.documentElement.dataset.theme=next?'dark':'light';
    window.localStorage.setItem(THEME_KEY,next?'dark':'light');
    setDark(next);
  }

  return <button type="button" className="themeToggle" onClick={toggle} aria-label={dark?'Switch to light theme':'Switch to dark theme'} title={dark?'Light theme':'Dark theme'}><span aria-hidden>{dark?'☼':'◐'}</span></button>;
}
