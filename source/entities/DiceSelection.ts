/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {ColorType} from "../enums/ColorType";
import {States} from "../enums/States";
import {Emit} from "../emit/Emit";
import { Piece } from "./Piece";
import { Dice } from "./Dice";
import { factory } from "../logging/ConfigLog4j";

const log = factory.getLogger("model.DiceSelection");


export class DiceSelection {
    private dice: Dice;
    private signal: Phaser.Signal;
    private diceSelectionArr: string[] = ["selectBothDice", "selectFirstDie", "selectSecondDie", "unselectBothDice"];
    private diceSelectionIndex = 0;
    private dieSelectionIndex = 1;
    private currentDieUniqueId: string;
    constructor(signal: Phaser.Signal, dice: Dice) {
        this.dice = dice;
        this.signal = signal;
        this.signal.add(this.diceSelection, this, 0);
    }

    public resetDiceSelectionIndex(): void {
        this.diceSelectionIndex = 0;
    }

    private diceSelection(listener: string, uniqueId: string, playerId: string, secondClick: boolean): void {
        if (listener === "secondClick") {
            if (secondClick === true) {
                if (this.dice.haveTwoLegitValues()) {
                    if (this.diceSelectionIndex > (this.diceSelectionArr.length - 1) ) {
                        this.diceSelectionIndex = 0;
                    }
                    this.dispatchDiceSelection(this.diceSelectionArr[this.diceSelectionIndex]);
                }else {
                    if (this.diceSelectionIndex > (this.diceSelectionArr.length - 1) ) {
                        this.dieSelectionIndex = 1;
                    }
                    this.dispatchDieSelection(this.diceSelectionArr[this.dieSelectionIndex]);
                }
            }
        }
    }

    private dispatchDiceSelection(listener: string): void {
         if (listener === "selectBothDice") {
             this.dice.selectBothDice();
             ++this.diceSelectionIndex;
         }else if (listener === "selectFirstDie") {
             this.dice.dieTwo.unSelectActiveDie();
             this.dice.dieOne.select();
             ++this.diceSelectionIndex;
         }else if (listener === "selectSecondDie") {
             this.dice.dieOne.unSelectActiveDie();
             this.dice.dieTwo.select();
             ++this.diceSelectionIndex;
         }else if (listener === "unselectBothDice") {
             this.dice.unselectBothDice();
             ++this.diceSelectionIndex;
         }
    }

    private dispatchDieSelection(listener: string): void {

         if (listener === "selectFirstDie") {
             this.dice.dieTwo.unSelectActiveDie();
             this.dice.dieOne.select();
             ++this.diceSelectionIndex;
         }else if (listener === "selectSecondDie") {
             this.dice.dieOne.unSelectActiveDie();
             this.dice.dieTwo.select();
             ++this.diceSelectionIndex;
         }else if (listener === "unselectBothDice") {
             this.dice.unselectBothDice();
             ++this.diceSelectionIndex;
         }
    }






}
