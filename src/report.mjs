import {evaluate,calculateActual,thresholdText} from './decision.mjs';
import {money,signedMoney} from './finance.mjs';
import {decisionGuidance,statusLabel} from './guidance.mjs';

export function reportSections(a){
 const c=a.currency,m=n=>money(n,c,true),qty=n=>n.toLocaleString('en-US');
 const rows=a.scenarios.map(s=>({s,d:evaluate(a,s)}));
 if(rows.some(({d})=>!d.valid))throw new Error('Complete all scenarios before exporting a report.');
 const first=rows[0].d.expected;
 const sections=[{title:'Product baseline & goal',paragraphs:[`${a.product} · ${a.period} · ${c}. Planning figures are user assumptions, not forecasts.`,a.goal.type==='profit'?`Protect profits: contribution must reach ${m(first.normalProfit>0?first.normalProfit+Number(a.goal.extraProfit):Number(a.goal.extraProfit))}.`:`Clear inventory: sell ${a.goal.sellThrough}% of stock, with a maximum contribution loss of ${m(Number(a.goal.lossBudget))}.`],headers:['Baseline input','Value'],rows:[['Regular price',m(Number(a.base.price))],['Product variable cost / unit',m(Number(a.base.cost))],['Extra fulfillment / unit',m(Number(a.base.fulfillment))],['Other variable cost / unit',m(Number(a.base.otherCost))],['Selling fee',`${a.base.feeRate}% of selling price`],['Normal sales (entered / modeled)',`${a.base.normalUnits} / ${qty(first.normalUnits)} units`],['Available stock',a.base.inventory===''?'Unknown':`${a.base.inventory} units`],['Normal contribution profit',m(first.normalProfit)]]},
 {title:'Scenario comparison',paragraphs:['All three sales cases are assumptions. A passing result does not guarantee demand.'],headers:['Scenario','Conservative','Expected','Optimistic','Overall'],rows:rows.map(({s,d})=>[s.name,...d.outcomes.map(o=>`${m(o.promoProfit)}\n${qty(o.units)} units · ${o.meets?'Meets':'Misses'}`),statusLabel(d)])}];
 for(const {s,d} of rows){
  const r=d.expected,g=decisionGuidance(a,s,d);
  sections.push({title:s.name,paragraphs:[`${s.discount}% discount · ${m(r.salePrice)} sale price · ${m(r.expenses)} campaign expenses.`,`${statusLabel(d)}. ${d.explanation}`],headers:['Expected result','Value'],rows:[['Sales (entered / stock capped)',`${s.units} / ${qty(r.units)} units`],['Revenue',m(r.promoRevenue)],['Variable costs',m(r.promoCosts)],['Selling fees',m(r.promoFees)],['Campaign expenses',m(r.expenses)],['Contribution profit',m(r.promoProfit)],['Change vs normal',signedMoney(r.delta,c)],['Financial goal',m(d.targetProfit)],['Financial sales threshold',thresholdText(d.goalThreshold)],['Clearance volume target',`${qty(d.targetUnits)} units`],['Maximum discount at expected sales',d.ceiling===null?'Not attainable':`${d.ceiling.toFixed(2)}%`]],notes:g.items.map(item=>`${item.title}: ${item.body}`)});
 }
 for(const review of a.reviews){
  const v=calculateActual(review),p=review.plan,rc=p.currency,rm=n=>money(n,rc,true);
  const section={title:`Review: ${p.scenario.name}`,paragraphs:[`Frozen plan: ${p.product} · ${p.period} · ${rc} · ${new Date(p.capturedAt).toLocaleDateString('en-US')}. Actuals are entered by the user.`]};
  if(!v.valid){section.paragraphs.push('Actual results are incomplete or invalid. No actual contribution result is reported.');}
  else{
   section.paragraphs.push(`${v.meets?'Actual results met':'Actual results missed'} the original goal. ${v.exceededStock?'Actual sales exceed planned stock; actual totals are not capped.':''}`);
   const r=v.plan.expected,x=review.actual;
   section.headers=['Metric','Frozen expected plan','Actual','Difference'];
   section.rows=[['Units sold',r.units,Number(x.units),true],['Revenue',r.promoRevenue,Number(x.revenue)],['Variable costs',r.promoCosts,Number(x.variableCosts)],['Selling fees',r.promoFees,Number(x.fees)],['Campaign expenses',r.expenses,Number(x.expenses)],['Contribution profit',r.promoProfit,v.profit]].map(([label,planned,actual,units])=>[label,units?qty(planned):rm(planned),units?qty(actual):rm(actual),units?qty(actual-planned):signedMoney(Math.round((actual-planned)*100)/100,rc)]);
   section.notes=[...v.bridge.map(([label,value])=>`${label}: ${signedMoney(value,rc)} contribution effect.`),`Actual contribution vs normal baseline: ${signedMoney(v.baselineDelta,rc)}. This is not proof of causal promotion lift.`];
  }
  if(review.actual.notes)section.notes=[...(section.notes??[]),`Lessons: ${review.actual.notes}`];
  sections.push(section);
 }
 sections.push({title:'Model & data notes',paragraphs:['Contribution profit excludes fixed overhead and taxes. One product, one period, one promotional price. Demand is assumed, not predicted. Unit prices and percentage fees round half-up to cents before volume multiplication. Stock caps planning volumes; actual totals are never capped.', 'Discount and cost adjustments hold sales constant. A price change may change demand. Negative unit contribution means that extra sales deepen the loss. Break-even at zero profit differs from the selected business goal.', 'Returns, basket effects, pull-forward, replenishment and long-term value are not separately modeled. Local saving is explicit. Keep JSON backups; CSV and PDF reports cannot restore editable analyses.']});
 return sections;
}
