@echo off
echo ========================================
echo    PUSH CODE LEN GITHUB
echo ========================================
echo.

echo Buoc 1: Nhap ten repository cua ban
set /p REPO_NAME="Ten repository (vi du: pro-chess): "

echo.
echo Buoc 2: Nhap username GitHub cua ban
set /p USERNAME="GitHub username (vi du: Phuc0705): "

echo.
echo ========================================
echo Dang push code len GitHub...
echo Repository: %USERNAME%/%REPO_NAME%
echo ========================================
echo.

REM Kiem tra xem da co remote chua
git remote -v >nul 2>&1
if %errorlevel% == 0 (
    echo Da co remote repository. Xoa remote cu...
    git remote remove origin
)

REM Add remote
echo Dang them remote repository...
git remote add origin https://github.com/%USERNAME%/%REPO_NAME%.git

REM Rename branch to main
echo Dang doi ten branch sang main...
git branch -M main

REM Push code
echo Dang push code len GitHub...
git push -u origin main

echo.
echo ========================================
if %errorlevel% == 0 (
    echo SUCCESS! Code da duoc push len GitHub!
    echo.
    echo Repository URL: https://github.com/%USERNAME%/%REPO_NAME%
    echo.
    echo Buoc tiep theo: Vao Vercel va import repository nay!
) else (
    echo ERROR! Co loi xay ra. Kiem tra lai:
    echo 1. Da tao repository tren GitHub chua?
    echo 2. Ten repository va username co dung khong?
    echo 3. Da dang nhap GitHub chua?
)
echo ========================================
pause

