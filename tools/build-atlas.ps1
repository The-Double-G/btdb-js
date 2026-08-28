# Rebuilds atlas pages and the runtime manifest from all root PNG assets.
# Usage from the repo root:
#   powershell -ExecutionPolicy Bypass -File .\tools\build-atlas.ps1

param(
    [string]$SourceDir = (Resolve-Path (Join-Path $PSScriptRoot "..\assets-src")).Path,
    [string]$OutputDir = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "generated"),
    [int]$PageSize = 4096,
    [int]$Padding = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-AtlasPage {
    param(
        [int]$Index
    )

    return [pscustomobject]@{
        Index = $Index
        CursorX = 0
        CursorY = 0
        RowHeight = 0
        UsedWidth = 0
        UsedHeight = 0
        Sprites = New-Object System.Collections.Generic.List[object]
    }
}

function ConvertTo-ManifestJson {
    param(
        [object]$Manifest
    )

    return ($Manifest | ConvertTo-Json -Depth 8 -Compress)
}

$sourceFiles = Get-ChildItem -Path $SourceDir -File -Filter *.png | Sort-Object Name
if($sourceFiles.Count -eq 0) {
    throw "No PNG assets were found in $SourceDir"
}

$sprites = foreach($file in $sourceFiles) {
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        [pscustomobject]@{
            Name = $file.Name
            FullName = $file.FullName
            Width = $image.Width
            Height = $image.Height
            Atlas = -1
            X = 0
            Y = 0
        }
    } finally {
        $image.Dispose()
    }
}

$sortedSprites = $sprites | Sort-Object @{ Expression = "Height"; Descending = $true }, @{ Expression = "Width"; Descending = $true }, Name

$pages = New-Object System.Collections.Generic.List[object]
$currentPage = New-AtlasPage -Index 0
$pages.Add($currentPage)

foreach($sprite in $sortedSprites) {
    $requiredWidth = $sprite.Width + ($Padding * 2)
    $requiredHeight = $sprite.Height + ($Padding * 2)

    if($requiredWidth -gt $PageSize -or $requiredHeight -gt $PageSize) {
        throw "Sprite $($sprite.Name) is too large for a ${PageSize}x${PageSize} atlas page."
    }

    if($currentPage.CursorX + $requiredWidth -gt $PageSize) {
        $currentPage.CursorX = 0
        $currentPage.CursorY += $currentPage.RowHeight
        $currentPage.RowHeight = 0
    }

    if($currentPage.CursorY + $requiredHeight -gt $PageSize) {
        $currentPage = New-AtlasPage -Index $pages.Count
        $pages.Add($currentPage)
    }

    $sprite.Atlas = $currentPage.Index
    $sprite.X = $currentPage.CursorX + $Padding
    $sprite.Y = $currentPage.CursorY + $Padding

    $null = $currentPage.Sprites.Add($sprite)

    $currentPage.CursorX += $requiredWidth
    if($requiredHeight -gt $currentPage.RowHeight) {
        $currentPage.RowHeight = $requiredHeight
    }
    $rightEdge = $sprite.X + $sprite.Width
    $bottomEdge = $sprite.Y + $sprite.Height
    if($rightEdge -gt $currentPage.UsedWidth) {
        $currentPage.UsedWidth = $rightEdge
    }
    if($bottomEdge -gt $currentPage.UsedHeight) {
        $currentPage.UsedHeight = $bottomEdge
    }
}

if(-not (Test-Path -Path $OutputDir)) {
    New-Item -Path $OutputDir -ItemType Directory | Out-Null
}

Get-ChildItem -Path $OutputDir -File -Filter "atlas-*.png" -ErrorAction SilentlyContinue | Remove-Item

$atlasManifest = New-Object System.Collections.Generic.List[object]

foreach($page in $pages) {
    $bitmapWidth = [Math]::Max(1, [int]$page.UsedWidth)
    $bitmapHeight = [Math]::Max(1, [int]$page.UsedHeight)
    $atlasFileName = "atlas-$($page.Index).png"
    $atlasPath = Join-Path $OutputDir $atlasFileName

    $bitmap = New-Object System.Drawing.Bitmap $bitmapWidth, $bitmapHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None

        foreach($sprite in $page.Sprites) {
            $spriteImage = [System.Drawing.Image]::FromFile($sprite.FullName)
            try {
                $graphics.DrawImage($spriteImage, $sprite.X, $sprite.Y, $sprite.Width, $sprite.Height)
            } finally {
                $spriteImage.Dispose()
            }
        }

        $bitmap.Save($atlasPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }

    $null = $atlasManifest.Add([ordered]@{
        src = "generated/$atlasFileName"
        width = $bitmapWidth
        height = $bitmapHeight
    })
}

$spriteManifest = [ordered]@{}
foreach($sprite in $sprites | Sort-Object Name) {
    $spriteManifest[$sprite.Name] = [ordered]@{
        atlas = $sprite.Atlas
        x = [int]$sprite.X
        y = [int]$sprite.Y
        width = [int]$sprite.Width
        height = [int]$sprite.Height
    }
}

$manifest = [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    pageSize = $PageSize
    padding = $Padding
    atlases = $atlasManifest
    sprites = $spriteManifest
}

$manifestPath = Join-Path $OutputDir "asset-manifest.js"
$manifestJson = ConvertTo-ManifestJson -Manifest $manifest
$manifestJs = "window.ASSET_ATLAS_MANIFEST = $manifestJson;"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($manifestPath, $manifestJs, $utf8NoBom)

Write-Host "Built $($pages.Count) atlas page(s) for $($sprites.Count) sprites."
Write-Host "Manifest: $manifestPath"
