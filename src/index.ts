import { Scene } from "./data/scene";
import { MainRenderer } from "./renderer/main_renderer";
import {Asteroid} from "./data/asteroid";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
let scene = new Scene();

scene.setPlayerPos(400, 300);
scene.setRayCount(20000);
scene.setReflectionCount(3);

canvas.addEventListener("mousemove", e =>
{
    scene.setPlayerPos(e.x, e.y);
});

let line = scene.addLine(500, 100, 600, 200);

// let line2 = scene.addLine(20, 20, 20, 300);
// line2.emmiting = true;

let line3 = scene.addLine(400, 100, 400, 200);
line3.emmiting = true;

new Asteroid(400, 300, 20, 10, scene);
new Asteroid(300, 300, 20, 10, scene);

new MainRenderer(canvas, scene).initialize();
