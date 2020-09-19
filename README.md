# silaschat

A simple web based, single room chat app. Without accounts.  

## json messages  

silaschat uses json objects with websocket messages to send information between the server and clients  

The type of the message can be determined by having a `"type"` property in the json object being sent. The current types are:

### message

`message` objects represent the plain text messages sent by users of the website

| Property | Type                 | Description                        |
| :------  | :--------            | :--------------------------------- |
| content  | string               | The text content of message        |
| user     | [user](#user) object | The user who sent the message      |  

example object:  

```json
{
    "type":"message",
    "content":"hello world!",
    "user":{
        "name":"foobar",
        "color":"#34ebd8"
    }
}
```

### serverConn  

`serverConn` messages are sent to a client when the server connects to them. It includes the message history, current client count and current connected users  

| Property | Type                                      | Description                           |
| :------  | :--------                                 | :---------------------------------    |
| setup    | [server setup](#server-setup) object      | Includes information about the server |  

example object:  

```json
{
    "type":"serverConn",
    "setup":{
        "currentConn":43,
        "msgHistory":[],
        "currentUsers":[["silas", "#34ebd8"]]
    }
}
```  

### clientConn  

a `clientConn` message is sent by a client once connected to the websocket server and includes information about the user connected to the websocket  

| Property | Type        | Description                          |
| :------  | :--------   | :---------------------------------   |
| username | string      | The username of the client connected |  

example object:  

```json
{
    "type":"clientConn",
    "username":"xyzzy"
}
```

### newClient  

A `newClient` message is sent to every client upon the server receiving a `clientConn` message.

| Property | Type        | Description                          |
| :------  | :--------   | :---------------------------------   |
| username | string      | The username of the client connected |  

example object:  

```json
{
    "type":"newClient",
    "username":"xyzzy"
}
```

### clientDisconn  

sent by the server to every client upon another client disconnecting  

| Property | Type                  | Description                          |
| :------  | :--------             | :---------------------------------   |
| user     | [user](#user) object  | The user that disconnected           |  

## objects  

Some messages use certain objects, such as `user objects`

### server-setup

used by the [serverConn](#serverConn) message to provide information of server state and message history  

| Property       | Type                | Description                              |
| :------        | :--------           | :---------------------------------       |
| currentConn    | integer             | Number of currently connected clients    |
| msgHistory     | array of messages   | A history of messages sent to the server |
| currentUsers   | array of tuples     | A list of currently connected users      | 

### user  

used when needing information on a given user  

| Property | Type        | Description                          |
| :------  | :--------   | :---------------------------------   |
| colour   | hex string  | The display colour of the user       |  
| name     | string      | The username of the user             |  
