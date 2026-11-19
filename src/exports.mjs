import {evaluate,calculateActual,thresholdText} from './decision.mjs';
export function download(contents,name,type){const url=URL.createObjectURL(new Blob([contents],{type})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csvCell(value){let s=String(value??'');if(/^[\s]*[=+@\-]/.test(s)&&typeof value!=='number')s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
const csv=rows=>'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
export function scenarioCsv(a){
 const rows=[['Analysis','Product','Period','Currency','Data type','Goal','Scenario','Sales assumption','Regular price','Base variable cost / unit','Fulfillment / unit','Other cost / unit','Selling fee %','Available stock (blank = unknown)','Normal units (entered)','Normal units (modeled)','Discount %','Sale price','Demand units (entered)','Sales units (stock capped)','Campaign expenses','Revenue','Variable costs','Selling fees','Normal contribution profit','Promotion contribution profit','Change vs normal','Goal minimum profit','Clearance target units','Meets goal in this case','Overall decision','Maximum goal discount at expected volume %','Goal sales threshold']];
 for(const s of a.scenarios){const d=evaluate(a,s);if(!d.valid)continue;for(const r of d.outcomes)rows.push([a.name,a.product,a.period,a.currency,'User assumption; not forecast',a.goal.type,s.name,r.label,r.price,Number(a.base.cost),Number(a.base.fulfillment),Number(a.base.otherCost),r.feeRate,r.inventory??'',r.requestedNormalUnits,r.normalUnits,r.discount,r.salePrice,r.requestedUnits,r.units,r.expenses,r.promoRevenue,r.promoCosts,r.promoFees,r.normalProfit,r.promoProfit,r.delta,d.targetProfit,d.targetUnits,r.meets?'Yes':'No',d.status,d.ceiling??'Not attainable',thresholdText(d.goalThreshold)]);}
 return csv(rows);
}
export function reviewCsv(a){
 const rows=[['Analysis','Product','Currency','Original scenario','Plan captured','Metric','Planned (expected assumption)','Actual (user entered)','Actual minus planned','Notes']];
 for(const review of a.reviews){const actual=calculateActual(review);if(!actual.valid)continue;const p=actual.plan.expected,x=review.actual;for(const [label,planned,observed] of [['Units sold',p.units,Number(x.units)],['Revenue',p.promoRevenue,Number(x.revenue)],['Variable costs',p.promoCosts,Number(x.variableCosts)],['Selling fees',p.promoFees,Number(x.fees)],['Campaign expenses',p.expenses,Number(x.expenses)],['Contribution profit',p.promoProfit,actual.profit]])rows.push([review.plan.name,review.plan.product,review.plan.currency,review.plan.scenario.name,review.plan.capturedAt,label,planned,observed,Math.round((observed-planned)*100)/100,x.notes]);}
 return csv(rows);
}
