import {useState} from 'react';
import {ChevronDown,ArrowRight} from 'lucide-react';
import {money} from '../finance.mjs';
import {Goal} from './Decision.jsx';
import Field from './Field.jsx';
export {default as Field} from './Field.jsx';

export default function Inputs({analysis,scenario,result,errors,updateAnalysis,updateBase,updateScenario}){
 const [section,setSection]=useState(analysis.base.price!==''?'offer':'baseline');
 const errorLabels={price:'Regular price',cost:'Variable cost',normalUnits:'Normal sales',inventory:'Available inventory',fulfillment:'Extra fulfillment',otherCost:'Other extra cost',feeRate:'Selling fees',extraProfit:'Extra profit required',sellThrough:'Inventory target',lossBudget:'Loss limit',discount:'Discount',expenses:'Campaign expenses',conservative:'Conservative sales',units:'Expected sales',optimistic:'Optimistic sales',range:'Sales range'};
 const revealError=key=>setSection(['price','cost','normalUnits','inventory','fulfillment','otherCost','feeRate'].includes(key)?'baseline':['extraProfit','sellThrough','lossBudget'].includes(key)?'goal':'offer');
 const symbol=new Intl.NumberFormat('en-US',{style:'currency',currency:analysis.currency}).formatToParts(0).find(x=>x.type==='currency').value;
 const baseField=(key,label,extra={})=><Field key={key} label={label} value={analysis.base[key]} onChange={v=>updateBase(key,v)} error={errors[key]} max={1000000} {...extra}/>;
 const step=(key,num,title,subtitle,children)=><details className="input-step panel" open={section===key} id={`step-${key}`}><summary onClick={e=>{e.preventDefault();setSection(section===key?null:key);}}><span className="input-step-number">{num}</span><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronDown size={17}/></summary><div className="step-body">{children}</div></details>;
 return <aside className="assumptions" id="plan-inputs" aria-label="Plan inputs">
  <div className="inputs-caption"><span>Plan inputs</span><span className="live-indicator"><i/>Updates live</span></div>
  {step('baseline','01','Product baseline',analysis.base.price!==''?`${money(Number(analysis.base.price)||0,analysis.currency,true)} price · ${analysis.base.inventory===''?'stock unknown':Number(analysis.base.inventory).toLocaleString()+' in stock'}`:'Start with your normal sales',<>
   <Field label="Product name" type="text" maxLength={80} value={analysis.product} placeholder="e.g. Canvas tote" onChange={v=>updateAnalysis('product',v)}/>
   <div className="field-pair">{baseField('price','Regular price',{prefix:symbol,placeholder:'50.00'})}{baseField('cost','Variable cost / unit',{prefix:symbol,placeholder:'22.00'})}</div>
   <div className="field-pair">{baseField('normalUnits','Normal sales',{suffix:'units',step:'1',max:10000000,placeholder:'100'})}{baseField('inventory','Available inventory',{suffix:'units',step:'1',max:10000000,placeholder:'Unknown'})}</div>
   <p className="input-note">Use the same period for normal and promotional sales. Inventory caps both; blank stock leaves capacity unverified.</p>
   <details className="input-details"><summary>Costs & selling fees</summary><p className="input-note">Add only costs not already included above. Avoid counting them twice.</p>{baseField('fulfillment','Extra fulfillment / unit',{prefix:symbol})}{baseField('otherCost','Other extra cost / unit',{prefix:symbol,hint:'Packaging, seller-paid shipping or fixed fees allocated per unit.'})}{baseField('feeRate','Sales-based selling fees',{suffix:'%',max:100,hint:'Combined payment / marketplace percentage of the tax-exclusive selling price. Applies to normal and promotional sales.'})}</details>
   <details className="input-details"><summary>Period & currency</summary><div className="field"><label htmlFor="period">Comparison period</label><select id="period" value={analysis.period} onChange={e=>updateAnalysis('period',e.target.value)}>{['7-day period','14-day period','30-day period','90-day period','Campaign period',...(!['7-day period','14-day period','30-day period','90-day period','Campaign period'].includes(analysis.period)?[analysis.period]:[])].map(p=><option key={p}>{p}</option>)}</select></div><div className="field"><label htmlFor="currency">Currency</label><select id="currency" value={analysis.currency} onChange={e=>updateAnalysis('currency',e.target.value)}>{['USD','EUR','GBP','CAD','AUD'].map(c=><option key={c}>{c}</option>)}</select></div><p className="input-note">Changing currency changes the label, not the values. Use tax-exclusive amounts.</p></details>
   <button className="step-next" onClick={()=>setSection('goal')}>Next: choose your goal <ArrowRight size={15}/></button>
  </>)}
  {step('goal','02','Business goal',analysis.goal.type==='profit'?'Protect profits':'Clear inventory',<><Goal analysis={analysis} onChange={value=>updateAnalysis('goal',value)} errors={errors}/><button className="step-next" onClick={()=>setSection('offer')}>Next: shape your offer <ArrowRight size={15}/></button></>)}
  {step('offer','03','Offer & sales',`${scenario.discount||0}% off · ${scenario.units||'—'} expected sales`,<>
   <Field label="Scenario name" type="text" value={scenario.name} maxLength={60} onChange={v=>updateScenario('name',v)}/>
   <div className="field-pair"><Field label="Discount" suffix="%" value={scenario.discount} error={errors.discount} onChange={v=>updateScenario('discount',v)} max={100} placeholder="20"/><Field label="Campaign expenses" prefix={symbol} value={scenario.expenses} error={errors.expenses} onChange={v=>updateScenario('expenses',v)} max={1000000}/></div>
   <input className="discount-slider" type="range" aria-label="Discount slider" min="0" max="100" step="0.5" value={scenario.discount||0} onChange={e=>updateScenario('discount',e.target.value)}/><div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
   <h3 className="range-heading">Your sales assumptions</h3><p className="input-note">Total units, not additional sales. Your estimates, not generated forecasts.</p>
   <div className="sales-fields">{[['conservative','Conservative'],['units','Expected'],['optimistic','Optimistic']].map(([k,label])=><Field key={k} label={label} value={scenario[k]} error={errors[k]} onChange={v=>updateScenario(k,v)} step="1" max={10000000}/>)}</div>
   {errors.range&&<p className="field-error">{errors.range}</p>}{scenario.rangeSet===false&&<p className="inline-warning">Imported from v1: all cases use the original expected sales. Enter your own range to test uncertainty.</p>}
   <div className="price-note">{result?.valid?<><span>Discounted unit price</span><strong>{money(result.salePrice,analysis.currency,true)}</strong></>:<span>Complete valid inputs to calculate.</span>}</div>
  </>)}
  {Object.keys(errors).length>0&&<div className="input-error-summary" role="status"><strong>Check your inputs</strong><ul>{Object.entries(errors).map(([key,error])=><li key={key}><button onClick={()=>revealError(key)}>{errorLabels[key]||key}: {error}</button></li>)}</ul></div>}
  <p className="input-note shared-note">Baseline and goal apply to all scenarios. Frozen review plans stay unchanged.</p>
 </aside>;
}
