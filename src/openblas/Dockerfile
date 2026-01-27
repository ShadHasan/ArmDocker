FROM tinyorb/arm64v8_openblas:dev_base
RUN cd /opt/OpenBLAS/OpenBLAS; make; make install;
RUN mkdir -p /opt/test_openblass
COPY copiable_content/test_cblas_dgemm.c /opt/test_openblass/test_cblas_dgemm.c
COPY copiable_content/time_dgemm.c /opt/test_openblass/time_dgemm.c
