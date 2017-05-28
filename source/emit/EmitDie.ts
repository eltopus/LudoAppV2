import {Die} from "../entities/Die";


export class EmitDie {
    public uniqueId: string;
    public playerId: string;
    public extFrame: number;
    public dieValue: number;
    public isSelected: boolean;
    public isConsumed: boolean;
    public gameId: string;

    public setParameters(die: Die) {
        this.uniqueId = die.uniqueId;
        this.playerId = die.playerId;
        this.extFrame = die.extFrame;
        this.dieValue = die.getFrameValue();
        this.isSelected = die.isSelected();
        this.isConsumed = die.isConsumed();
        this.gameId = die.gameId;
    }

    public resetParameters() {
        this.uniqueId = null;
        this.playerId = null;
        this.extFrame = null;
        this.dieValue = null;
        this.isSelected = null;
        this.isConsumed = null;
    }

}
