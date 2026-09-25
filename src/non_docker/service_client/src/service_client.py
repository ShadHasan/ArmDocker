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


def fetch_binary_by_id(binary_id):
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
	with open("./ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	render = ""
	with open(data["pages"][req_data["render"]]["render"], "r") as f:
		render = f.read()
	
	script = ""
	with open(data["pages"][req_data["render"]]["script"], "r") as f:
		script = f.read()
		
	return {"render": render, "script": script}


# for time dbName is equivalent of data type
def get_data(req_data):
	product_list = req_data["product_list"]
	offset = req_data["offset"] if req_data.get("offset") else 0
	length = req_data["length"] if req_data.get("length") else 9
	dbName = req_data["type"]
	data = {}
	with open("./ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	
	response = requests.get(
		data["COUCHDB_CONFIG"]["baseUrl"]+"/{}/_all_docs?skip={}&limit={}".format(dbName, offset, length), 
		headers={"Accept": "application/json", "Authorization": data["COUCHDB_CONFIG"]["authStr"]})
	return response.json()
	
	
def get_schema(req_data):
	return {}
	

def get_ui_details(req_data):
	data = {}
	with open("./ui/config.json", 'r') as file:
		# Load the JSON data into a Python object
		data = json.load(file)
	return data["ui_details"]
	

def send_binary_to_socket(req_data):
	ws = create_connection("{}/{}".format(os.environ["SIGNALSERVER"], "/ws/binary"))
	for binary_id in req_data["binary_list"]:
		for binary in fetch_binary_by_id(binary_id):
		ws.send_binary(binary)
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
	argument["directive"] = "service_client_reply"
	argument["result"] = process_action(argument)
	return argument


def process_and_send(ws, message):
	directive = message.get("directive")
	signal_response = message.get("signal_response")
	logger.debug("Signal directive/response {} {}".format(directive, signal_response))
	if directive == "request_service_client":
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
	# Target URL
	uri = "{}/{}".format(os.environ["SIGNALSERVER"], "/ws/signal")
	
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
