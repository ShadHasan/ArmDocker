# nginx webserver

docker run -d \
  --name nginx-proxy-manager \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -p 81:81 \
  -v $(pwd)/data:/data \
  -v $(pwd)/letsencrypt:/etc/letsencrypt \
  jc21/nginx-proxy-manager:latest