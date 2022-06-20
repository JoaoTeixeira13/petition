//refer to MDN Documentation for further clarifications
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

// When true, moving the mouse draws on the canvas

let isDrawing = false;
let x = 0;
let y = 0;

const canvasElem = document.getElementById("signCanvas");
const context = canvasElem.getContext("2d");
console.log("canvas element is ", canvasElem);

canvasElem.addEventListener("mousedown", (event) => {
    x = event.offsetX;
    y = event.offsetY;
    isDrawing = true;
    console.log("mouse is down ");
});

canvasElem.addEventListener("mousemove", (event) => {
    if (isDrawing === true) {
        drawLine(context, x, y, event.offsetX, event.offsetY);
        x = event.offsetX;
        y = event.offsetY;
        console.log("mouse is moving");
    }
});

window.addEventListener("mouseup", (event) => {
    if (isDrawing === true) {
        drawLine(context, x, y, event.offsetX, event.offsetY);
        x = 0;
        y = 0;
        isDrawing = false;
        console.log("mouse is up");
    }
});
