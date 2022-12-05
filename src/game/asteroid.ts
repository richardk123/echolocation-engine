import {Line} from "../renderer/data/line";
import {Scene} from "../renderer/data/scene";
import {GameObject} from "../renderer/data/game_object";
import {Bodies, Body, Vector} from "matter-js";
import {GameObjectUtils} from "./game_object_utils";
import gl, {vec2} from 'gl-matrix';

export class Asteroid implements GameObject
{
    private _lines: Line[] = [];
    private _body: Body;
    private _prevAngle: number = 0;
    private _prevPositionX: number;
    private _prevPositionY: number;

    constructor(x: number, y: number, vertCount: number, radius: number)
    {
        const vertices: Vector[] = [];

        for (let i = 0; i < vertCount; i++)
        {
            const angleP1 = ((Math.PI * 2) / vertCount) * i;
            vertices.push(Vector.create(x + Math.sin(angleP1) * radius, y + Math.cos(angleP1) * radius));
        }

        this._lines = GameObjectUtils.createLinesFromVertices(vertices, true);
        this._prevPositionX = x;
        this._prevPositionY = y;
        this._body = Bodies.fromVertices(x, y, [vertices]);
    }

    get isAlwaysVisible(): boolean
    {
        return false;
    }

    get lines(): Line[]
    {
        return this._lines;
    }

    update(): void
    {
        const xDiff = this.body.position.x - this._prevPositionX;
        const yDiff = this.body.position.y - this._prevPositionY;
        // update position
        this._lines.forEach(line =>
        {
            line.x0 += xDiff;
            line.y0 += yDiff;
            line.x1 += xDiff;
            line.y1 += yDiff;
        });
        // update angle
        this._lines.forEach(line =>
        {
            const center = vec2.fromValues(this._body.position.x, this._body.position.y);
            const p1 = vec2.fromValues(line.x0, line.y0);
            const p2 = vec2.fromValues(line.x1, line.y1);

            const newP1 = vec2.create();
            const newP2 = vec2.create();
            const angleDiff = this._body.angle - this._prevAngle;
            vec2.rotate(newP1, p1, center, angleDiff);
            vec2.rotate(newP2, p2, center, angleDiff);

            line.x0 = newP1[0];
            line.y0 = newP1[1];

            line.x1 = newP2[0];
            line.y1 = newP2[1];
        });

        this._prevAngle = this._body.angle;
        this._prevPositionX = this._body.position.x;
        this._prevPositionY = this._body.position.y;
    }

    get body(): Body
    {
        return this._body;
    }

}