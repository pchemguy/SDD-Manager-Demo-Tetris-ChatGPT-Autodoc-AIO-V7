/** Retain the exact installed production-dependency licenses with every static release. */
import fs from 'node:fs';
import path from 'node:path';
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const notices=['# Third-party notices\n\nThe static application includes the following pinned production dependencies. SQLite itself is in the public domain.\n'];
for(const [directory,entry] of Object.entries(lock.packages)){
 if(!directory||entry.dev)continue;
 const pkg=JSON.parse(fs.readFileSync(path.join(directory,'package.json'),'utf8'));
 const license=['LICENSE','license','LICENSE.md','LICENSE.txt'].find(name=>fs.existsSync(path.join(directory,name)));
 if(!license)throw Error('Missing license for '+pkg.name);
 notices.push(`## ${pkg.name} ${pkg.version}\n\n`+fs.readFileSync(path.join(directory,license),'utf8').trim()+'\n');
}
fs.writeFileSync('dist/THIRD-PARTY-NOTICES.md',notices.join('\n'));
