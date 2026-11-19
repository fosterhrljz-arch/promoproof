import {ArrowLeft,Download,Printer} from 'lucide-react';
import {reportSections} from '../report.mjs';
import {Button} from './Common.jsx';

export default function PrintReport({analysis,onClose,onPdf}){
 const sections=reportSections(analysis);
 return <main className="print-report"><div className="report-toolbar"><Button variant="secondary" onClick={onClose}><ArrowLeft size={16}/>Back to analysis</Button><div><Button variant="secondary" onClick={onPdf}><Download size={16}/>Download PDF</Button><Button onClick={()=>window.print()}><Printer size={16}/>Print report</Button></div></div><header className="report-cover"><span>PromoProof 2.2 · Promotion decision report</span><h1>{analysis.name}</h1><p>{analysis.product} · {analysis.period} · {analysis.currency}</p><p>Includes current changes, all scenarios and frozen reviews. Planning figures are assumptions; actual results are labeled separately.</p></header>{sections.map((s,i)=><section className="report-section" key={i}><h2>{s.title}</h2>{s.paragraphs?.map((p,j)=><p key={j}>{p}</p>)}{s.headers&&<div className="table-scroll"><table><thead><tr>{s.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{s.rows.map((r,j)=><tr key={j}>{r.map((cell,k)=><td key={k}>{cell}</td>)}</tr>)}</tbody></table></div>}{s.notes&&<ul>{s.notes.map((note,j)=><li key={j}>{note}</li>)}</ul>}</section>)}</main>;
}
