/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Dice} from "./Dice";

const log = factory.getLogger("model.Player");

export interface PlayerInterface {
    name: string;
    playerId: string;
    turn: boolean;
    pieces: Piece[];
    signal: Phaser.Signal;
    currentPiece: Piece;
    selectCurrentPiece(listener: string, uniqueId: string, playerId: string): void;
}

export class Player extends PieceFactory implements PlayerInterface {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: Piece[] = [];
    public signal: Phaser.Signal;
    public currentPiece: Piece;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal) {
        super(game);
        this.name = name;
        this.playerId = playerId;
        this.turn = turn;
        this.pieces = new Array<Piece>();
        this.signal = signal;
        this.signal.add(this.selectCurrentPiece, this, 0, "select");
        this.currentPiece = null;

        for (let x = 0; x < colorTypes.length; x++) {
            let playerPieces = this.createNewPieces(colorTypes[x], playerId, this.signal);
            for (let piece of playerPieces){
                this.pieces.push(piece);
            }
        }
    }

    public roll(dice: Dice, value1?: number, value2?: number): void {
        dice.roll(this.playerId, value1, value2);
    }


    public getActivePieces(board: Board): Piece[] {
        let activePieces: Piece[] = [];
        for (let piece of this.pieces) {
            let index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isActive()) {
                activePieces.push(piece);
            }
        }
        return activePieces;
    }

    public getHomePieces(board: Board): Piece[] {
        let homePieces: Piece[] = [];
        for (let piece of this.pieces) {
            let index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isAtHome()) {
                homePieces.push(piece);
            }
        }
        return homePieces;
    }

    public getOnWayOutPieces(board: Board): Piece[] {
        let onWayOutPieces: Piece[] = [];
        for (let piece of this.pieces) {
            let index = board.board.getValue(piece.uniqueId);
            if (typeof index !== "undefined" && piece.isOnWayOut()) {
                onWayOutPieces.push(piece);
            }
        }
        return onWayOutPieces;
    }

    public selectAllPiece(): void {
        for (let piece of this.pieces) {
            piece.alpha = 1;
        }
    }

    public unselectAllPiece(): void {
        for (let piece of this.pieces) {
            piece.alpha = 0.5;
        }
    }

    /**
     * Receives select signal from piece and set select or unselect on piece
     * using piece uniqueId
     * @param uniqueId
     */
    public selectCurrentPiece(listener: string, uniqueId: string, playerId: string): void {
        // check if you are the right owner of the piece
        if (this.playerId === playerId) {
            if (listener === "select") {
                for (let piece of this.pieces) {
                    if (piece.uniqueId === uniqueId) {
                        piece.select();
                        this.currentPiece = piece;
                        // log.debug("I am being selected..." + this.currentPiece.uniqueId);
                    }else {
                        piece.unselect();
                    }
                }
            }

        }
    }

}

