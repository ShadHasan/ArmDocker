 ls /usr/lib/libmali-valhall-g610-g6p0-x11-wayland-gbm.so 
 1258  sudo docker ps -a
 1259  sudo docker cp /usr/lib/libmali-valhall-g610-g6p0-x11-wayland-gbm.so temp:/usr/lib/libmali-valhall-g610-g6p0-x11-wayland-gbm.so
 1260  cd /etc/OpenCL/vendors/
 1261  ls
 1262  cat mali-arm64.icd 
 1263  cat mali.icd 
 1264  ls /usr/lib/aarch64-linux-gnu/libmali-x11/
 1265  sudo docker cp /usr/lib/aarch64-linux-gnu/libmali-x11/ temp:/usr/lib/aarch64-linux-gnu/libmali-x11/
 1266  sudo docker cp /etc/OpenCL/vendors/mali-arm64.icd temp:/etc/OpenCL/vendors/mali-arm64.icd
 1267  cd ~
 1268  ls
 1269  cd opencl_proj/
 1270  ls
 1271  cat run 
 1272  cat ../all_build_docker_proj/Dockerfile 
 1273  top
 1274  watch -n 1 cat /sys/devices/platform/*.gpu/devfreq/*.gpu/load
 1275  cd /sys/devices/platform
 1276  ls
 1277  ls *.gpu
 1278  cd fb000000.gpu
 1279  ls
 1280  watch -n 1 cat utilisation
 1281  watch -n 1 cat utilisation_period 
 1282  cd ..
 1283  cd ~
 1284  sudo docker ps -a
 1285  history
 1286  sudo docker ps -a
 1287  sudo docker commit opencv_exploration temp
 1288  sudo docker commit temp opencv4_exploration
 1289  sudo docker images
 1290  sudo docker save -o orangepi5pro_ocl_opencv4_exploration.tar 
 1291  sudo docker save -o orangepi5pro_ocl_opencv4_exploration.tar opencv4_exploration
 1292  sudo chmod 777 orangepi5pro_ocl_opencv4_exploration.tar 
 1293  ls
 1294  sudo docker cp te.png temp:/root/test_program/
 1295  watch -n 1 cat /sys/devices/platform/*.gpu/devfreq/*.gpu/load
 1296  top
 1297  sudo docker ps-a
 1298  sudo docker ps -a
 1299  sudo docker images
 1300  glxinfo -B
 1301  es2_info
 1302  glxinfo
 1303  timeshift
 1304  ls
 1305  cd backup_system
 1306  mkdir backup_system
 1307  cd backup_system/
 1308  timeshift --create
 1309  sudo timeshift --create
 1310  ls -las /run/timeshift/4344/backup/timeshift/snapshots
 1311  sudo ls -las /run/timeshift/4344/backup/timeshift/snapshots
 1312  sudo ls -las /run/timeshift/4344/backup/timeshift
 1313  sudo ls -las /run/timeshift/4344/backup/timeshift/snapshots/2026-01-30_14-35-53/info.json
 1314  sudo ls -las /run/timeshift/4344/backup
 1315  timeshift --list
 1316  sudo timeshift --list
 1317  cd /timeshift/
 1318  ls
 1319  cd ..
 1320  ls
 1321  ls -las /timeshift
 1322  du /timeshift
 1323  sudo du /timeshift
 1324  sudo du /timeshift -h M 
 1325  sudo du /timeshift -hM
 1326  sudo du /timeshift -h M
 1327  sudo du -s /timeshift -h M
 1328  sudo du -s -h M /timeshift
 1329  sudo du -s -hM /timeshift
 1330  sudo du -s -h - M /timeshift
 1331  sudo du -s -h -M /timeshift
 1332  sudo du -sh /timeshift
 1333  ls
 1334  cd ~
 1335  ls
 1336  cat /etc/timeshift/timeshift.json 
 1337  cat /etc/timeshift/default.json 
 1338  ls
 1339  clinfo
 1340  cmake
 1341  ls
 1342  make opencv_docker_proj
 1343  mkdir opencv_docker_proj
 1344  cd openc
 1345  cd opencv_docker_proj/
 1346  ls
 1347  vi Dockerfile
 1348  cd ..
 1349  ls
 1350  mkdir all_build_docker_proj
 1351  cd all_build_docker_proj/
 1352  vi Dockerfile
 1353  cat ../opencv_docker_proj/Dockerfile 
 1354  vi Dockerfile
 1355  sudo docker build -t dev_kit .
 1356  vi Dockerfile
 1357  sudo docker build -t dev_kit .
 1358  cd ..
 1359  ls /usr/lib/libmali
 1360  ls /usr/lib/libmali*
 1361  mkdir opencl_proj
 1362  cd opencl_proj/
 1363  vi run
 1364  sudo docker images
 1365  vi run
 1366  ls /dev/mali0 
 1367  ls /usr/lib/libmali
 1368  ls /lib/firmware/mali_csffw.bin
 1369  chmod +x run 
 1370  ./run 
 1371  ls
 1372  vi run 
 1373  ./run 
 1374  watch -n 1 cat /sys/devices/platform/*.gpu/devfreq/*.gpu/load
 1375  sudo docker images
 1376  ls
 1377  sudo docker cp te.png temp:~/test_program/te.png
 1378  sudo docker cp te.png temp:/root/test_program/
 1379  watch -n 1 cat /sys/devices/platform/*.gpu/devfreq/*.gpu/load
 1380  top
 1381  sudo docker ps -a
 1382  sudo docker run -it  distracted_brahmagupta /bin/bash
 1383  sudo docker start --attach distracted_brahmagupta
 1384  sudo docker start --attach distracted_brahmagupta /bin/bash
 1385  sudo docker start --attach distracted_brahmagupta
 1386  sudo docker start --help
 1387  sudo docker start --attach -i distracted_brahmagupta
 1388  sudo docker images
 1389  sudo docker run --name oe -it opencv4_exploration /bin/bash
 1390  sudo docker stop oe
 1391  sudo docker rm oe
 1392  sudo docker run --name oe -it --device /dev/mali0:/dev/mali0 \opencv4_exploration /bin/bash
 1393  sudo docker rm oe
 1394  ubuntu@ubuntu:~$ s
 1395  sudo docker run -it     --name="temp"     --device /dev/mali0:/dev/mali0     -v /lib/firmware/mali_csffw.bin:/lib/firmware/mali_csffw.bin:ro     -v /usr/lib/aarch64-linux-gnu/libmali.so:/usr/lib/libmali.so:ro     dev_kit /bin/bash
 1396  sudo docker run -it     --name="temp"     --device /dev/mali0:/dev/mali0     -v /lib/firmware/mali_csffw.bin:/lib/firmware/mali_csffw.bin:ro     -v /usr/lib/aarch64-linux-gnu/libmali.so:/usr/lib/libmali.so:ro     opencv4_exploration /bin/bash
 1397  sudo docker rm temp
 1398  sudo docker run -it     --name="temp"     --device /dev/mali0:/dev/mali0     -v /lib/firmware/mali_csffw.bin:/lib/firmware/mali_csffw.bin:ro     -v /usr/lib/aarch64-linux-gnu/libmali.so:/usr/lib/libmali.so:ro     opencv4_exploration /bin/bash
 1399  ls
 1400  sudo poweroff
 1401  cd /etc/netplan/
 1402  ls
 1403  cat 50-cloud-init.yaml 
 1404  sudo cat 50-cloud-init.yaml 


=========================================================
    1  cd ~
    2  ls
    3  cd test_program/
    4  ls
    5  ./output 
    6  export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib/
    7  ./output 
    8  cp test.cpp test_opencl.cpp 
    9  vi test_opencl.cpp 
   10  mv test_opencl.cpp test_opencl_runtime.cpp 
   11  vi test_opencl_runtime.cpp 
   12  ls
   13  cd ..
   14  ls
   15  cd /opt/
   16  ls
   17  history
   18  ls
   19  cd /tmp/
   20  ls
   21  cd ~
   22  ls
   23  clinfo
   24  ls
   25  cd test_program/
   26  ls
   27  cat test.cpp 
   28  ls
   29  touch load_image_matrix.cpp
   30  vi load_image_matrix.cpp 
   31  cat load_image_matrix.cpp 
   32  vi load_image_matrix.cpp 
   33  pwd
   34  vi load_image_matrix.cpp 
   35  g++ load_image_matrix.cpp -o output $(pkg-config opencv4 --libs --cflags)
   36  vi load_image_matrix.cpp 
   37  g++ load_image_matrix.cpp -o output $(pkg-config opencv4 --libs --cflags)
   38  ./output 
   39  vi load_image_matrix.cpp 
   40  ls
   41  vi load_image_matrix.cpp 
   42  ls
   43  g++ load_image_matrix.cpp -o output $(pkg-config opencv4 --libs --cflags)
   44  vi load_image_matrix.cpp 
   45  g++ load_image_matrix.cpp -o output $(pkg-config opencv4 --libs --cflags)
   46  cat load_image_matrix.cpp 
   47  ./output 
   48  vi load_image_matrix.cpp 
   49  g++ load_image_matrix.cpp -o output $(pkg-config opencv4 --libs --cflags)
   50  ./output 
   51  ps -aux
   52  ls
   53  cd opt/
   54  ls
   55  cd tmp
   56  cd /tmp/
   57  ls
   58  cd ~
   59  ls
   60  cd buildOpenCV/
   61  ls
   62  cd ..
   63  ls
   64  cd test_program/
   65  ls
   66  cat test_opencl_runtime.cpp 
   67  ls
   68  ./output 
   69  history
   70  ./output 
   71  export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib/

