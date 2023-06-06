import Vector3 from "./Vector3";
import Car from './car'
import Road from "./road";
import ElkObstacle from "./elkObstacle";

import elkMesh from "bundle-text:../assets/los.obj"
import barrelMesh from "bundle-text:../assets/Barrel.obj"
import Terrain from "./terrain";
import Light from "./light";
import lightMesh from "bundle-text:../assets/Light.obj"

const mainCanvas = document.getElementById('mainCanvas')
mainCanvas.width = window.innerWidth
mainCanvas.height = window.innerHeight
let lastTick = performance.now()

const cameraPos = new Vector3(-0.1, 0.1, 0.1);
const cameraFront = new Vector3(33.5, 0, 274.0);
const cameraUp = new Vector3(0.0, 2.0, 0.0);
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

// scene initialization
const car = new Car(gl)
const road = new Road(gl,0,0.01);
const road2 = new Road(gl,-100,0);

const elkObstacle = new ElkObstacle('los', elkMesh, gl);
elkObstacle.transform.position.y = 1.8;

const barrelObstacle = new ElkObstacle('barrel', barrelMesh, gl);
barrelObstacle.transform.scale = new Vector3(0.05,0.05,0.05);
barrelObstacle.transform.position.y = 0;

const terrain = new Terrain(gl, 0, 0);
terrain.transform.position.x = 20;
const terrain2 = new Terrain(gl, 200, 0)
terrain2.transform.position.x = 20;
const light = new Light('light', lightMesh, gl)
const objectsOnScene = [car, road, road2, elkObstacle, barrelObstacle, terrain, terrain2, light];
/////////////////////////////

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