import {GameObject} from "./game_object";
import {vec2} from "gl-matrix";

export class GameObjectUpdater
{
    private _gameObject: GameObject;
    private _prevAngle: number = 0;
    private _prevPositionX: number;
    private _prevPositionY: number;

    constructor(gameObject: GameObject)
    {
        this._gameObject = gameObject;
        this._prevPositionX = this._gameObject.body.position.x;
        this._prevPositionY = this._gameObject.body.position.y;
    }

    update()
    {
        const xDiff = this._gameObject.body.position.x - this._prevPositionX;
        const yDiff = this._gameObject.body.position.y - this._prevPositionY;
        const angleDiff = this._gameObject.body.angle - this._prevAngle;

        // update position
        this._gameObject.lines.forEach(line =>
        {
            line.x0 += xDiff;
            line.y0 += yDiff;
            line.x1 += xDiff;
            line.y1 += yDiff;
        });
        // update angle
        this._gameObject.lines.forEach(line =>
        {
            const center = vec2.fromValues(this._gameObject.body.position.x, this._gameObject.body.position.y);
            const p1 = vec2.fromValues(line.x0, line.y0);
            const p2 = vec2.fromValues(line.x1, line.y1);

            const newP1 = vec2.create();
            const newP2 = vec2.create();

            vec2.rotate(newP1, p1, center, angleDiff);
            vec2.rotate(newP2, p2, center, angleDiff);

            line.x0 = newP1[0];
            line.y0 = newP1[1];

            line.x1 = newP2[0];
            line.y1 = newP2[1];
        });

        this._prevAngle = this._gameObject.body.angle;
        this._prevPositionX = this._gameObject.body.position.x;
        this._prevPositionY = this._gameObject.body.position.y;
    }

    get gameObject(): GameObject
    {
        return this._gameObject;
    }
}