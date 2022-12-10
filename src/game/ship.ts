import {Line} from "../renderer/data/line";
import {GameObject} from "../renderer/data/game_object";
import {Bodies, Body, Vector} from "matter-js";
import {GameObjectUtils} from "./game_object_utils";
import {SoundSource} from "../renderer/data/sound_source";

export class Ship implements GameObject
{
    private _lines: Line[] = [];
    private _body: Body;

    constructor(x: number, y: number, size: number)
    {
        const vertices = [
            Vector.create(x, y - size),
            Vector.create(x - size,  y + size),
            Vector.create(x,  y + (size / 2)),
            Vector.create(x + size,  y + size),
            Vector.create(x, y - size),
        ];

        this._lines = GameObjectUtils.createLinesFromVertices(vertices);
        this._body = Bodies.fromVertices(x, y, [vertices]);
    }

    get isAlwaysVisible(): boolean
    {
        return true;
    }

    get lines(): Line[]
    {
        return this._lines;
    }

    get soundSources(): SoundSource[]
    {
        return [new SoundSource(this.body.position.x, this.body.position.y, .5)];
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