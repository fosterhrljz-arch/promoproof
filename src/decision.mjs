import {calculate,validate,cents,money} from './finance.mjs';

export const cases=[['conservative','Conservative'],['units','Expected'],['optimistic','Optimistic']];
export const defaultGoal=()=>({type:'profit',sellThrough:'80',lossBudget:'0',extraProfit:'0'});
export function validatePlan(base,scenario,goal=defaultGoal()){
  const errors=validate(base,scenario);
  for(const key of ['conservative','optimistic']){
    const e=validate(base,{...scenario,units:scenario[key]??scenario.units});
    if(e.units)errors[key]=e.units;
  }
  if(!errors.units&&!errors.conservative&&!errors.optimistic&&(Number(scenario.conservative??scenario.units)>Number(scenario.units)||Number(scenario.units)>Number(scenario.optimistic??scenario.units)))errors.range='Use conservative ≤ expected ≤ optimistic sales.';
  if(!['profit','clearance'].includes(goal.type))errors.goal='Choose a business goal.';
  for(const key of ['lossBudget','extraProfit']){
    if(validate(base,{...scenario,expenses:goal[key]??'0'}).expenses)errors[key]='Enter an amount from 0 to 1,000,000, with up to 2 decimals.';
  }
  if(!/^\d+(\.\d{1,2})?$/.test(String(goal.sellThrough))||Number(goal.sellThrough)<=0||Number(goal.sellThrough)>100)errors.sellThrough='Enter a target above 0 and up to 100%.';
  if(goal.type==='clearance'&&(base.inventory===''||base.inventory===undefined||Number(base.inventory)===0))errors.inventory='Enter available stock above zero to plan clearance.';
  return errors;
}
// All boundaries use cents. Negative contribution produces a maximum, never a growth target.
export function volumeThreshold(unitCents,expenseCents,targetCents,inventory=null){
  const required=targetCents+expenseCents;
  let threshold;
  if(unitCents>0n)threshold={kind:'minimum',units:required<=0n?0:Number((required+unitCents-1n)/unitCents)};
  else if(unitCents===0n)threshold=required<=0n?{kind:'all',units:0}:{kind:'impossible'};
  else threshold=required<=0n?{kind:'maximum',units:Number((-required)/(-unitCents))}:{kind:'impossible'};
  return {...threshold,withinStock:threshold.kind!=='impossible'&&(threshold.kind!=='minimum'||inventory===null||threshold.units<=inventory)};
}
const signedCents=n=>BigInt(Math.round(n*100));
export function financialCeiling(base,scenario,targetProfit){
  // Exact search over the supported 0.01-percentage-point grid accounts for retail rounding.
  const meets=bps=>{const r=calculate(base,{...scenario,discount:(bps/100).toFixed(2)});return r.valid&&signedCents(r.promoProfit)>=targetProfit;};
  if(!meets(0))return null;
  let lo=0,hi=10000;
  while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(meets(mid))lo=mid;else hi=mid-1;}
  return lo/100;
}
export function evaluate(analysis,scenario){
  const goal=analysis.goal??defaultGoal(),errors=validatePlan(analysis.base,scenario,goal);
  if(Object.keys(errors).length)return {valid:false,errors,status:'incomplete'};
  const outcomes=cases.map(([key,label])=>({key,label,...calculate(analysis.base,{...scenario,units:scenario[key]??scenario.units})}));
  const expected=outcomes[1],baseline=signedCents(expected.normalProfit);
  const target=goal.type==='profit'?(baseline>0n?baseline:0n)+cents(goal.extraProfit??'0'):-cents(goal.lossBudget??'0');
  const targetUnits=goal.type==='clearance'?Number((BigInt(expected.inventory)*cents(goal.sellThrough)+9999n)/10000n):0;
  outcomes.forEach(r=>{r.profitMeets=signedCents(r.promoProfit)>=target;r.volumeMeets=r.units>=targetUnits;r.meets=r.profitMeets&&r.volumeMeets;});
  const allMeet=outcomes.every(r=>r.meets),rangeTested=scenario.rangeSet!==false&&Number(scenario.conservative??scenario.units)<Number(scenario.optimistic??scenario.units);
  const stockKnown=expected.inventory!==null;
  const capped=outcomes.some(r=>r.stockCapped)||expected.baselineCapped;
  const status=!expected.meets?'fail':allMeet&&rangeTested&&stockKnown&&!capped?'pass':'risk';
  const m=money,cur=analysis.currency,failCases=outcomes.filter(r=>!r.meets).map(r=>r.label.toLowerCase());
  const failing=new Intl.ListFormat('en-US',{style:'long',type:'conjunction'}).format(failCases),failingSentence=failing.charAt(0).toUpperCase()+failing.slice(1);
  const rules=[{id:'profit',pass:expected.profitMeets,title:goal.type==='profit'?'Protect contribution profit':'Stay within the clearance loss limit',detail:`Expected ${m(expected.promoProfit,cur)} · required at least ${m(Number(target)/100,cur)}.`}];
  if(goal.type==='clearance')rules.push({id:'clearance',pass:expected.volumeMeets,title:'Reach the inventory target',detail:`Expected ${expected.units.toLocaleString()} of ${expected.inventory.toLocaleString()} units sold · target ${targetUnits.toLocaleString()} (${goal.sellThrough}%).`});
  rules.push({id:'range',pass:allMeet&&rangeTested,title:'Test the downside and upside',detail:!rangeTested?'A distinct sales range is not set. All three cases currently use a single assumption.':allMeet?'All three entered sales cases meet the goal. This is a sensitivity test, not a probability estimate.':`${failingSentence} sales miss the goal. ${expected.promoContribution<0?'Higher sales deepen the loss.':'Check demand evidence before committing.'}`});
  rules.push({id:'stock',pass:stockKnown&&!outcomes.some(r=>r.stockCapped)&&!expected.baselineCapped,title:'Respect available inventory',detail:!stockKnown?'Stock is not set. These results assume unlimited availability.':`Stock limit: ${expected.inventory.toLocaleString()} units. ${outcomes.some(r=>r.stockCapped)||expected.baselineCapped?'Volumes above it are capped in the calculations, including the normal baseline.':'Your sales assumptions fit within available stock.'}`});
  const unit=signedCents(expected.promoContribution),expense=cents(scenario.expenses);
  const goalThreshold=volumeThreshold(unit,expense,target,expected.inventory);
  const breakEven=volumeThreshold(unit,expense,0n,expected.inventory);
  const ceiling=expected.volumeMeets?financialCeiling(analysis.base,scenario,target):null;
  return {valid:true,status,expected,outcomes,rules,targetProfit:Number(target)/100,targetUnits,goalThreshold,breakEven,ceiling,rangeTested,
    title:status==='pass'?'Meets your goal across all three cases.':status==='fail'?'The expected case misses your goal.':!allMeet?'Works at expected sales. Risk remains.':'The numbers work. Check the assumptions.',
    explanation:status==='pass'?'Your entered sales range supports this offer. Validate demand before launching.':status==='fail'?(expected.profitMeets?'Sales fall short of the inventory target. Try a different offer or a better-supported sales plan.':(!goalThreshold.withinStock&&goalThreshold.kind==='minimum'?'The sales needed exceed available stock. Reduce the discount or campaign costs; higher demand alone cannot close the gap.':'Expected contribution profit is below your required level. Reduce the discount or campaign costs, or validate whether higher sales are realistic.')):!allMeet?`${failingSentence} sales do not meet your goal. Review the failed rules below.`:capped?'Demand exceeds available stock. Results use capped sales; review capacity before launching.':'Add available inventory and a distinct sales range to complete the decision checks.'};
}
export function thresholdText(t){return t.kind==='minimum'?`${t.units.toLocaleString()} units${t.withinStock===false?' · exceeds stock':''}`:t.kind==='maximum'?`At most ${t.units.toLocaleString()} units`:t.kind==='all'?'Any volume':'Not reachable';}
export function snapshotPlan(analysis,scenario){
  if(!evaluate(analysis,scenario).valid)throw new Error('Complete this plan before recording actual results.');
  return JSON.parse(JSON.stringify({name:analysis.name,product:analysis.product,period:analysis.period,currency:analysis.currency,base:analysis.base,goal:analysis.goal??defaultGoal(),scenario,capturedAt:new Date().toISOString()}));
}
export const emptyActual=()=>({units:'',revenue:'',variableCosts:'',fees:'',expenses:'',notes:''});
export function calculateActual(review){
  const a=review.actual,errors={};
  for(const k of ['units','revenue','variableCosts','fees','expenses']){
    const text=String(a[k]??'');
    if(!/^\d+(\.\d+)?$/.test(text)||Number(text)>(k==='units'?10000000:10000000000000)||(text.split('.')[1]?.length??0)>(k==='units'?0:2))errors[k]=k==='units'?'Enter whole units, 0–10,000,000.':'Enter a total from 0 to 10 trillion, with up to 2 decimals.';
  }
  if(!errors.units&&!errors.revenue&&Number(a.units)===0&&Number(a.revenue)>0)errors.revenue='Revenue must be zero when no units were sold.';
  if(Object.keys(errors).length)return {valid:false,errors};
  const plan=evaluate(review.plan,review.plan.scenario);
  if(!plan.valid)return {valid:false,errors:{plan:'The original plan is invalid.'}};
  const profit=cents(a.revenue)-cents(a.variableCosts)-cents(a.fees)-cents(a.expenses);
  const delta=profit-signedCents(plan.expected.promoProfit),baselineDelta=profit-signedCents(plan.expected.normalProfit);
  return {valid:true,plan,profit:Number(profit)/100,delta:Number(delta)/100,baselineDelta:Number(baselineDelta)/100,
    meets:profit>=signedCents(plan.targetProfit)&&Number(a.units)>=plan.targetUnits,
    exceededStock:plan.expected.inventory!==null&&Number(a.units)>plan.expected.inventory,
    volumeVariance:Number(a.units)-plan.expected.units,
    bridge:[['Sales & realized price',Number(cents(a.revenue)-signedCents(plan.expected.promoRevenue))/100],['Variable costs',Number(signedCents(plan.expected.promoCosts)-cents(a.variableCosts))/100],['Selling fees',Number(signedCents(plan.expected.promoFees)-cents(a.fees))/100],['Campaign expenses',Number(signedCents(plan.expected.expenses)-cents(a.expenses))/100]]};
}
