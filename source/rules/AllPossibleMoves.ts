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
            return [];
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

    public totalNumberOfRules(): number {
        return (this.activeMoves.length + this.homeMoves.length + this.onWayOutMoves.length);
    }

    public activeMoveContainsDieId(diceId: string): boolean {
        let match = false;
        for (let movement of this.activeMoves){
            if (movement.diceId === diceId) {
                match = true;
                break;
            }
        }
        return match;
    }

    public getConcatenatedPossibleMoves(): Move[] {
        let concatMoves: Move[] = [];
        concatMoves = concatMoves.concat(this.activeMoves);
        concatMoves = concatMoves.concat(this.homeMoves);
        concatMoves = concatMoves.concat(this.onWayOutMoves);
        return concatMoves;
    }

}
