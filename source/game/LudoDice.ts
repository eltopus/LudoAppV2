import {LudoDie} from "./LudoDie";
import {Dice} from "../entities/Dice";
import {Die} from "../entities/Die";
export class LudoDice {
    public dieOne: LudoDie;
    public dieTwo: LudoDie;

    public setParameters(dice: Dice): void {
        this.dieOne = new LudoDie();
        this.dieOne.setParameters(dice.dieOne);
        this.dieTwo = new LudoDie();
        this.dieTwo.setParameters(dice.dieTwo);
    }
}
