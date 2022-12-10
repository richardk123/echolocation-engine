export class SoundSource
{
    private _data: Float32Array = new Float32Array([0, 0, 0]);

    constructor(x: number, y: number, intensity: number)
    {
        this._data[0] = x;
        this._data[1] = y;
        this._data[2] = intensity;
    }

    get x(): number
    {
        return this._data[0];
    }

    set x(x: number)
    {
        this._data[0] = x;
    }

    get y(): number
    {
        return this._data[1];
    }

    set y(y: number)
    {
        this._data[1] = y;
    }

    get intensity(): number
    {
        return this._data[2];
    }

    set intensity(intensity: number)
    {
        this._data[2] = intensity;
    }

    get data(): Float32Array
    {
        return this._data;
    }
}