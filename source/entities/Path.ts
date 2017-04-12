 import {MoveStatus} from "../enums/MoveStatus";
export class Path {
    public x: number[] = new Array();
    public y: number[] = new Array();
    public moveStatus = MoveStatus.ShouldContinue;
    public moveRemainder = 0;

    public setPath(x: number[], y: number[]): void {
        this.x = x;
        this.y = y;
    }
}

