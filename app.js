const $=id=>document.getElementById(id);
const questions=[...JUNE_2026_QUESTIONS].sort((a,b)=>a.sourceQuestion-b.sourceQuestion);
let visible=[...questions],index=0,current=null,attempted=0,correct=0,answered=false;
const bookmarks=new Set(JSON.parse(localStorage.getItem("june26-bookmarks")||"[]").map(String));
const mistakes=new Set(JSON.parse(localStorage.getItem("june26-mistakes")||"[]").map(String));
const keyOf=q=>typeof q.answer==="number"?q.answer-1:String(q.answer).toUpperCase().charCodeAt(0)-65;
const idOf=q=>String(q.id);
function save(){localStorage.setItem("june26-bookmarks",JSON.stringify([...bookmarks]));localStorage.setItem("june26-mistakes",JSON.stringify([...mistakes]));$("saved").textContent=bookmarks.size}
function filtered(){const term=$("search").value.trim().toLowerCase(),mode=$("mode").value;return questions.filter(q=>(!term||(q.question+" "+q.options.join(" ")).toLowerCase().includes(term))&&(mode==="all"||(mode==="bookmarks"?bookmarks.has(idOf(q)):mistakes.has(idOf(q)))))}
function google(q,extra=""){return "https://www.google.com/search?q="+encodeURIComponent("UGC NET Public Administration June 2026 "+q.question+" "+extra)}
function official(q){const t=q.question.toLowerCase();let domain="site:egyankosh.ac.in OR site:ndl.iitkgp.ac.in";
if(/article|constitution|governor|parliament|cag|panchayat|commissioner/.test(t))domain="site:indiacode.nic.in OR site:legislative.gov.in";
else if(/scheme|yojna|mission|digital india|e-sanjeevani|tele manas/.test(t))domain="site:pib.gov.in OR site:india.gov.in";
else if(/upsc|civil service|recruitment/.test(t))domain="site:upsc.gov.in OR site:dopt.gov.in";
else if(/administrative reforms|arc|committee|commission/.test(t))domain="site:darpg.gov.in OR site:gov.in";
else if(/disaster/.test(t))domain="site:ndma.gov.in OR site:mha.gov.in";
else if(/budget|finance commission|tax|public account/.test(t))domain="site:indiabudget.gov.in OR site:cag.gov.in";
return "https://www.google.com/search?q="+encodeURIComponent(domain+" "+q.question)}

function parseMatchQuestion(text){
 const a=text.search(/LIST-I/i),b=text.search(/LIST-II/i);
 if(a<0||b<a)return null;
 const intro=text.slice(0,a).trim();
 const leftText=text.slice(a+6,b).replace(/^\s*\([^)]*\)\s*/,"").trim();
 const rightText=text.slice(b+6).replace(/^\s*\([^)]*\)\s*/,"").trim();
 function split(block,roman){
  const re=roman?/(?:^|\s)(I{1,3}|IV|V|VI|VII|VIII|IX|X)\.\s*/g:/(?:^|\s)([A-E])\.\s*/g;
  const m=[...block.matchAll(re)];
  return m.map((x,i)=>({key:x[1],value:block.slice(x.index+x[0].length,i+1<m.length?m[i+1].index:block.length).trim()}));
 }
 const left=split(leftText,false),right=split(rightText,true);
 return left.length&&right.length?{intro,left,right}:null;
}
function parseStatementQuestion(text){const re=/(?:^|\s)([A-E])\.\s*/g;const m=[...text.matchAll(re)];if(/LIST-I|LIST-II/i.test(text)||m.length<3)return null;return {prefix:text.slice(0,m[0].index).trim(),items:m.map((x,i)=>({key:x[1],value:text.slice(x.index+x[0].length,i+1<m.length?m[i+1].index:text.length).trim()}))};}
function renderQuestionContent(q){
 const host=$("question"),data=parseMatchQuestion(q.question),statements=parseStatementQuestion(q.question);
 host.innerHTML="";
 if(!data&&statements){host.className="qtext statement-question";const p=document.createElement("p");p.className="statement-prompt";p.textContent=statements.prefix;host.append(p);const list=document.createElement("div");list.className="statement-list";statements.items.forEach(item=>{const row=document.createElement("div");row.className="statement-row";const k=document.createElement("b");k.textContent=item.key+".";const v=document.createElement("span");v.textContent=item.value;row.append(k,v);list.append(row)});host.append(list);return}if(!data){host.className="qtext";host.textContent=q.question;return}
 host.className="qtext match-question";
 if(data.intro){const p=document.createElement("p");p.className="match-instruction";p.textContent=data.intro;host.append(p)}
 const statementStyle=[...data.left,...data.right].some(item=>item.value.length>58||item.value.split(/\\s+/).length>9);
 const board=document.createElement("div");board.className="match-board"+(statementStyle?" match-statements":"");
 [["LIST I",data.left],["LIST II",data.right]].forEach(group=>{
  const col=document.createElement("section");col.className="match-column";
  const h=document.createElement("h3");h.textContent=group[0];col.append(h);
  group[1].forEach(item=>{const row=document.createElement("div");row.className="match-item";const k=document.createElement("b");k.textContent=item.key+".";const v=document.createElement("span");v.textContent=item.value;row.append(k,v);col.append(row)});
  board.append(col);
 });
 host.append(board);
 const hint=document.createElement("div");hint.className="match-hint";hint.textContent="Choose the correct combination below.";host.append(hint);
}
function renderOptionContent(button,text){
 const pairs=[...text.matchAll(/([A-E])\s*[-–]\s*(I{1,3}|IV|V|VI|VII|VIII|IX|X)\b/g)];
 if(pairs.length<2){button.append(document.createTextNode(text));return}
 const label=document.createElement("span");label.className="pair-label";label.textContent="MATCHING COMBINATION";
 const grid=document.createElement("span");grid.className="pair-grid";
 pairs.forEach(m=>{const chip=document.createElement("span");chip.className="pair-chip";chip.textContent=m[1]+" ↔ "+m[2];grid.append(chip)});
 button.append(label,grid);
}

function render(){visible=filtered();$("count").textContent=visible.length;if(!visible.length){current=null;$("qid").textContent="";$("question").textContent="No matching June 2026 questions. Change your search or filter.";$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=true;$("previous").disabled=true;$("bookmark").disabled=true;return}
index=Math.min(index,visible.length-1);current=visible[index];answered=false;$("bookmark").disabled=false;$("qid").textContent="QUESTION "+current.sourceQuestion;renderQuestionContent(current);$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=true;$("previous").disabled=index===0;$("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark";
current.options.forEach((opt,i)=>{const b=document.createElement("button");b.className="option";const lab=document.createElement("span");lab.className="letter";lab.textContent=String.fromCharCode(65+i)+".";b.append(lab);renderOptionContent(b,opt);b.onclick=()=>choose(i);$("options").append(b)})}
function choose(choice){if(answered||!current)return;answered=true;attempted++;const answer=keyOf(current),right=choice===answer;if(right)correct++;else mistakes.add(idOf(current));save();[...$("options").children].forEach((b,i)=>{b.disabled=true;if(i===answer)b.classList.add("correct");else if(i===choice)b.classList.add("wrong")});$("progress").textContent=attempted;$("accuracy").textContent=Math.round(correct/attempted*100)+"%";const letter=String.fromCharCode(65+answer);$("feedback").innerHTML='<h3>'+(right?"Correct":"Review this one")+'</h3><p><b>Answer key supplied in the source:</b> '+letter+'. '+escapeText(current.options[answer])+'</p><p>The source document does not include a detailed explanation for this question. Use the study links below to read the related Public Administration concept and check the answer against a reliable source.</p>';$("feedback").hidden=false;$("verify").innerHTML='<b>Study and verify this question</b><a target="_blank" rel="noopener" href="'+google(current,"concept explanation")+'">Study this question and its related concept ↗</a><a target="_blank" rel="noopener" href="'+official(current)+'">Search official / academic sources ↗</a><small>The supplied answer key is reproduced as-is; these searches are aids for independent verification, not proof that the key is official.</small>';$("verify").hidden=false;$("next").disabled=false}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("next").onclick=()=>{if(index<visible.length-1){index++;render()}};
$("previous").onclick=()=>{if(index>0){index--;render()}};
$("bookmark").onclick=()=>{if(!current)return;bookmarks.has(idOf(current))?bookmarks.delete(idOf(current)):bookmarks.add(idOf(current));save();$("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark"};
$("search").addEventListener("input",()=>{index=0;render()});$("mode").addEventListener("change",()=>{index=0;render()});
save();render();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));