/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
import * as Collections from "typescript-collections";

import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Piece} from "../entities/Piece";

const log = factory.getLogger("model.Home");

/**
 * Stores the <piece.uniqueId, piece.index> of all home pieces
 */
export class HomeBoard extends Board {
    public homeBoard: Collections.Dictionary<String, Number>;
    constructor(signal: Phaser.Signal) {
        super(signal);
        this.homeBoard = new Collections.Dictionary<String, Number>();
    }

    /**
     * Adds <key, value> <piece.uniqueId, piece.index> to home board dictionary
     * Also update value if <key, value> exists
     * @param piece
     * @return void
     */
    public addPieceToHomeBoard(piece: Piece): void {
        this.homeBoard.setValue(piece.uniqueId, piece.index);
    }
    /**
     * Removes <key, value> <piece.uniqueId, piece.index> from home board dictionary
     * @param piece
     * @return void
     */
    public removePieceFromHomeBoard(piece: Piece): void {
        this.homeBoard.remove(piece.uniqueId);
    }
    public movement(listener: string, piece: Piece): void {
        if (listener === "rom") {
            if (this.homeBoard.containsKey(piece.uniqueId)) {
                this.homeBoard.remove(piece.uniqueId);
            log.debug("From Listener: " + listener + " I am removing <" + piece.uniqueId +
            " " + piece.index + "> from homeboard: New size: " + this.homeBoard.size());
            }
        }else if (listener === "backToHome") {
            this.homeBoard.setValue(piece.uniqueId, piece.index);
             log.debug("From Listener: " + listener + " I am adding <" + piece.uniqueId
             + " " + piece.index + "> to homeboard: New Size " + this.homeBoard.size());
        }
    }
    /**
     * Returns appropriate boolean if home board contains piece.index
     * @param piece
     * @return boolean
     */
    public containsInHomeBoard(piece: Piece): boolean {
        return this.homeBoard.containsKey(piece.uniqueId);
    }
}
