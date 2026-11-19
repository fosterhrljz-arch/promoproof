import {ArrowRight,Lightbulb} from 'lucide-react';
import {decisionGuidance} from '../guidance.mjs';

export default function Guidance({analysis,scenario,decision}){
 const g=decisionGuidance(analysis,scenario,decision);
 if(!decision.valid)return null;
 const edit=id=>{const el=document.getElementById(id);if(el){if(!el.open)el.querySelector('summary')?.click();requestAnimationFrame(()=>{el.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});el.querySelector('input,button,select')?.focus({preventScroll:true});});}};
 const ordered=[...g.items].sort((a,b)=>Number(b.tone==='warning')-Number(a.tone==='warning'));
 const itemView=(item,i)=><div className={`guidance-item ${item.tone}`} key={item.id}><span className="guidance-number">{i+1}</span><div><h3>{item.title}</h3><p>{item.body}</p><button className="text-button" onClick={()=>edit(item.section)}>{item.section==='step-baseline'?'Review inventory & costs':'Review offer & sales'}<ArrowRight size={13}/></button></div></div>;
 return <section className="panel practical-guidance"><div className="panel-heading"><h2><Lightbulb size={18}/>What to do next</h2><span className="context-label">Based on your inputs</span></div><p className="guidance-intro">{g.summary}</p><div className="guidance-list">{ordered.slice(0,2).map(itemView)}</div>{ordered.length>2&&<details className="guidance-more"><summary>More adjustments & limits ({ordered.length-2})</summary><div className="guidance-list">{ordered.slice(2).map((item,i)=>itemView(item,i+2))}</div></details>}<p className="input-note">Possible adjustments hold sales constant. Test them against demand evidence before changing the plan.</p></section>;
}
