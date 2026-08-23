Get-ChildItem -Path 'src\\components\\tools' -Filter *.tsx | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    if ($content -match '<UtilityShell>') {
        Write-Host "Skipping $($_.Name)"
        return
    }
    # Insert opening UtilityShell after first return (
    $new = $content -replace 'return\s*\(','return (`n    <UtilityShell>`n      '
    # Insert closing UtilityShell before final );
    $new = $new -replace '\)\;\s*$','`n    </UtilityShell>`n  );'
    Set-Content -Path $file -Value $new -Encoding utf8
    Write-Host "Migrated $($_.Name)"
}