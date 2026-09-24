@echo off
echo Starting Portal Administrasi Guru Tahunan...
echo.
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo Gagal menjalankan server. Pastikan npm install sudah dijalankan.
    pause
)
