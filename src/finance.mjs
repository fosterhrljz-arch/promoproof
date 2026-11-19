// Money is represented as integer cents. Discounted unit prices are rounded half-up
// to the nearest cent before multiplying by volume, as on a retail price label.
export const LIMITS={money:1000000,units:10000000,discount:100};
export function validate(base,scenario){
  const errors={};
  const check=(key,value,max,decimals,positive=false)=>{
    const text=String(value??'').trim();
    if(!/^\d+(\.\d+)?$/.test(text)||!Number.isFinite(Number(text))) errors[key]='Enter a valid number.';
    else if(Number(text)>max||(positive&&Number(text)===0)) errors[key]=`Enter ${positive?'more than 0':'0'} to ${max.toLocaleString('en-US')}.`;
    else if((text.split('.')[1]?.length??0)>decimals) errors[key]=decimals===0?'Enter whole units.':`Use no more than ${decimals} decimal places.`;
  };
  check('price',base.price,LIMITS.money,2,true);check('cost',base.cost,LIMITS.money,2);check('normalUnits',base.normalUnits,LIMITS.units,0);
  check('discount',scenario.discount,100,2);check('units',scenario.units,LIMITS.units,0);check('expenses',scenario.expenses,LIMITS.money,2);
  for(const key of ['fulfillment','otherCost'])check(key,base[key]??'0',LIMITS.money,2);
  check('feeRate',base.feeRate??'0',100,2);
  if(base.inventory!==undefined&&base.inventory!=='')check('inventory',base.inventory,LIMITS.units,0);
  return errors;
}
export const cents=value=>{const [whole,fraction='']=String(value).trim().split('.');return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));};
const divideUp=(n,d)=>(n+d-1n)/d;
export function calculate(base,scenario){
  const errors=validate(base,scenario);if(Object.keys(errors).length)return {valid:false,errors};
  const price=cents(base.price),cost=cents(base.cost)+cents(base.fulfillment??'0')+cents(base.otherCost??'0'),discount=cents(scenario.discount),expenses=cents(scenario.expenses);
  const inventory=base.inventory===undefined||base.inventory===''?null:BigInt(base.inventory);
  const cap=q=>inventory===null||q<inventory?q:inventory;
  const normalUnits=cap(BigInt(base.normalUnits)),units=cap(BigInt(scenario.units));
  const salePrice=(price*(10000n-discount)+5000n)/10000n;
  const feeRate=cents(base.feeRate??'0'),normalFee=(price*feeRate+5000n)/10000n,promoFee=(salePrice*feeRate+5000n)/10000n;
  const contribution=price-cost-normalFee,promoContribution=salePrice-cost-promoFee;
  const normalProfit=contribution*normalUnits,promoProfit=promoContribution*units-expenses,delta=promoProfit-normalProfit;
  const target=normalProfit+expenses;
  let threshold;
  if(promoContribution>0n){
    const minimum=target<=0n?0n:divideUp(target,promoContribution);
    threshold={kind:'minimum',units:Number(minimum),exact:Math.max(0,Number(target)/Number(promoContribution))};
  }else if(promoContribution===0n){
    threshold=target<=0n?{kind:'all',units:0}:{kind:'impossible'};
  }else{
    threshold=target<=0n?{kind:'maximum',units:Number((-target)/(-promoContribution))}:{kind:'impossible'};
  }
  const money=n=>Number(n)/100;
  return {valid:true,price:money(price),cost:money(cost),salePrice:money(salePrice),contribution:money(contribution),promoContribution:money(promoContribution),
    normalRevenue:money(price*normalUnits),promoRevenue:money(salePrice*units),normalCosts:money(cost*normalUnits),promoCosts:money(cost*units),expenses:money(expenses),
    normalFee:money(normalFee),promoFee:money(promoFee),normalFees:money(normalFee*normalUnits),promoFees:money(promoFee*units),feeRate:Number(feeRate)/100,
    inventory:inventory===null?null:Number(inventory),requestedUnits:Number(scenario.units),requestedNormalUnits:Number(base.normalUnits),stockCapped:units<BigInt(scenario.units),baselineCapped:normalUnits<BigInt(base.normalUnits),
    normalProfit:money(normalProfit),promoProfit:money(promoProfit),delta:money(delta),percent:normalProfit>0n?Number(delta)/Number(normalProfit)*100:null,
    normalMargin:price>0n?Number(contribution)/Number(price)*100:null,promoMargin:salePrice>0n?Number(promoContribution)/Number(salePrice)*100:null,
    normalUnits:Number(normalUnits),units:Number(units),discount:Number(discount)/100,threshold,
    uplift:normalUnits>0n?(Number(units)/Number(normalUnits)-1)*100:null,
    requiredUplift:threshold.kind==='minimum'&&normalUnits>0n?(threshold.units/Number(normalUnits)-1)*100:null};
}
export function verdict(r){
  if(r.promoContribution<0)return {tone:'negative',title:'Every discounted sale adds a loss.',body:`The sale price is below your variable cost. Selling more makes the result worse.`};
  if(r.promoContribution===0)return {tone:'warning',title:'Sales won’t add contribution profit.',body:'Each sale only covers its variable cost. More volume cannot pay back campaign expenses or create additional profit.'};
  if(r.delta>0)return {tone:'positive',title:r.promoProfit<0?'A smaller loss is still a loss.':'This promotion earns more.',body:r.promoProfit<0?'You improve on normal performance, but the promotion still loses money before fixed overhead.':`At ${r.units.toLocaleString('en-US')} units, you make more contribution profit than usual.`};
  if(r.delta===0)return {tone:'neutral',title:'This promotion matches normal profit.',body:'Your expected sales cover the discount and campaign expenses, with no additional contribution profit.'};
  return {tone:'negative',title:'This promotion earns less.',body:r.threshold.kind==='minimum'?`You need ${r.threshold.units.toLocaleString('en-US')} units to match normal profit. Your sales assumption falls short.`:'Your expected contribution profit is below the normal baseline.'};
}
export function thresholdLabel(r){
  const t=r.threshold;
  return t.kind==='minimum'?`${t.units.toLocaleString('en-US')} units`:t.kind==='all'?'Any volume':t.kind==='maximum'?`0–${t.units.toLocaleString('en-US')} units`:'Not reachable';
}
export const money=(value,currency='USD',precise=false)=>{const decimals=precise||Math.abs(value%1)>.001?2:0;return new Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value);};
export const signedMoney=(value,currency='USD')=>(value>0?'+':'')+money(value,currency);
export const percent=value=>value===null?'Not applicable':`${value>0?'+':''}${value.toFixed(1)}%`;
