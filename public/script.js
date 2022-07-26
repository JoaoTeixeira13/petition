//refer to MDN Documentation for further clarifications

// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event

// function sign to be called inside the events  (using canvas context)

let signedCanvas = false;

function sign(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2.5;
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

//use the event offsetX and offsetY and assign these values to x and y

canvasElem.addEventListener("mousedown", (event) => {
    x = event.offsetX;
    y = event.offsetY;
    mouseDown = true;
});

canvasElem.addEventListener("mousemove", (event) => {
    if (mouseDown === true) {
        sign(ctx, x, y, event.offsetX, event.offsetY);
        x = event.offsetX;
        y = event.offsetY;
    }
});

window.addEventListener("mouseup", (event) => {
    if (mouseDown === true) {
        sign(ctx, x, y, event.offsetX, event.offsetY);
        x = 0;
        y = 0;
        mouseDown = false;
        signedCanvas = true;
    }
    // inject the canvas toDataURL result into the input signature field
    if (signedCanvas) {
        let dataURL = canvasElem.toDataURL();
        document.querySelector('input[name="signature"]').value = dataURL;
    }
});
