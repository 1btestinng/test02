'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import styles from './advanced-financial-chart.module.css';

type ChartPoint={date:string;value:number;fxRate?:number};
type ChartCurrency='local'|'usd';
type ChartScale='linear'|'log';
type FXPoint={date:string;timestamp:number;rate:number};
type FXResponse={points?:FXPoint[];source?:string;coverageStart?:string;coverageEnd?:string;error?:string};
type Props={points:ChartPoint[];interactionPoints?:ChartPoint[];localCurrency:string;marketCap?:boolean;fxRate?:number};
type Selection={point:ChartPoint;left:number;top:number};

function fmt(value:number,maximumFractionDigits=2){return Number.isFinite(value)?value.toLocaleString('en-US',{maximumFractionDigits}):'—';}
function compact(value:number,currency:string){if(!Number.isFinite(value))return '—';const prefix=currency==='USD'?'$':`${currency} `;const abs=Math.abs(value);if(abs>=1e12)return `${prefix}${(value/1e12).toFixed(2)}T`;if(abs>=1e9)return `${prefix}${(value/1e9).toFixed(2)}B`;if(abs>=1e6)return `${prefix}${(value/1e6).toFixed(0)}M`;return `${prefix}${Math.round(value).toLocaleString('en-US')}`;}
function formatDate(date:string){const d=new Date(date);return Number.isFinite(d.getTime())?d.toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}):date;}
function nearestPoint(points:ChartPoint[],target:number){let lo=0,hi=points.length-1;while(lo<=hi){const mid=(lo+hi)>>1;const t=new Date(points[mid]!.date).getTime();if(t===target)return mid;if(t<target)lo=mid+1;else hi=mid-1;}if(lo<=0)return 0;if(lo>=points.length)return points.length-1;const before=Math.abs(new Date(points[lo-1]!.date).getTime()-target);const after=Math.abs(new Date(points[lo]!.date).getTime()-target);return before<=after?lo-1:lo;}
function findFX(points:FXPoint[],date:string){const target=new Date(date).getTime();if(!Number.isFinite(target)||points.length===0)return undefined;let lo=0,hi=points.length-1,best=-1;while(lo<=hi){const mid=(lo+hi)>>1;const point=points[mid]!;if(point.timestamp<=target){best=mid;lo=mid+1;}else hi=mid-1;}return best>=0?points[best]:undefined;}

export default function AdvancedFinancialChart({points,interactionPoints=points,localCurrency,marketCap=false}:Props){
  const [chartCurrency,setChartCurrency]=useState<ChartCurrency>('local');
  const [scale,setScale]=useState<ChartScale>('linear');
  const [selection,setSelection]=useState<Selection|null>(null);
  const [fxPoints,setFxPoints]=useState<FXPoint[]>([]);
  const [fxSource,setFxSource]=useState<string>('');
  const [fxCoverageStart,setFxCoverageStart]=useState<string|undefined>();
  const [fxCoverageEnd,setFxCoverageEnd]=useState<string|undefined>();
  const [fxError,setFxError]=useState<string|undefined>();
  const [fxLoading,setFxLoading]=useState(false);
  const svgRef=useRef<SVGSVGElement|null>(null);
  const startDate=points[0]?.date?.slice(0,10);
  const endDate=points.at(-1)?.date?.slice(0,10);

  useEffect(()=>{
    let cancelled=false;
    if(!startDate||!endDate){setFxPoints([]);return;}
    setFxLoading(true);setFxError(undefined);
    const params=new URLSearchParams({currency:localCurrency,start:startDate,end:endDate});
    fetch(`/api/historical-fx?${params.toString()}`,{cache:'force-cache'})
      .then(async response=>{const data=(await response.json()) as FXResponse;if(!response.ok)throw new Error(data.error??'Historical FX request failed');return data;})
      .then(data=>{if(cancelled)return;setFxPoints(data.points??[]);setFxSource(data.source??'');setFxCoverageStart(data.coverageStart);setFxCoverageEnd(data.coverageEnd);setFxError(data.error);})
      .catch(error=>{if(cancelled)return;setFxPoints([]);setFxSource('');setFxCoverageStart(undefined);setFxCoverageEnd(undefined);setFxError(error instanceof Error?error.message:'Historical FX request failed');})
      .finally(()=>{if(!cancelled)setFxLoading(false);});
    return()=>{cancelled=true;};
  },[localCurrency,startDate,endDate]);

  const displayBasePoints=useMemo(()=>points.map(point=>{const fx=findFX(fxPoints,point.date);return fx?{...point,fxRate:fx.rate}:point;}),[points,fxPoints]);
  const displayBaseInteraction=useMemo(()=>interactionPoints.map(point=>{const fx=findFX(fxPoints,point.date);return fx?{...point,fxRate:fx.rate}:point;}),[interactionPoints,fxPoints]);
  const usdPoints=useMemo(()=>displayBasePoints.map(p=>p.fxRate&&p.fxRate>0?{...p,value:p.value/p.fxRate}:null).filter((p):p is ChartPoint=>p!==null&&Number.isFinite(p.value)),[displayBasePoints]);
  const usdInteraction=useMemo(()=>displayBaseInteraction.map(p=>p.fxRate&&p.fxRate>0?{...p,value:p.value/p.fxRate}:null).filter((p):p is ChartPoint=>p!==null&&Number.isFinite(p.value)),[displayBaseInteraction]);
  const canUseUsd=usdPoints.length>=2&&usdInteraction.length>=2;
  const displayCurrency=chartCurrency==='usd'?'USD':localCurrency;
  const displayPoints=chartCurrency==='usd'&&canUseUsd?usdPoints:displayBasePoints;
  const displayInteraction=chartCurrency==='usd'&&canUseUsd?usdInteraction:displayBaseInteraction;
  const usdCoverageIncomplete=chartCurrency==='usd'&&canUseUsd&&usdPoints.length<points.length;
  const fxCoverageNote=chartCurrency==='usd'&&canUseUsd&&fxCoverageStart&&fxCoverageEnd?`FX coverage: ${formatDate(fxCoverageStart)} – ${formatDate(fxCoverageEnd)}.`:undefined;
  const positivePoints=useMemo(()=>displayPoints.filter(p=>p.value>0),[displayPoints]);
  const logAvailable=positivePoints.length>=2&&positivePoints.length===displayPoints.length;
  const effectiveScale=scale==='log'&&logAvailable?'log':'linear';
  if(displayPoints.length<2||displayInteraction.length<2)return <div className="emptyChart"><div><strong>Historical data unavailable</strong><p>The configured provider did not return enough valid observations for this metric.</p></div></div>;
  const width=1000,height=330,padX=42,padY=30,plotWidth=width-padX*2,plotHeight=height-padY*2;
  const values=effectiveScale==='log'?positivePoints.map(p=>p.value):displayPoints.map(p=>p.value);
  const min=Math.min(...values),max=Math.max(...values),spread=max-min||Math.max(Math.abs(max)*.02,1);
  const logMin=effectiveScale==='log'?Math.log10(min):0,logMax=effectiveScale==='log'?Math.log10(max):1;
  const y=(value:number)=>effectiveScale==='log'?height-padY-((Math.log10(Math.max(value,min))-logMin)/(logMax-logMin||1))*plotHeight:height-padY-((value-min)/spread)*plotHeight;
  const x=(i:number)=>padX+(i/Math.max(1,displayPoints.length-1))*plotWidth;
  const line=displayPoints.map((p,i)=>`${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const first=displayInteraction[0]!;const last=displayInteraction.at(-1)!;const change=first.value!==0?((last.value-first.value)/Math.abs(first.value))*100:0;
  const selectAtClientX=(clientX:number)=>{const svg=svgRef.current;if(!svg)return;const rect=svg.getBoundingClientRect();if(rect.width<=0)return;const localX=Math.max(0,Math.min(rect.width,clientX-rect.left));const chartX=(localX/rect.width)*width;const ratio=Math.max(0,Math.min(1,(chartX-padX)/plotWidth));const firstTime=new Date(first.date).getTime(),lastTime=new Date(last.date).getTime();const targetTime=firstTime+ratio*(lastTime-firstTime);const index=nearestPoint(displayInteraction,targetTime);const point=displayInteraction[index]!;const pointTime=new Date(point.date).getTime();const dateRatio=lastTime===firstTime?0:(pointTime-firstTime)/(lastTime-firstTime);const px=padX+Math.max(0,Math.min(1,dateRatio))*plotWidth;const py=y(point.value);setSelection({point,left:(px/width)*rect.width,top:(py/height)*rect.height});};
  const handlePointerMove=(event:ReactPointerEvent<SVGSVGElement>)=>{if(event.pointerType==='touch'&&event.buttons===0)return;selectAtClientX(event.clientX);};
  const axisValues=effectiveScale==='log'?[1,2,5].flatMap(mult=>{const base=Math.pow(10,Math.floor(logMin));return [base*mult,base*mult*10,base*mult*100].filter(v=>v>=min&&v<=max);}).filter((v,i,a)=>a.indexOf(v)===i).slice(0,5):[0,1,2,3].map(i=>min+(spread*i/3));
  return <div className="realChartWrap" style={{position:'relative',touchAction:'pan-y'}}>
    <div className={styles.controls} aria-label={`${marketCap?'Market capitalization':'Price'} chart controls`}>
      <div className={styles.cluster}><span className={styles.label}>Currency</span><div className={styles.toggle} role="group" aria-label="Chart currency"><button type="button" className={chartCurrency==='local'?styles.active:''} onClick={()=>setChartCurrency('local')}>{localCurrency}</button><button type="button" className={chartCurrency==='usd'?styles.active:''} disabled={!canUseUsd} onClick={()=>setChartCurrency('usd')}>USD</button></div>{!canUseUsd&&<span className={styles.hint}>{fxLoading?'Loading historical FX…':fxError??'Historical FX unavailable'}</span>}</div>
      <div className={styles.cluster}><span className={styles.label}>Scale</span><div className={styles.toggle} role="group" aria-label="Chart scale"><button type="button" className={effectiveScale==='linear'?styles.active:''} onClick={()=>setScale('linear')}>Linear</button><button type="button" className={effectiveScale==='log'?styles.active:''} disabled={!logAvailable} onClick={()=>setScale('log')}>Log</button></div>{!logAvailable&&<span className={styles.hint}>Positive values required</span>}</div>
    </div>
    <div className="chartStats"><span>{compact(min,displayCurrency)} — {compact(max,displayCurrency)}</span><strong className={change>=0?'positive':'negative'}>{change>=0?'+':''}{change.toFixed(2)}%</strong></div>
    <div style={{position:'relative'}}>
      <svg ref={svgRef} className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Historical ${marketCap?'market capitalization':'price'} chart in ${displayCurrency} on ${effectiveScale} scale`} onPointerMove={handlePointerMove} onPointerDown={event=>selectAtClientX(event.clientX)} onPointerLeave={()=>setSelection(null)}>
        {axisValues.map((value,i)=>{const yy=y(value);return <g key={`${value}-${i}`}><line x1={padX} x2={width-padX} y1={yy} y2={yy} stroke="currentColor" opacity=".08"/><text x={padX-7} y={yy+4} textAnchor="end" fill="currentColor" opacity=".48" fontSize="10">{compact(value,displayCurrency)}</text></g>;})}
        <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={line}/>
        {selection&&<><line x1={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} x2={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} y1={padY} y2={height-padY} stroke="currentColor" strokeWidth="1" opacity=".28" strokeDasharray="3 3" pointerEvents="none"/><circle cx={selection.left/(svgRef.current?.getBoundingClientRect().width||1)*width} cy={y(selection.point.value)} r="4" fill="var(--panel)" stroke="currentColor" strokeWidth="2" pointerEvents="none"/></>}
      </svg>
      {selection&&<div className={styles.tooltip} style={{left:Math.max(6,Math.min(selection.left-78,Math.max(6,(svgRef.current?.clientWidth??0)-178))),top:Math.max(6,Math.min(selection.top-92,238))}} role="status" aria-live="polite"><div className={styles.tooltipDate}>{formatDate(selection.point.date)}</div><strong className={`mono ${styles.tooltipValue}`}>{marketCap?'Market Cap':'Price'}&nbsp;&nbsp;{marketCap?compact(selection.point.value,displayCurrency):`${displayCurrency==='USD'?'$':displayCurrency+' '}${fmt(selection.point.value)}`}</strong>{chartCurrency==='usd'&&selection.point.fxRate!==undefined&&<div className={styles.tooltipFx}>FX&nbsp;&nbsp;{fmt(selection.point.fxRate,4)} {localCurrency}/USD</div>}</div>}
    </div>
    <div className="chartAxis" style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)'}}><span>{new Date(first.date).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</span><span>{new Date(last.date).toLocaleDateString('en-GB',{month:'short',year:'numeric'})}</span></div>
    {chartCurrency==='usd'&&canUseUsd&&<div className={styles.note}>USD values use point-in-time historical FX rates aligned to each market observation date.{fxSource?` Source: ${fxSource}.`:''}{fxCoverageNote?` ${fxCoverageNote}`:''}{usdCoverageIncomplete?' Some early market observations have no valid FX coverage and are excluded from the USD series.':''}</div>}
  </div>;
}
