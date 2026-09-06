### Prerequisite for deployment

1. a server with reachable IP/FQDN for deployment
2. Create ubuntu user
``` 
sudo useradd -m ubuntu
sudo passwd ubuntu
```
3. Connect and install python version 3.12 and create python virtual environment with `venv`.

```
python3 -m venv service_client
```
4. activate python virtual environment and get python path using `which` command.
```
cd service_client
source bin/activate

which python3
```

Note: Python path need to be updated in service_client.service at ExecStart

5. Install websocket
```
python3 -m pip install websocket-client
```
