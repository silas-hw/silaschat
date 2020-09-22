function getCookie(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
} 

function checkCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
} 

var username = getCookie("username")
//var username = usernameCookie.split('=')[0]
if (checkCookie("username")===null){
    window.location.href = "../setname";
}

//incase the users username is being used by them but hasn't been added
data = {
    'type':'cookieName',
    'name': username
}
fetch('https://silaschat.tk/userlist', {
    method: 'POST',
    body: JSON.stringify(data)
})

var colours = ["#59bd73", "#5966bd", "#bd8959", "#b854a7", "#cc2554"]
var usercolour = colours[Math.floor(Math.random() * colours.length)]

var input = document.getElementById("input");
var socket = new WebSocket("wss://silaschat.tk:5055");

ping = function(event) {
    pingMsg = {
        "type":"ping",
        "time": Date.now()
    }
    socket.send(JSON.stringify(pingMsg));
}

updatePing = function(pingTime, pongTime) {
    ping = Math.round(pongTime - pingTime)

    var elem = document.getElementById("ping")
    elem.innerHTML = ping
}

userConfigMsg = {
    "type": "clientConn",
    "user":{
        "name":username,
        "colour":usercolour
    }
}

socket.onopen = function(event) {
    socket.send(JSON.stringify(userConfigMsg));
    window.setInterval(ping, 100);
}

window.onunload = function(event) {
    socket.close(1000, "session ended")
}

addUser = function(name, colour){

    if(!document.getElementById(name))
        var para = document.createElement("p");
        para.setAttribute("style", "color:"+colour);
        para.setAttribute("id", name);
        var content = document.createTextNode(name);

        para.appendChild(content);

        var element = document.getElementById("userlist");
        element.appendChild(para);
}

removeUser = function(msg){
    var element = document.getElementById(msg.user.name);
    element.parentElement.removeChild(element);
}

addMessage = function(msg) {
    var element = document.getElementById("chat");

    var name = document.createElement("mark")
    name.setAttribute("style", "color:"+msg.user.colour+"; background:none;")
    var username = document.createTextNode(msg.user.name)
    name.appendChild(username)

    var para = document.createElement("p");
    para.setAttribute("class", "chat-text")

    para.appendChild(name)

    if (msg.type === "message"){
    
        var content = document.createTextNode(": "+msg.content);
        para.appendChild(content);

        element.appendChild(para);
        
    } else if(msg.type === "image"){
        var img = document.createElement("img")
        img.setAttribute("src", msg.url)
        img.setAttribute("class", "imgMessage")

        element.appendChild(para)
        element.appendChild(img)
    }

    element.scrollTop = element.scrollHeight;
}

socket.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    
    if (msg.type==='message'){
        addMessage(msg)
    } else if(msg.type==='image'){
        addMessage(msg)
    } else if(msg.type==='serverConn') {
        for (var i = 0; i < msg.setup.msgHistory.length; i++) {
            addMessage(JSON.parse(msg.setup.msgHistory[i]))
        }

        for(var i = 0; i < msg.setup.currentUsers.length; i++){
            addUser(msg.setup.currentUsers[i][0], msg.setup.currentUsers[i][1])
        }
    } else if(msg.type==='newClient'){
        addUser(msg.user.name, msg.user.colour)
    } else if(msg.type==='clientDisconn'){
        console.log("User disconn");
        removeUser(msg)
    } else if(msg.type==='pong'){
        updatePing(msg.time, Date.now())
    }
}

sendmessage = function(event) {

    if (socket.readyState === 1 && input.value){
        var msg = {
            "type": "message",
            "content": input.value,
            "user": {
                "name":username,
                "colour": usercolour
            }
        }
        socket.send(JSON.stringify(msg));
        input.value = ""
    }
}

closeimgdiv = function(event){
    var elem = document.getElementById("openimg");
    elem.style.display = "none";
}

var imginput = document.getElementById("imgurl");
sendimg = function(event) {
    if (socket.readyState === 1 && imginput.value){
        var msg = {
            "type":"image",
            "url":imginput.value,
            "user":{
                "name": username,
                "colour": usercolour
            }
        }
        socket.send(JSON.stringify(msg))
    }

    closeimgdiv();
}
//prevents the form from refreshing the page on submit
var form = document.getElementById("msgform");

form.addEventListener('submit', function handleform(event) {
    event.preventDefault();
});


input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        sendmessage();
    }
});

settings = function(event) {
    window.location.href("../setname")
}

openimg = function(event) {
    var elem = document.getElementById("openimg");
    elem.style.display = "block";
}

