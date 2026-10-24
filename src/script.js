const helloText = document.getElementById("hello");

const colors = ["red", "blue", "green", "purple", "orange"];

let colorIndex = 0;
let count = 1;

helloText.addEventListener("click", function () { helloText.style.color = colors[colorIndex];
helloText.textContent = `You clicked me ${count} times.`;

colorIndex = (colorIndex + 1) % colors.length;
count++;

});