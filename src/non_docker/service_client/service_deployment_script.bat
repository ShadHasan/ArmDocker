@echo off

set remotedir=/home/%username%/temp_proj_svc
set SERVICE_CLIENT_PROGRAM_PATH=/home/ubuntu/service_client/service_client.py
set SERVICE_CLIENT_SERVICE_PATH=/etc/systemd/system/service_client.service
set UI_PATH=/home/ubuntu/service_client/ui
set ADMINUI_PATH=/home/ubuntu/secure_env/admin-ui
set LOGPATH=/var/log/service_client.log

echo Clean up starting...

.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "echo 'Hello connect check';"

.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "sudo rm -rf %remotedir% || true; sudo mkdir -p %remotedir%;sudo chown -R %username%:%username% %remotedir%; sudo systemctl disable service_client.service || true; sudo systemctl stop service_client.service || true; sudo rm -rf %SERVICE_CLIENT_SERVICE_PATH% || true; sudo rm -rf %SERVICE_CLIENT_PROGRAM_PATH% || true; pkill -f 'python3 server.py' || true;"


echo Checking remote dir exist...
.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "ls %remotedir%;cd %remotedir% ; pwd; ls -l;"

echo Starting copying to host...

.\binary\putty\PSCP.EXE -r -pw "%password%" .\src\non_docker\service_client\src\service_client.py %username%@%host%:%remotedir%/service_client.py
.\binary\putty\PSCP.EXE -r -pw "%password%" .\src\non_docker\service_client\service_client.service %username%@%host%:%remotedir%/service_client.service
.\binary\putty\PSCP.EXE -r -pw "%password%" .\src\non_docker\service_client\src\ui %username%@%host%:%remotedir%/
.\binary\putty\PSCP.EXE -r -pw "%password%" .\src\non_docker\service_client\src\admin-ui %username%@%host%:%remotedir%/


echo Copying to respective position...

.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "sudo cp %remotedir%/service_client.py %SERVICE_CLIENT_PROGRAM_PATH%; sudo chown -R %username%:%username% %SERVICE_CLIENT_PROGRAM_PATH%; sudo cp %remotedir%/service_client.service %SERVICE_CLIENT_SERVICE_PATH%; sudo rm -rf %UI_PATH% || true; sudo cp -r %remotedir%/ui %UI_PATH%; sudo rm -rf %ADMINUI_PATH% || true; sudo cp -r %remotedir%/admin-ui %ADMINUI_PATH%"

echo Deploying...
.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "sudo touch %LOGPATH% || true;sudo chown -R %username%:%username% %LOGPATH%;"

.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "sudo systemctl daemon-reload; sudo systemctl enable --now service_client.service; sudo systemctl status service_client.service;"


echo Deploying admin server...
.\binary\putty\PLINK.EXE %username%@%host% -pw "%password%" -batch "sudo touch /var/log/server.log || true ; sudo chown -R %username%:%username% /var/log/server.log; cd %ADMINUI_PATH% ; cd .. ; python3 server.py > /var/log/server.log 2>&1 & "

echo 
echo Execution completed
