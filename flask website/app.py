from flask import Flask, render_template, redirect, request
import os
import json
dir = os.getcwd()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/setname")
def setname():
    return render_template("setname.html")

@app.route("/settings")
def settings():
    return render_template("settings.html")

@app.route("/userlist", methods=['POST', 'GET'])
def userlist():

    with open("users.json") as f:
        users = json.load(f)

    if request.method == 'POST':
        data = request.data.decode('utf-8')
        data = json.loads(data)
        if data['type'] == 'change':
            oldname = data['old']
            users['users'].remove(oldname)
        
        name = data['name']
        
        if name not in users['users']:
            users['users'].append(name)
        
        with open("users.json", "w") as f:
            json.dump(users, f)
    
    return json.dumps(users)

if __name__ == '__main__':
    context=('./silaschat.tk.chained.crt', './privkey.pem')
    app.run(host="192.168.0.35", port=443, ssl_context=context)
