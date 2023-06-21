import Vector3 from "./Vector3";
import Car from './car'
import Road from "./road";
import ElkObstacle from "./elkObstacle";

import elkMesh from "bundle-text:../assets/Box_2.obj"
import barrelMesh from "bundle-text:../assets/Tire.obj"
import Terrain from "./terrain";
import Light from "./light";
import lightMesh from "bundle-text:../assets/Light.obj"
import ConeObject from "./light_cone";

const mainCanvas = document.getElementById('mainCanvas')
mainCanvas.width = window.innerWidth
mainCanvas.height = window.innerHeight
let lastTick = performance.now()


let brightness = 2;
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

const lights = [];
for (let i = 0; i < 4; i++) {
    const light = new Light('light', lightMesh, gl)
    light.transform.position.z = i * 50;
    light.transform.position.x = -15;
    light.transform.rotation.y = Math.PI;

    const light2 = new Light('light', lightMesh, gl)
    light2.transform.position.z = i * 50;
    light2.transform.position.x = 15;
    //light2.transform.rotation.y = Math.PI /2
    lights.push(light,light2)
}


const road = new Road(gl,0,0.01);
const road2 = new Road(gl,-100,0);

const obstacles = [];

const elkObstacle = new ElkObstacle('boxes', elkMesh, gl);
elkObstacle.transform.scale = new Vector3(0.05,0.05,0.05);
elkObstacle.transform.position.y = 1.8;

const barrelObstacle = new ElkObstacle('tire', barrelMesh, gl);
barrelObstacle.transform.scale = new Vector3(0.05,0.05,0.05);
barrelObstacle.transform.position.y = 1.1;
barrelObstacle.transform.position.z = 50;

obstacles.push(barrelObstacle, elkObstacle);



const terrain = new Terrain(gl, 0, 0);
terrain.transform.position.x = 20;
const terrain2 = new Terrain(gl, 200, 0)
terrain2.transform.position.x = 20;



const lightCone = new ConeObject(gl);
lightCone.transform.position = new Vector3(10,10,10);

const car = new Car(gl, obstacles,
    function (){
    //alert('You lose')

    },
    function (){
        for (const objectOnScene of [road, road2, elkObstacle, barrelObstacle, terrain, terrain2, ...lights,]) {
            objectOnScene.setSlow()
        }
    },
    function (){
        for (const objectOnScene of [road, road2, elkObstacle, barrelObstacle, terrain, terrain2, ...lights,]) {
            objectOnScene.setFast()
        }
    })

const objectsOnScene = [car, road, road2, elkObstacle, barrelObstacle, terrain, terrain2, ...lights,];
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
        object.lights = lights;
        object.start();
    }

    gameLoop();

}

function gameLoop(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame( gameLoop )
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT );
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
        object.brightness = brightness;
        object.update(gameState.event.pressedButtonChar)
    }
    const event = gameState.event.pressedButtonChar;
    switch (event){
        case 'q':
            brightness += 0.1;
            break;
        case 'e':
            brightness -= 0.1;
            break;
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