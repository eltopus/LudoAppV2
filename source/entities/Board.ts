/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import * as Collections from "typescript-collections";
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Board");


export class Board {
    public activeBoard: Collections.MultiDictionary<Number, String>;
    private signal: Phaser.Signal;
    constructor(signal: Phaser.Signal) {
        this.activeBoard = new Collections.MultiDictionary<Number, String>(null, null, true);
        this.signal = signal;
        this.signal.add(this.endOfMovement, this, 0, "eom");
    }

    /**
     * Adds <key, value> <piece.index, piece.uniqueId> to active board dictionary
     * @param piece
     * @return void
     */
    public addPieceToActiveBoard(piece: Piece): void {
        this.activeBoard.setValue(piece.index, piece.uniqueId);
    }
    /**
     * Removes <key, value> <piece.index, piece.uniqueId> from active board dictionary
     * @param piece
     * @return void
     */
    public removePieceFromActiveBoard(piece: Piece): void {
        this.activeBoard.remove(piece.index, piece.uniqueId);
    }
    /**
     * Returns appropriate boolean if active board contains piece.index
     * @param piece
     * @return boolean
     */
    public contains(piece: Piece): boolean {
        return this.activeBoard.containsKey(piece.index);
    }
    public endOfMovement(listener: string, uniqueId: string, index: number): void {
        if (listener === "eom") {
            log.debug("From Listener: " + listener + " I am adding UniqueId: " + uniqueId + " to index: " + index);
            this.activeBoard.setValue(index, uniqueId);
        }else if (listener === "backToHome") {
            log.debug("From Listener: " + listener + " I am removing UniqueId: " + uniqueId + " from index: " + index);
            this.activeBoard.remove(index, uniqueId);
            let keys = this.activeBoard.keys();
            log.debug("keysize: " + keys.length);
        }
    }

}
