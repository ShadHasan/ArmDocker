### Environment
Orange Pi pro 5
Ubuntu 24.04LTS(Noble reinstalled image)

### Pre-requisite

$> python3 --version
Python 3.12.3

$> sudo apt install python3-pip python3-venv


### Steps

1. create one environment
$> python3 -m venv JupyterEnv

2. Activate
$> source JupyterEnv/bin/activate

3. Install ipykernel (It is execution environment)
$> JupyterEnv/bin/python3 -m pip install ipykernel

Note: In some practice people don't install ipykernel on host but directly host 
and then connect via ipykernel to virtual environment notebook 
`python -m ipykernel install --user --name=myenv --display-name="Python (myenv)"`
This is call notebook registeration. That mean myenv must have notebook will be 
connected to this ipykernel.

In our case, we are install ipykernel within virtual environment

4. Install notebook
$> JupyterEnv/bin/python3 -m pip install notebook

5. Start jupyter notebook
$> JupyterEnv/bin/python3 -m jupyter notebook

To start at root host use like below:
`JupyterEnv/bin/python3 -m jupyter notebook --ip=0.0.0.0 --allow-root`


