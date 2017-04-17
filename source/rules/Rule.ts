import {Actions} from "../enums/Actions";
export class Rule {
    public pieceId: string;
    public action: Actions;
    public diceId: string;
    public playBothDice: boolean;

    constructor() {
        this.pieceId = " ";
        this.action = Actions.DO_NOTHING;
        this.pieceId = " ";
        this.playBothDice = false;
    }

    public resetRule(): void {
        this.pieceId = "";
        this.action = Actions.DO_NOTHING;
        this.pieceId = "";
        this.playBothDice = false;
    }
}
