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

        let line = new Line(vertices[0].x, vertices[0].y, vertices[vertices.length - 1].x, vertices[vertices.length - 1].y);
        if (emiting)
        {
            line.emmiting = emiting;
        }
        lines.push(line);

        return lines;
    }

}