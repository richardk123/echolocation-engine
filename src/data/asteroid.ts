import {Line} from "./line";
import {Scene} from "./scene";

export class Asteroid
{
    constructor(centerX: number, centerY: number, vertCount: number, radius: number, scene: Scene)
    {
        for (let i = 0; i < vertCount; i++)
        {
            const angleP1 = ((Math.PI * 2) / vertCount) * i;
            const angleP2 = ((Math.PI * 2) / vertCount) * (i + 1);

            const line = new Line(
                centerX + Math.sin(angleP1) * radius,
                centerY + Math.cos(angleP1) * radius,
                centerX + Math.sin(angleP2) * radius,
                centerY + Math.cos(angleP2) * radius);
            line.emmiting = true;
            scene.lines.push(line);
        }
    }
}