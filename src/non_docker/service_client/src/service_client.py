import os
import uuid
import ssl
import json
import asyncio
import websocket
import threading
import logging
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

class CRUD:
	
	def fetch_binary_by_id(binary_id):
		pass


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
	return {}
	
def get_data(req_data):
	return {}
	
def get_schema(req_data):
	return {}
	
def get_ui_details(req_data):
	return {
		"pages": [],
		"main_page_name": "",
		"common_media_list": []
	}
	
def send_binary_to_socket(req_data):
	ws = create_connection("{}/{}".format(os.environ["SIGNALSERVER"], "/ws/binary"))
	for binary_id in req_data["binary_list"]:
		ws.send_binary(fetch_binary_by_id(binary_id))
	ws.close()
	result = {}
	result["status"] = "ok"
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
	argument["result"] = ""
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