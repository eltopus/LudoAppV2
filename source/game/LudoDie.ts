import {Die} from "../entities/Die";

export class LudoDie {
    public uniqueId: string;
    public playerId: string;
    public extFrame: number;
    public dieValue: number;
    public isSelected: boolean;
    public isConsumed: boolean;

    constructor(die: Die) {
        this.uniqueId = die.uniqueId;
        this.playerId = die.playerId;
        this.extFrame = die.getFrame(die.getValue());
        this.dieValue = die.getValue();
        this.isSelected = die.isSelected();
        this.isConsumed = die.isConsumed();
    }
}
