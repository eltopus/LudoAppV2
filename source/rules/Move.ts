import {Actions} from "../enums/Actions";
import {States} from "../enums/States";
export class Move {
    public pieceId: string;
    public action: Actions;
    public diceId: string;
    public state: States;
    public playBothDice: boolean;

    constructor() {
        this.pieceId = " ";
        this.action = Actions.DO_NOTHING;
        this.pieceId = " ";
        this.playBothDice = false;
        this.state = null;
    }

    public resetRule(): void {
        this.pieceId = "";
        this.action = Actions.DO_NOTHING;
        this.pieceId = "";
        this.playBothDice = false;
        this.state = null;
    }
}
