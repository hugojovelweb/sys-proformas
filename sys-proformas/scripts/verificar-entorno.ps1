# Verifica (sin instalar nada) que Windows tenga lo necesario. Ejecutar en PowerShell.
$falta = $false
foreach ($c in @(@{n='Git';c='git'}, @{n='Node.js';c='node'}, @{n='npm';c='npm.cmd'})) {
  $cmd = Get-Command $c.c -ErrorAction SilentlyContinue
  if ($cmd) { Write-Host ("[OK]    {0}: {1}" -f $c.n, (& $c.c --version)) }
  else { Write-Host ("[FALTA] {0}" -f $c.n); $falta = $true }
}
if (Get-Command node -ErrorAction SilentlyContinue) {
  $mayor = [int](node -p "process.versions.node.split('.')[0]")
  if ($mayor -lt 20) { Write-Host "[FALTA] Node.js >= 20 requerido (tienes $mayor)"; $falta = $true }
}
if ($falta) { exit 1 } else { Write-Host "Entorno listo." }
