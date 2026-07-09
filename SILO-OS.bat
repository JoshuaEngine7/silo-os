@echo off
rem ============================================================
rem  SILO-OS - lanzador de un clic (Windows)
rem  Doble clic para abrir la demo. Para apagar: cierra la
rem  ventanita minimizada llamada "SILO-OS (server)".
rem ============================================================
title SILO-OS
cd /d "%~dp0"

rem --- localizar Python (python o el lanzador py) ---
where python >nul 2>nul && (set "PY=python") || (set "PY=py")

rem --- arrancar el servidor local, minimizado ---
start "SILO-OS (server)" /min cmd /c "%PY% -m http.server 8137"

rem --- darle un instante a que levante ---
ping -n 2 127.0.0.1 >nul

rem --- abrir en modo app (ventana limpia) si hay Edge; si no, navegador por defecto ---
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --app="http://localhost:8137/index.html"
) else (
  start "" "http://localhost:8137/index.html"
)

exit
