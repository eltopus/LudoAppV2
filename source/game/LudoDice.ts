import {LudoDie} from "./LudoDie";
import {Dice} from "../entities/Dice";
import {Die} from "../entities/Die";
export class LudoDice {
    public dieOne: LudoDie;
    public dieTwo: LudoDie;

    constructor(dice: Dice) {
        this.dieOne = new LudoDie(dice.dieOne);
        this.dieTwo = new LudoDie(dice.dieTwo);
    }
}
