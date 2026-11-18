Add-Type -AssemblyName System.Drawing

function Draw-UniHubIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable = $false,
        [bool]$isApple = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#6a4cff')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#5433e8')
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 45.0)

    if ($isMaskable -or $isApple) {
        $g.FillRectangle($brush, 0, 0, $size, $size)
    } else {
        $radius = [int]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $size - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($brush, $path)
        $path.Dispose()
    }
    $brush.Dispose()

    # Scale factor for cap
    $scale = if ($isMaskable) { $size * 0.58 / 32.0 } else { $size * 0.66 / 32.0 }
    $offsetX = ($size - (32 * $scale)) / 2.0
    $offsetY = ($size - (32 * $scale)) / 2.0

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    # 1. Top diamond
    $capPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diamondPts = @(
        (New-Object System.Drawing.PointF ($offsetX + 16.0 * $scale), ($offsetY + 7.0 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 26.5 * $scale), ($offsetY + 12.0 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 16.0 * $scale), ($offsetY + 17.0 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 5.5 * $scale), ($offsetY + 12.0 * $scale))
    )
    $capPath.AddPolygon($diamondPts)
    $g.FillPath($whiteBrush, $capPath)
    $capPath.Dispose()

    # 2. Bottom skullcap / neck
    $neckPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $neckPts = @(
        (New-Object System.Drawing.PointF ($offsetX + 9.5 * $scale), ($offsetY + 14.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 16.0 * $scale), ($offsetY + 17.8 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 22.5 * $scale), ($offsetY + 14.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 22.5 * $scale), ($offsetY + 19.5 * $scale))
    )
    $neckPath.AddLines($neckPts)
    $curvePts = @(
        (New-Object System.Drawing.PointF ($offsetX + 22.5 * $scale), ($offsetY + 19.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 19.5 * $scale), ($offsetY + 22.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 16.0 * $scale), ($offsetY + 23.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 12.5 * $scale), ($offsetY + 22.5 * $scale)),
        (New-Object System.Drawing.PointF ($offsetX + 9.5 * $scale), ($offsetY + 19.5 * $scale))
    )
    $neckPath.AddCurve($curvePts)
    $neckPath.CloseFigure()
    $g.FillPath($whiteBrush, $neckPath)
    $neckPath.Dispose()

    # 3. Tassel
    $tasselPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float]($scale * 1.2))
    $tasselPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $tasselPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($tasselPen, [float]($offsetX + 25.5 * $scale), [float]($offsetY + 12.5 * $scale), [float]($offsetX + 26.8 * $scale), [float]($offsetY + 18.5 * $scale))
    $g.FillEllipse($whiteBrush, [float]($offsetX + 26.0 * $scale), [float]($offsetY + 18.0 * $scale), [float]($scale * 1.6), [float]($scale * 2.5))
    $tasselPen.Dispose()

    $whiteBrush.Dispose()
    $g.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated $outputPath"
}

Draw-UniHubIcon -size 192 -outputPath "public\pwa-192x192.png"
Draw-UniHubIcon -size 512 -outputPath "public\pwa-512x512.png"
Draw-UniHubIcon -size 512 -outputPath "public\maskable-icon-512x512.png" -isMaskable $true
Draw-UniHubIcon -size 180 -outputPath "public\apple-touch-icon.png" -isApple $true
