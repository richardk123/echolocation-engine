import { Line } from "./line";

export class Scene
{
    lines: Line[];
    alwaysVisibleLines: Line[];
    playerPos: Float32Array;
    rayCount: number;
    reflectionCount: number;

    constructor()
    {
        this.playerPos = new Float32Array([0, 0]);
        this.alwaysVisibleLines = [];
        this.lines = [];
        this.rayCount = 100000;
        this.reflectionCount = 2;
    }

    public setReflectionCount(reflectionCount: number)
    {
        this.reflectionCount = reflectionCount;
    }

    public setPlayerPos(x: number, y: number)
    {
        this.playerPos[0] = x;
        this.playerPos[1] = y;
    }

    public setRayCount(count: number)
    {
        this.rayCount = count;
    }

    public addLine(x0: number, y0: number, x1: number, y1: number): Line
    {
        let line = new Line(x0, y0, x1, y1);
        this.lines.push(line);
        return line;
    }

    public addAlwaysVisibleLine(x0: number, y0: number, x1: number, y1: number): Line
    {
        let line = new Line(x0, y0, x1, y1);
        this.alwaysVisibleLines.push(line);
        return line;
    }
}