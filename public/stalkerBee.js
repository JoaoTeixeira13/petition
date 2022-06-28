// stalker bee
let bee = true;

let beeX = 0,
    beeY = 0,
    stalkerBee = document.getElementById("stalker");

const hive = document.querySelector(".hexagon");
hive.addEventListener("click", () => {
    if (bee) {
        stalkerBee.style.visibility = "hidden";
        bee = false;
    } else {
        stalkerBee.style.visibility = "visible";
        bee = true;
    }
});

document.onmousemove = (event) => {
    beeX = event.pageX;
    beeY = event.pageY;
};

let delay = 75,
    revisedBeeX = -50,
    revisedBeeY = -50;

function delayStalker() {
    requestAnimationFrame(delayStalker);

    revisedBeeX += (beeX - revisedBeeX) / delay;
    revisedBeeY += (beeY - revisedBeeY) / delay;

    stalker.style.top = revisedBeeY + "px";
    stalker.style.left = revisedBeeX + "px";
}
delayStalker();

//picture frames

let frames = false;

let picFrames = document.querySelectorAll(".form-img");

if (picFrames.length > 0) {
    picFrames[0].addEventListener("mouseover", () => {
        picFrames[0].style.border = "10px solid #fda500";
    });

    picFrames[0].addEventListener("mouseout", () => {
        picFrames[0].style.border = "10px solid #f1e4e4";
    });
}
