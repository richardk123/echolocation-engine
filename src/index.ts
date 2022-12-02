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

new Renderer(<HTMLCanvasElement> document.getElementById("gfx-main")).Initialize();