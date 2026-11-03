const $=id=>document.getElementById(id);
const questions=[...JUNE_2026_QUESTIONS].sort((a,b)=>a.sourceQuestion-b.sourceQuestion);
let visible=[...questions],index=0,current=null,correct=0,answered=false;
const chosenAnswers=new Map(),unattempted=new Set(),reviewSet=new Set();
const bookmarks=new Set(JSON.parse(localStorage.getItem("june26-bookmarks")||"[]").map(String));
const mistakes=new Set(JSON.parse(localStorage.getItem("june26-mistakes")||"[]").map(String));
const keyOf=q=>q.answer==null?-1:(typeof q.answer==="number"?q.answer-1:String(q.answer).toUpperCase().charCodeAt(0)-65);
const idOf=q=>String(q.id);
function save(){localStorage.setItem("june26-bookmarks",JSON.stringify([...bookmarks]));localStorage.setItem("june26-mistakes",JSON.stringify([...mistakes]));$("saved").textContent=bookmarks.size}
function filtered(){const term=$("search").value.trim().toLowerCase(),mode=$("mode").value;return questions.filter(q=>{const id=idOf(q),has=chosenAnswers.has(id),choice=chosenAnswers.get(id),isCorrect=has&&choice===keyOf(q),isWrong=has&&!isCorrect;const status=mode==="unattempted"?!has:mode==="correct"?isCorrect:mode==="wrong"?isWrong:mode==="bookmarks"?bookmarks.has(id):mode==="mistakes"?mistakes.has(id):true;return status&&(!term||(q.question+" "+q.options.join(" ")).toLowerCase().includes(term))})}
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
 const upper=text.toUpperCase();
 const listIMatches=[...upper.matchAll(/LIST-I(?!I)/g)];
 const listIIMatches=[...upper.matchAll(/LIST-II(?!I)/g)];
 if(!listIMatches.length||!listIIMatches.length)return null;
 const a=listIMatches[listIMatches.length-1].index;
 const b=listIIMatches[listIIMatches.length-1].index;
 if(b<=a)return null;
 const intro=text.slice(0,a).replace(/\s+/g," ").trim();
 const leftText=text.slice(a+6,b).replace(/^\s*\([^)]*\)\s*/,"").trim();
 const rightText=text.slice(b+7).replace(/^\s*\([^)]*\)\s*/,"").trim();
 function split(block,roman){
  const re=roman?/(?:^|\s)(IV|VIII|VII|VI|V|III|II|I|IX|X)\.\s*/g:/(?:^|\s)([A-E])\.\s*/g;
  const m=[...block.matchAll(re)];
  return m.map((x,i)=>({key:x[1],value:block.slice(x.index+x[0].length,i+1<m.length?m[i+1].index:block.length).trim()})).filter(x=>x.value);
 }
 const left=split(leftText,false),right=split(rightText,true);
 return left.length>=2&&right.length>=2?{intro,left,right}:null;
}
function parseStatementQuestion(text){const re=/(?:^|\s)([A-E])\.\s*/g;const m=[...text.matchAll(re)];if(/LIST-I|LIST-II/i.test(text)||m.length<3)return null;return {prefix:text.slice(0,m[0].index).trim(),items:m.map((x,i)=>({key:x[1],value:text.slice(x.index+x[0].length,i+1<m.length?m[i+1].index:text.length).trim()}))};}
function renderQuestionContent(q){
 const host=$("question"),data=parseMatchQuestion(q.question),statements=parseStatementQuestion(q.question);host.innerHTML="";
 if(!data&&statements){host.className="qtext statement-question";const p=document.createElement("p");p.className="statement-prompt";p.textContent=statements.prefix;host.append(p);const list=document.createElement("div");list.className="statement-list";statements.items.forEach(item=>{const row=document.createElement("div");row.className="statement-row";const k=document.createElement("b");k.textContent=item.key+".";const v=document.createElement("span");v.textContent=item.value;row.append(k,v);list.append(row)});host.append(list);return}
 if(!data){host.className="qtext";host.textContent=q.question;return}
 host.className="qtext match-question";if(data.intro){const p=document.createElement("p");p.className="match-instruction";p.textContent=data.intro;host.append(p)}
 const board=document.createElement("div");board.className="match-board";const h1=document.createElement("div");h1.className="match-head";h1.textContent="LIST I";const h2=document.createElement("div");h2.className="match-head";h2.textContent="LIST II";board.append(h1,h2);
 for(let i=0;i<Math.max(data.left.length,data.right.length);i++){for(const item of [data.left[i],data.right[i]]){const cell=document.createElement("div");cell.className="match-cell";if(item){const key=document.createElement("b");key.className="match-key";key.textContent=item.key+".";const value=document.createElement("span");value.textContent=item.value;cell.append(key,value)}board.append(cell)}}
 host.append(board);const hint=document.createElement("div");hint.className="match-hint";hint.textContent="Choose the correct combination below.";host.append(hint);
}
function renderOptionContent(button,text){
 const pairs=[...text.matchAll(/([A-E])\s*[-–]\s*(I{1,3}|IV|V|VI|VII|VIII|IX|X)\b/g)];
 if(pairs.length<2){button.append(document.createTextNode(text));return}
 const label=document.createElement("span");label.className="pair-label";label.textContent="MATCHING COMBINATION";
 const grid=document.createElement("span");grid.className="pair-grid";
 pairs.forEach(m=>{const chip=document.createElement("span");chip.className="pair-chip";chip.textContent=m[1]+" ↔ "+m[2];grid.append(chip)});
 button.append(label,grid);
}

function updateStats(){const scored=[...chosenAnswers].filter(([id])=>{const q=questions.find(x=>idOf(x)===id);return q&&keyOf(q)>=0});const n=scored.length,right=scored.filter(([id,choice])=>{const q=questions.find(x=>idOf(x)===id);return q&&choice===keyOf(q)}).length;$("progress").textContent=chosenAnswers.size;$("accuracy").textContent=n?Math.round(right/n*100)+"%":"—";$("unattempted").textContent=questions.length-chosenAnswers.size;$("correctCount").textContent=right;$("wrongCount").textContent=n-right;$("reviewCount").textContent=reviewSet.size}
function renderQuestionNavigator(){const host=$("questionNavigator");host.innerHTML="";const title=document.createElement("div");title.className="navigator-title";title.textContent="TAP A QUESTION TO OPEN · "+visible.length;host.append(title);const grid=document.createElement("div");grid.className="question-number-grid";visible.forEach((q,i)=>{const id=idOf(q),has=chosenAnswers.has(id),right=has&&chosenAnswers.get(id)===keyOf(q),wrong=has&&!right;const b=document.createElement("button");b.type="button";b.className="question-jump"+(i===index?" active":"")+(right?" is-correct":wrong?" is-wrong":" is-unattempted");b.textContent=q.sourceQuestion;b.title="Open Question "+q.sourceQuestion+(right?" · Correct":wrong?" · Wrong":" · Unattempted");b.onclick=()=>{index=i;render();$("question").scrollIntoView({behavior:"smooth",block:"start"})};grid.append(b)});host.append(grid)}
function render(){
 visible=filtered();$("count").textContent=visible.length;renderQuestionNavigator();
 if(!visible.length){current=null;$("qid").textContent="";$("question").textContent="No matching June 2026 questions. Change your search or filter.";$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=true;$("previous").disabled=true;$("bookmark").disabled=true;$("review").disabled=true;return}
 index=Math.min(index,visible.length-1);current=visible[index];answered=chosenAnswers.has(idOf(current));$("bookmark").disabled=false;$("review").disabled=false;$("qid").textContent="QUESTION "+current.sourceQuestion;renderQuestionContent(current);$("options").innerHTML="";$("feedback").hidden=true;$("verify").hidden=true;$("next").disabled=index===visible.length-1;$("previous").disabled=index===0;
 $("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark";$("review").textContent=reviewSet.has(idOf(current))?"★ Marked for Review":"☆ Mark for Review";
 current.options.forEach((opt,i)=>{const b=document.createElement("button");b.className="option";const lab=document.createElement("span");lab.className="letter";lab.textContent=String.fromCharCode(65+i)+".";b.append(lab);renderOptionContent(b,opt);b.onclick=()=>choose(i);$("options").append(b)});
 if(answered){const choice=chosenAnswers.get(idOf(current));[...$("options").children].forEach((b,i)=>{b.disabled=true;if(i===keyOf(current))b.classList.add("correct");else if(i===choice)b.classList.add("wrong")});showFeedback(choice)}updateStats();
}
function showFeedback(choice){const answer=keyOf(current),right=choice===answer,analysis=current.analysis||null;if(answer<0){$("feedback").innerHTML="<h3>Question flagged — no unique answer</h3><p>This question has been excluded from accuracy scoring because the available options do not support one defensible answer.</p>";if(analysis){const section=document.createElement("section");section.className="option-analysis";const heading=document.createElement("h4");heading.textContent="Analysis of all four options";section.append(heading);const status=document.createElement("p");status.className="analysis-status";status.textContent=analysis.status;section.append(status);const basis=document.createElement("p");basis.className="analysis-basis";basis.textContent=analysis.basis;section.append(basis);const list=document.createElement("ol");list.className="analysis-options";analysis.options.forEach((detail,i)=>{const item=document.createElement("li");const label=document.createElement("b");label.textContent=String.fromCharCode(65+i)+". ";item.append(label,document.createTextNode(detail));list.append(item)});section.append(list);(analysis.sources||[]).forEach(source=>{const a=document.createElement("a");a.href=source.url;a.target="_blank";a.rel="noopener";a.textContent=source.label+" ↗";section.append(a)});$("feedback").append(section)}$("feedback").hidden=false;$("verify").innerHTML="<small>This item is flagged for correction. No single answer is being scored.</small>";$("verify").hidden=false;return}const letter=String.fromCharCode(65+answer);$("feedback").innerHTML='<h3>'+(right?"Correct":"Review this one")+'</h3><p><b>Independently reviewed answer:</b> '+letter+'. '+escapeText(current.options[answer])+'</p><p>The answer analysis below distinguishes independently checked explanations from questions still awaiting verification.</p>';if(analysis){const section=document.createElement("section");section.className="option-analysis";const heading=document.createElement("h4");heading.textContent="Analysis of all four options";section.append(heading);const status=document.createElement("p");status.className="analysis-status";status.textContent=analysis.status;section.append(status);const basis=document.createElement("p");basis.className="analysis-basis";basis.textContent=analysis.basis;section.append(basis);const list=document.createElement("ol");list.className="analysis-options";analysis.options.forEach((detail,i)=>{const item=document.createElement("li");const label=document.createElement("b");label.textContent=String.fromCharCode(65+i)+". ";item.append(label,document.createTextNode(detail));list.append(item)});section.append(list);if(analysis.sources&&analysis.sources.length){const refs=document.createElement("div");refs.className="analysis-sources";const label=document.createElement("b");label.textContent="Sources to verify";refs.append(label);analysis.sources.forEach(source=>{const link=document.createElement("a");link.href=source.url;link.target="_blank";link.rel="noopener";link.textContent=source.label+" ↗";refs.append(link)});section.append(refs)}$("feedback").append(section)}$("feedback").hidden=false;$("verify").innerHTML='<b>Study and verify this question</b><a target="_blank" rel="noopener" href="'+google(current,"concept explanation")+'">Study this question and its related concept ↗</a><a target="_blank" rel="noopener" href="'+official(current)+'">Search official / academic sources ↗</a><small>Only answers explicitly marked independently verified have been checked against the listed references. The imported answer key is not treated as official NTA confirmation.</small>';$("verify").hidden=false}
function choose(choice){if(answered||!current)return;answered=true;chosenAnswers.set(idOf(current),choice);unattempted.delete(idOf(current));const right=keyOf(current)>=0&&choice===keyOf(current);if(right)correct++;if(keyOf(current)>=0&&!right)mistakes.add(idOf(current));save();[...$("options").children].forEach((b,i)=>{b.disabled=true;if(i===keyOf(current))b.classList.add("correct");else if(i===choice)b.classList.add("wrong")});showFeedback(choice);updateStats()}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("next").onclick=()=>{if(index<visible.length-1){if(current&&!chosenAnswers.has(idOf(current)))unattempted.add(idOf(current));index++;render()}};
$("previous").onclick=()=>{if(index>0){if(current&&!chosenAnswers.has(idOf(current)))unattempted.add(idOf(current));index--;render()}};
$("bookmark").onclick=()=>{if(!current)return;bookmarks.has(idOf(current))?bookmarks.delete(idOf(current)):bookmarks.add(idOf(current));save();$("bookmark").textContent=bookmarks.has(idOf(current))?"★ Bookmarked":"☆ Bookmark"};
$("review").onclick=()=>{if(!current)return;reviewSet.has(idOf(current))?reviewSet.delete(idOf(current)):reviewSet.add(idOf(current));$("review").textContent=reviewSet.has(idOf(current))?"★ Marked for Review":"☆ Mark for Review";updateStats()};
$("search").addEventListener("input",()=>{index=0;render()});$("mode").addEventListener("change",()=>{index=0;render();$("questionMenuToggle").textContent=$("mode").selectedOptions[0].textContent+" ▾"});$("questionMenuToggle").onclick=()=>{const panel=$("questionMenu"),open=panel.hidden;panel.hidden=!open;$("questionMenuToggle").setAttribute("aria-expanded",String(open))};
$("reset").onclick=()=>{if(!window.confirm("Start again? This will clear all answers, progress, wrong-answer history and review marks. Bookmarks will be kept."))return;chosenAnswers.clear();unattempted.clear();reviewSet.clear();mistakes.clear();correct=0;index=0;localStorage.removeItem("june26-mistakes");$("search").value="";$("mode").value="all";$("questionMenu").hidden=true;$("questionMenuToggle").textContent="All questions ▾";$("questionMenuToggle").setAttribute("aria-expanded","false");save();render()};
save();render();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));