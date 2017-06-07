import {LudoGame} from "../game/Ludogame";
import {EmitDie} from "../emit/EmitDie";
import {factory} from "../logging/ConfigLog4j";
import {EmitPiece} from "../emit/EmitPiece";

const log = factory.getLogger("model.LudoGame");

export class LocalGame {
    private ludogame: LudoGame;
    private signal: Phaser.Signal;

    constructor(signal: Phaser.Signal) {
        this.signal = signal;
        this.signal.add(this.updateLudoGame, this, 0);
    }

    public setLudoGame(ludogame: LudoGame): void {
        this.ludogame = ludogame;
    }

    private updateLudoGame(listener: string, anyobject: any): void {
        switch (listener) {
            case "endOfDieRollLocal": {
                this.updateDie(anyobject);
                break;
            }
            case "consumeDieLocal": {
                this.consumeDie(anyobject);
                break;
            }
            case "selectActiveDieLocal": {
                this.selectActiveDie(anyobject);
                break;
            }
            case "unselectActiveDieLocal": {
                this.unselectActiveDie(anyobject);
                break;
            }
            case "selectActivePieceLocal": {
                this.selectActivePiece(anyobject);
                break;
            }
            case "setStateChangeLocal": {
                this.setStateChange(anyobject);
                break;
            }
            case "changePlayerLocal": {
                this.changePlayer();
                break;
            }
            case "setBackToHomeLocal": {
                this.setBackToHome(anyobject);
                break;
            }
            default:
            break;
        }
    }

    private updateDie(die: EmitDie): void {
        if (this.ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
            this.ludogame.ludoDice.dieOne = die;
            // log.debug("Updating local dieOne " + JSON.stringify(this.ludogame.ludoDice.dieOne));
        }
        if (this.ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
            this.ludogame.ludoDice.dieTwo = die;
            // log.debug("Updating local dieTwo " + JSON.stringify(this.ludogame.ludoDice.dieTwo));
        }
    }

    private consumeDie(die: EmitDie): void {
        if (this.ludogame.ludoDice.dieOne.uniqueId === die.uniqueId) {
            // console.log("Consume Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isConsumed);
            this.ludogame.ludoDice.dieOne.isConsumed = die.isConsumed;
            // console.log("ConsumeAfter After " + this.ludogame.ludoDice.dieOne.uniqueId + " value: " + this.ludogame.ludoDice.dieOne.isConsumed);
        }
        if (this.ludogame.ludoDice.dieTwo.uniqueId === die.uniqueId) {
            // console.log("Consume Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isConsumed);
            this.ludogame.ludoDice.dieTwo.isConsumed = die.isConsumed;
            // console.log("Consume After " + this.ludogame.ludoDice.dieTwo.uniqueId + " value: " + this.ludogame.ludoDice.dieTwo.isConsumed);
        }
    }

    private selectActiveDie(emitDie: EmitDie): void {
        if (this.ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
                this.ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
                // console.log("SelectAfter After " + this.ludogame.ludoDice.dieOne.uniqueId + " value: " + this.ludogame.ludoDice.dieOne.isSelected);
            }
            if (this.ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
                // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
                this.ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
                // console.log("Select After " + this.ludogame.ludoDice.dieTwo.uniqueId + " value: " + this.ludogame.ludoDice.dieTwo.isSelected);
            }
            // console.log("----------------------------------------------------------------------------------");
    }

    private unselectActiveDie(emitDie: EmitDie): void {
        if (this.ludogame.ludoDice.dieOne.uniqueId === emitDie.uniqueId) {
            // console.log("Select Before " + ludogame.ludoDice.dieOne.uniqueId + " value: " + ludogame.ludoDice.dieOne.isSelected);
            this.ludogame.ludoDice.dieOne.isSelected = emitDie.isSelected;
            // console.log("SelectAfter After " + this.ludogame.ludoDice.dieOne.uniqueId + " value: " + this.ludogame.ludoDice.dieOne.isSelected);
        }
        if (this.ludogame.ludoDice.dieTwo.uniqueId === emitDie.uniqueId) {
            // console.log("Select Before " + ludogame.ludoDice.dieTwo.uniqueId + " value: " + ludogame.ludoDice.dieTwo.isSelected);
            this.ludogame.ludoDice.dieTwo.isSelected = emitDie.isSelected;
            // console.log("Select After " + this.ludogame.ludoDice.dieTwo.uniqueId + " value: " + this.ludogame.ludoDice.dieTwo.isSelected);
        }
        // console.log("----------------------------------------------------------------------------------");
    }

    private selectActivePiece(emitPiece: EmitPiece): void {
        for (let player of this.ludogame.ludoPlayers){
            if (player.playerId === emitPiece.playerId) {
                // console.log("Player selectpiece Before " + player.playerId + " value: " + player.currentSelectedPiece);
                player.currentSelectedPiece = emitPiece.uniqueId;
                // console.log("Player selectpiece After " + player.playerId + " value: " + player.currentSelectedPiece);
                break;
            }
        }
    }

    private setStateChange(emitPiece: EmitPiece): void {
        for (let player of this.ludogame.ludoPlayers){
            if (player.playerId === emitPiece.playerId) {
                for (let piece of player.pieces) {
                    if (piece.uniqueId === emitPiece.uniqueId) {
                        // console.log("Piece state change Before " + piece.uniqueId + " value: " + piece.state + " index: " + piece.index);
                        piece.state = emitPiece.state;
                        piece.currentPosition = emitPiece.currentPosition;
                        piece.index = emitPiece.index;
                        // console.log("Piece state change  After " + piece.uniqueId + " value: " + piece.state + " index: " + piece.index);
                        break;
                    }
                }
            }
        }
    }

    private changePlayer(): void {
        let player = this.ludogame.ludoPlayers.shift();
        this.ludogame.ludoPlayers.push(player);
        this.ludogame.ludoDice.dieOne.isConsumed = true;
        this.ludogame.ludoDice.dieTwo.isConsumed = true;
        // console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ " + player.colors.join());

    }

    private setBackToHome(emitPiece: EmitPiece): void {
        for (let player of this.ludogame.ludoPlayers){
            if (player.playerId === emitPiece.playerId) {
                for (let piece of player.pieces) {
                    if (piece.uniqueId === emitPiece.uniqueId) {
                        // console.log("Piece state Before Peck " + piece.uniqueId + " value: " + piece.state);
                        piece.state = emitPiece.state;
                        piece.currentPosition = piece.homePosition;
                        // console.log("Piece state After Peck " + piece.uniqueId + " value: " + piece.state);
                        break;
                    }
                }
            }
        }
    }
}
