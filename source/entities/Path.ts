interface PathInterface {
    x: number[];
    y: number[];
    setPath(x: number[], y: number[]): void;
}

export class Path implements PathInterface {
    public x: number[];
    public y: number[];

    public setPath(x: number[], y: number[]): void {
        this.x = x;
        this.y = y;
    }
}

