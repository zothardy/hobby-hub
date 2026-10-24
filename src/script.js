const boxes = document.querySelectorAll(".box");
const hobbyhub = document.getElementById("hobbyhub");

const colors = ["lightblue", "lightgreen", "lightpink", "plum"];

boxes.forEach(function(box) { let colorIndex = 0;

box.addEventListener("click", function() {
    box.style.backgroundColor = colors[colorIndex];

    colorIndex = (colorIndex + 1) % colors.length;
});

hobbyhub.addEventListener("click", function() {
    boxes.forEach(function(box) {
        box.style.backgroundColor = "white";
    });
});

});