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

6.1. DB install
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

6.2 DB Clean UP
```
#!/usr/bin/env bash

# Ensure the script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "x Please run this script with sudo or as root."
  exit 1
fi

echo "--- Starting Complete CouchDB Installation Cleanup ---"

# 1. Stop the CouchDB system service
echo "Stopping CouchDB service..."
sudo systemctl stop couchdb 2>/dev/null
sudo systemctl disable couchdb 2>/dev/null

# 2. Purge the CouchDB package and its configurations
echo "Purging CouchDB packages..."
sudo apt-get purge -y couchdb
sudo apt-get autoremove -y

# 3. Permanently delete all remaining data directories, logs, and configs
echo "Removing data directories, logs, and configurations..."
sudo rm -rf /var/lib/couchdb      # Deletes all databases and BLOB attachments
sudo rm -rf /etc/couchdb         # Deletes system-wide configurations
sudo rm -rf /opt/couchdb         # Deletes installation binaries and runtimes
sudo rm -rf /var/log/couchdb      # Deletes system logs

# 4. Remove the system user and group created by the installer
echo "Deleting couchdb system user and group..."
sudo userdel couchdb 2>/dev/null
sudo groupdel couchdb 2>/dev/null

# 5. Clean up repository source files and signing keys
echo "Removing APT repository configs and signing keys..."
sudo rm -f /etc/apt/sources.list.d/couchdb.list
sudo rm -f /usr/share/keyrings/couchdb-archive-keyring.gpg
sudo apt-get update -qq

echo "--- Cleanup Complete! The ARM system is 100% clean for your automation script. ---"

```

6.3. Dockerisization of couch DB

```
# 1. Image dockerfile

<i>Ask for dockerfile</i>


# 2. Build image 

sudo docker build --build-arg HOSTROUTE=0.0.0.0 --build-arg PASSWORD="<password>" --build-arg COOKIEDATA="couchdb_pi_cookie_ChangeThis" -t <image_name> .

# 3. Run the container

sudo docker run -d --name=cdb -p 5984:5984/tcp <image_name> 

# 4. Navigate on browser

http://10.10.12.9:5984/_utils/#

```


