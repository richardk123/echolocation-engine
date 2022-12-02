import { Line } from "./line";

export class Scene
{
    lines = Array<Line>();

    public addLine(x0: number, y0: number, x1: number, y1: number): Line
    {
        let line = new Line(x0, y0, x1, y1);
        this.lines.push(line);
        return line;
    }
}