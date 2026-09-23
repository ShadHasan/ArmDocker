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

# 6.1. DB install
- When you automate the deployment via Ansible, Bash, or Docker, the CouchDB installer will try to pop up that interactive terminal screen asking for passwords. You can bypass that entirely by pre-seeding the installation answers into the `debconf` system right before running apt install.

Add these lines to your automated deployment script to make it completely headless:

```
# 1. Pre-seed installer answers (Standalone mode, bind to 0.0.0.0, set password)
echo "couchdb couchdb/mode select standalone" | sudo debconf-set-selections
echo "couchdb couchdb/bindaddress string 0.0.0.0" | sudo debconf-set-selections
echo "couchdb couchdb/adminpass password yourpassword" | sudo debconf-set-selections
echo "couchdb couchdb/adminpass_again password yourpassword" | sudo debconf-set-selections

# 2. Run the install (DEBIAN_FRONTEND=noninteractive suppresses any remaining prompts)
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y couchdb

```
- Add the Official CouchDB Repository
```
sudo apt update && sudo apt install -y curl gnupg ca-certificates lsb-release

curl https://couchdb.apache.org/repo/keys.asc | gpg --dearmor | sudo tee /usr/share/keyrings/couchdb-archive-keyring.gpg >/dev/null

curl https://couchdb.apache.org/repo/keys.asc | gpg --dearmor | sudo tee /usr/share/keyrings/couchdb-archive-keyring.gpg >/dev/null

echo "deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg] https://apache.jfrog.io/artifactory/couchdb-deb/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/couchdb.list >/dev/null

sudo apt update
sudo apt install -y couchdb

```

# 6.2 DB Clean UP
```
#!/usr/bin/env bash

## Ensure the script is run as root

if [ "$EUID" -ne 0 ]; then
  echo "x Please run this script with sudo or as root."
  exit 1
fi

echo "--- Starting Complete CouchDB Installation Cleanup ---"
```
## 1. Stop the CouchDB system service
```
echo "Stopping CouchDB service..."
sudo systemctl stop couchdb 2>/dev/null
sudo systemctl disable couchdb 2>/dev/null
```
## 2. Purge the CouchDB package and its configurations
```
echo "Purging CouchDB packages..."
sudo apt-get purge -y couchdb
sudo apt-get autoremove -y
```
## 3. Permanently delete all remaining data directories, logs, and configs
```
echo "Removing data directories, logs, and configurations..."
sudo rm -rf /var/lib/couchdb      # Deletes all databases and BLOB attachments
sudo rm -rf /etc/couchdb         # Deletes system-wide configurations
sudo rm -rf /opt/couchdb         # Deletes installation binaries and runtimes
sudo rm -rf /var/log/couchdb      # Deletes system logs
```
## 4. Remove the system user and group created by the installer
```
echo "Deleting couchdb system user and group..."
sudo userdel couchdb 2>/dev/null
sudo groupdel couchdb 2>/dev/null
```
## 5. Clean up repository source files and signing keys
```
echo "Removing APT repository configs and signing keys..."
sudo rm -f /etc/apt/sources.list.d/couchdb.list
sudo rm -f /usr/share/keyrings/couchdb-archive-keyring.gpg
sudo apt-get update -qq

echo "--- Cleanup Complete! The ARM system is 100% clean for your automation script. ---"

```

# 6.3. Dockerisization of couch DB


## 1. Image dockerfile

<i>Ask for dockerfile</i>


## 2. Build image 
```
sudo docker build --build-arg HOSTROUTE=0.0.0.0 --build-arg PASSWORD="<password>" --build-arg COOKIEDATA="couchdb_pi_cookie_ChangeThis" -t <image_name> .
```
## 3. Run the container
```
$> sudo docker run -d --name=cdb -p 5984:5984/tcp <image_name> 

$> sudo docker run -d --restart=always --name=cdb -p 5984:5984/tcp cdb
```
## 4. Navigate on browser
```
http://10.10.12.9:5984/_utils/#

```

# Local testing tips

## CORS Couch DB
```
Here is a complete, single-file HTML interface with embedded CSS and JavaScript that connects directly to a CouchDB database to perform full CRUD operations (Create, Read, Update, Delete) for your inventory.

It handles image snapshotting via webcam, short video recording, image thumbnail previews, dynamic tag handling, responsive loading states, and full media persistence in CouchDB using base64 attachments.

Implementation Guidelines & Requirements
CouchDB Setup: Ensure CouchDB is running (typically on [http://127.0.0.1:5984](http://127.0.0.1:5984)).

CORS: Ensure CORS is enabled on CouchDB if accessing via browser (or use a local reverse proxy like Nginx/Node.js).

Authentication: Enter your CouchDB Base URL, Database Name (inventory), Username, and Password in the configuration section at the top of the script tag.
```

## Camera on HTTP without SSL
```
By default, modern web browsers (Chrome, Edge, Firefox) block camera access on http:// sites because camera streams require a secure context (https:// or localhost).

However, if you are testing locally or on a local network (e.g., [http://192.168.](http://192.168.)x.x or [http://127.0.0.1](http://127.0.0.1)), you can explicitly allow camera access on Chrome using developer flags.

Method 1: Enable Unsecure Origins for Testing (Recommended for Chrome/Edge)
This flag forces Chrome to treat specific http:// addresses as if they were secure (https://), allowing webcam and microphone APIs to function.

Open a new tab in Chrome and navigate to:

chrome://flags/#unsafely-treat-insecure-origin-as-secure
Find the setting named "Insecure origins treated as secure".

Change its state from Disabled to Enabled.

In the text box that appears, enter your exact http URL (including the port if applicable).

Example: [http://192.168.1.50:8000](http://192.168.1.50:8000) or [http://10.0.0.5:5984](http://10.0.0.5:5984)

To add multiple addresses, separate them with commas.

Click the Relaunch button at the bottom right to restart Chrome.

Refresh your page. Chrome will now prompt you to grant camera permissions.
```

## Prepare SSL environment for admin UI

- Create directory for admin-UI
```
	mkdir -p ~/secure_env
```
- Create SSL certificate
```
with Prompt
---
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out cert.pem -keyout key.pem

witout prompt
---
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
  -out cert.pem -keyout key.pem \
  -subj "/C=IN/ST=cg/L=abkp/O=tinyorb/OU=Development/CN=10.10.12.9"
```
Note: if required giver cert and key permission ` sudo chmod 644 <filename>`

- Create server.py
```
from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

def run_server(port=8999):
	server_address = ('0.0.0.0', port)
	httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

	# Initialize the modern TLS server context
	context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

	# Load your certificate and private key
	context.load_cert_chain(certfile='cert.pem', keyfile='key.pem')

	# Wrap the HTTP server socket with SSL
	httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

	print(f"Serving HTTPS on https://localhost:{port} ...")
	try:
		httpd.serve_forever()
	except KeyboardInterrupt:
		print("\nServer stopped.")

if __name__ == "__main__":
	run_server()
```

Now run http server
```
python3 server.py > /var/log/server.log 2>&1 &
```

without SSL it can be run as below(But browser won't allow camera, mic, sound etc.)
```
python3 -m http.server 8999 --bind 0.0.0.0 > /var/log/server.log 2>&1 &
```

Link will be
```
https://10.10.12.9:8999/admin-ui/
```