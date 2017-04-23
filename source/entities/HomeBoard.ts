/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import * as Collections from "typescript-collections";

import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Piece} from "../entities/Piece";

const log = factory.getLogger("model.HomeBoard");

/**
 * Stores the <piece.uniqueId, piece.index> of all home pieces
 */
export class HomeBoard extends Board {
    constructor(signal: Phaser.Signal) {
        super(signal);
    }

    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to home board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    public addPieceToHomeBoard(piece: Piece): void {
        this.board.setValue(piece.uniqueId, piece.index);
    }
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from home board dictionary
     * @param piece
     * @return void
     */
    public removePieceFromHomeBoard(piece: Piece): void {
        this.board.remove(piece.uniqueId);
    }
    public movement(listener: string, piece: Piece): void {
        if (listener === "rom") {
            if (this.board.containsKey(piece.uniqueId)) {
                this.board.remove(piece.uniqueId);
            // log.debug("From Listener: " + listener + " I am removing <" + piece.uniqueId +
            // " " + piece.index + "> from homeboard: New size: " + this.board.size());
            }
        }else if (listener === "backToHome") {
            this.board.setValue(piece.uniqueId, piece.index);
             // log.debug("From Listener: " + listener + " I am adding <" + piece.uniqueId
             // + " " + piece.index + "> to homeboard: New Size " + this.board.size());
        }
    }
    /**
     * Returns appropriate boolean if home board contains piece.index
     * @param piece
     * @return boolean
     */
    public containsInHomeBoard(piece: Piece): boolean {
        return this.board.containsKey(piece.uniqueId);
    }
}
