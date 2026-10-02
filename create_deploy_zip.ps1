Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = Join-Path $PSScriptRoot "deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$distDir = (Join-Path $PSScriptRoot "frontend\dist\")

Get-ChildItem -Path $distDir -Recurse -File | ForEach-Object {
    $fullPath = $_.FullName
    $relPath = $fullPath.Substring($distDir.Length).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $fullPath, $relPath)
}

$zip.Dispose()

Write-Host "Created deploy.zip successfully!"
$verify = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
foreach ($entry in $verify.Entries) {
    Write-Host "  Entry: $($entry.FullName)"
}
$verify.Dispose()
