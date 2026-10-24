const helloText = document.getElementById("hello");

const colors = ["red", "blue", "green", "purple", "orange"];

let colorIndex = 0;

helloText.addEventListener("click", function () { helloText.style.color = colors[colorIndex];
helloText.textContent = "You clicked me!";

colorIndex = (colorIndex + 1) % colors.length;


});