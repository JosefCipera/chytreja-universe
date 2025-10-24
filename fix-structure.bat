@echo off
setlocal enabledelayedexpansion
echo.
echo =====================================================
echo   🧩  CHYTRÉ JÁ – FIX STRUKTURY PROJEKTU
echo =====================================================
echo.

REM --- Nastavení cest ---
set ROOT_ASSETS=%cd%\assets
set PUBLIC_ASSETS=%cd%\public\assets
set BACKUP_DIR=%cd%\_backup_assets_%DATE:~-4,4%%DATE:~3,2%%DATE:~0,2%

REM --- Záloha staré složky assets v rootu, pokud existuje ---
if exist "%ROOT_ASSETS%" (
    echo 📦  Zálohuji staré root\assets do "%BACKUP_DIR%"
    mkdir "%BACKUP_DIR%"
    xcopy "%ROOT_ASSETS%" "%BACKUP_DIR%\" /E /I /Y >nul
)

REM --- Vytvoření cílových složek ---
echo 🏗️  Kontrola složky public\assets
if not exist "%PUBLIC_ASSETS%" mkdir "%PUBLIC_ASSETS%"

REM --- Přesun obsahu, pokud chybí ---
echo 🚚  Kopíruji potřebné soubory do public\assets ...
for %%F in (css js models docs media) do (
    if exist "%ROOT_ASSETS%\%%F" (
        echo    → %%F
        xcopy "%ROOT_ASSETS%\%%F" "%PUBLIC_ASSETS%\%%F\" /E /I /Y >nul
    )
)

REM --- (Volitelně) odstranění staré složky ---
echo 🧹  Odstraňuji starou složku root\assets ...
rmdir /S /Q "%ROOT_ASSETS%"

echo.
echo ✅  Hotovo! Všechny zdroje jsou nyní v public\assets.
echo    Záloha je uložena v: %BACKUP_DIR%
echo =====================================================
pause
