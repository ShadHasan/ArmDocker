## Connect Bash on run using docker command

```
sudo docker run -it --name=armadillo tinyorb/arm64v8_compiledblas_armadillo:v1.0 /bin/bash
```
## To check gpu utilization

For check gpu utilization
```
cat /sys/devices/platform/fb000000.gpu/utilisation
```

For continous monitoring use `watch`
```
watch -n1 cat /sys/devices/platform/fb000000.gpu/utilisation
```

Another method is by using `glances` by python3-pip.
```
sudo apt install pythn3-pip

sudo pip install glances

sudo glances
```

