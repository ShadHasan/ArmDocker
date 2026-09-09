import os
import uuid
import ssl
import json
import asyncio
import websocket
import threading
import logging

logging.basicConfig(
	level=logging.DEBUG,
	format="%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",
	handlers=[
		logging.FileHandler(os.environ["LOGPATH"]),
		logging.StreamHandler()
	]
)

def ws_send_json(ws, msg):
	ws.send(json.dumps(msg))

async def exec_run(argument):
	await asyncio.sleep(1)
	logger.debug("Exeuting service client request, {}".format(argument))
	return {"directive": "service_client_reply"}

def process_and_send(ws, message):
	directive = message.get("directive")
	signal_response = message.get("signal_response")
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
	threading.Thread(target=process_and_send, args=(ws, message), daemon=True).start()

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
	uri = os.environ["SIGNALSERVER"]
	
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