const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
// strip script/style bodies and comments
let s=html.replace(/<script[\s\S]*?<\/script>/g, m=>"<script></script>".padEnd(m.length," "))
          .replace(/<style[\s\S]*?<\/style>/g, m=>"<style></style>".padEnd(m.length," "))
          .replace(/<!--[\s\S]*?-->/g, m=>" ".repeat(m.length));
const VOID=new Set(["meta","link","input","br","hr","img","use","path","circle","ellipse","rect","polygon","line","text","source","wbr"]);
const re=/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
const stack=[]; let m, errors=0;
function line(i){ return s.slice(0,i).split("\n").length; }
while((m=re.exec(s))){
  const close=m[1]==="/", tag=m[2].toLowerCase(), self=m[4]==="/";
  if(!close){
    if(self||VOID.has(tag)) continue;
    stack.push({tag, line: line(m.index)});
  } else {
    if(VOID.has(tag)) continue;
    const top=stack[stack.length-1];
    if(!top){ console.log("stray close </"+tag+"> at line", line(m.index)); errors++; continue; }
    if(top.tag!==tag){
      // find nearest matching
      let j=stack.length-1; while(j>=0 && stack[j].tag!==tag) j--;
      if(j<0){ console.log("close </"+tag+"> without open at line", line(m.index), "(top is <"+top.tag+"> from line "+top.line+")"); errors++; continue; }
      for(let k=stack.length-1;k>j;k--) { console.log("unclosed <"+stack[k].tag+"> opened at line", stack[k].line, "closed implicitly by </"+tag+"> at line", line(m.index)); errors++; }
      stack.length=j;
    } else stack.pop();
  }
}
for(const t of stack){ console.log("never closed <"+t.tag+"> from line", t.line); errors++; }
console.log("errors:", errors);
