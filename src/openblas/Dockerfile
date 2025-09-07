FROM arm64v8/ubuntu:noble
RUN apt update -y
RUN apt install -y git make build-essential
RUN git clone https://github.com/OpenMathLib/OpenBLAS.git
RUN make
RUN make install
RUN mkdir -p /opt/test_openblass
COPY copiable_content/test_cblas_dgemm.c /opt/test_openblass/test_cblas_dgemm.c
COPY copiable_content/time_dgemm.c /opt/test_openblass/time_dgemm.c
