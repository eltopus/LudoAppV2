/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import * as Collections from "typescript-collections";
import { UUID } from "angular2-uuid";
import {Piece} from "../entities/Piece";


export class Board {
    public activeBoard: Collections.MultiDictionary<Number, String>;
    constructor() {
        this.activeBoard = new Collections.MultiDictionary<Number, String>(null, null, true);
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

}
