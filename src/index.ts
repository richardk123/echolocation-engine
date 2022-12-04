import { Scene } from "./data/scene";
import { MainRenderer } from "./renderer/main_renderer";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");

let scene = new Scene();

scene.setPlayerPos(400, 300);
scene.setRayCount(20000);

scene.addLine(500, 100, 600, 200);
let line = scene.addLine(400, 100, 400, 200);
line.emmiting = true;

new MainRenderer(canvas, scene).Initialize();