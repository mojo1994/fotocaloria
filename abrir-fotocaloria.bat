@echo off
chcp 65001 >nul
title FotoCaloria
cd /d "%~dp0"

echo ============================================
echo             FotoCaloria
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org e tente de novo.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado. Reinstale o Node.js e tente de novo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Primeira execucao: instalando dependencias...
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
  echo.
)

echo Abrindo o FotoCaloria no navegador em alguns segundos...
echo (Para parar o servidor, feche esta janela ou pressione Ctrl+C.)
echo.
start "" /b cmd /c "timeout /t 6 /nobreak >nul & start "" http://localhost:3000"

call npm run dev

echo.
echo O servidor foi encerrado.
pause
