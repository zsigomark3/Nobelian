# Cursor postToolUse hook: record touched paths and remind the agent to review for unnecessary code.
# stdin: Cursor postToolUse JSON

$ErrorActionPreference = 'Continue'
$stdin = [Console]::In.ReadToEnd()

if (-not $stdin.Trim()) {
  '{}'
  exit 0
}

try {
  $ev = $stdin | ConvertFrom-Json
}
catch {
  '{}'
  exit 0
}

$toolName = [string]$ev.tool_name

# Only edits that typically write tracked source files — extend if your Composer uses another name.
$touchedEditors = @('Write', 'StrReplace', 'ApplyPatch', 'search_replace', 'Edit', 'WriteFile', 'MultiEdit')

if (-not ($touchedEditors -contains $toolName)) {
  '{}'
  exit 0
}

$touchedSet = New-Object 'System.Collections.Generic.HashSet[string]'

$cwd = if ($null -ne $ev.cwd -and [string]::IsNullOrWhiteSpace([string]$ev.cwd) -eq $false) {
  [string]$ev.cwd
}
else {
  (Get-Location).Path
}

function Add-Touched([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return }
  $norm = ($p.Trim() -replace '/', [IO.Path]::DirectorySeparatorChar)
  if (-not ([IO.Path]::IsPathRooted($norm))) {
    $norm = [IO.Path]::GetFullPath((Join-Path $cwd $norm))
  }
  else {
    try { $norm = [IO.Path]::GetFullPath($norm) }
    catch { return }
  }
  if (-not (Test-Path -LiteralPath $norm -PathType Leaf)) {
    # Tool may succeed before filesystem is visible — still push path for checklist
    [void]$touchedSet.Add($norm)
    return
  }
  # Only track plausible source files (avoid bloating logs for binaries)
  $ext = [IO.Path]::GetExtension($norm).ToLowerInvariant()
  $interesting = '.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.htm','.css','.scss','.json','.md','.vue','.svelte','.ps1','.sh','.rs','.py'

  if (($interesting -contains $ext) -or ([string]::IsNullOrEmpty($ext))) {
    [void]$touchedSet.Add($norm)
  }
}

function Walk-CollectPaths([object]$node) {
  if ($null -eq $node) { return }
  if ($node -is [string]) { return }

  if ($node -is [Collections.IDictionary]) {
    foreach ($ent in $node.GetEnumerator()) {
      $n = [string]$ent.Key
      $v = $ent.Value
      if ($n -in @('path', 'file_path', 'filename', 'relative_workspace_path', 'target_file', 'filePath')) {
        if ($v -is [string]) { Add-Touched $v }
      }
      elseif ($null -ne $v) { Walk-CollectPaths $v }
    }
    return
  }

  if ($node.PSObject -and ($node.PSObject.Properties.Count -gt 0)) {
    foreach ($kv in ($node.psobject.Properties)) {
      $n = [string]$kv.Name
      $v = $kv.Value
      if ($n -in @('path', 'file_path', 'filename', 'relative_workspace_path', 'target_file', 'filePath')) {
        if ($v -is [string]) { Add-Touched $v }
      }
      elseif ($null -ne $v) { Walk-CollectPaths $v }
    }
    return
  }

  foreach ($item in @($node)) { Walk-CollectPaths $item }
}

$tinput = $ev.tool_input
if ($tinput -is [string]) {
  try { $tinput = $tinput | ConvertFrom-Json } catch {}
}
Walk-CollectPaths $tinput

$outputStr = ''
if (-not [string]::IsNullOrWhiteSpace([string]$ev.tool_output)) {
  $outputStr = [string]$ev.tool_output
}
if ($outputStr) {
  try {
    Walk-CollectPaths (($outputStr | ConvertFrom-Json))
  }
  catch {}
}

if ($touchedSet.Count -eq 0) {
  '{}'
  exit 0
}

$listPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'agent-touched-files.txt'

$existing = New-Object System.Collections.Generic.HashSet[string]
if (Test-Path -LiteralPath $listPath) {
  foreach ($ln in Get-Content -LiteralPath $listPath) {
    if (-not [string]::IsNullOrWhiteSpace($ln)) { [void]$existing.Add($ln.Trim()) }
  }
}

foreach ($p in $touchedSet) {
  [void]$existing.Add($p)
}

$dir = Split-Path $listPath -Parent
if (-not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$existing | Sort-Object | Set-Content -LiteralPath $listPath -Encoding utf8

$pathsArr = foreach ($x in $touchedSet) { $x }
$sample = (($pathsArr | Select-Object -First 6) -join "`n• ")
$fileWord = if ($touchedSet.Count -eq 1) { 'file' } else { 'files' }

$msg = @"
**Post-edit review (automated)** — Before continuing, explicitly re-open and scan the touched $fileWord for needless surface area:

**Checklist ($($touchedSet.Count) path(s)):**
1. **`function`/methods/hooks/handlers/helpers** added or changed → confirm each call site exists or intent is justified; inline or merge if duplication is gratuitous.
2. **Exported / public-ish symbols** (`export`, `global`, reused module boundaries) → reduce unneeded APIs.
3. **Dead branches** (`if (false)`, stale feature flags), **comment-only churn**, **`console`/debug remnants** tied to discarded paths.
4. If you intentionally left a helper unused for the next PR, say **why** briefly in the assistant reply—otherwise delete it **now**.
5. Re-run a quick **`rg`/search** across the touched $fileWord for symbols you renamed or removed — no dangling refs.

Representative paths (first few):
• $sample
"@

@{ additional_context = $msg } | ConvertTo-Json -Compress
exit 0
