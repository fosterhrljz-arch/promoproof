import {useId} from 'react';
export default function Field({label,value,onChange,prefix,suffix,error,hint,type='number',step='0.01',max,...rest}){
 const uid=useId();return <div className={`field ${error?'has-error':''}`}><label htmlFor={uid}>{label}</label><div className="input-wrap">{prefix&&<span>{prefix}</span>}<input id={uid} type={type} inputMode={type==='number'?(step==='1'?'numeric':'decimal'):undefined} min={type==='number'?'0':undefined} max={max} step={step} value={value} onChange={e=>onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error||hint?uid+'-hint':undefined} {...rest}/>{suffix&&<span>{suffix}</span>}</div>{(error||hint)&&<small id={uid+'-hint'} className={error?'field-error':'field-hint'}>{error||hint}</small>}</div>
}
