import websockets
import asyncio
import json
import pathlib
import ssl
import requests

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('websockets')
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

import time

class Uptime:

    def __init__(self):
        self.starttime = time.time()

    @property
    def uptime(self):
        return time.time() - self.starttime

class MsgLog:

    @property
    def history(self):
        with open('messageHistory.txt', 'r') as f:
            content = eval(f.read())

        return content

    def writeTo(self, content):
        with open('messageHistory.txt', 'w') as f:
            f.write(str(content))
    
    def add(self, msg):
        history = self.history

        history.append(msg)
        self.writeTo(history)

msgLog = MsgLog()  
uptime = Uptime()

clients = []
users = []
clientCount = 0

async def handle_client(websocket, port):
    global clientCount, users, clients

    clients.append(websocket)
    remote_ip = websocket.remote_address[0]
    logging.info(f"[NEW CONNECTION] {remote_ip}")

    username = None
    usercolour = None
    
    clientCount += 1

    #send server conn message to new client connection
    serverMsg = {
        "type":"serverConn",
        "setup":{
            "currentConn":clientCount,
            "msgHistory":msgLog.history,
            "currentUsers":users
        }
    }

    await websocket.send(json.dumps(serverMsg))

    try:
        while True:
            byteMsg = await websocket.recv()
            msg = json.loads(byteMsg)

            if msg['type'] not in ['ping']:
                msgLog.add(byteMsg)
            
            if msg['type'] == "image":
                for client in clients:
                    await client.send(byteMsg)

            if msg['type'] == "message":
                for client in clients:
                    await client.send(byteMsg)

                if msg['content'] == "!uptime":
                    serverMsg = {
                        "type": "message",
                        "content": f"{uptime.uptime} seconds",
                        "user": {
                            "colour": "#ff0000",
                            "name": "WS-SERVER"
                        }
                    }
                    byteMsg = json.dumps(serverMsg)
                    msgLog.add(byteMsg)

                    for client in clients:
                        await client.send(byteMsg)

                if msg['content'] == "!usercount":
                    serverMsg = {
                        "type": "message",
                        "content": clientCount,
                        "user": {
                            "colour": "#ff0000",
                            "name": "WS-SERVER"
                        }
                    }
                    byteMsg = json.dumps(serverMsg)
                    msgLog.add(byteMsg)

                    for client in clients:
                        await client.send(byteMsg)
            
            elif msg['type'] == "clientConn":
                username = msg["user"]["name"]
                usercolour = msg["user"]["colour"]

                users.append(tuple((username, usercolour)))

                newClientMsg = {
                        "type":"newClient",
                        "user": {
                            "name": username,
                            "colour": usercolour
                        }
                    }
                
                for client in clients:
                    await client.send(json.dumps(newClientMsg))

            elif msg['type'] == "ping":
                pingtime = msg['time']

                pongMsg = {
                    "type":"pong",
                    "time": pingtime
                }

                await websocket.send(json.dumps(pongMsg))
                
    except websockets.exceptions.ConnectionClosedOK:
        logging.info(f"[CONNECTION ENDED] {remote_ip}")
        
    except websockets.exceptions.ConnectionClosedError:
        logging.error(f"[CONNECTION ENDED] {remote_ip} disconnected unexpectedly")

    except Exception as err:
        logging.error(f"[CONNECTION ENDED] {remote_ip} disconnected for unknown reasons or errors:\n{err}")
    
    clients.remove(websocket)
    clientCount -= 1

    clientDisconnMsg = {
        "type":"clientDisconn",
        "user": {
            "name": username,
            "colour": usercolour
        }
    }

    for client in clients:
        await client.send(json.dumps(clientDisconnMsg))

    for user in users:
        if user[0] == username:
            users.remove(user)


ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain("cert.pem", "privkey.pem")

start_server = websockets.serve(handle_client, "192.168.0.11", 12687, ssl=ssl_context) #websocket port will always be 4607 more than the websites port

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

'''
Format of message json object:

{   
    "type":"message"
    "content": "content of message",
    "user": {
        "colour":"colour of the username text",
        "name":"display name of the user"
    }
}

{
    "type": "clientConn",
    "username": "john"
}

{
    "type":"serverConn",
    "setup":{
        "currentConn":conncount,
        "messageHistory": [past 100 messages],
    }
}

{
    "type": "newClient",
    "username": "john"
}

Used to get ping

what client sends:
{
    "type":"ping";
    "time":time in milliseconds since epoch
}

what client receives:
{
    "type":"pong";
    "time": time in milliseconds since epoch from ping message
}

^^
The client can then calculate ping by getting it's current time and measuring the difference
'''