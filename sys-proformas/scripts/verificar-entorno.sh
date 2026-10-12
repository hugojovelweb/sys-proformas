#!/usr/bin/env bash
# Verifica (sin instalar nada) que el entorno Debian/Linux tenga lo necesario.
set -u
ok=0
revisar() { # nombre, comando, versión mínima mayor (opcional)
  if command -v "$2" >/dev/null 2>&1; then
    echo "[OK]   $1: $($2 --version 2>&1 | head -n1)"
  else
    echo "[FALTA] $1 (comando '$2' no encontrado)"; ok=1
  fi
}
revisar "Git" git
revisar "Node.js" node
revisar "npm" npm
if command -v node >/dev/null 2>&1; then
  mayor=$(node -p "process.versions.node.split('.')[0]")
  if [ "$mayor" -lt 20 ]; then echo "[FALTA] Node.js >= 20 requerido (tienes $mayor)"; ok=1; fi
fi
[ -f /etc/os-release ] && . /etc/os-release && echo "[INFO] Sistema: ${PRETTY_NAME:-desconocido}"
exit $ok
