import Vector3 from "./Vector3";
import Car from './car'
import Road from "./road";

const mainCanvas = document.getElementById('mainCanvas')
mainCanvas.width = window.innerWidth
mainCanvas.height = window.innerHeight
let lastTick = performance.now()

const cameraPos = new Vector3(-0.1, 0.7, 0.1);
const cameraFront = new Vector3(33.5, -56.2, 274.0);
const cameraUp = new Vector3(0.0, 1.0, 0.0);
const fov = 45.0;


const lightPos = new Vector3(1.2, 1.0, 0.0);
const lightOn = new Vector3(-1.0, 0.3, 0.0);
const lightOff = new Vector3(0.0, 0.0, 0.0);
const view = lightOn;

const a = -36.1;
const b = 40.0;
const aspect = mainCanvas.width / mainCanvas.height;
const r = -1.089;
const projection = perspective(r);

const gameState = {
    tickLength: 16,
    lastTick: 0,
    score: 0,
    time: 0,
    event: {
        pressedButtonChar: ''
    }
}

const gl = mainCanvas.getContext('webgl2', {antialias : false});

const car = new Car(gl)
const road = new Road(gl,0,0.01);
const road2 = new Road(gl,-100,0);
const objectsOnScene = [car, road, road2];

function run() {
    document.addEventListener('keydown', onKeyDown, false)
    document.addEventListener('keyup', onKeyUp, false)

    function onKeyDown(event){
        const keyName = event.key;
        gameState.event.pressedButtonChar = keyName;
        console.log('keyName', keyName);
    }

    function onKeyUp(event){
        gameState.event.pressedButtonChar = '';
    }

    for (const object of objectsOnScene) {
        object.start();
    }

    gameLoop();

}

function gameLoop(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame( gameLoop )
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const nowish = performance.now()
    const delta = nowish - lastTick
    lastTick = nowish
    update( delta );
    draw( delta );
    gameState.lastRender = tFrame;

}

function update(delta) {
    for (const object of objectsOnScene) {
        object.update(gameState.event.pressedButtonChar)
    }
}

function draw(delta) {
    for (const object of objectsOnScene) {
        object.draw(lightPos, view, projection, cameraPos, cameraFront, cameraUp)
    }
}
function perspective(r) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1,-1.0/r,
        0, 0, 0, 1
    ];
}
run()