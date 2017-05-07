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
    constructor(signal: Phaser.Signal) {
        super(signal);
    }

    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to active board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    public addPieceToActiveBoard(piece: Piece): void {
        this.board.setValue(piece.uniqueId, piece.index);
    }
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from active board dictionary
     * @param piece
     * @return void
     */
    public removePieceFromActiveBoard(piece: Piece): void {
        this.board.remove(piece.uniqueId);
    }
    /**
     * Returns appropriate boolean if active board contains piece.index
     * @param piece
     * @return boolean
     */
    public movement(listener: string, piece: Piece): void {
        if (listener === "startmovement" && piece.isActive()) {
            this.board.setValue(piece.uniqueId, piece.index);
            // log.debug("From Listener: " + listener + " I am adding <" + piece.uniqueId + ", " + piece.index
            // + "> to active board " + this.board.size());
            this.signal.dispatch("rom", piece);
        }
        if (listener === "backToHome") {
            this.board.remove(piece.uniqueId);
             // log.debug("From Listener: " + listener + " I am removing <" + piece.uniqueId + ", " +
             // piece.index + "> from activeBoard " + this.board.size());
        }
        if (listener === "onwayout") {
            this.board.remove(piece.uniqueId);
             // log.debug("From Listener: " + listener + " I am removing <" + piece.uniqueId + ", " +
             // piece.index + "> from activeBoard because ONWAYOUT " + this.board.size());
        }
    }
    public containsInActiveBoard(piece: Piece): boolean {
        return this.board.containsKey(piece.uniqueId);
    }
}
