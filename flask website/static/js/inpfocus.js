var button = document.getElementById("sendbtn");
var msgdiv = document.getElementById('msginp');

var style = window.getComputedStyle(button);
var width = style.getPropertyValue("width");
var font_size = style.getPropertyValue("font-size");
var font_color = style.getPropertyValue("color")

button.style.display = "none"
button.style.width = "0px"
button.style.font_size = "0.3em"
button.style.display = "block"

inpfocus = function(event) {

    button.style.opacity = "1"
    button.style.width = width
    button.style.fontSize = font_size
    button.style.color = font_color
};

inpunfocus = function(event) {

    button.style.width = "0px";
    button.style.opacity = "0";
    button.style.fontSize = "0.3em";
    button.style.color = "rgba(127, 127, 127, 0)"
}