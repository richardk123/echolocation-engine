import { Line } from "./line";
import {GameObject} from "./game_object";
import {Common, Engine, Render, World} from "matter-js";
import {KeyboardMovement} from "./keyboard_movement";
import {GameObjectUpdater} from "./game_object_updater";
import {SoundSource} from "./sound_source";
var decomp = require('poly-decomp');

export class Scene
{
    private _soundSources: SoundSource[] = [];
    private _gameObjectUpdaters: GameObjectUpdater[] = [];
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

        Common.setDecomp(decomp);

        this._movement = new KeyboardMovement();
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
        this._movement.player = gameObject;
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


    public get soundSources(): SoundSource[]
    {
        return this._gameObjectUpdaters.flatMap(gou => gou.gameObject.soundSources);
    }

    public get lines(): Line[]
    {
        return this._gameObjectUpdaters.map(gou => gou.gameObject).filter(o => !o.isAlwaysVisible).flatMap(o => o.lines);
    }

    public get alwaysVisibleLines(): Line[]
    {
        return this._gameObjectUpdaters.map(gou => gou.gameObject).filter(o => o.isAlwaysVisible).flatMap(o => o.lines);
    }
}