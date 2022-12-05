import {GameObject} from "./game_object";
import {Body} from "matter-js";

export class KeyboardMovement
{
    private _keyW: boolean = false;
    private _keyS: boolean = false;
    private _keyA: boolean = false;
    private _keyD: boolean = false;
    private _player: GameObject;

    constructor()
    {
        //event listener
        window.addEventListener("keydown", (e) => this.onKeyDown(e, this));
        window.addEventListener("keyup", (e) => this.onKeyUp(e, this));
    }

    set player(player: GameObject)
    {
        this._player = player;
    }

    update(): void
    {
        const body = this._player.body;
        if (this._keyW)
        {
            const forceX = Math.cos(body.angle + (Math.PI / 2)) * -0.00005;
            const forceY = Math.sin(body.angle + (Math.PI / 2))* -0.00005;
            Body.applyForce( body, {x: body.position.x, y: body.position.y}, {x: forceX, y: forceY});
        }
        if (this._keyS)
        {
            Body.applyForce( body, {x: body.position.x, y: body.position.y}, {x: 0, y: 0.00005});
        }
        if (this._keyA)
        {
            body.torque = -0.0001;
        }
        if (this._keyD)
        {
            body.torque = 0.0001;
            // Body.applyForce( body, {x: body.position.x, y: body.position.y - 50}, {x: 0.000001, y: 0});
        }
    }

    applyForce(x: number, y: number)
    {
        const body = this._player.body;
        Body.applyForce( body, {x: body.position.x, y: body.position.y}, {x: x, y: y});
    }

    onKeyDown(event: KeyboardEvent, self: KeyboardMovement) {
        var key = event.key;
        switch (key) {
            case 'a':
                self._keyA = true;
                console.log('a down');
                break;
            case 'w':
                self._keyW = true;
                console.log('w down');
                break;
            case 's':
                self._keyS = true;
                console.log('s down');
                break;
            case 'd':
                self._keyD = true;
                console.log('d down');
                break;
        }
    }

    onKeyUp(event: KeyboardEvent, self: KeyboardMovement) {
        var key = event.key;
        switch (key) {
            case 'a':
                self._keyA = false;
                console.log('a up');
                break;
            case 'w':
                self._keyW = false;
                console.log('w up');
                break;
            case 's':
                self._keyS = false;
                console.log('s up');
                break;
            case 'd':
                self._keyD = false;
                console.log('d up');
                break;
        }
    }
}