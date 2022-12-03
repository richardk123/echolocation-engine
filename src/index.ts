import { Scene } from "./data/scene";
import { MainRenderer } from "./renderer/main_renderer";

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");

let scene = new Scene();

scene.setPlayerPos(400, 300);
scene.setReflectionCount(4);
scene.addLine(100, 100, 100, 200);
scene.addLine(300, 100, 300, 200);
scene.addLine(500, 200, 700, 100);

new MainRenderer(canvas, scene).Initialize();