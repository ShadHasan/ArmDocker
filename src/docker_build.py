import json
import os
import subprocess
from jinja2 import Template

config = {
	"openblas": {
		"variable": {
			"docker_path": "openblas",
			"image_name": "tinyorb/openblas",
			"container_name": "openblas"
		},
		"job": {
			"build": "build -t {{variable.image_name}} .",
			"run": "run --name={{variable.container_name}} {{variable.image_name}}",
			"exec": "exec -t {{variable.container_name}} bach -c '{{cmd}}'",
			"interactive_run": "run -it --name={{variable.container_name}} {{variable.image_name}} bash"
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
			"compile" : [
					"Go to operblas clone directory",
					"RUN 'make' command"
				}
		}
	},
	"mlpack": {
	},
	"lapack": {
	},
	"armadillo": {
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
		docker_executor(cmd, path)
	
	
