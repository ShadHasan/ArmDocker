FROM arm64v8/ubuntu:noble
ARG HOSTROUTE=0.0.0.0
ARG PASSWORD=yourpassword
ARG COOKIEDATA=couchdb_pi_cookie_ChangeThis
RUN apt update && apt install -y curl gnupg ca-certificates lsb-release; \
        curl https://couchdb.apache.org/repo/keys.asc | gpg --dearmor | tee /usr/share/keyrings/couchdb-archive-keyring.gpg >/dev/null; \
        echo "deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg] https://apache.jfrog.io/artifactory/couchdb-deb/ noble main" | tee /etc/apt/sources.list.d/couchdb.list >/dev/null; \
        apt update -y;
RUN mkdir -p /etc/couchdb || true; mkdir -p /opt/couchdb || true; touch /etc/couchdb/vm.args; touch /opt/couchdb/vm.args;
RUN echo "couchdb couchdb/mode select standalone" | debconf-set-selections ; \
        echo "couchdb couchdb/bindaddress string ${HOSTROUTE}" | debconf-set-selections ; \
        echo "couchdb couchdb/adminpass password ${PASSWORD}" | debconf-set-selections ; \
        echo "couchdb couchdb/adminpass_again password ${PASSWORD}" | debconf-set-selections ; \
        echo "couchdb couchdb/cookie string ${COOKIEDATA}" | debconf-set-selections ; \
        apt update -y; apt install -y couchdb;
RUN touch /tmp/run.sh; chmod +x /tmp/run.sh; echo "#!/bin/bash" > /tmp/run.sh; echo "service couchdb start;" >> /tmp/run.sh; echo "tail -f /dev/null;" >> /tmp/run.sh; echo "admin = ${PASSWORD}" >> /opt/couchdb/etc/local.ini
ENTRYPOINT ["/tmp/run.sh"]