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

    constructor(x: number, y: number, vertCount: number, radius: number)
    {
        const vertices: Vector[] = [];

        for (let i = 0; i < vertCount; i++)
        {
            const angleP1 = ((Math.PI * 2) / vertCount) * i;
            vertices.push(Vector.create(x + Math.sin(angleP1) * radius, y + Math.cos(angleP1) * radius));
        }

        this._lines = GameObjectUtils.createLinesFromVertices(vertices, true);
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

    get body(): Body
    {
        return this._body;
    }

}