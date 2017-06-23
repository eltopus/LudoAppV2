 import {MoveStatus} from "../enums/MoveStatus";
export class Path {
    public x: number[] = [];
    public y: number[] = [];
    public moveStatus = MoveStatus.ShouldContinue;
    public moveRemainder = 0;
    public mockMoveRemainder = 0;
    public newIndex = -1;

    public setPath(x: number[], y: number[]): void {
        this.x = x;
        this.y = y;
    }

    public isEmpty(): boolean {
        return (this.x.length < 1 || this.y.length < 1);
    }
}

