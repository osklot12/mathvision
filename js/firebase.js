let guestID;

async function setCanvas(owner) {
    if (owner == 'guest') {
        await db.collection('canvas').add({
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            owner: 'guest'
        })
            .then(function (docRef) {
                currentCanvas = docRef.id;
            })
            .catch(function (error) {
                console.log('Error occured while trying to create new canvas.', error)
            });
        await addDatabaseListeners();
        await getCanvasObjects();
    };
};

async function addDatabaseListeners() {
    addCircleListener();
    addSquareListener();
    addFunctionListener();
};

async function getCanvasObjects() {
    await getCircles();
    await getSquares();
    await getFunctions();
};

async function setCircle(evt) {
    let center = getMousePos(evt);
    if (owner == 'guest') {
        await db.collection('circles').add({
            centerX: center.x,
            centerY: center.y,
            radius: previewCircleRadius / zoom,
            owner: 'guest',
            canvas: currentCanvas,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date())
        })
            .catch(function (error) {
                console.log('Error occured while trying to create new circle.', error)
            });
        updateCanvas();
    };
};

async function setSquare(evt) {
    if (owner == 'guest') {
        await db.collection('squares').add({
            s1x1: pss1.x1,
            s1y1: pss1.y1,
            s1x2: pss1.x2,
            s1y2: pss1.y2,
            s2x1: pss2.x1,
            s2y1: pss2.y1,
            s2x2: pss2.x2,
            s2y2: pss2.y2,
            s3x1: pss3.x1,
            s3y1: pss3.y1,
            s3x2: pss3.x2,
            s3y2: pss3.y2,
            s4x1: pss4.x1,
            s4y1: pss4.y1,
            s4x2: pss4.x2,
            s4y2: pss4.y2,
            owner: 'guest',
            canvas: currentCanvas,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date())
        })
            .catch(function (error) {
                console.log('Error occured while trying to create new circle.', error)
            });
        updateCanvas();
    };
};

let circles;
async function getCircles() {
    circles = await db.collection('circles').where('canvas', '==', currentCanvas).get();
    updateCanvas();
};

let squares;
async function getSquares() {
    squares = await db.collection('squares').where('canvas', '==', currentCanvas).get();
    updateCanvas();
};

let functions;
async function getFunctions() {
    functions = await db.collection('functions').where('canvas', '==', currentCanvas).get();
    updateCanvas();
};

let circleUnsubscribe = function () { };
async function addCircleListener() {
    circleUnsubscribe();
    circleUnsubscribe = await db.collection('circles').where('canvas', '==', currentCanvas).onSnapshot(async function (snapshot) {
        getCircles();
        for (let changes of snapshot.docChanges()) {

        };
    });
};

let squaresUnsubscribe = function () { };
async function addSquareListener() {
    squaresUnsubscribe();
    squaresUnsubscribe = await db.collection('squares').where('canvas', '==', currentCanvas).onSnapshot(async function (snapshot) {
        getSquares();
        for (let changes of snapshot.docChanges()) {

        };
    });
};

let functionsUnsubscribe = function () { };
async function addFunctionListener() {
    functionsUnsubscribe();
    functionsUnsubscribe = await db.collection('functions').where('canvas', '==', currentCanvas).onSnapshot(async function (snapshot) {
        getFunctions();
        for (let changes of snapshot.docChanges()) {

        };
    });
};

async function loadCanvasFromStartList(event) {
    let targetCanvas = event.target;
    currentCanvas = targetCanvas.dataset.code;
    startPopUp.style.display = 'none';
    loader.style.display = 'flex';
    let loadingscreenAnimation = document.querySelector('#spinner').animate(loadingAnimation, loadingTiming);
    await addDatabaseListeners();
    await getCanvasObjects();
    dimmer.style.display = 'none';
    loadingscreenAnimation.cancel();
    loader.style.display = 'none';
    owner = 'guest';
    loadingStatus = false;
    updateCanvas();
};

async function loadCanvasFromStartEnter(code) {
    currentCanvas = code;
    startPopUp.style.display = 'none';
    loader.style.display = 'flex';
    let loadingscreenAnimation = document.querySelector('#spinner').animate(loadingAnimation, loadingTiming);
    await addDatabaseListeners();
    await getCanvasObjects();
    dimmer.style.display = 'none';
    loadingscreenAnimation.cancel();
    loader.style.display = 'none';
    owner = 'guest';
    loadingStatus = false;
    updateCanvas();
};

async function setFunction(string) {
    if (owner == 'guest') {
        await db.collection('functions').add({
            function: string,
            owner: owner,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            canvas: currentCanvas,
            color: randomArrayObject(graphColors)
        })
            .catch(function (error) {
                console.log('Error occured while trying to create new function.', error)
            });
        functionInput.value = "";
        updateCanvas();
    };
};