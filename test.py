import websocket
import requests
import threading

# Server URL
ws_url = "ws://127.0.0.1:8080/join?roomname=helloworld"
msg_url = "http://127.0.0.1:8080/message"
roomname = "helloworld"


def sendMessages(ws):
    while True:
        message = input("Enter message to send: ")
        if message.lower() == "exit":
            ws.close()
            break

        data = {
                "roomname": roomname,
                "username": "testing",
                "msg": message
                }
        response = requests.post(msg_url, json=data)
        print(f"Server response: {response.status_code} - {response.text}")


# Step 2: Upgrade to WebSocket Connection
def on_message(ws, message):
    print("Received:", message)


def on_error(ws, error):
    print("Error:", error)


def on_close(ws, close_status_code, close_msg):
    print("Closed:", close_status_code, close_msg)


def on_open(ws):
    print("WebSocket connection established!")

    thread = threading.Thread(target=sendMessages, args=(ws,))
    thread.daemon = True
    thread.start()


# Create WebSocket connection
ws = websocket.WebSocketApp(ws_url,
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.on_open = on_open

# Start WebSocket communication
ws.run_forever()

