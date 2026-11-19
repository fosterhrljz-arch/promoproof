import {jsPDF} from 'jspdf';
import {fontBase64,fontCodepoints} from './assets/pdf-font.mjs';
import {reportSections} from './report.mjs';

const glyphs=new Set(fontCodepoints);
const clean=value=>String(value).replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\u2026/g,'...').replace(/[\u00a0\u202f]/g,' ').replace(/\u2264/g,'<=').replace(/\u2265/g,'>=').replace(/\u2192/g,'to');
export function buildPdf(analysis){
 const sections=reportSections(analysis),all=[analysis.name,...sections.flatMap(s=>[s.title,...(s.paragraphs??[]),...(s.headers??[]),...(s.rows??[]).flat(),...(s.notes??[])])];
 // Never silently drop product-name characters unsupported by the compact embedded font.
 if(all.some(s=>[...clean(s)].some(ch=>ch!=='\n'&&ch!=='\r'&&!glyphs.has(ch.codePointAt(0)))))throw new Error('Some names contain characters outside the bundled PDF font. Use Print report and Save as PDF to preserve those characters.');
 const doc=new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 doc.addFileToVFS('Inter.ttf',fontBase64);doc.addFont('Inter.ttf','Inter','normal');doc.setFont('Inter');
 doc.setProperties({title:analysis.name,subject:'Promotion decision report',creator:'PromoProof 2.2'});
 const left=16,right=194,width=178,bottom=277;let y=20;
 const header=()=>{doc.setTextColor(54,93,227);doc.setFontSize(9);doc.text('PROMOPROOF 2.2  /  PROMOTION DECISION REPORT',left,12);doc.setDrawColor(225,229,235);doc.line(left,15,right,15);y=24;};
 const room=h=>{if(y+h>bottom){doc.addPage();header();}};
 const text=(value,size=10,color=[75,85,102],gap=3)=>{doc.setFontSize(size);doc.setTextColor(...color);const lines=doc.splitTextToSize(clean(value),width);for(const line of lines){room(size*.45+gap);doc.text(line,left,y);y+=size*.45;}y+=gap;};
 header();text(analysis.name,20,[29,39,53],5);text(`${analysis.product} · ${analysis.period} · ${analysis.currency}`,11);text('Current plan assumptions and user-entered actuals. Generated locally; no data upload.',9);
 const table=(headers,rows)=>{
  const weights=headers.length===2?[.58,.42]:headers.length===5?[.28,.18,.18,.18,.18]:[.34,.22,.22,.22];
  const widths=weights.map(w=>w*width);
  const draw=(cells,isHeader=false)=>{
   doc.setFontSize(9);const lines=cells.map((s,i)=>doc.splitTextToSize(clean(s),widths[i]-5));const h=Math.max(...lines.map(a=>a.length))*4.2+6;
   if(y+h>bottom){doc.addPage();header();if(!isHeader)draw(headers,true);}
   if(isHeader){doc.setFillColor(238,242,255);doc.rect(left,y,width,h,'F');}
   let x=left;doc.setTextColor(...(isHeader?[43,63,112]:[29,39,53]));lines.forEach((ls,i)=>{doc.text(ls,x+2.5,y+5,{lineHeightFactor:1.32});x+=widths[i];});
   y+=h;doc.setDrawColor(225,229,235);doc.line(left,y,right,y);
  };
  room(24);draw(headers,true);rows.forEach(r=>draw(r));y+=7;
 };
 sections.forEach((s,i)=>{if(i>1&&i<sections.length-1){doc.addPage();header();}room(27);text(s.title,14,[29,39,53],4);s.paragraphs?.forEach(p=>text(p));if(s.headers)table(s.headers,s.rows);s.notes?.forEach(n=>text(n,9,[75,85,102],4));y+=4;});
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(8);doc.setTextColor(105,115,134);doc.text('Assumptions are not forecasts. Contribution excludes fixed overhead and tax.',left,287);doc.text(`${i} / ${pages}`,right,287,{align:'right'});}
 return doc.output('arraybuffer');
}
