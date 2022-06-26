// stalker bee
let bee = true;

let beeX = 0,
    beeY = 0,
    stalkerBee = document.getElementById("stalker");

const hive = document.querySelector(".hexagon");
console.log("hive element is ", hive);
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
