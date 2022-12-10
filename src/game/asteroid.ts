import {Line} from "../renderer/data/line";
import {Scene} from "../renderer/data/scene";
import {GameObject} from "../renderer/data/game_object";
import {Bodies, Body, Vector} from "matter-js";
import {GameObjectUtils} from "./game_object_utils";
import {SoundSource} from "../renderer/data/sound_source";

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
            const randRadius = this.randomIntFromInterval(radius / 2, radius);
            vertices.push(Vector.create(x + Math.sin(angleP1) * randRadius, y + Math.cos(angleP1) * randRadius));
        }

        this._lines = GameObjectUtils.createLinesFromVertices(vertices);
        this._body = Bodies.fromVertices(x, y, [vertices], {frictionAir: 0, friction: 0, restitution: 1});
        Body.setVelocity(this._body, Vector.create((Math.random() * 2) - 1, (Math.random() * 2) - 1));
    }

    randomIntFromInterval(min: number, max: number)
    {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    get isAlwaysVisible(): boolean
    {
        return false;
    }

    get lines(): Line[]
    {
        return this._lines;
    }

    get soundSources(): SoundSource[]
    {
        return [];
    }

    get body(): Body
    {
        return this._body;
    }

    update(): void
    {
        if (this.body.position.x < 0)
        {
            Body.setPosition(this.body, Vector.create(800, this.body.position.y));
        }
        if (this.body.position.y < 0)
        {
            Body.setPosition(this.body, Vector.create(this.body.position.x, 600));
        }

        if (this.body.position.x > 800)
        {
            Body.setPosition(this.body, Vector.create(0, this.body.position.y));
        }
        if (this.body.position.y > 600)
        {
            Body.setPosition(this.body, Vector.create(this.body.position.x, 0));
        }
    }
}