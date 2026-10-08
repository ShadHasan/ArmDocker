import os
import uuid
import ssl
import json
import asyncio
import websocket
import threading
import logging
import requests
from websocket import create_connection

# Service configuration related
logging.basicConfig(
	level=logging.DEBUG,
	format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",
	handlers=[
		logging.FileHandler(os.environ["LOGPATH"]),
		logging.StreamHandler()
	]
)

def fetch_binary_by_id(data, binary_id):
	binary_result = []
	response = requests.get(
		"{}/{}/{}".format(data["COUCHDB_CONFIG"]["baseUrl"], "media_video", binary_id), 
		headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]})
	if response.status_code == 404:
		response = requests.get(
			"{}/{}/{}".format(data["COUCHDB_CONFIG"]["baseUrl"], "media_image", binary_id), 
			headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]})
		if response.status_code == 404:
			return binary_result
		data = response.json()
		if data.get("_attachments") is not None:
			for attachment in data["_attachments"]:
				for filename in attachment.keys():
					response = requests.get(
						"{}/{}/{}/{}".format(data["COUCHDB_CONFIG"]["baseUrl"], "media_image", binary_id, filename), 
						headers={"Authorization": data["COUCHDB_CONFIG"]["authStr"]})
					binary_result.append(response)
	else:
		data = response.json()
		if data.get("_attachments") is not None:
			for attachment in data["_attachments"]:
				for filename in attachment.keys():
					response = requests.get(
						"{}/{}/{}/{}".format(data["COUCHDB_CONFIG"]["baseUrl"], "media_video", binary_id, filename), 
						headers={"Authorization": data["COUCHDB_CONFIG"]["authStr"]})
					binary_result.append(response)
	return binary_result
	


## Action response related
# Usage::
#	f = open(os.path.join("<media_path>"), "rb")
#	binary_img = f.read()
#	formatted_media = format_media("<directive>", "8383-892-8938493-998", "png", "owner_image", binary_img)
#	there is three directive: 1) "rm" mean requested media, 2) "fm" mean formatted media, 3) "ee" means error
#	
def format_media(pc_uuid, media_type, id, binary):
	meta = "{}::{}::{}::{}::{}".format("fm", pc_uuid, media_type, id, "--==--")
	return meta.encode() + binary


def get_render(req_data):
	data = {}
	with open(APP_PATH+"/ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	render = ""
	with open(data["pages"][req_data["context_data"]["render"]]["render"], "r") as f:
		render = f.read()
	
	script = ""
	with open(data["pages"][req_data["context_data"]["render"]]["script"], "r") as f:
		script = f.read()
		
	return {"HTML": render, "SCRIPT": script}


# for time dbName is equivalent of data type
def get_data(req_data):
	offset = req_data["context_data"]["offset"] if req_data["context_data"].get("offset") else 0
	length = req_data["context_data"]["length"] if req_data["context_data"].get("length") else 9
	dbName = req_data["context_data"]["type"]
	data = {}
	with open(APP_PATH+"/ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	# default_get_url
	url = data["COUCHDB_CONFIG"]["baseUrl"]+"/{}/_all_docs?skip={}&limit={}&include_docs=true".format(dbName, offset, length)
	if dbName == "order":
		aoa = req_data["context_data"]["aoa"]
		# This will create order
		if aoa == "request":
			req_data["context_data"]["body"]["altname"] = req_data["altname"]
			response = requests.post(data["COUCHDB_CONFIG"]["baseUrl"]+"/{}".format(dbName), 
				json=req_data["context_data"]["body"],
				headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]}
			)
			return response.json()
		# This will cancel the order
		elif aoa == "cancel":
			response = requests.post(data["COUCHDB_CONFIG"]["baseUrl"]+"/{}/{}".format(dbName, req_data["context_data"]["_id"]),
				json={
					"status": "cancel_request"
				},
				headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]}
			)
			return response.json()
		elif aoa == "status":
			response = requests.post(data["COUCHDB_CONFIG"]["baseUrl"]+"/{}/_find".format(dbName), 
				json={
					"selector": {
						"altname": req_data["altname"]
					}
				},
				headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]}
			)
			return response.json()
	response = requests.get(url, 
		headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]})
	return response.json()
	
	
def get_schema(req_data):
	context_data = data["context_data"]
	return {}
	

def get_ui_details(req_data):
	data = {}
	with open(APP_PATH+"/ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	return data["ui_details"]
	

def send_binary_to_socket(req_data):
	ws = create_connection("{}/{}".format(os.environ["SIGNALSERVER"], "ws/binary"))
	data = {}
	with open(APP_PATH+"/ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	for binary_id in req_data["binary_list"]:
		for binary in fetch_binary_by_id(binary_id):
			ws.send_binary(data, binary)
	ws.close()
	return {"status": "ok"}


def process_action(req_data):
	action_functions = {
		"ui_details": {
			"callback": get_ui_details
		},
		"dataType": {
			"callback": get_schema
		},
		"binary_data": {
			"callback": send_binary_to_socket
		},
		"data": {
			"callback": get_data
		},
		"render": {
			"callback": get_render
		}
	}
	
	if req_data.get("action") and action_functions.get(req_data["action"]) is not None:
		return action_functions[req_data["action"]]["callback"](req_data)
	else:
		return {"error": "Unkown action {}".format(req_data.get("action"))}


def ws_send_json(ws, msg):
	ws.send(json.dumps(msg))


async def exec_run(argument):
	await asyncio.sleep(1)
	logger.debug("Executing service client request, {}".format(argument))
	if argument["directive"] == "request_service_client":
		argument["directive"] = "service_client_reply"
	elif argument["directive"] == "sc_request_service_client":
		argument["directive"] = "sc_service_client_reply"
	argument["result"] = process_action(argument)
	return argument


def process_and_send(ws, message):
	directive = message.get("directive")
	signal_response = message.get("signal_response")
	logger.debug("Signal directive/response {} {}".format(directive, signal_response))
	if directive == "request_service_client" or directive == "sc_request_service_client":
		result = asyncio.run(exec_run(message))
		ws_send_json(ws, result)
		logger.info("Successfully sent")
	elif directive == "echo":
		logger.info(f"Echo received: {message['msg']}")
	if signal_response == "service_client_replied":
		logger.info(f"Service reply signal ack: {message['status']}")
	elif signal_response == "socket_mapped":
		logger.info("Service service registered")


def on_message(ws, message):
	logger.info(f"Received: {message}")
	message = json.loads(message)
	threading.Thread(target=process_and_send, args=(ws, message,), daemon=True).start()


def on_error(ws, error):
	logger.info(f"Error: {error}")


def on_close(ws, close_status_code, close_msg):
	logger.info("### Connection Closed ###")


def on_open(ws):
	logger.info("Opened connection successfully.")
	# Send a message right after opening the connection
	ws_send_json(ws, {"directive": "echo", "msg": "Hello, Server!"})
	ws_send_json(ws, {"directive": "my_altname", "altname": "service_pi5b", "type": "service"})
	

if __name__ == "__main__":
	
	logger = logging.getLogger(__name__)
	logger.info("This goes to both the file and console")
	APP_PATH = os.environ["APP_PATH"]
	# Target URL
	uri = "{}/{}".format(os.environ["SIGNALSERVER"], "ws/signal")
	
	# my_context = ssl.create_default_context()
	# my_context.load_verify_locations('my_extra_CAs.cer')
	
	# Create the persistent application connection
	ws = websocket.WebSocketApp(
		uri,
		on_open=on_open,
		on_message=on_message,
		on_error=on_error,
		on_close=on_close
	)
	
	# Keep the connection alive indefinitely
	# ws.run_forever(sslopt={'context': my_context})
	ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
