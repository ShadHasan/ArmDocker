@echo off

set remotedir=/home/%user%/temp_docker

.\binary\putty\PLINK.EXE %user%@%remotehost% -pw "%password%" -batch "rm -rf %remotedir% || true; mkdir -p %remotedir%;"

.\binary\putty\PSCP.EXE -r -pw "%password%" .\src %user%@%remotehost%:%remotedir%

.\binary\putty\PLINK.EXE %user%@%remotehost% -pw "%password%" -batch "cd %remotedir%/src ; export SEC1='%password%'; python3 docker_build.py ;"

echo

echo Execution done