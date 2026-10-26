/** Project tooling for package release. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
const entries=[];
function visit(dir,prefix=''){
 for(const name of fs.readdirSync(dir).sort()){
  const full=path.join(dir,name),relative=prefix+name,stat=fs.lstatSync(full);
  if(stat.isSymbolicLink())throw Error('Release assets must not be symbolic links');
  if(stat.isDirectory())visit(full,relative+'/');else entries.push({name:relative,data:fs.readFileSync(full)});
 }
}
visit('dist');
entries.push({name:'VERSION',data:Buffer.from(version+'\n')});
for(const [name,source] of [['USER-GUIDE.md','docs/USER-GUIDE.md'],['DEVELOPMENT.md','docs/DEVELOPMENT.md'],['LICENSE','LICENSE']])if(fs.existsSync(source))entries.push({name,data:fs.readFileSync(source)});
const crc32=data=>{let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
const local=[],central=[];let offset=0;
for(const {name,data} of entries){
 if(/(?:\.tkn|node_modules|\.cache|ai-logs|tests\/)/.test(name))throw Error('Disallowed archive entry');
 const filename=Buffer.from(name),crc=crc32(data),header=Buffer.alloc(30),record=Buffer.alloc(46);
 header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
 record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(33,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(data.length,20);record.writeUInt32LE(data.length,24);record.writeUInt16LE(filename.length,28);record.writeUInt32LE(offset,42);
 local.push(header,filename,data);central.push(record,filename);offset+=header.length+filename.length+data.length;
}
const index=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(index.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...local,index,end]),destination='artifacts/releases/tetris.zip';fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,zip);fs.writeFileSync(destination+'.sha256',createHash('sha256').update(zip).digest('hex')+'  '+path.basename(destination)+'\n');console.log(destination,entries.length,'entries',zip.length,'bytes');
