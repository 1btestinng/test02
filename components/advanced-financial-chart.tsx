'use client';

import {useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import styles from './advanced-financial-chart.module.css';

type ChartPoint={date:string;value:number};
type ChartCurrency='local'|'usd';
type ChartScale='linear'|'log';
type Props={points:ChartPoint[];interactionPoints?:ChartPoint[];localCurrency:string;fxRate?:number;marketCap?:boolean};
type Selection={point:ChartPoint;left:number;top:number};

function fmt(value:number,maximumFractionDigits=2){return Number.isFinite(value)?value.toLocaleString('en-US',{maximumFractionDigits}):'—';}
function compact(value:number,currency:string){if(!Number.isFinite(value))return '—';const prefix=currency==='USD'?'$':`${currency} `;const abs=Math.abs(value);if(abs>=1e12)return `${prefix}${(value/1e12).toFixed(2)}T`;if(abs>=1e9)return `${prefix}${(value/1e9).toFixed(2)}B`;if(abs>=1e6)return `${prefix}${(value/1e6).toFixed(0)}M`;return `${prefix}${Math.round(value).toLocaleString('en-US')}`;}
function formatDate(date:string){const d=new Date(date);return Number.isFinite(d.getTime())?d.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}):date;}
function nearestPoint(points:ChartPoint[],target:number){let lo=0,hi=points.length-1;while(lo<=hi){const mid=(lo+hi)>>1;const t=new Date(points[mid].date).getTime();if(t===target)return mid;if(t<target)lo=mid+1;else hi=mid-1;}if(lo<=0)return 0;if(lo>=points.length)return points.length-1;const before=Math.abs(new Date(points[lo-1].date).getTime()-target);const after=Math.abs(new Date(points[lo].date).getTime()-target);return before<=after?lo-1:lo;}

export default function AdvancedFinancialChart({points,interactionPoints=points,localCurrency,fxRate,marketCap=false}:Props){
  const [chartCurrency,setChartCurrency]=useState<ChartCurrency>('local');
  const [scale,setScale]=useState<ChartScale>('linear');
  const [selection,setSelection]=useState<Selection|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);
  const canUseUsd=typeof fxRate==='number'&&Number.isFinite(fxRate)&&fxRate>0;
  const displayCurrency=chartCurrency==='usd'?'USD':localCurrency;
  const displayPoints=useMemo(()=>points.map(p=>({date:p.date,value:chartCurrency==='usd'&&canUseUsd?p.value/fxRate!:p.value})),[points,chartCurrency,canUseUsd,fxRate]);
  const displayInteraction=useMemo(()=>interactionPoints.map(p=>({date:p.date,value:chartCurrency==='usd'&&canUseUsd?p.value/fxRate!:p.value})),[interactionPoints,chartCurrency,canUseUsd,fxRate]);
  const positivePoints=useMemo(()=>displayPoints.filter(p=>p.value>0),[displayPoints]);
  const logAvailable=positivePoints.length>=2&&positivePoints.length===displayPoints.length;
  const effectiveScale=scale==='log'&&logAvailable?'log':'linear';
  const width=1000,height=330,padX=42,padY=30,plotWidth=width-padX*2,plotHeight=height-padY*2;
  const values=effectiveScale==='log'?positivePoints.map(p=>p.value):displayPoints.map(p=>p.value);
  const min=Math.min(...values),max=Math.max(...values),spread=max-min||Math.max(Math.abs(max)*.02,1);
  const logMin=effectiveScale==='log'?Math.log10(min):0,logMax=effectiveScale==='log'?Math.log10(max):1;
  const y=(value:number)=>effectiveScale==='log'?height-padY-((Math.log10(Math.max(value,min))-logMin)/(logMax-logMin||1))*plotHeight:height-padY-((value-min)/spread)*plotHeight;
  const x=(i:number)=>padX+(i/Math.max(1,displayPoints.length-1))*plotWidth;
  const line=displayPoints.map((p,i)=>`${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const first=displayInteraction[0],last=displayInteraction.at(-1);const change=first&&last&&first.value!==0?((last.value-first.value)/Math.abs(first.value))*100:0;
  const selectAtClientX=(clientX:number)=>{const svg=svgRef.current;if(!svg||!first||!last)return;const rect=svg.getBoundingClientRect();if(rect.width<=0)return;const localX=Math.max(0,Math.min(rect.width,clientX-rect.left));const chartX=(localX/rect.width)*width;const ratio=Math.max(0,Math.min(1,(chartX-padX)/plotWidth));const firstTime=new Date(first.date).getTime(),lastTime=new Date(last.date).getTime();const targetTime=firstTime+ratio*(lastTime-firstTime);const index=nearestPoint(displayInteraction,targetTime);const point=displayInteraction[index];const pointTime=new Date(point.date).getTime();const dateRatio=lastTime===firstTime?0:(pointTime-firstTime)/(lastTime-firstTime);const px=padX+Math.max(0,Math.min(1,dateRatio))*plotWidth;const py=y(point.value);setSelection({point,left:(px/width)*rect.width,top:(py/height)*rect.height});};
  const handlePointerMove=(event:ReactPointerEvent<SVGSVGElement>)=>{if(event.pointerType==='touch'&&event.buttons===0)return;selectAtClientX(event.clientX);};
  if(displayPoints.length<2||displayInteraction.length<2)return <div className="emptyChart"><div><strong>Historical data unavailable</strong><p>The configured provider did not return enough valid observations for this metric.</p></div></div>;
  const axisValues=effectiveScale==='log'?[1,2,5].flatMap(mult=>{const base=Math.pow(10,Math.floor(logMin));return [base*mult,base*mult*10,base*mult*100].filter(v=>v>=min&&v<=max);}).filter((v,i,a)=>a.indexOf(v)===i).slice(0,5):[0,1,2,3].map(i=>min+(spread*i/3));
  return <div className="realChartWrap" style={{position:'relative',touchAction:'pan-y'}}>
    <div className={styles.controls} aria-label={`${marketCap?'Market capitalization':'Price'} chart controls`}>
      <div className={styles.cluster}><span className={styles.label}>Currency</span><div className={styles.toggle} role="group" aria-label="Chart currency"><button type="button" className={chartCurrency==='local'?styles.active:''} onClick={()=>setChartCurrency('local')}>{localCurrency}</button><button type="button" className={chartCurrency==='usd'?styles.active:''} disabled={!canUseUsd} onClick={()=>setChartCurrency('usd')}>USD</button></div>{!canUseUsd&&<span className={styles.hint}>USD unavailable</span>}</div>
      <div className={styles.cluster}><span className={styles.label}>Scale</span><div className={styles.toggle} role="group" aria-label="Chart scale"><button type="button" className={effectiveScale==='linear'?styles.active:''} onClick={()=>setScale('linear')}>Linear</button><button type="button" className={effectiveScale==='log'?styles.active:''} disabled={!logAvailable} onClick={()=>setScale('log')}>Log</button></div>{!logAvailable&&<span className={styles.hint}>Positive values required</span>}</div>
    </div>
    <div className="chartStats"><span>{compact(min,displayCurrency)} — {compact(max,displayCurrency)}</span><strong className={change>=0?'positive':'negative'}>{change>=0?'+':''}{change.toFixed(2)}%</strong></div>
    <div style={{position:'relative'}}>
      <svg ref={svgRef} className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Historical ${marketCap?'market capitalization':'price'} chart in ${displayCurrency} on ${effectiveScale} scale`} onPointerMove={handlePointerMove} onPointerDown={event=>selectAtClientX(event.clientX)} onPointerLeave={()=>setSelection(null)}>
        {axisValues.map((value,i)=>{const yy=y(value);return <g key={`${value}-${i}`}><line x1={padX} x2={width-padX} y1={yy} y2={yy} stroke="currentColor" opacity=".08"/><text x={padX-7} y={yy+4} textAnchor="end" fill="currentColor" opacity=".48" fontSize="10">{compact(value,displayCurrency)}</text></g>;})}
        <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line}/>
        {selection&&<><line x1={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} x2={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} y1={padY} y2={height-padY} stroke="currentColor" strokeWidth="1" opacity=".28" strokeDasharray="3 3" pointerEvents="none"/><circle cx={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} cy={y(selection.point.value)} r="4" fill="var(--panel)" stroke="currentColor" strokeWidth="2" pointerEvents="none"/></>}
      </svg>
      {selection&&<div className={styles.tooltip} style={{left:Math.max(6,Math.min(selection.left-78,Math.max(6,(svgRef.current?.clientWidth??0)-178))),top:Math.max(6,Math.min(selection.top-92,238))}} role="status" aria-live="polite"><div className={styles.tooltipDate}>{formatDate(selection.point.date)}</div><strong className={`mono ${styles.tooltipValue}`}>{marketCap?'Market Cap':'Price'}&nbsp;&nbsp;{marketCap?compact(selection.point.value,displayCurrency):`${displayCurrency==='USD'?'$':displayCurrency+' '}${fmt(selection.point.value)}`}</strong></div>}
    </div>
    <div className="chartAxis" style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)'}}><span>{new Date(first.date).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</span><span>{new Date(last.date).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</span></div>
    {chartCurrency==='usd'&&canUseUsd&&<div className={styles.note}>USD values use the market's configured verified FX rate ({localCurrency}/USD {fxRate}). No historical FX series is connected, so this is a current/configured-FX conversion rather than a historical FX-adjusted series.</div>}
  </div>;
}
