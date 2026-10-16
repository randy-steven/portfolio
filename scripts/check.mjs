import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(dir){let list=[];for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())list.push(...await walk(file));else list.push(file)}return list}
const files=await walk(root),errors=[];let links=0;
for(const file of files){if(file.endsWith('.html')){const html=await readFile(file,'utf8');if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push('Expected one h1: '+file);if(/概念示例|待替换|联系方式待补充|原创概念/.test(html))errors.push('Placeholder: '+file);for(const match of html.matchAll(/(?:src|href|data-hls)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){const target=path.join(root,decodeURIComponent(match[1]));try{const info=await stat(target);if(info.isDirectory())await stat(path.join(target,'index.html'));links++}catch{errors.push('Missing '+match[1]+' in '+file)}}}if(file.endsWith('.m3u8'))for(const segment of (await readFile(file,'utf8')).split(/\r?\n/).filter(line=>line&&!line.startsWith('#'))){try{await stat(path.join(path.dirname(file),segment))}catch{errors.push('Missing HLS segment '+segment)}}if((await stat(file)).size>25*1024*1024)errors.push('Asset exceeds 25 MiB: '+file)}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`${files.length} deployment files; ${links} local references verified; no placeholders or oversized assets.`);
