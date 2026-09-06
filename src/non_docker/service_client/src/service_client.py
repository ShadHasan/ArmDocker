import os
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


async def exec_run(argument):
	await asyncio.sleep(1)
	return f"Responding {argument}"

def process_and_send(ws, message):
	result = asyncio.run(exec_run())
	ws.send(result)
	logger.info("Successfully sent")

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
    ws.send("Hello, Server!")

if __name__ == "__main__":
	logger = logging.getLogger(__name__)
	logger.info("This goes to both the file and console")
    # Target URL
    uri = os.environ["SIGNALSERVER"]
    
    # Create the persistent application connection
    ws = websocket.WebSocketApp(
        uri,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    # Keep the connection alive indefinitely
    ws.run_forever()