import {GameObject} from "../renderer/data/game_object";
import {Line} from "../renderer/data/line";
import {Vector} from "matter-js";

export abstract class GameObjectUtils
{
    static createLinesFromVertices(vertices: Vector[], emiting?: boolean): Line[]
    {
        let lines: Line[] = [];
        for(let i = 0; i < vertices.length - 1; i++)
        {
            const curr = vertices[i];
            const next = vertices[i + 1];
            const line = new Line(curr.x, curr.y, next.x, next.y);
            if (emiting)
            {
                line.emmiting = emiting;
            }
            lines.push(line);
        }
        return lines;
    }

}