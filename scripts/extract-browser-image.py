import json,hashlib,urllib.request,tarfile,shutil,os
from pathlib import Path,PurePosixPath
base=Path(__file__).resolve().parents[1]
# Linux recovery only; supply the verified manifest as documented.
info=json.loads((base/'.cache/browser-image/manifest.json').read_text())
history=[h for h in info['config']['history'] if not h.get('empty_layer')]
layers=info['manifest']['layers']
assert len(history)==len(layers)
selected=[(h,l) for h,l in zip(history,layers) if 'playwright-core install chromium &&' in h.get('created_by','')]
assert len(selected)==1
layer=selected[0][1];folder=base/'.cache/browser-image';folder.mkdir(exist_ok=True)
archive=folder/'chromium-layer.tar.gz';digest=hashlib.sha256();size=0
request=urllib.request.Request('https://mcr.microsoft.com/v2/playwright/blobs/'+layer['digest'])
with urllib.request.urlopen(request,timeout=30) as response,archive.open('wb') as out:
    while data:=response.read(1024*1024):out.write(data);digest.update(data);size+=len(data)
assert size==layer['size'],(size,layer['size'])
assert 'sha256:'+digest.hexdigest()==layer['digest']
print('Official layer size and SHA-256 verified:',size,layer['digest'],flush=True)
stage=folder/'stage';stage.mkdir(exist_ok=True)
prefixes=['ms-playwright/chromium_headless_shell-1248','ms-playwright/ffmpeg-1013']
with tarfile.open(archive,'r:gz') as tar:
    members=[]
    for member in tar.getmembers():
        name=member.name.removeprefix('./')
        if not any(name==p or name.startswith(p+'/') for p in prefixes):continue
        assert not member.isdev() and not member.isfifo()
        assert not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts
        if member.issym() or member.islnk():
            target=os.path.normpath(os.path.join(os.path.dirname(name),member.linkname)) if member.issym() else os.path.normpath(member.linkname)
            assert any(target==p or target.startswith(p+'/') for p in prefixes),(name,target)
        assert not Path(name).name.startswith('.wh.'),'Unexpected whiteout in initial browser layer'
        members.append(member)
    assert members
    tar.extractall(stage,members=members,filter='data')
cache=base/'.cache/pw-browsers'
for prefix in prefixes:
    source=stage/prefix;assert source.is_dir()
    target=cache/Path(prefix).name;assert not target.exists()
    shutil.move(source,target)
print('Extracted only matching managed headless shell and FFmpeg; no host libraries or other browsers changed.',flush=True)
(folder/'provenance.json').write_text(json.dumps({'image':'mcr.microsoft.com/playwright:v1.64.1-noble','platformDigest':info['platformDigest'],'layer':layer,'extracted':prefixes},indent=2)+'\n')
