import { Line } from "./line";

export class Scene
{
    lines = Array<Line>();
    playerPos: Float32Array;
    reflectionCount: number;

    constructor()
    {
        this.playerPos = new Float32Array([0, 0]);
        this.reflectionCount = 1;
    }

    public setPlayerPos(x: number, y: number)
    {
        this.playerPos[0] = x;
        this.playerPos[1] = y;
    }

    public setReflectionCount(count: number)
    {
        this.reflectionCount = count;
    }

    public addLine(x0: number, y0: number, x1: number, y1: number): Line
    {
        let line = new Line(x0, y0, x1, y1);
        this.lines.push(line);
        return line;
    }
}