


function getCookie(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
} 

var input = document.getElementById("input")

//var protocol = window.location.protocol;
//var host = window.location.host;
//var url = protocol+'//'+host;

var url = "https://silaschat.tk:8080"


submitname = function(event) {
    var response = fetch(url+'/userlist')
    .then(response => response.json())
    .then(response => {
    if (input.value && !response.users.includes(input.value))  {
        
        oldUsername = getCookie("username")
        
        if(oldUsername && response.users.includes(oldUsername)){
            data = {
                "type":"change",
                "old": oldUsername,
                "name": input.value
            }

            fetch(url+'/userlist',
            {
                method:"POST",
                body: JSON.stringify(data)
            })
        } else {
            data = {
                "type":"new",
                "name":input.value
            }
            fetch(url+'/userlist',
            {
                method:"POST",
                body: JSON.stringify(data)
            })
        }
        
        document.cookie = "username="+input.value+" ;expires=Thu, 18 Dec 2100 12:00:00 UTC; path=/"
        window.location.href = "../";
    
    } else if (response.users.includes(input.value)){
        alert("Username already being used")
    }});
    
}

input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        submitname();
    }
});