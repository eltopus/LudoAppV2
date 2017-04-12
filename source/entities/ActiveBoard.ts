/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import * as Collections from "typescript-collections";

import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Piece} from "../entities/Piece";

const log = factory.getLogger("model.ActiveBoard");

/**
 * Stores the <piece.uniqueId, piece.index> of all active pieces
 */
export class ActiveBoard extends Board {
    // Using MutiDictionary for both ActiveBoard and HomeBoard led to unexpected behavior
    // remove function worked for activeBoard but not for homeBoard
    public activeBoard: Collections.Dictionary<String, Number>;
    constructor(signal: Phaser.Signal) {
        super(signal);
        this.activeBoard = new Collections.Dictionary<String, Number>();
    }

    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to active board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    public addPieceToActiveBoard(piece: Piece): void {
        this.activeBoard.setValue(piece.uniqueId, piece.index);
    }
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from active board dictionary
     * @param piece
     * @return void
     */
    public removePieceFromActiveBoard(piece: Piece): void {
        this.activeBoard.remove(piece.uniqueId);
    }
    /**
     * Returns appropriate boolean if active board contains piece.index
     * @param piece
     * @return boolean
     */
    public movement(listener: string, uniqueId: string, index: number): void {
        if (listener === "eom") {
            this.activeBoard.setValue(uniqueId, index);
            // log.debug("From Listener: " + listener + " I am adding <" + uniqueId + ", " + index
             // + "> to active board " + this.activeBoard.size());
        }else if (listener === "backToHome") {
            this.activeBoard.remove(uniqueId);
            // log.debug("From Listener: " + listener + " I am removing <" + uniqueId + ", " +
            // index + "> from activeBoard " + this.activeBoard.size());
        }
    }
    public containsInActiveBoard(piece: Piece): boolean {
        return this.activeBoard.containsKey(piece.uniqueId);
    }
}
