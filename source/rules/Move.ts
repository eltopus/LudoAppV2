import {Actions} from "../enums/Actions";
import {States} from "../enums/States";
export class Move {
    public pieceId: string;
    public action: Actions;
    public diceId: string;
    public state: States;
    public playBothDice: boolean;
    public mockConsumeDieValueSix: boolean;
    public mockDiceId: string;

    constructor() {
        this.action = Actions.DO_NOTHING;
        this.pieceId = " ";
        this.playBothDice = false;
        this.state = null;
        this.diceId = "";
        this.mockConsumeDieValueSix = false;
        this.mockDiceId = "";
    }

    public resetRule(): void {
        this.pieceId = "";
        this.action = Actions.DO_NOTHING;
        this.diceId = "";
        this.playBothDice = false;
        this.state = null;
        this.mockConsumeDieValueSix = false;
        this.mockDiceId = "";
    }
    // Unit Test this function
    public compare(move: Move): boolean {
        let match = false;
        if (move.action === this.action && move.diceId === this.diceId && move.pieceId === this.pieceId) {
            match = true;
        }
        return match;
    }

    public isHomeMovement(): boolean {
        return (this.state === States.AtHome);
    }
    public isActiveMovement(): boolean {
        return (this.state === States.Active);
    }
    public isOnWayOutMovement(): boolean {
        return (this.state === States.onWayOut);
    }
}
