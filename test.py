import websocket
import requests
import threading
import random
import time
import json

# Server URL
ws_url = "ws://127.0.0.1:8080/join?roomname=helloworld"
msg_url = "http://127.0.0.1:8080/message"
start_encryption_url = "http://127.0.0.1:8080/startencryption"
encryption_url = "http://127.0.0.1:8080/encrypt"
roomname = "helloworld"
messages = []
isEncrypted = False
finalKey = 0


def xor_encrypt_decrypt(text: str, key: int) -> str:
    return ''.join(chr(ord(c) ^ key) for c in text)


def createEncryption(ws):
    roomSize = 0
    userId = 0
    userType = 0

    while len(messages) == 0:
        time.sleep(0.0001)

    if messages[0]["code"] == 201:
        userType = 1

    messages.clear()

    if userType == 0:
        while len(messages) == 0:
            input("Press enter to try to create room")
            if len(messages) >= 1:
                break
            data = {
                    "roomname": roomname
                    }
            messages.clear()
            response = requests.post(start_encryption_url, json=data)
            data = response.json()
            if data["code"] == 200:
                break
            else:
                print("Unable to create room")

    while len(messages) == 0:
        time.sleep(0.0001)

    print(messages[0])
    roomSize = messages[0]["roomsize"]
    userId = messages[0]["userid"]

    del messages[0]

    print("Starting encryption")
    # TODO create actual encryption but for now using insecure methods
    privateKey = random.randint(0, 1000)
    publicKey = random.randint(0, 1000)
    print(publicKey, privateKey, "\n--------")

    # Send public key first
    data = {
            "userid": userId,
            "roomname": roomname,
            "publickey": publicKey
            }
    requests.post(encryption_url, json=data)

    while len(messages) != roomSize:
        time.sleep(0.001)

    key = 0
    print(messages)
    for message in messages:
        if message["userid"] != userId:
            print(message["userid"])
            key += message["publickey"]
    print("Key:", key)
    del messages[0:roomSize]

    data = {
            "userid": userId,
            "roomname": roomname,
            "publickey": key + privateKey
            }
    requests.post(encryption_url, json=data)

    while len(messages) != roomSize:
        time.sleep(0.001)

    global finalKey
    print(messages)
    for message in messages:
        if message["userid"] != userId:
            finalKey += message["publickey"]
    finalKey += privateKey + key
    del messages[0:roomSize]

    global isEncrypted
    isEncrypted = True

    print(finalKey)

    sendMessages(ws)


def sendMessages(ws):
    while True:
        message = input("Enter message to send: ")
        if message.lower() == "exit":
            ws.close()
            break

        message = xor_encrypt_decrypt(message, finalKey)
        data = {
                "roomname": roomname,
                "username": "testing",
                "msg": message
                }
        requests.post(msg_url, json=data)


# Step 2: Upgrade to WebSocket Connection
def on_message(ws, message):
    data = json.loads(message)
    if isEncrypted:
        username = data["username"]
        msg = data["msg"]
        decrypted = xor_encrypt_decrypt(msg, finalKey)

        print(f"\n-----\n{username}: {msg}\n")
        print(f"\n-----\n{username}: {decrypted}\n")
    else:
        messages.append(data)


def on_error(ws, error):
    print("Error:", error)


def on_close(ws, close_status_code, close_msg):
    print("Closed:", close_status_code, close_msg)


def on_open(ws):
    print("WebSocket connection established!")

    thread = threading.Thread(target=createEncryption, args=(ws,))
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

