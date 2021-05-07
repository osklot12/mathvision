const canvas = document.querySelector('#mathVision');
const ctx = canvas.getContext("2d");

let currentCanvas = 'none';
let loadingStatus = true;

// Creating arrays for color data
const graphColors = ['#E8A87C', '#C38D9E', '#E27D60'];

// Setting variables
let offset = {
    x: 0,
    y: 0
};
let grabOrigin = {
    x: 0,
    y: 0
};
let prevOffset = {
    x: 0,
    y: 0
};
let scale = 0;
let zoom = 1;
let scrollMode = 'linear';
let mouseDown = false;
let coordinatesToggle = false;
let gridOn = false;

// Choosing how many pixels each unit is
let unit = 200;

// Setting mode to dragmode
let mode = 'moveCanvas';

// Updating canvas
function updateCanvas() {
    resizeCanvas();
    if (loadingStatus == false) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentCanvas != 'none') {
            paintAllCircles();
            paintAllSquares();
            paintAllFunctions();
        };

        setAxis();
        toggleXGrid();
        toggleYGrid();
        setXAxisValues('20px Raleway');
        setYAxisValues('20px Raleway');
    };
};

// Rezising the canvas with proper dimensions
function resizeCanvas() {
    let canvasDiv = canvas.parentNode,
        styles = getComputedStyle(canvasDiv),
        w = parseInt(styles.getPropertyValue("width"), 10),
        h = parseInt(styles.getPropertyValue("height"), 10);

    canvas.width = w;
    canvas.height = h;
};

// Converting coordinates to pixels
function coordinatesToPixels(xAxis, yAxis) {
    let x = (xAxis * unit * zoom + canvas.width / 2 - offset.x * zoom);
    let y = (-yAxis * unit * zoom + canvas.height / 2 + offset.y * zoom);
    return {
        x: x,
        y: y
    };
};

// Converting pixels to coordinates
function pixelsToCoordinates(xAxis, yAxis) {
    let x = ((xAxis - canvas.width / 2) / (unit * zoom) + ((offset.x * zoom) / (unit * zoom)));
    let y = (-(yAxis - canvas.height / 2) / (unit * zoom) + (offset.y * zoom / (unit * zoom)));
    return {
        x: x,
        y: y
    };
};

// Getting mouse position on canvas
function getMousePos(evt) {
    mouseInitiated = true;
    let rect = canvas.getBoundingClientRect();
    let coordinates = pixelsToCoordinates((evt.clientX - rect.left), (evt.clientY - rect.top));
    return {
        x: coordinates.x,
        y: coordinates.y
    };
};

// Setting point in center
function setCenterPoint() {
    let center = coordinatesToPixels(0, 0);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 10, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
};

// Setting axis in center
function setAxis() {
    let center = coordinatesToPixels(0, 0);
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(0, center.y);
    ctx.lineTo(canvas.width, center.y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center.x, 0);
    ctx.lineTo(center.x, canvas.height);
    ctx.closePath();
    ctx.stroke();
};

// Moving canvas
function moveCanvas(evt) {
    offset = {
        x: prevOffset.x + (grabOrigin.x - evt.clientX) / zoom,
        y: prevOffset.y - (grabOrigin.y - evt.clientY) / zoom
    };
    updateCanvas();
};

// Setting mouse coordinates
function setMouseCoordinates(evt) {
    let coordinates = getMousePos(evt);
    ctx.fillStyle = 'white';
    ctx.font = '20px Raleway';
    let pixelsCoordinates = coordinatesToPixels(coordinates.x, coordinates.y);

    let multiplyValue = timesHalfed(unit, (unit * zoom));
    let decimalsX = 2;
    let decimalsY = 2;
    if (multiplyValue < -2) {
        decimalsX = magnitude(Math.abs(coordinates.x)) + 1;
        decimalsY = magnitude(Math.abs(coordinates.y)) + 1;
    } else if (multiplyValue > 2 && multiplyValue < 4) {
        decimalsX = 1;
        decimalsY = 1;
    } else if (multiplyValue >= 4) {
        decimalsX = 0;
        decimalsY = 0;
    }
    let string = 'x: ' + round(coordinates.x, decimalsX) + ' y: ' + round(coordinates.y, decimalsY);
    ctx.fillText(string, pixelsCoordinates.x + 60, pixelsCoordinates.y + 25);
};

// Setting values to the x axis
function setXAxisValues(font) {
    ctx.strokeStyle = "white";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = font;

    let staticValue = 0;
    let multiplyValue = timesHalfed(unit, (unit * zoom));
    let intervalStartX = (offset.x / Math.pow(2, multiplyValue) / unit - (canvas.width / 2 / unit) - 6);
    let intervalEndX = ((offset.x / Math.pow(2, multiplyValue) / unit) + (canvas.width / 2 / unit) + 6);
    for (let i = intervalStartX; i <= intervalEndX; i++) {
        let xValue = round(i, 0)
        xValue = xValue * Math.pow(2, multiplyValue);
        if (multiplyValue < 0 && xValue != Math.floor(xValue)) {
            xValue = round(xValue, Math.abs(multiplyValue));
        };
        if (xValue != 0) {
            let coordinate = coordinatesToPixels(xValue, 0);
            if (offset.y * zoom > canvas.height / 2) {
                coordinate.y = canvas.height;
                staticValue = 45;
            } else if (offset.y * zoom < - canvas.height / 2) {
                coordinate.y = 0;
            }
            ctx.beginPath();
            ctx.moveTo(coordinate.x, coordinate.y - 10);
            ctx.lineTo(coordinate.x, coordinate.y + 10);
            ctx.closePath();
            ctx.stroke();

            ctx.fillText(xValue, coordinate.x, coordinate.y + 25 - staticValue);
        }
    };
};

// Setting values to the y axis
function setYAxisValues(font) {
    ctx.strokeStyle = "white";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.font = font;

    let staticValue = 0;
    let multiplyValue = timesHalfed(unit, (unit * zoom));
    let intervalStartY = (offset.y / Math.pow(2, multiplyValue) / unit - (canvas.height / 2 / unit) - 3);
    let intervalEndY = ((offset.y / Math.pow(2, multiplyValue) / unit) + (canvas.height / 2 / unit) + 3);
    for (let i = intervalStartY; i <= intervalEndY; i++) {
        let yValue = round(i, 0)
        yValue = yValue * Math.pow(2, multiplyValue);
        if (multiplyValue < 0 && yValue != Math.floor(yValue)) {
            yValue = round(yValue, Math.abs(multiplyValue));
        };
        if (yValue != 0) {
            let coordinate = coordinatesToPixels(0, yValue);
            if (- offset.x * zoom > canvas.width / 2) {
                coordinate.x = canvas.width;
                staticValue = 50;
                ctx.textAlign = 'end';
            } else if (offset.x * zoom > canvas.width / 2) {
                coordinate.x = 0;
            };
            ctx.beginPath();
            ctx.moveTo(coordinate.x - 10, coordinate.y);
            ctx.lineTo(coordinate.x + 10, coordinate.y);
            ctx.closePath();
            ctx.stroke();

            ctx.fillText(yValue, coordinate.x + 25 - staticValue, coordinate.y);
        }
    };
};

// Toggle grid on and off for x axis
function toggleXGrid() {
    if (gridOn == true) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.288)';
        let multiplyValue = timesHalfed(unit, (unit * zoom));
        let intervalStartX = (offset.x / Math.pow(2, multiplyValue) / unit - (canvas.width / 2 / unit) - 6);
        let intervalEndX = ((offset.x / Math.pow(2, multiplyValue) / unit) + (canvas.width / 2 / unit) + 6);
        for (let i = intervalStartX; i <= intervalEndX; i++) {
            let xValue = round(i, 0)
            xValue = xValue * Math.pow(2, multiplyValue);
            if (multiplyValue < 0 && xValue != Math.floor(xValue)) {
                xValue = round(xValue, Math.abs(multiplyValue));
            };
            if (xValue != 0) {
                let coordinate = coordinatesToPixels(xValue, 0);
                ctx.beginPath();
                ctx.moveTo(coordinate.x, coordinate.y - canvas.height / 2 - offset.y * zoom);
                ctx.lineTo(coordinate.x, coordinate.y + canvas.height / 2 - offset.y * zoom);
                ctx.closePath();
                ctx.stroke();
            }
        };
    };
};

// Toggle grid on and off for y axis
function toggleYGrid() {
    if (gridOn == true) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.288)';
        let multiplyValue = timesHalfed(unit, (unit * zoom));
        let intervalStartY = (offset.y / Math.pow(2, multiplyValue) / unit - (canvas.height / 2 / unit) - 3);
        let intervalEndY = ((offset.y / Math.pow(2, multiplyValue) / unit) + (canvas.height / 2 / unit) + 3);
        for (let i = intervalStartY; i <= intervalEndY; i++) {
            let yValue = round(i, 0)
            yValue = yValue * Math.pow(2, multiplyValue);
            if (multiplyValue < 0 && yValue != Math.floor(yValue)) {
                yValue = round(yValue, Math.abs(multiplyValue));
            };
            if (yValue != 0) {
                let coordinate = coordinatesToPixels(0, yValue);
                ctx.beginPath();
                ctx.moveTo(coordinate.x + canvas.width / 2 + offset.x * zoom, coordinate.y);
                ctx.lineTo(coordinate.x - canvas.width / 2 + offset.x * zoom, coordinate.y);
                ctx.closePath();
                ctx.stroke();
            }
        };
    };
};

// Rounding numbers
function round(number, decimalPlaces) {
    let factorOfTen = Math.pow(10, decimalPlaces);
    return Math.round(number * factorOfTen) / factorOfTen;
};

// Finding magnitude of a number
function magnitude(number) {
    let result = -Math.floor(Math.log(number) / Math.log(10));
    if (result > 0) {
        return result;
    } else {
        return 0;
    }
};

// Scrolling
function scroll(direction) {
    if (direction == 'in') {
        scale = scale + 0.1;
        zoom = Math.pow(2, scale);
    } else if (direction == 'out') {
        scale = scale - 0.1;
        zoom = Math.pow(2, scale);
    };
    updateCanvas();
};

// Finding how many times numberline have zoomed
function timesHalfed(number, end) {
    return Math.floor(log(2, number / end));
};

// Log function for other bases than e
function log(base, number) {
    return Math.log(number) / Math.log(base);
};

// Finding relevant numbers to display
function vizualizeNumber(number) {
    let size = round(Math.log(number) / Math.log(10), 0);
    if (size <= -6) {
        return round(number * Math.pow(10, Math.abs(size) + 1), 2) + '*10^' + (size - 1);
    } else if (size >= 6) {
        return round(number / Math.pow(10, size), 2) + '*10^' + size;
    } else {
        return number
    }
};

// Previewing circle before initiation
function previewCircle(evt) {
    updateCanvas();
    let mousePos = coordinatesToPixels(getMousePos(evt).x, getMousePos(evt).y);
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, previewCircleRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
};

let previewCircleRadius = 200;
let circleRadiusInput = document.querySelector('#circleRadiusInput');
circleRadiusInput.addEventListener('input', function () {
    if (checkIfInteger(circleRadiusInput.value)) {
        previewCircleRadius = Number(circleRadiusInput.value) * unit * zoom;
    } else {
        console.log('Radius of circle must be a number.')
    };
});

// Resizing previewed circle
function resizeCircle(growth, evt) {
    if (growth == 'in' && previewCircleRadius > 0) {
        previewCircleRadius = previewCircleRadius - 5;
    } else if (growth == 'out') {
        previewCircleRadius = previewCircleRadius + 5;
    };
    previewCircle(evt);
    updateCircleRadius();
};

// Previewing square before initiation
let pss1;
let pss2;
let pss3;
let pss4;
function previewSquare(evt) {
    updateCanvas();
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(grabOrigin.x, grabOrigin.y);
    ctx.lineTo(evt.clientX, grabOrigin.y);
    ctx.closePath();
    ctx.stroke();
    pss1 = {
        x1: pixelsToCoordinates(grabOrigin.x, grabOrigin.y).x,
        y1: pixelsToCoordinates(grabOrigin.x, grabOrigin.y).y,
        x2: pixelsToCoordinates(evt.clientX, grabOrigin.y).x,
        y2: pixelsToCoordinates(evt.clientX, grabOrigin.y).y
    };

    ctx.beginPath();
    ctx.moveTo(grabOrigin.x, grabOrigin.y);
    ctx.lineTo(grabOrigin.x, evt.clientY);
    ctx.closePath();
    ctx.stroke();
    pss2 = {
        x1: pixelsToCoordinates(grabOrigin.x, grabOrigin.y).x,
        y1: pixelsToCoordinates(grabOrigin.x, grabOrigin.y).y,
        x2: pixelsToCoordinates(grabOrigin.x, evt.clientY).x,
        y2: pixelsToCoordinates(grabOrigin.x, evt.clientY).y
    };

    ctx.beginPath();
    ctx.moveTo(evt.clientX, grabOrigin.y);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.closePath();
    ctx.stroke();
    pss3 = {
        x1: pixelsToCoordinates(evt.clientX, grabOrigin.y).x,
        y1: pixelsToCoordinates(evt.clientX, grabOrigin.y).y,
        x2: pixelsToCoordinates(evt.clientX, evt.clientY).x,
        y2: pixelsToCoordinates(evt.clientX, evt.clientY).y
    };

    ctx.beginPath();
    ctx.moveTo(grabOrigin.x, evt.clientY);
    ctx.lineTo(evt.clientX, evt.clientY);
    ctx.closePath();
    ctx.stroke();
    pss4 = {
        x1: pixelsToCoordinates(grabOrigin.x, evt.clientY).x,
        y1: pixelsToCoordinates(grabOrigin.x, evt.clientY).y,
        x2: pixelsToCoordinates(evt.clientX, evt.clientY).x,
        y2: pixelsToCoordinates(evt.clientX, evt.clientY).y
    };
};

function checkIfInteger(string) {
    let corrects = 0;
    for (let i = 0; i <= string.length; i++) {
        if (string.charAt(i) >= 0 && string.charAt(i) <= 9 || string.charAt(i) == '.') {
            corrects++;
        };
    };
    if (corrects - 1 == string.length) {
        return true;
    } else {
        return false;
    }
};

async function paintAllCircles() {
    if (circles.docs.length > 0) {
        for (let circle of circles.docs) {
            let data = circle.data();
            let centerX = data.centerX;
            let centerY = data.centerY;
            let radius = data.radius * zoom;

            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.arc(coordinatesToPixels(centerX, centerY).x, coordinatesToPixels(centerX, centerY).y, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        };
    };
};

async function paintAllSquares() {
    if (squares.docs.length > 0) {
        for (let square of squares.docs) {
            let data = square.data();

            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(coordinatesToPixels(data.s1x1, data.s1y1).x, coordinatesToPixels(data.s1x1, data.s1y1).y);
            ctx.lineTo(coordinatesToPixels(data.s1x2, data.s1y2).x, coordinatesToPixels(data.s1x2, data.s1y2).y);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(coordinatesToPixels(data.s2x1, data.s1y1).x, coordinatesToPixels(data.s2x1, data.s2y1).y);
            ctx.lineTo(coordinatesToPixels(data.s2x2, data.s2y2).x, coordinatesToPixels(data.s2x2, data.s2y2).y);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(coordinatesToPixels(data.s3x1, data.s3y1).x, coordinatesToPixels(data.s3x1, data.s3y1).y);
            ctx.lineTo(coordinatesToPixels(data.s3x2, data.s3y2).x, coordinatesToPixels(data.s3x2, data.s3y2).y);
            ctx.closePath();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(coordinatesToPixels(data.s4x1, data.s4y1).x, coordinatesToPixels(data.s4x1, data.s4y1).y);
            ctx.lineTo(coordinatesToPixels(data.s4x2, data.s4y2).x, coordinatesToPixels(data.s4x2, data.s4y2).y);
            ctx.closePath();
            ctx.stroke();
        };
    };
};

let functionRes = 10;
let pointSpace = 2;
let showFPoints = false;
function paintAllFunctions() {
    if (functions.docs.length > 0) {
        for (let f of functions.docs) {
            let data = f.data();
            let intervalX = getDisplayedSize().x;
            let intervalY = getDisplayedSize().y;

            ctx.strokeStyle = data.color;
            for (let i = intervalX.start; i < intervalX.end; i = i + (1 / zoom) / functionRes) {
                let sum = solveParameterEquation(data.function, i);
                if (sum > intervalY.start && sum < intervalY.end) {
                    let nextSum = solveParameterEquation(data.function, i + (1 / zoom) / functionRes);
                    ctx.beginPath();
                    ctx.moveTo(coordinatesToPixels(i, sum).x, coordinatesToPixels(i, sum).y);
                    ctx.lineTo(coordinatesToPixels(i + (1 / zoom) / functionRes, nextSum).x, coordinatesToPixels(i + (1 / zoom) / functionRes, nextSum).y);
                    ctx.closePath();
                    ctx.stroke();
                };
            };

            ctx.fillStyle = data.color;
            if (showFPoints) {
                for (let i = intervalX.start; i < intervalX.end; i = i + (1 / zoom) / pointSpace) {
                    let sum = solveParameterEquation(data.function, i);
                    ctx.beginPath();
                    ctx.arc(coordinatesToPixels(i, sum).x, coordinatesToPixels(i, sum).y, 5, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                };
            };
        };
    };
};

function randomArrayObject(array) {
    return array[Math.floor(Math.random() * array.length)];
};

// Function that finds interval of units shown currently on screen
function getDisplayedSize() {
    let x = {
        start: (offset.x - (canvas.width / 2) / zoom) / unit,
        end: (offset.x + (canvas.width / 2) / zoom) / unit
    };
    let y = {
        start: (offset.y - (canvas.height / 2) / zoom) / unit,
        end: (offset.y + (canvas.height / 2) / zoom) / unit
    };
    return {
        x: x,
        y: y
    };
};

// Function that solves equation with given parameter
function solveParameterEquation(equation, xValue) {
    let e = nerdamer(equation, { x: xValue }).evaluate();
    return e.text();
};

// Function that rearranges equation
function rearrangeEquation(equation) {
    let e = nerdamer(equation);
    return e.text();
};

// Checking if the function is valid
function evaluateFunctionInput(equation) {
    let txtCheck = equation.replace(/\s/g, '');
    if (txtCheck.length == 0) {
        return {
            status: false,
            feedback: 'Function cannot be blank.'
        };
    } else {
        return {
            status: true,
            feedback: 'Function is valid.'
        };
    }
};

// Listening to the function text input for changes
const functionInput = document.querySelector('#functionInput');
functionInput.addEventListener('input', function (e) {
    let value = e.target.value;
    evaluateFunctionInput(value);
});

// Listening to the enter key being pressed while in the function input
functionInput.addEventListener('keypress', function (e) {
    if (e.key == 'Enter') {
        setFunction(functionInput.value);
    };
});

canvas.addEventListener('mousemove', function (evt) {
    // console.log(getMousePos(evt));
    if (toggleMouseCoordinates) {
        updateCanvas();
    };
    if (mouseDown && mode == 'moveCanvas') {
        moveCanvas(evt);
    } else if (mouseDown && mode == 'freeDraw') {
        freeDraw(evt);
    } else if (mode == 'previewCircle') {
        previewCircle(evt);
    } else if (mouseDown && mode == 'previewSquare') {
        previewSquare(evt);
    };
    if (coordinatesToggle) {
        setMouseCoordinates(evt);
    };
});

let sqaureStartPoint;
canvas.addEventListener('mousedown', function (evt) {
    mouseDown = true;
    if (mode == 'moveCanvas') {
        canvas.style.cursor = 'grabbing';
    } else if (mode == 'previewCircle') {
        setCircle(evt);
    }
    grabOrigin = {
        x: evt.clientX,
        y: evt.clientY
    };
    prevOffset = {
        x: offset.x,
        y: offset.y
    }
});

canvas.addEventListener('mouseup', function () {
    mouseDown = false;
    if (mode == 'moveCanvas') {
        canvas.style.cursor = 'grab';
    } else if (mode == 'previewSquare') {
        setSquare();
    };
});

canvas.addEventListener('wheel', function (event) {
    if (event.deltaY < 0 && mode == 'moveCanvas') {
        scroll('in');
    } else if (event.deltaY > 0 && mode == 'moveCanvas') {
        scroll('out');
    };

    if (event.deltaY < 0 && mode == 'previewCircle') {
        resizeCircle('in', event);
    } else if (event.deltaY > 0 && mode == 'previewCircle') {
        resizeCircle('out', event);
    };
});

window.addEventListener('resize', updateCanvas);

updateCanvas();
canvas.style.cursor = 'grab';