import { Scene } from "./data/scene";
import { MainRenderer } from "./renderer/main_renderer";

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

scene.setPlayerPos(1, 0);

for(let i = 0; i < 10; i++)
{
    scene.addLine(i, i, i + 10, i + 10);
}

setInterval(() =>
{
    scene.lines.forEach(line =>
        {
            line.x0 += 1;
        })
}, 10);

new MainRenderer(canvas, scene).Initialize();