import { Scene } from "./data/scene";
import { MainRenderer } from "./renderer/main_renderer";
import {Asteroid} from "./data/asteroid";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
let scene = new Scene();

scene.setPlayerPos(400, 300);
scene.setRayCount(20000);
scene.setReflectionCount(2);

canvas.addEventListener("mousemove", e =>
{
    scene.setPlayerPos(e.x, e.y);
});

let line = scene.addLine(500, 100, 600, 200);
let line3 = scene.addLine(400, 100, 400, 200);
line3.emmiting = true;

// player
scene.addAlwaysVisibleLine(500, 500, 600, 600);

new Asteroid(400, 300, 20, 10, scene);
new Asteroid(300, 300, 20, 10, scene);

new MainRenderer(canvas, scene).initialize();
