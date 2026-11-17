import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url)),target=fileURLToPath(new URL('../../play/cartrev-towers/',import.meta.url));
await mkdir(target+'assets',{recursive:true});
for(const file of await readdir(root+'dist/assets'))await copyFile(root+'dist/assets/'+file,target+'assets/'+file);
await writeFile(target+'index.html',(await readFile(root+'dist/index.html','utf8')).replace(/\r\n?/g,'\n'));
console.log('Updated only play/cartrev-towers; existing hashed assets retained for cached pages.');
