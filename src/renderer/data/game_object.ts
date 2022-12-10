import {Line} from "./line";
import {Body, Vector} from "matter-js";
import {SoundSource} from "./sound_source";

export interface GameObject
{
    // all lines to be part of rendering
    get lines(): Line[];

    get soundSources(): SoundSource[];

    // echolocation will not apply and line will be always rendered
    get isAlwaysVisible(): boolean;

    // create physical body
    get body(): Body

    // called each frame
    update(): void;
}