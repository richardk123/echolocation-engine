import { Line } from "./line";
import {GameObject} from "./game_object";
import {Engine, Render, World} from "matter-js";
import {KeyboardMovement} from "./keyboard_movement";
import {GameObjectUpdater} from "./game_object_updater";

export class Scene
{
    private _player: GameObject;
    private _gameObjectUpdaters: GameObjectUpdater[] = [];
    private _rayCount: number = 100000;
    private _reflectionCount: number = 2;
    private _engine: Engine;
    private _world: World;
    private _movement: KeyboardMovement;
    constructor()
    {
        // create engine
        this._engine = Engine.create();
        this._world = this._engine.world;
        this._engine.gravity.y = 0;

        // create renderer
        let render = Render.create({
            element: document.body,
            engine: this._engine,
            options: {
                width: 800,
                height: 600,
                showVelocity: true
            }
        });

        // fit the render viewport to the scene
        Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: 800, y: 600 }
        });

        Render.run(render);

        this._movement = new KeyboardMovement();
    }

    // how many times ray reflects
    public setReflectionCount(reflectionCount: number)
    {
        this._reflectionCount = reflectionCount;
    }

    // update all gameobjects
    public update(): void
    {
        this._movement.update();
        Engine.update(this._engine);
        this._gameObjectUpdaters.forEach(gou => gou.update());
    }

    // position of player
    public setPlayer(gameObject: GameObject)
    {
        this._player = gameObject;
        this._movement.player = gameObject;
    }

    // number of rays to simulate outwards player position
    public setRayCount(count: number)
    {
        this._rayCount = count;
    }

    public addGameObject(gameObject: GameObject)
    {
        World.add(this._world, gameObject.body);
        this._gameObjectUpdaters.push(new GameObjectUpdater(gameObject));
    }

    public addGameObjects(...gameObjects: GameObject[])
    {
        gameObjects.forEach(go =>
        {
            this.addGameObject(go);
        });
    }

    public get lines(): Line[]
    {
        return this._gameObjectUpdaters.map(gou => gou.gameObject).filter(o => !o.isAlwaysVisible).flatMap(o => o.lines);
    }

    public get alwaysVisibleLines(): Line[]
    {
        return this._gameObjectUpdaters.map(gou => gou.gameObject).filter(o => o.isAlwaysVisible).flatMap(o => o.lines);
    }

    public get playerPos(): Float32Array
    {
        return new Float32Array([this._player.body.position.x, this._player.body.position.y]);
    }

    public get rayCount(): number
    {
        return this._rayCount;
    }

    public get reflectionCount(): number
    {
        return this._reflectionCount;
    }
}