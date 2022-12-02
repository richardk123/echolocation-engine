import { Scene } from "./data/scene";
import { Renderer } from "./renderer";

const compatibility_elem : HTMLElement = <HTMLElement> document.getElementById("compatibility-check");

if (navigator.gpu)
{
    compatibility_elem.innerText = "works!";
}
else
{
    compatibility_elem.innerText = "not work!";
}

const canvas = <HTMLCanvasElement> document.getElementById("gfx-main");
let scene = new Scene();
scene.addLine(100, 100, 100, 200);
scene.addLine(200, 200, 200, 300);
scene.addLine(300, 300, 300, 400);

setInterval(() =>
{
    scene.lines.forEach(line =>
        {
            line.x0 += 1;
        })
}, 10);

new Renderer(canvas, scene).Initialize();