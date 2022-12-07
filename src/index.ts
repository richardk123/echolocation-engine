import { Scene } from "./renderer/data/scene";
import { MainRenderer } from "./renderer/main_renderer";
import {Asteroid} from "./game/asteroid";
import {Ship} from "./game/ship";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
let scene = new Scene();

scene.setRayCount(20000);
scene.setReflectionCount(5);

// const a1 = new Asteroid(400, 300, 20, 10);
// const a2 = new Asteroid(300, 300, 20, 10);
const ship = new Ship(400, 400, 10);

for (let i = 0; i < 10; i++)
{
    const a = new Asteroid(Math.random() * 80 * i, Math.random() * 60 * i, 5, 10 + (Math.random() * 10), true);
    scene.addGameObject(a);
}

scene.addGameObjects(ship);
scene.setPlayer(ship);

new MainRenderer(canvas, scene).initialize();