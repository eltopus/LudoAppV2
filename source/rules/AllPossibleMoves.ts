import {HomeRules} from "./HomeRules";
import {ActiveRules} from "./ActiveRules";
import {OnWayOutRules} from "./OnWayOutRules";
import {Move} from "./Move";
import {States} from "../enums/States";

export class AllPossibleMoves {
    public activeMoves: Move[];
    public homeMoves: Move[];
    public onWayOutMoves: Move[];

    public setAllPossibleMoves(activeMoves: Move[], homeMoves: Move[], onWayOutMoves: Move[]): void {
        this.activeMoves = activeMoves;
        this.homeMoves = homeMoves;
        this.onWayOutMoves = onWayOutMoves;
    }

    public getPieceMoves(states: States): Move[] {
        switch (states) {
            case States.Active:
            return this.activeMoves;
            case States.AtHome:
            return this.homeMoves;
            case States.onWayOut:
            return this.onWayOutMoves;
            default:
            return null;
        }
    }

    public resetMoves(): void {
        this.activeMoves = [];
        this.homeMoves = [];
        this.onWayOutMoves = [];
    }

    public isEmpty(): boolean {
        return (this.activeMoves.length === 0 && this.homeMoves.length === 0 && this.onWayOutMoves.length === 0);
    }

}
