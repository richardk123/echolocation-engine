import {Line} from "./line";
import {Body, Vector} from "matter-js";

export interface GameObject
{
    // all lines to be part of rendering
    get lines(): Line[];

    // echolocation will not apply and line will be always rendered
    get isAlwaysVisible(): boolean;

    // update lines positions
    update(): void;

    // create physical body
    get body(): Body
}