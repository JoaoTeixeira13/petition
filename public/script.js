//refer to MDN Documentation for further clarifications
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event

// function sign to be called inside the events  (using canvas context)

function sign(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

// When mouseDown is true, moving the mouse draws on the canvas

//setting initial coordinates for x, y

let mouseDown = false;
let x = 0;
let y = 0;

const canvasElem = document.getElementById("signCanvas");
const ctx = canvasElem.getContext("2d");
console.log("canvas element is ", canvasElem);

//use the event offsetX and offsetY and assign these values to x and y

canvasElem.addEventListener("mousedown", (event) => {
    x = event.offsetX;
    y = event.offsetY;
    mouseDown = true;
    console.log("mouse is down ");
});

canvasElem.addEventListener("mousemove", (event) => {
    if (mouseDown === true) {
        sign(ctx, x, y, event.offsetX, event.offsetY);
        x = event.offsetX;
        y = event.offsetY;
        console.log("mouse is moving");
    }
});

window.addEventListener("mouseup", (event) => {
    if (mouseDown === true) {
        sign(ctx, x, y, event.offsetX, event.offsetY);
        x = 0;
        y = 0;
        mouseDown = false;
        console.log("mouse is up");
    }
});
