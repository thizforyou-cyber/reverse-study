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
function render(){visible=filtered();$("count").textContent=visible.length;if(!visible.length){current=null;$("qid").textContent="";$("question").textContent="No matching June 2026 questions. Change your search or filter.";$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=true;$("previous").disabled=true;$("bookmark").disabled=true;return}
index=Math.min(index,visible.length-1);current=visible[index];answered=false;$("bookmark").disabled=false;$("qid").textContent="QUESTION "+current.sourceQuestion;$("question").textContent=current.question;$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=true;$("previous").disabled=index===0;$("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark";
current.options.forEach((opt,i)=>{const b=document.createElement("button");b.className="option";const letter=String.fromCharCode(65+i);b.innerHTML='<span class="letter">'+letter+'.</span><span></span>';b.querySelector("span:last-child").textContent=opt;b.onclick=()=>choose(i);$("options").append(b)})}
function choose(choice){if(answered||!current)return;answered=true;attempted++;const answer=keyOf(current),right=choice===answer;if(right)correct++;else mistakes.add(idOf(current));save();[...$("options").children].forEach((b,i)=>{b.disabled=true;if(i===answer)b.classList.add("correct");else if(i===choice)b.classList.add("wrong")});$("progress").textContent=attempted;$("accuracy").textContent=Math.round(correct/attempted*100)+"%";const letter=String.fromCharCode(65+answer);$("feedback").innerHTML='<h3>'+(right?"Correct":"Review this one")+'</h3><p><b>Answer key supplied in the source:</b> '+letter+'. '+escapeText(current.options[answer])+'</p><p>The source document does not include a detailed explanation for this question. Use the study links below to read the related Public Administration concept and check the answer against a reliable source.</p>';$("feedback").hidden=false;$("verify").innerHTML='<b>Study and verify this question</b><a target="_blank" rel="noopener" href="'+google(current,"concept explanation")+'">Study this question and its related concept ↗</a><a target="_blank" rel="noopener" href="'+official(current)+'">Search official / academic sources ↗</a><small>The supplied answer key is reproduced as-is; these searches are aids for independent verification, not proof that the key is official.</small>';$("verify").hidden=false;$("next").disabled=false}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("next").onclick=()=>{if(index<visible.length-1){index++;render()}};
$("previous").onclick=()=>{if(index>0){index--;render()}};
$("bookmark").onclick=()=>{if(!current)return;bookmarks.has(idOf(current))?bookmarks.delete(idOf(current)):bookmarks.add(idOf(current));save();$("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark"};
$("search").addEventListener("input",()=>{index=0;render()});$("mode").addEventListener("change",()=>{index=0;render()});
save();render();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));