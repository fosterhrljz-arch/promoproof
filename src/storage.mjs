import {validate} from './finance.mjs';
import {defaultGoal,validatePlan,emptyActual} from './decision.mjs';
export const STORAGE_KEY='promoproof.library.v2',LEGACY_KEY='promoproof.library.v1';
export const id=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const currencies=['USD','EUR','GBP','CAD','AUD'];
export const emptyAnalysis=()=>({id:id(),name:'Untitled analysis',product:'',period:'30-day period',currency:'USD',goal:defaultGoal(),base:{price:'',cost:'',normalUnits:'',fulfillment:'0',otherCost:'0',feeRate:'0',inventory:''},scenarios:[{id:id(),name:'Scenario 1',discount:'',units:'',conservative:'',optimistic:'',rangeSet:true,expenses:'0'}],reviews:[],updatedAt:new Date().toISOString()});
export const exampleAnalysis=()=>({...emptyAnalysis(),name:'Weekend offer',product:'Canvas tote',base:{price:'50',cost:'22',normalUnits:'100',fulfillment:'0',otherCost:'0',feeRate:'0',inventory:'220'},scenarios:[{id:id(),name:'20% weekend offer',discount:'20',conservative:'140',units:'180',optimistic:'220',expenses:'150',rangeSet:true},{id:id(),name:'10% gentle nudge',discount:'10',conservative:'115',units:'130',optimistic:'150',expenses:'100',rangeSet:true},{id:id(),name:'30% deeper discount',discount:'30',conservative:'160',units:'200',optimistic:'240',expenses:'150',rangeSet:true}]});
const shortText=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.length<=max;
const fail=message=>{throw new Error(message);};
function normalizePlan(a,legacy=false){
  if(!shortText(a.name,80)||!shortText(a.product,80)||!shortText(a.period,60)||!currencies.includes(a.currency))fail('This backup contains invalid product details.');
  const base={};for(const key of ['price','cost','normalUnits'])base[key]=String(a.base?.[key]??'');
  for(const key of ['fulfillment','otherCost','feeRate'])base[key]=legacy?'0':String(a.base?.[key]??'0');
  base.inventory=legacy?'':String(a.base?.inventory??'');
  const goal=legacy?defaultGoal():{type:a.goal?.type??'profit',sellThrough:String(a.goal?.sellThrough??'80'),lossBudget:String(a.goal?.lossBudget??'0'),extraProfit:String(a.goal?.extraProfit??'0')};
  return {name:a.name,product:a.product,period:a.period,currency:a.currency,base,goal};
}
function normalizeScenario(s,plan,legacy){
  if(!shortText(s.id,100)||!shortText(s.name,60)||Object.keys(validate(plan.base,s)).length)fail('This backup contains invalid scenario inputs.');
  const next={id:s.id,name:s.name,discount:String(s.discount),units:String(s.units),expenses:String(s.expenses),conservative:String(legacy?s.units:s.conservative??s.units),optimistic:String(legacy?s.units:s.optimistic??s.units),rangeSet:legacy?false:s.rangeSet!==false};
  if(Object.keys(validatePlan(plan.base,next,plan.goal)).length)fail('This backup contains invalid goals or sales ranges.');
  return next;
}
function normalizeReview(r){
  if(!shortText(r.id,100)||!shortText(r.scenarioId,100)||!r.plan||Number.isNaN(Date.parse(r.plan.capturedAt)))fail('This backup contains an invalid review.');
  const plan=normalizePlan(r.plan);plan.scenario=normalizeScenario(r.plan.scenario,plan,false);plan.capturedAt=r.plan.capturedAt;
  const actual=emptyActual();for(const key of Object.keys(actual)){
    const value=r.actual?.[key];if(typeof value!=='string'||value.length>(key==='notes'?2000:24))fail('This backup contains invalid actual results.');
    if(key!=='notes'&&value!==''&&(!/^\d+(\.\d+)?$/.test(value)||Number(value)>(key==='units'?10000000:10000000000000)||(value.split('.')[1]?.length??0)>(key==='units'?0:2)))fail('This backup contains invalid actual amounts.');
    actual[key]=value;
  }
  return {id:r.id,scenarioId:r.scenarioId,plan,actual};
}
export function validateBackup(data){
  if(![1,2].includes(data?.version)||!Array.isArray(data.analyses)||data.analyses.length>100)fail('Choose a PromoProof version 1 or 2 backup with up to 100 analyses.');
  const ids=new Set(),legacy=data.version===1;
  return data.analyses.map(a=>{
    if(!shortText(a.id,100)||ids.has(a.id)||!Array.isArray(a.scenarios)||a.scenarios.length<1||a.scenarios.length>20)fail('This backup contains an invalid analysis.');
    ids.add(a.id);const plan=normalizePlan(a,legacy),seen=new Set();
    const scenarios=a.scenarios.map(s=>{if(seen.has(s.id))fail('Duplicate scenario IDs in backup.');seen.add(s.id);return normalizeScenario(s,plan,legacy);});
    if(!legacy&&(!Array.isArray(a.reviews)||a.reviews.length>20))fail('An analysis can contain up to 20 reviews.');
    const reviewIds=new Set(),reviews=legacy?[]:a.reviews.map(r=>{if(reviewIds.has(r.id))fail('Duplicate review IDs in backup.');reviewIds.add(r.id);return normalizeReview(r);});
    return {id:a.id,...plan,scenarios,reviews,updatedAt:Number.isNaN(Date.parse(a.updatedAt))?new Date().toISOString():a.updatedAt};
  });
}
export function importCopies(analyses){return analyses.map(a=>{const remap=new Map(a.scenarios.map(s=>[s.id,id()]));return {...a,id:id(),scenarios:a.scenarios.map(s=>({...s,id:remap.get(s.id)})),reviews:a.reviews.map(r=>({...r,id:id(),scenarioId:remap.get(r.scenarioId)??id()})),updatedAt:new Date().toISOString()};});}
export function readLibrary(){
  let key=STORAGE_KEY;
  try{let raw=localStorage.getItem(STORAGE_KEY);if(raw===null){key=LEGACY_KEY;raw=localStorage.getItem(LEGACY_KEY);}return {analyses:raw?validateBackup(JSON.parse(raw)):[],error:null,migrated:!!raw&&key===LEGACY_KEY};}
  catch{return {analyses:[],error:'Saved data could not be read. It has not been overwritten. Export a recovery copy or import a valid backup to start a new library.',blocked:true,recoveryKey:key};}
}
export function writeLibrary(analyses){localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,analyses}));}
export function backup(analyses){return JSON.stringify({app:'PromoProof',version:2,exportedAt:new Date().toISOString(),analyses},null,2);}
