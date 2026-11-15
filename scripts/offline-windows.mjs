import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const config = `<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="Пакеты из архива" value="nuget-packages" />
  </packageSources>
  <config>
    <add key="globalPackagesFolder" value=".nuget/packages" />
  </config>
</configuration>
`;

export function publishExample(project, folder) {
  execFileSync('dotnet', ['publish', project, '-c', 'Release', '--self-contained', 'false',
    '--nologo', '-o', folder], {stdio: 'inherit'});
  if (!fs.existsSync(`${folder}/${path.basename(project, '.csproj')}.exe`)) {
    throw new Error(`Не найден EXE для ${project}`);
  }
}

export async function offlinePackages() {
  const assets = JSON.parse(fs.readFileSync('examples/Shared/obj/project.assets.json', 'utf8'));
  const files = {'NuGet.Config': config};
  for (const {type, path: packagePath, files: contents} of Object.values(assets.libraries)) {
    if (type !== 'package') continue;
    const file = contents.find(name => name.endsWith('.nupkg.sha512')).slice(0, -7);
    const candidates = Object.keys(assets.packageFolders).map(root => path.join(root, packagePath, file));
    const source = candidates.find(candidate => fs.existsSync(candidate));
    if (!source) throw new Error(`Не найден оригинальный файл пакета ${file}`);
    files[`nuget-packages/${file}`] = fs.readFileSync(source);
  }
  for (const name of ['microsoft.extensions.logging.abstractions', 'microsoft.extensions.dependencyinjection.abstractions']) {
    const file = `${name}.9.0.0.nupkg`;
    const url = `https://api.nuget.org/v3-flatcontainer/${name}/9.0.0/${file}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(60_000)});
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    files[`nuget-packages/${file}`] = Buffer.from(await response.arrayBuffer());
  }
  return files;
}
