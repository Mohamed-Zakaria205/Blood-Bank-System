Get-ChildItem -Path 'D:\Graduation!!!\Blood-Bank-System\src\app\components' -Recurse -Include '*.tsx','*.ts' | ForEach-Object {
    $file = $_
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Card/surface containers
    $content = $content -replace '(?<!\w)bg-white(?!\w)', 'bg-card'
    
    # Background patterns  
    $content = $content -replace '(?<!\w)bg-gray-50(?!\w)', 'bg-muted/40'
    $content = $content -replace '(?<!\w)bg-gray-100(?!\w)', 'bg-muted'
    $content = $content -replace '(?<!\w)bg-gray-200(?!\w)', 'bg-muted'
    
    # Text colors
    $content = $content -replace '(?<!\w)text-gray-900(?!\w)', 'text-foreground'
    $content = $content -replace '(?<!\w)text-gray-800(?!\w)', 'text-foreground'
    $content = $content -replace '(?<!\w)text-gray-700(?!\w)', 'text-foreground'
    $content = $content -replace '(?<!\w)text-gray-600(?!\w)', 'text-muted-foreground'
    $content = $content -replace '(?<!\w)text-gray-500(?!\w)', 'text-muted-foreground'
    $content = $content -replace '(?<!\w)text-gray-400(?!\w)', 'text-muted-foreground'
    $content = $content -replace '(?<!\w)text-gray-300(?!\w)', 'text-muted-foreground/50'
    
    # Border colors
    $content = $content -replace '(?<!\w)border-gray-50(?!\w)', 'border-border'
    $content = $content -replace '(?<!\w)border-gray-100(?!\w)', 'border-border'
    $content = $content -replace '(?<!\w)border-gray-200(?!\w)', 'border-border'
    $content = $content -replace '(?<!\w)border-gray-300(?!\w)', 'border-border'
    
    # Divide colors
    $content = $content -replace '(?<!\w)divide-gray-50(?!\w)', 'divide-border'
    $content = $content -replace '(?<!\w)divide-gray-100(?!\w)', 'divide-border'
    $content = $content -replace '(?<!\w)divide-gray-200(?!\w)', 'divide-border'
    
    # Hover states
    $content = $content -replace '(?<!\w)hover:bg-gray-50(?!\w)', 'hover:bg-accent/40'
    $content = $content -replace '(?<!\w)hover:bg-gray-100(?!\w)', 'hover:bg-accent'
    $content = $content -replace '(?<!\w)hover:bg-white(?!\w)', 'hover:bg-card'
    $content = $content -replace '(?<!\w)hover:text-gray-900(?!\w)', 'hover:text-foreground'
    $content = $content -replace '(?<!\w)hover:text-gray-700(?!\w)', 'hover:text-foreground'

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host ('Updated: ' + $file.Name)
    }
}
Write-Host 'DONE'
