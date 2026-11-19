import {useState,useEffect} from 'react';
import {money} from '../finance.mjs';
const compact=(v,currency)=>new Intl.NumberFormat('en-US',{style:'currency',currency,notation:'compact',maximumFractionDigits:1}).format(v);
const niceStep=target=>{const power=10**Math.floor(Math.log10(Math.max(target,.001)));const fraction=target/power;return (fraction<=1?1:fraction<=2?2:fraction<=5?5:10)*power;};
export default function ProfitChart({result:r,currency}){
 const [probe,setProbe]=useState(null);
 const [mobile,setMobile]=useState(()=>window.matchMedia('(max-width:700px)').matches);
 useEffect(()=>{const query=window.matchMedia('(max-width:700px)');const update=()=>setMobile(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const typical=Math.max(10,r.units,r.normalUnits),showThreshold=r.threshold.kind==='minimum'&&r.threshold.units<=typical*5;
 const rawMax=Math.max(typical*1.1,showThreshold?r.threshold.units*1.1:0),xStep=Math.max(1,niceStep(rawMax/5)),xMax=Math.ceil(rawMax/xStep)*xStep;
 const a=-r.expenses,b=xMax*r.promoContribution-r.expenses;
 let lo=Math.min(0,a,b,r.normalProfit),hi=Math.max(0,a,b,r.normalProfit);if(lo===hi)hi=100;
 const yStep=niceStep((hi-lo)/4);lo=Math.floor((lo-yStep*.15)/yStep)*yStep;hi=Math.ceil((hi+yStep*.15)/yStep)*yStep;
 const W=mobile?540:1000,H=mobile?320:280,L=mobile?62:65,R=24,T=26,B=43,cw=W-L-R,ch=H-T-B;
 const x=q=>L+q/xMax*cw,y=p=>T+(hi-p)/(hi-lo)*ch;
 const q=probe===null?r.units:Math.min(probe,xMax),p=q*r.promoContribution-r.expenses;
 return <section className="chart-section"><div className="chart-heading"><h2>Find your profitable volume</h2><div className="legend"><span><i/>Promotion profit</span><span><i className="dashed"/>Normal profit</span></div></div><div className="chart-wrap"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Contribution profit by units sold. Normal profit ${money(r.normalProfit,currency)}. Promotional contribution per unit ${money(r.promoContribution,currency)}.`} onPointerMove={e=>{const box=e.currentTarget.getBoundingClientRect();const pos=(e.clientX-box.left)/box.width*W;setProbe(Math.round(Math.max(0,Math.min(xMax,(pos-L)/cw*xMax))));}} onPointerLeave={()=>setProbe(null)}>
 {showThreshold&&<rect x={x(r.threshold.exact)} y={T} width={Math.max(0,x(xMax)-x(r.threshold.exact))} height={ch} fill="#eff8f2"/>}
 {Array.from({length:Math.round((hi-lo)/yStep)+1},(_,i)=>{const v=lo+yStep*i;return <g key={i}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} stroke="#e7ecee"/><text x={L-10} y={y(v)+4} textAnchor="end" className="axis-text">{compact(v,currency)}</text></g>})}
 {Array.from({length:Math.round(xMax/xStep)+1},(_,i)=><text key={i} x={x(i*xStep)} y={H-B+21} textAnchor="middle" className="axis-text">{(i*xStep).toLocaleString('en-US')}</text>)}
 <line x1={L} x2={W-R} y1={y(r.normalProfit)} y2={y(r.normalProfit)} stroke="#86959b" strokeDasharray="6 5" strokeWidth="1.5"/><text x={L+7} y={y(r.normalProfit)-9} className="baseline-label">{money(r.normalProfit,currency)} normal</text>
 <line x1={L} x2={x(xMax)} y1={y(a)} y2={y(b)} stroke={r.promoContribution<0?'#c45e53':'#176354'} strokeWidth="3"/>
 {showThreshold&&<g><line x1={x(r.threshold.exact)} x2={x(r.threshold.exact)} y1={y(r.normalProfit)} y2={H-B} stroke="#87b2a3" strokeDasharray="4 4"/><circle cx={x(r.threshold.exact)} cy={y(r.normalProfit)} r="5" fill="white" stroke="#176354" strokeWidth="2"/><text x={x(r.threshold.exact)-8} y={Math.min(H-B-10,y(r.normalProfit)+25)} textAnchor="end" className="point-label">{r.threshold.units.toLocaleString('en-US')} to match</text></g>}
 <circle cx={x(r.units)} cy={y(r.promoProfit)} r="6" fill="#176354" stroke="white" strokeWidth="2"/>
 <text x={Math.max(L+55,Math.min(W-R-55,x(r.units)))} y={Math.max(T+10,y(r.promoProfit)-18)} textAnchor="middle" className="point-label">{r.units.toLocaleString('en-US')} forecast</text>
 {probe!==null&&<g><line x1={x(q)} x2={x(q)} y1={T} y2={H-B} stroke="#176354" strokeOpacity=".3"/><circle cx={x(q)} cy={y(p)} r="4" fill="#142c33"/></g>}
 <text x={L+cw/2} y={H-2} textAnchor="middle" className="axis-title">Units sold in the {r.normalUnits===0?'comparison':'same'} period</text></svg></div><div className="chart-explorer"><span><strong>{q.toLocaleString('en-US')} units</strong><span className="muted"> → </span><strong>{money(p,currency)}</strong> contribution profit</span><label className="sr-only" htmlFor="volume-probe">Explore sales volume</label><input id="volume-probe" type="range" min="0" max={xMax} step="1" value={q} onChange={e=>setProbe(Number(e.target.value))}/><button className="text-button" onClick={()=>setProbe(null)}>Reset to forecast</button></div>{r.threshold.kind==='minimum'&&!showThreshold&&<p className="input-note">The required {r.threshold.units.toLocaleString('en-US')} units are beyond this chart’s displayed range.</p>}</section>
}
