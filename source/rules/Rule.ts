import {Actions} from "../enums/Actions";
export class Rule {
    public diceValue: number;
    public pieceId: string;
    public action: Actions;
    constructor(diceValue: number, pieceId: string, action: Actions) {
        this.diceValue = diceValue;
        this.pieceId = pieceId;
        this.action = action;
    }
}
