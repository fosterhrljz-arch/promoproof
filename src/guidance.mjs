import {evaluate,financialCeiling} from './decision.mjs';
import {cents,money} from './finance.mjs';

const count=n=>n.toLocaleString('en-US');
const round=n=>Math.round(n*100)/100;
export const statusLabel=d=>d.status==='pass'?'Meets all cases':d.status==='risk'?'Needs a check':d.status==='fail'?'Expected misses':'Incomplete';

// Interpret the existing engine. These checks never change assumptions or estimate demand.
export function decisionGuidance(analysis,scenario,decision=evaluate(analysis,scenario)){
 if(!decision.valid)return {items:[],summary:'Complete the inputs to see practical next steps.'};
 const d=decision,r=d.expected,t=d.goalThreshold,c=analysis.currency,m=n=>money(round(n),c,true);
 const clearance=analysis.goal.type==='clearance';
 const lower=Math.max(d.targetUnits,t.kind==='minimum'?t.units:0);
 const upper=t.kind==='maximum'?Math.min(t.units,r.inventory??Infinity):r.inventory;
 const feasible=t.kind!=='impossible'&&t.withinStock&&!(upper!==null&&lower>upper);
 const failures=d.outcomes.filter(o=>!o.meets);
 const worst=d.outcomes.reduce((a,b)=>a.promoProfit<=b.promoProfit?a:b);
 const profitGap=Math.max(0,round(d.targetProfit-r.promoProfit));
 const volumeGap=Math.max(0,d.targetUnits-r.units);
 const items=[];
 if(r.promoContribution<=0){
  items.push({id:'margin',tone:'warning',title:r.promoContribution<0?'More sales deepen the loss':'More sales cannot add profit',body:r.promoContribution<0?`Each extra discounted unit loses ${m(-r.promoContribution)} before campaign expenses. ${feasible&&t.kind==='maximum'?`To meet both limits, sell ${count(lower)}–${count(upper)} units; above that, the loss budget is breached.`:'Raise the sale price or reduce unit costs before relying on higher sales.'}`:`Every unit contributes ${m(0)}. Campaign expenses still cost ${m(r.expenses)}. ${feasible?'Volume can help clear stock, but cannot improve contribution profit.':'Higher demand cannot make this offer meet the financial goal.'}`,section:'step-offer'});
 }else if(!feasible){
  items.push({id:'capacity',tone:'warning',title:'Demand alone cannot meet this goal',body:t.kind==='minimum'&&r.inventory!==null?`The offer needs ${count(lower)} sales, but only ${count(r.inventory)} units are available: a ${count(Math.max(0,lower-r.inventory))}-unit capacity shortfall. Reduce the discount or campaign costs, or verify additional stock and recalculate.`:'The current unit contribution and campaign costs cannot meet both the financial and inventory targets. Revise the offer or costs.',section:'step-offer'});
 }else if(!r.meets){
  items.push({id:'shortfall',tone:'warning',title:'Close the expected-case shortfall',body:`${profitGap>0?`Expected contribution is ${m(profitGap)} below your financial goal. `:''}${volumeGap>0?`You are ${count(volumeGap)} sales short of the inventory target. `:''}At this offer, at least ${count(lower)} total sales are needed${r.units<lower?` (${count(lower-r.units)} more than expected)`:''}. Only increase your sales assumption when evidence supports it.`,section:'step-offer'});
 }else{
  items.push({id:'buffer',tone:'positive',title:clearance?'Expected sales meet the clearance target':'Know your profit buffer',body:clearance?`${count(r.units)} expected sales meet the ${count(d.targetUnits)}-unit inventory target. Expected contribution is ${m(r.promoProfit)}, with ${m(r.promoProfit-d.targetProfit)} remaining before the loss limit.`:`Expected contribution is ${m(r.promoProfit-d.targetProfit)} above your goal. At this offer, sales can fall from ${count(r.units)} to ${count(lower)} before the goal is missed.`,section:'step-offer'});
 }
 if(failures.length){
  const names=failures.map(o=>o.label.toLowerCase()).join(' and ');
  const gap=Math.max(0,round(d.targetProfit-worst.promoProfit));
  items.push({id:'range',tone:'warning',title:`Check the ${names} case${failures.length>1?'s':''}`,body:`${worst.label} sales produce ${m(worst.promoProfit)}${gap?`, ${m(gap)} below the financial goal`:''}. ${r.promoContribution>0&&feasible&&worst.units<lower?`${count(lower-worst.units)} more sales would be needed at this offer. `:''}${r.promoContribution<0?'The highest-volume case can be the most costly.':'Use past sales or a small trial to check the sales range.'}`,section:'step-offer'});
 }else if(!d.rangeTested){
  items.push({id:'range',tone:'warning',title:'Test a genuine sales range',body:'A single sales estimate does not test risk. Enter distinct conservative and optimistic volumes supported by your experience.',section:'step-offer'});
 }
 const capped=d.outcomes.filter(o=>o.stockCapped);
 if(r.inventory===null||capped.length||r.baselineCapped){
  items.push({id:'stock',tone:'warning',title:r.inventory===null?'Confirm available inventory':'Separate demand from stock',body:r.inventory===null?'Inventory is blank, so capacity is unverified. Enter stock available for this product and period before relying on the result.':`${capped.map(o=>`${o.label}: ${count(o.requestedUnits)} assumed demand is capped at ${count(o.units)} sales (${count(o.requestedUnits-o.units)} unfilled).`).join(' ')}${r.baselineCapped?` Normal sales are also capped from ${count(r.requestedNormalUnits)} to ${count(r.normalUnits)}; check that baseline.`:''} Confirm stock or lower the sales assumptions.`,section:'step-baseline'});
 }
 if(d.ceiling!==null){
  const above=Number(scenario.discount)>d.ceiling;
  items.push({id:'discount',tone:above?'warning':'neutral',title:above?'Reduce the discount to protect the goal':'Your discount limit',body:`At ${count(r.units)} sales, the largest qualifying discount is ${d.ceiling.toFixed(2)}%. ${above?`Your ${scenario.discount}% offer is above that limit.`:`Your current offer is ${scenario.discount}%.`} This holds sales constant; changing the price may change demand.`,section:'step-offer'});
 }else if(!r.meets){
  const financialOnly=financialCeiling(analysis.base,scenario,BigInt(Math.round(d.targetProfit*100)));
  items.push({id:'discount',tone:'warning',title:financialOnly===null?'A smaller discount is not enough':'The sales target still needs work',body:financialOnly===null?`Even full price cannot meet the financial goal at ${count(r.units)} sales with these costs. Review campaign spending and unit costs.`:`A discount no larger than ${financialOnly.toFixed(2)}% can meet the financial limit at this volume, but ${count(d.targetUnits)} sales are still needed to clear the target stock.`,section:'step-offer'});
 }
 const allowed=BigInt(Math.round(r.promoContribution*100))*BigInt(r.units)-BigInt(Math.round(d.targetProfit*100));
 if(!r.profitMeets&&allowed>=0n&&cents(scenario.expenses)>allowed){
  items.push({id:'spending',tone:'neutral',title:'A campaign-cost alternative',body:`At the current price and ${count(r.units)} sales, campaign expenses must be at most ${m(Number(allowed)/100)}. That is a ${m(r.expenses-Number(allowed)/100)} reduction. ${clearance&&!r.volumeMeets?'The inventory target would still need to be met.':'Only remove costs you can actually avoid.'}`,section:'step-offer'});
 }
 return {items,feasible,lower,upper,profitGap,volumeGap,summary:d.status==='pass'?'The entered range meets your goal. Confirm demand and stock before committing.':d.status==='risk'?'Expected sales work, but resolve the checks below before committing.':'Revise this offer before committing to the promotion.'};
}

export function comparisonSummary(analysis,rows){
 const complete=rows.filter(x=>x.d.valid),passing=complete.filter(x=>x.d.status==='pass');
 const eligible=complete.filter(x=>x.d.expected.meets);
 const candidates=passing.length?passing:eligible;
 const best=candidates.reduce((a,b)=>!a||b.d.expected.promoProfit>a.d.expected.promoProfit?b:a,null);
 return {passing:passing.length,eligible:eligible.length,total:rows.length,best,
  title:passing.length?`${passing.length} ${passing.length===1?'offer meets':'offers meet'} the goal across all cases`:eligible.length?'Expected sales work, but every offer needs a check':'No complete offer meets the expected goal',
  body:best?`${best.s.name} has the highest expected contribution among ${passing.length?'offers that pass all checks':'offers whose expected case meets the goal'}. ${passing.length?'Compare its assumptions with your evidence.':'Review its downside and inventory checks before choosing.'}`:'Revise the discount, costs or evidence-backed sales assumptions. A chart ranking alone is not a recommendation.'};
}
