let db = firebase.firestore();

// Creating color themes
const themes = [
    ['#41B3A3', '#E8A87C', '#C38D9E'],
    [],
    []
];

// Getting all mode btns
let toggleBtns = document.querySelectorAll('.modeBtn');

let dimmer = document.querySelector('#dimmer');
let startPopUp = document.querySelector('#startPopUp');
let loader = document.querySelector('#loader');

let modeBoxes = document.querySelectorAll('.modeBox');

let pickObjects = document.querySelectorAll('.objectPick');

let owner = 'guest';

// Toggling mode
function toggleMode(id) {
    for (let btn of toggleBtns) {
        btn.classList.remove('modeBtnToggled')
        btn.classList.add('modeBtn');
    };
    document.querySelector('#' + id).classList.add('modeBtnToggled');
    document.querySelector('#' + id).classList.remove('modeBtn');
    mode = id;
    for (let modeBox of modeBoxes) {
        modeBox.style.display = 'none';
    }
    if (mode == 'freeDraw') {
        document.querySelector('#freeDrawDiv').style.display = 'flex';
    } else if (mode == 'addObject') {
        document.querySelector('#addObjectDiv').style.display = 'flex';
        canvas.style.cursor = 'default';
        if (objectSlideToggle == 0) {
            mode = 'previewCircle';
            updateCircleRadius();
        } else if (objectSlideToggle == 1) {
            mode = 'previewSquare';
        }
    } else if (mode == 'moveCanvas') {
        canvas.style.cursor = 'grab';
    }
    updateCanvas();
};

// Toggling grid features
function toggleGrid(btn) {
    if (gridOn) {
        gridOn = false;
        btn.classList.add('toggleBtn');
        btn.classList.remove('toggleBtnToggled');
    } else {
        gridOn = true;
        btn.classList.remove('toggleBtn');
        btn.classList.add('toggleBtnToggled');
    };
    updateCanvas();
};

// Toggling mouse coordinates
function toggleMouseCoordinates(btn) {
    if (coordinatesToggle) {
        coordinatesToggle = false;
        btn.classList.add('toggleBtn');
        btn.classList.remove('toggleBtnToggled');
    } else {
        coordinatesToggle = true;
        btn.classList.remove('toggleBtn');
        btn.classList.add('toggleBtnToggled');
    };
    updateCanvas();
};


// Creating a function for logging the user in
async function login(type) {
    if (type == 'guest') {
        startPopUp.style.display = 'none';
        loader.style.display = 'flex';
        let loadingscreenAnimation = document.querySelector('#spinner').animate(loadingAnimation, loadingTiming);
        await setCanvas('guest');
        dimmer.style.display = 'none';
        loadingscreenAnimation.cancel();
        loader.style.display = 'none';
        owner = 'guest';
        loadingStatus = false;
        updateCanvas();
    } else {
        console.log('Please pass type of login as an argument');
    }
};


let objectSlideToggle = 0;
let timing = {
    duration: 200,
    ease: 'ease-in-out',
    fill: 'forwards'
};

// Creating a function for slideshows
function slideShow(container, objects, direction) {
    let distance = objects[0].offsetWidth;
    if (direction == 'right' && objectSlideToggle < objects.length - 1) {
        objectSlideToggle++;
        let animation = [
            { transform: 'translate(-' + distance * objectSlideToggle + 'px)' }
        ];
        container.animate(animation, timing);
    } else if (direction == 'left' && objectSlideToggle > 0) {
        objectSlideToggle--;
        let animation = [
            { transform: 'translate(' + distance * objectSlideToggle + 'px)' }
        ];
        container.animate(animation, timing);
    } else {
        console.log('slideShow function does not work with the inserted arguments. Please check the arguments!');
    };

    previewCircleRadius = 200;
    updateObjectMode();
};

// Updating circle radius in input field
function updateCircleRadius() {
    let multiplyValue = timesHalfed(unit, (unit * zoom));
    if (multiplyValue <= -2) {
        circleRadiusInput.value = round(previewCircleRadius / (unit * zoom), Math.abs(multiplyValue));
    } else if (multiplyValue > -2 && multiplyValue < 10) {
        circleRadiusInput.value = round(previewCircleRadius / (unit * zoom), 2);
    } else {
        circleRadiusInput.value = round(previewCircleRadius / (unit * zoom), 0);
    };
};

let circleOptionDiv = document.querySelector('#circleOptions');
let squareOptionDiv = document.querySelector('#squareOptions')
function updateObjectMode() {
    if (objectSlideToggle == 0) {
        mode = 'previewCircle';
        circleOptionDiv.style.display = 'flex';
        squareOptionDiv.style.display = 'none';
        updateCircleRadius();
    } else if (objectSlideToggle == 1) {
        mode = 'previewSquare';
        circleOptionDiv.style.display = 'none';
        squareOptionDiv.style.display = 'flex';
    };
};

let loadingTiming = {
    duration: 2000,
    ease: 'ease-in-out',
    fill: 'forwards',
    iterations: 'Infinity'
};

let loadingAnimation = [
    { transform: 'rotate(180deg)' },
    { transform: 'rotate(360deg)' }
];

document.querySelector('#moveCanvas').click();

let canvasList = document.querySelector('#list');
let canvasArray = [];
async function getCanvasList() {
    let canvasCollection = await db.collection('canvas').get();
    addObjects(canvasCollection.docs);
}
getCanvasList();


function addObjects(array) {
    for (let canvas of array) {
        let code = canvas.id;
        canvasArray.push({ code: code });
    };
};


function setList(group) {
    clearList();
    for (let canvas of group) {
        canvasList.innerHTML += `
            <li class="list-group-item" data-code="${canvas.code}" onclick="loadCanvasFromStartList(event)">
                ${canvas.code}
            </li>
        `;
    }
    if (group.length === 0) {
        setNoResults();
    }
};

function clearList() {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
};

function setNoResults() {
    canvasList.innerHTML += `
        <li class="list-group-item">
            No results found
        </li>
        `;
};

function getRelevancy(value, searchTerm) {
    if (value === searchTerm) {
        return 2;
    } else if (value.startsWith(searchTerm)) {
        return 1;
    } else {
        return 0;
    }
};

let searchInput = document.querySelector('#startCodeInput');
searchInput.addEventListener('keypress', async function (e) {
    if (e.key === 'Enter') {
        loadCanvasFromStartEnter(searchInput.value);
    };
});
searchInput.addEventListener('input', () => {
    let value = event.target.value;
    if (value && value.trim().length > 5) {
        value = value.trim();
        setList(canvasArray.filter(canvas => {
            return canvas.code.includes(value);
        }).sort((canvasA, canvasB) => {
            return getRelevancy(canvasB.code, value) - getRelevancy(canvasA.code, value);
        }));
    } else {
        clearList();
    }
});