import {Die} from "../entities/Die";


export class EmitDie {
    public uniqueId: string;
    public playerId: string;
    public extFrame: number;
    public dieValue: number;
    public isSelected: boolean;
    public isConsumed: boolean;

    public setParameters(die: Die) {
        this.uniqueId = die.uniqueId;
        this.playerId = die.playerId;
        this.extFrame = die.getFrame(die.getValue());
        this.dieValue = die.getValue();
        this.isSelected = die.isSelected();
        this.isConsumed = die.isConsumed();
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
