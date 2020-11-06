@echo off
setlocal
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: You need to change this to the directory of the TWMS frontend directory
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
set DIR=%~dp0\..
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
IF NOT EXIST %DIR% GOTO NOTWMSDIR
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

pushd %DIR%

IF NOT "%~1"=="" (
  IF NOT "%~1"=="wipe" (
    echo twmsRestore.cmd was started with argument "%~1". Will skip restart of Backend.
    GOTO STARTFRONTEND
  )  
  echo twmsRestore.cmd was started with argument "%~1"
)

:: restarting backend. If you do not want to do that, call twmsRestore.bat with any parameter
:: (for example: "twmsRestore.bat wasd" from command line) 
  
  SET TWMSDIR="third_party\twms-backend"
  
  IF NOT EXIST %TWMSDIR% (
    npm run install-backend
    npm run setup-backend
  )
  
  tasklist /FI "IMAGENAME eq TwmsBackend.exe" 2>NUL | find /I /N "TwmsBackend.exe">NUL
  if "%ERRORLEVEL%"=="0" (
    taskkill /IM "TwmsBackend.exe" /F 2>NUL
  )
  
  IF "%~1"=="wipe" (
    echo wiping database
    del /S /Q %TWMSDIR%\twms*.db*
    del /S /Q %TWMSDIR%\uuid.txt
  )

  REM IF NOT EXIST %TWMSDIR% (
    REM npm run install-backend
    REM npm run setup-backend
  REM ) else (
    REM del /S /Q %TWMSDIR%\twms*.db*
    REM del /S /Q %TWMSDIR%\uuid.txt
  REM )

  set FILE=%TWMSDIR%\appsettings.json
  powershell -Command "(gc %FILE%) -replace ': 900(?!0)', ': 90000' | Out-File -encoding ASCII %FILE%"
  call npm run start-backend

  goto STARTFRONTEND

:STARTFRONTEND
  setlocal enabledelayedexpansion
  for /f "tokens=5" %%a in ('netstat -aon ^| find ":4200" ^| find "LISTENING"') do (echo frontend is already running) && goto END 
  call npm start
  goto END 

:NOTWMSDIR
  echo %DIR% doesn't exist. Please change line 6 of twmsRestore.cmd to the location of your frontend repository. 
  goto END
  
:END
popd