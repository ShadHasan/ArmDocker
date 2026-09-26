## Simply run to make local known host.

ssh -N -R 2222:localhost:22 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 user@your-public-cloud-server.com

## Steps to make ssh-tunnel.service
- Copy ssh-tunnel.service at /etc/systemd/system/
```ssh-tunnel.service
[Unit]
Description=Persistent SSH Reverse Tunnel
After=network.target

[Service]
Type=simple
User=root
# Standard SSH with keep-alives to detect dropped connections quickly
ExecStart=/usr/bin/ssh -N -R 2222:localhost:22 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 user@your-public-cloud-server.com
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Run ssh-tunnel.service
sudo systemctl daemon-reload
sudo systemctl enable ssh-tunnel.service
sudo systemctl start ssh-tunnel.service

## Connecting remote server
ssh user@your-public-cloud-server.com

## connect local server once inside remote server shell
ssh localuser@localhost -p 2222

