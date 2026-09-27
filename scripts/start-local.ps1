param([ValidateSet('mysql','postgresql')][string]$Stack='mysql',[switch]$Api,[switch]$ErrorServer)
$projectRoot=Split-Path $PSScriptRoot -Parent
$env:DKIP_STACK=$Stack
if($Stack -eq 'mysql'){$env:DKIP_CONNECTION='Server=127.0.0.1;Database=dkip2027_course;User ID=root;Password=;Character Set=utf8mb4';$port=5271;$project='examples/mysql/Dkip.WinForms.csproj'}else{$env:DKIP_CONNECTION='Host=127.0.0.1;Port=55437;Database=dkip2027_course;Username=postgres';$port=5272;$project='examples/postgresql/Dkip.Wpf.csproj'}
if($ErrorServer){if($Stack -eq 'mysql'){$env:DKIP_CONNECTION='Server=127.0.0.1;Port=1;User ID=demo;Database=dkip2027_course;Connection Timeout=1'}else{$env:DKIP_CONNECTION='Host=127.0.0.1;Port=1;Username=demo;Database=dkip2027_course;Timeout=1'};$port+=10;$Api=$true}
Set-Location -LiteralPath $projectRoot
if($Api){$host.UI.RawUI.WindowTitle="DKIP2027 API $Stack";dotnet run --project examples/Api --no-build --urls "http://127.0.0.1:$port"}else{dotnet run --project $project --no-build}

