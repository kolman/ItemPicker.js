@ECHO OFF
%WINDIR%\Microsoft.NET\Framework\v4.0.30319\msbuild.exe ItemPicker.sln
IF %ERRORLEVEL% NEQ 0 GOTO Error
packages\NUnit.2.5.10.11092\tools\nunit-console.exe ItemPicker\bin\ItemPicker.dll
IF %ERRORLEVEL% NEQ 0 GOTO Error

ECHO ----------------
ECHO BUILD SUCCESSFUL
ECHO ----------------
GOTO End
:Error
ECHO ------------
ECHO BUILD FAILED
ECHO ------------
:End
pause