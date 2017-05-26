import {Die} from "../entities/Die";
import {Dice} from "../entities/Dice";
import {EmitDie} from "./EmitDie";


export class EmitDice {
    public dieOne: EmitDie = new EmitDie();
    public dieTwo: EmitDie = new EmitDie();

    public setParameters(dice: Dice) {
        this.dieOne.setParameters(dice.dieOne);
        this.dieTwo.setParameters(dice.dieOne);
    }

    public resetParameters() {
        this.dieOne.resetParameters();
        this.dieTwo.resetParameters();
    }

}
