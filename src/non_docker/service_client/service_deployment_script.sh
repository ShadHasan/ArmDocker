#!/bin/bash

echo "This script is valid for debian based linux distros."

SERVICE_CLIENT_PROGRAM_PATH="/etc/systemd/system/service_client.service"
SERVICE_CLIENT_SERVICE_PATH="/home/ubuntu/service_client/service_client.py"  # This generally reside within init.d
LOGPATH="/var/log/service_client.log"

ssh """
touch ${LOGPATH} || true;

echo "reloading daemon"
sudo systemctl daemon-reload
sudo systemctl enable --now myapp.service

echo "Checking service status"
sudo systemctl status myapp.service
sudo journalctl -u myapp.service -f

"""
