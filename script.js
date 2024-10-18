const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

let currentColor;

const colors = {
    red: "#C7242F",
    blue: "#3579DE",
    orange:"#F99F44",
    green:"#2ABB2A",
    white:"#F5F6F6",
    yellow:"#FFDD00"
}

const maxDiff = 70;

var pixels;

var startR, startB, startG;

document.querySelectorAll(".colorButton").forEach(element => {
    element.addEventListener("click", () => {
        currentColor = element.classList.item(1);
    });
});

window.addEventListener("load", () => {
    canvas.width = innerWidth / 3;
    canvas.height = innerWidth / 3;
    
    context.fillStyle = "#fff";
    context.fillRect(0,0,canvas.width,canvas.height);
    
    context.drawImage(document.querySelector("#template"), 0, 0, canvas.width, canvas.height)
});

document.querySelector("#download").addEventListener("click", () => {
    var image = canvas.toDataURL();
    var a = document.createElement("a");
    a.download = "skewb.png";
    a.href = image;
    a.click();
});

canvas.addEventListener("click", e => {
    context.fillStyle = currentColor;

    let canvasX = e.x;
    let canvasY = e.y;

    const bounding = canvas.getBoundingClientRect();

    canvasX -= bounding.x;
    canvasY -= bounding.y;

    canvasX = Math.floor(canvasX);
    canvasY = Math.floor(canvasY);

    var data = context.getImageData(0,0,canvas.width,canvas.height);
    pixels = data.data;

    var pixelStack = [[canvasX, canvasY]];

    let pixelIndex = (canvasX + canvas.width*canvasY)*4;

    startR = pixels[pixelIndex];
    startG = pixels[pixelIndex+1];
    startB = pixels[pixelIndex+2];

    var color = hexToRGB(colors[currentColor]);
    if(startR == color.r && startG == color.g && startB == color.b){
        return;
    }

    if(startR == 0){
        return;
    }

    while(pixelStack.length){
        let newPos = pixelStack.pop();

        let x = newPos[0];
        let y = newPos[1];

        let pixelPos = (y * canvas.width + x) * 4;

        while(y-- >= 0 && matchesStartColor(pixelPos)){
            pixelPos -= canvas.width * 4;
        }

        pixelPos += canvas.width * 4;

        var reachLeft = false;
        var reachRight = false;

        while(y++ < canvas.height - 1 && matchesStartColor(pixelPos)){
            colorPixel(pixelPos);

            if(x > 0){
                if(matchesStartColor(pixelPos - 4)){
                    if(!reachLeft){
                        pixelStack.push([x-1, y]);
                        reachLeft = true;
                    }
                }else if(reachLeft){
                    reachLeft = false;
                }
            }

            if(x < canvas.width - 1){
                if(matchesStartColor(pixelPos + 4)){
                    if(!reachRight){
                        pixelStack.push([x+1, y]);
                        reachRight = true;
                    }
                }else if(reachRight){
                    reachRight = false;
                }
            }

            pixelPos += canvas.width * 4;
        }
    }

    context.putImageData(data, 0, 0);
});

function matchesStartColor(pixelPos){
    var r = pixels[pixelPos];
    var g = pixels[pixelPos+1];
    var b = pixels[pixelPos+2];

    var rDiff = Math.abs(r - startR);
    var gDiff = Math.abs(g - startG);
    var bDiff = Math.abs(b - startB);

    return (rDiff<maxDiff && gDiff<maxDiff && bDiff<maxDiff);
}

function hexToRGB(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorPixel(pixelPos){

    const hexColor = hexToRGB(colors[currentColor]);

    pixels[pixelPos] = hexColor.r;
    pixels[pixelPos+1] = hexColor.g;
    pixels[pixelPos+2] = hexColor.b;
}