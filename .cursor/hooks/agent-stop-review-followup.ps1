# Cursor stop hook — one follow-up sweep for unnecessary code when files were edited this turn.

$ErrorActionPreference = 'Continue'
$raw = [Console]::In.ReadToEnd()

if (-not $raw.Trim()) {
  '{}'
  exit 0
}

try {
  $ev = $raw | ConvertFrom-Json
}
catch {
  '{}'
  exit 0
}

$listPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'agent-touched-files.txt'

function Clear-TouchedLog([string]$path) {
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
  }
}

try { $loop = [int]$ev.loop_count } catch { $loop = 0 }

if ($loop -gt 0) {
  Clear-TouchedLog $listPath
  '{}'
  exit 0
}

if (-not (Test-Path -LiteralPath $listPath)) {
  '{}'
  exit 0
}

$paths =
  @(Get-Content -LiteralPath $listPath |
    ForEach-Object { $_.Trim() } |
    Where-Object { $_ })

Clear-TouchedLog $listPath

if ($paths.Count -eq 0) {
  '{}'
  exit 0
}

$uniq = @($paths | Sort-Object -Unique)

$bullets = ($uniq | ForEach-Object { "`n- $_" }) -join ''

$msg =
@"


**Mandatory review pass** - You modified $($uniq.Count) tracked file(s). Before closing the turn:

1. Re-read each path and remove or justify surplus functions, helpers, wrappers, and dead exports you introduced.
2. For each helper: say where it is used (keep), or delete it now, or reply with defer: and a brief reason.
3. No new features in this pass unless required to delete dead code.

Paths to verify:$bullets


"@

@{ followup_message = $msg.Trim() } | ConvertTo-Json -Compress
exit 0
