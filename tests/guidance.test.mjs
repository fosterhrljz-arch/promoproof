import test from 'node:test';
import assert from 'node:assert/strict';
import {exampleAnalysis} from '../src/storage.mjs';
import {evaluate,snapshotPlan,emptyActual} from '../src/decision.mjs';
import {decisionGuidance,comparisonSummary} from '../src/guidance.mjs';
import {reportSections} from '../src/report.mjs';
import {buildPdf} from '../src/pdf.mjs';

test('tote guidance quantifies downside, extra sales and discount ceiling without changing inputs',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0],before=JSON.stringify(a),g=decisionGuidance(a,s);
 assert.equal(g.lower,164);assert.equal(g.feasible,true);
 assert.match(g.items.find(i=>i.id==='range').body,/\$430\.00 below/);
 assert.match(g.items.find(i=>i.id==='range').body,/24 more sales/);
 assert.match(g.items.find(i=>i.id==='discount').body,/23\.23%/);
 assert.equal(JSON.stringify(a),before);
});
test('a sales target above stock never recommends more assumed demand as the solution',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0];a.base.inventory='150';s.conservative='120';s.units='140';s.optimistic='150';
 const g=decisionGuidance(a,s);assert.equal(g.feasible,false);assert.match(g.items.find(i=>i.id==='capacity').body,/164 sales.*150 units.*14-unit/);
});
test('negative-margin clearance reports a bounded sales range and optimistic loss',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0];a.goal={type:'clearance',sellThrough:'60',lossBudget:'150',extraProfit:'0'};
 a.base={price:'10',cost:'8',normalUnits:'20',fulfillment:'0',otherCost:'0',feeRate:'0',inventory:'100'};
 Object.assign(s,{discount:'30',conservative:'60',units:'70',optimistic:'100',expenses:'70'});
 const g=decisionGuidance(a,s);assert.equal(g.lower,60);assert.equal(g.upper,80);assert.equal(g.feasible,true);
 assert.match(g.items.find(i=>i.id==='margin').body,/60–80 units/);assert.match(g.items.find(i=>i.id==='range').body,/Optimistic.*\$20\.00 below/);
 a.goal.sellThrough='90';assert.equal(decisionGuidance(a,s).feasible,false);
});
test('zero contribution cannot promise recovery with more units',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0];s.discount='56';const g=decisionGuidance(a,s);
 assert.equal(g.feasible,false);assert.match(g.items[0].body,/Higher demand cannot/);assert.equal(g.items[0].title,'More sales cannot add profit');
});
test('cost adjustment closes the exact fee-aware profit gap',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0];Object.assign(a.base,{fulfillment:'3',otherCost:'.30',feeRate:'2.9'});
 // Use the canonical accepted decimal representation.
 a.base.otherCost='0.30';const g=decisionGuidance(a,s);
 assert.equal(g.profitGap,37.8);assert.match(g.items.find(i=>i.id==='spending').body,/\$112\.20.*\$37\.80/);
 s.expenses='112.20';assert.equal(evaluate(a,s).expected.profitMeets,true);
 s.expenses='112.21';assert.equal(evaluate(a,s).expected.profitMeets,false);
});
test('comparison prefers a fully qualifying offer over a risky higher profit',()=>{
 const a=exampleAnalysis();Object.assign(a.scenarios[1],{discount:'5',conservative:'115',units:'130',optimistic:'150'});
 const rows=a.scenarios.map(s=>({s,d:evaluate(a,s)})),summary=comparisonSummary(a,rows);
 assert.equal(summary.passing,1);assert.equal(summary.best.s.id,a.scenarios[1].id);
});
test('report distinguishes pending actuals and keeps frozen results after live changes',()=>{
 const a=exampleAnalysis(),s=a.scenarios[0];a.reviews=[{id:'r',scenarioId:s.id,plan:snapshotPlan(a,s),actual:emptyActual()}];
 let section=reportSections(a).find(s=>s.title.startsWith('Review:'));assert.match(section.paragraphs.join(' '),/incomplete/);assert.equal(section.rows,undefined);
 a.reviews[0].actual={units:'175',revenue:'7000',variableCosts:'3850',fees:'203',expenses:'170',notes:'Include payment fees next time.'};
 a.base.cost='25';section=reportSections(a).find(s=>s.title.startsWith('Review:'));
 assert.deepEqual(section.rows.find(r=>r[0]==='Contribution profit'),['Contribution profit','$3,090.00','$2,777.00','-$313']);
});
test('PDF emits a real report with embedded font and rejects unsupported names explicitly',()=>{
 const a=exampleAnalysis(),bytes=buildPdf(a);assert.ok(bytes.byteLength>10000);assert.equal(Buffer.from(bytes).subarray(0,5).toString(),'%PDF-');
 a.currency='EUR';assert.ok(buildPdf(a).byteLength>10000);
 a.name='Canvas 👜';assert.throws(()=>buildPdf(a),/Print report/);
});
