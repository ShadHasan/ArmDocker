import json
import os
import subprocess
from jinja2 import Template

config = {
    "openblas": {
        "description": "It is basic linear algebra subprogram which provided matrix and vector.The Level 1 BLAS ",
        "description2": "perform scalar, vector and vector-vector operations, the Level 2 BLAS perform matrix-vector ",
        "description3": "operations, and the Level 3 BLAS perform matrix-matrix operations.",
        "description4": "CBLAS (now part of LAPACK release)",
        "variable": {
            "docker_path": "openblas",
            "image_name": "tinyorb/openblas",
            "container_name": "openblas"
        },
        "job": {
            "build": "build -t {{variable.image_name}} .",
            "run": "run --name={{variable.container_name}} {{variable.image_name}}",
            "exec": "exec -t {{variable.container_name}} bash -c '{{cmd}}'",
            "interactive_run": "run -it --name={{variable.container_name}} {{variable.image_name}} bash",
            "tests": [
            	"exec -t {{variable.container_name}} bash -c 'cd /opt/test_openblass;gcc -o test_cblas_open test_cblas_dgemm.c -I/opt/OpenBLAS/include/ -L/opt/OpenBLAS/lib -Wl,-rpath,/opt/OpenBLAS/lib -lopenblas -lpthread -lgfortran;'",
            	"exec -t {{variable.container_name}} bash -c 'cd /opt/test_openblass;./test_cblas_open;'",
            	"exec -t {{variable.container_name}} bash -c 'cd /opt/test_openblass;gcc -o time_dgemm time_dgemm.c /opt/OpenBLAS/lib/libopenblas.a -lpthread -lm;'",
            	"exec -t {{variable.container_name}} bash -c 'cd /opt/test_openblass;./test_cblas_open;./time_dgemm 4 5 7'"
            ]
        },
        "reference": {
            "source code": "https://github.com/OpenMathLib/OpenBLAS",
            "blas api doc": [
                "https://www.netlib.org/blas/",
                "https://www.netlib.org/blas/blas.pdf"
            ],
            "abbreviation": "Basic Linear Algebra Subprogram"
        },
        "post_manual_activity": {
            "reference": "http://www.openmathlib.org/OpenBLAS/docs/user_manual/",
            "compile": [
                "Go to operblas clone directory",
                "RUN 'make' command"
            ],
            "install": [
            	"RUN 'make install' for default directory else 'make install PREFIX=<other directory>'"
            ],
            "tests": [
            	{
            		"name": "Call CBLAS interface",
            		"steps": [
            			"cd /opt/test_openblass",
            			"gcc -o test_cblas_open test_cblas_dgemm.c -I/opt/OpenBLAS/include/ -L/opt/OpenBLAS/lib -Wl,-rpath,/opt/OpenBLAS/lib -lopenblas -lpthread -lgfortran",
            			"./test_cblas_open"
            		],
            		"reference": [
            			"http://www.openmathlib.org/OpenBLAS/docs/user_manual/#call-cblas-interface",
            			"http://www.openmathlib.org/OpenBLAS/docs/user_manual/#linking-to-openblas"
            		],
            		"Notes": "You may not required to link gfortran library if openblas.pc ie package config already linked to gfortran library"
            	},
            	{
            		"name": "Call BLAS Fortran interface",
            		"steps": [
            			"cd /opt/test_openblass",
            			"gcc -o time_dgemm time_dgemm.c /opt/OpenBLAS/lib/libopenblas.a -lpthread -lm",
            			"./time_dgemm 4 5 7"
            		],
            		"reference": [
            			"http://www.openmathlib.org/OpenBLAS/docs/user_manual/#call-blas-fortran-interface"
            		]
            	}
            ],
            "troubleshooting": [
            	{
            		"occurs": "gcc -o test_cblas_open test_cblas_dgemm.c -I/opt/OpenBLAS/include/ -L/opt/OpenBLAS/lib -lopenblas -lpthread",
            		"error": "error while loading shared libraries: libopenblas.so.0: cannot open shared object file: No such file or directory",
            		"resolution": "-Wl,-rpath,/opt/OpenBLAS/lib",
            		"reference": [
            			"http://www.openmathlib.org/OpenBLAS/docs/user_manual/#link-a-shared-library"
            		],
            		"fix illustration": "gcc -o test_cblas_open test_cblas_dgemm.c -I/opt/OpenBLAS/include/ -L/opt/OpenBLAS/lib -Wl,-rpath,/opt/OpenBLAS/lib -lopenblas -lpthread"
            	},
            	{
            		"occurs": " gcc -o time_dgemm time_dgemm.c /opt/OpenBLAS/lib/libopenblas.a -lpthread",
            		"error": "gemm.c:(.text+0xec0): undefined reference to 'sqrt'",
            		"resolution": "-lm",
            		"explaination": "missing math library. so linking math library",
            		"reference": [
            			"https://techoverflow.net/2021/04/11/how-to-fix-gcc-undefined-reference-to-sqrt/"
            		],
            		"fix illustration": "gcc -o time_dgemm time_dgemm.c /opt/OpenBLAS/lib/libopenblas.a -lpthread -lm"
            	}
            ]
        }
    },
    "mlpack": {
        "reference": {
            "all citation": [
                "https://mlpack.org/doc/citation.html"
            ],
            "main documentation": "https://mlpack.org/doc/index.html"
        }
    },
    "lapack": {
        "description": "It is library written on top blas. lapack use blas core as well fortran library.",
        "source_code": "https://github.com/Reference-LAPACK/lapack/tree/v3.12.1",
        "reference": {}
    },
    "armadillo": {},
    "DockerGPUAccelarated": {
        "reference": {
            "milas_blog": "https://milas.dev/blog/mali-g610-rk3588-mlc-llm-docker/",
            "source_code": "https://github.com/milas/rock5-toolchain/blob/eef8c4833bfec4979785f6b3cc84a82e25ef50e9/extra/mlc-llm/Dockerfile"
        }
    },
    "openNMT": {
        "description": "Open source ecosystem for neural machine translation and neural sequence learning",
        "main page": "https://github.com/OpenNMT",
        "reference": {
            "quick start": "https://opennmt.net/OpenNMT-py/quickstart.html"
        }
    },
    "eole": {
        "description": "Open language modeling toolkit based on PyTorch",
        "main page": "https://eole-nlp.github.io/eole/"
    }
}

pipeline = {
	"build": [
		"openblas"
	],
	"run": [
		"openblas"
	]
}

common_cmd = "echo '{}' | sudo -S docker"

def docker_executor(cmd, path=None):
	cmd = "{} {}".format(common_cmd, cmd)
	print(cmd)
	cmd = cmd.format(os.environ["SEC1"])
	if path is not None:
		cmd = "cd {}; {}".format(path, cmd)
	process = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
	(out, err) = process.communicate()
	# .decode() convert byte to string where .encode convert string to byte
	print("Test: {} {}".format(out.decode(), err.decode()))
	

if __name__ == "__main__":
	docker_executor("ps -a")
	
	# build
	for component in pipeline["build"]:
		print("Building {}".format(component))
		cmd = Template(config[component]["job"]["build"]).render(variable=config[component]["variable"])
		path = config[component]["variable"]["docker_path"]
		print("Command to be executed: ", cmd)
		# docker_executor(cmd, path)
	
	
