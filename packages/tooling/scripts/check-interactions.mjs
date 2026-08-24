import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const failures=[];
const roots=["apps","packages/ui","packages/shared"];

function scan(path){
  for(const entry of readdirSync(path,{withFileTypes:true})){
    const target=join(path,entry.name);
    if(entry.isDirectory()) scan(target);
    else if([".tsx",".jsx"].includes(extname(entry.name))){
      const source=readFileSync(target,"utf8");
      if(source.includes('href="#"')) failures.push(`${target}: placeholder href`);
      if(/<Link\b[^>]*>[\s\S]*?<Button\b/.test(source)) failures.push(`${target}: nested interactive Link and Button`);
      if(target.endsWith("packages/ui/src/components/button.tsx") || target.endsWith("components/ui/button.tsx")) continue;
      for(const match of source.matchAll(/<Button\b([^>]*)>/g)){
        const attributes=match[1];
        if(!/\bonClick\s*=|\btype\s*=\s*["']submit["']/.test(attributes)) failures.push(`${target}: Button has no action`);
      }
      for(const match of source.matchAll(/<button\b([^>]*)>/g)){
        const attributes=match[1];
        if(!/\bonClick\s*=|\btype\s*=\s*["']submit["']/.test(attributes)) failures.push(`${target}: native button has no action`);
      }
    }
  }
}

for(const root of roots) scan(root);
if(failures.length){console.error(failures.join("\n"));process.exit(1);}
console.log("Interaction audit passed: no placeholder links, nested controls, or actionless buttons.");
