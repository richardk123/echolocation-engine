export class Line
{
    data: Float32Array;

    constructor(x0: number, y0: number, x1: number, y1: number)
    {
        this.data = new Float32Array([x0, y0, x1, y1, 0]);
    }

    get emmiting(): boolean
    {
        return this.data[4] == 0;
    }

    set emmiting(value: boolean)
    {
        this.data[4] = value ? 1 : 0;
    }

    get x0(): number
    {
        return this.data[0];
    }
    
    set x0(x: number)
    {
        this.data[0] = x;
    }

    get y0(): number
    {
        return this.data[1];
    }    

    set y0(y: number)
    {
        this.data[1] = y;
    }

    get x1(): number
    {
        return this.data[2];
    }

    set x1(x: number)
    {
        this.data[2] = x;
    }


    get y1(): number
    {
        return this.data[3];
    }
    
    set y1(y: number)
    {
        this.data[3] = y;
    }

}