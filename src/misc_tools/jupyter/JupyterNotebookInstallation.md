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

5. Register ipykernel to same virtual environment
$> JupyterEnv/bin/python3 -m ipykernel install --user --name=JupyterEnv --display-name="pythonJupyterENV"

6. Start jupyter notebook
$> JupyterEnv/bin/python3 -m jupyter notebook

To start at root host use like below:
`JupyterEnv/bin/python3 -m jupyter notebook --ip=0.0.0.0 --allow-root`


Notedown the url, let say:
	http://127.0.0.1:8888/tree?token=96c1704a17811cf7362274e66e8580cee18578b91adadf46

7. Go to browser
Navigate to above url

8. open notebook and select kernel as per step 5 registeration.


9. You can install try pip package as below:
```
#@title Install required libraries

!pip install google-ml-edu==0.1.3 \
  keras~=3.8.0 \
  matplotlib~=3.10.0 \
  numpy~=2.0.0 \
  pandas~=2.2.0 \
  tensorflow~=2.18.0

print('\n\nAll requirements successfully installed.') 

```

If you run in error like `jupyter error: externally-managed-environment`
Then run like below replace `!` with `%`
```
#@title Install required libraries

%pip install google-ml-edu==0.1.3 \
  keras~=3.8.0 \
  matplotlib~=3.10.0 \
  numpy~=2.0.0 \
  pandas~=2.2.0 \
  tensorflow~=2.18.0

print('\n\nAll requirements successfully installed.')
```

