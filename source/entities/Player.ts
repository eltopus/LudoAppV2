/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Dice} from "./Dice";

const log = factory.getLogger("model.Player");

export abstract class Player extends PieceFactory {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: Piece[] = [];
    public signal: Phaser.Signal;
    public currentSelectedPiece: Piece;
    public previousDoubleSix = false;
    public isAI = false;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal,
     previousDoubleSix?: boolean) {
        super(game);
        this.name = name;
        this.playerId = playerId;
        this.turn = turn;
        this.pieces = new Array<Piece>();
        this.signal = signal;
        this.signal.add(this.selectCurrentPiece, this, 0, "select");
        this.currentSelectedPiece = null;
        if (typeof previousDoubleSix !== "undefined") {
            this.previousDoubleSix = previousDoubleSix;
        }
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

    public getFirstOccuringActivePiece(): Piece {
        let firstOccuringActivePiece: Piece = null;
        for (let piece of this.pieces) {
            if (piece.isActive()) {
                firstOccuringActivePiece = piece;
                break;
            }
        }
        return firstOccuringActivePiece;
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
    // Necessarily.. although it looks like a duplicate
    public getPlayerOnWayOutPieces(): Piece[] {
        let onWayOutPieces: Piece[] = [];
        for (let piece of this.pieces) {
            if (piece.isOnWayOut()) {
                onWayOutPieces.push(piece);
            }
        }
        return onWayOutPieces;
    }
    // Necessarily.. although it looks like a duplicate
    public getPlayerActivePieces(): Piece[] {
        let activePieces: Piece[] = [];
        for (let piece of this.pieces) {
            if (piece.isActive()) {
                activePieces.push(piece);
            }
        }
        return activePieces;
    }

    public selectAllPiece(): void {
        for (let piece of this.pieces) {
            piece.alpha = 1;
        }
        this.turn = true;
    }

    public unselectAllPiece(): void {
        for (let piece of this.pieces) {
            piece.alpha = 0.5;
        }
        this.turn = false;
    }

    public allPiecesAreAtHome(): boolean {
        let allPiecesAtHome = true;
        for (let piece of this.pieces) {
            if (!piece.isExited() && (piece.isActive() || piece.isOnWayOut())) {
                allPiecesAtHome = false;
                break;
            }
        }
        return allPiecesAtHome;
    }

    public allPiecesAreOnWayOut(): boolean {
        let allPiecesOnWayOut = false;
        for (let piece of this.pieces) {
            if (!piece.isExited() && (piece.isAtHome() || piece.isActive())) {
                allPiecesOnWayOut = true;
                break;
            }
        }
        return allPiecesOnWayOut;
    }

    /**
     * Receives select signal from piece and set select or unselect on piece
     * using piece uniqueId
     * @param uniqueId
     */
    public selectCurrentPiece(listener: string, uniqueId: string, playerId: string): void {
        // check if you are the right owner of the piece
        if (this.turn && this.playerId === playerId) {
            if (listener === "select") {
                for (let piece of this.pieces) {
                    if (piece.uniqueId === uniqueId) {
                        piece.select();
                        this.currentSelectedPiece = piece;
                        // log.debug("I am being selected..." + this.currentSelectedPiece.uniqueId);
                    }else {
                        piece.unselect();
                    }
                }
            }

        }
    }

    public pieceBelongsToMe(uniqueId: string): boolean {
        let belongToMe = false;
        for (let piece of this.pieces){
            if (piece.uniqueId === uniqueId) {
                belongToMe = true;
                break;
            }
        }
        return belongToMe;
    }

    public getPieceByUniqueId(uniqueId: string): Piece {
        let matchingPiece = null;
        for (let piece of this.pieces){
            if (piece.uniqueId === uniqueId) {
                matchingPiece = piece;
                break;
            }
        }
        return matchingPiece;
    }

    public hasActivePieces(): boolean {
        let active = false;
        for (let piece of this.pieces) {
            if (piece.isActive()) {
                active = true;
                break;
            }
        }
        return active;
    }

    public hasOnWayOutPieces(): boolean {
        let onWayOut = false;
        for (let piece of this.pieces) {
            if (piece.isOnWayOut()) {
                onWayOut = true;
                break;
            }
        }
        return onWayOut;
    }

    public hasHomePieces(): boolean {
        let home = false;
        for (let piece of this.pieces) {
            if (piece.isAtHome()) {
                home = true;
                break;
            }
        }
        return home;
    }

    public hasExactlyOneActivePiece(): boolean {
        let activePieceCount = 0;
        for (let piece of this.pieces) {
            if (piece.isActive()) {
                ++activePieceCount;
                if (activePieceCount > 1) {
                    break;
                }
            }
        }
        return (activePieceCount === 1);
    }

    public hasExactlyOnePieceLeft(): boolean {
        let pieceCount = 0;
        for (let piece of this.pieces) {
            if (piece.isActive() || piece.isAtHome() || piece.isOnWayOut()) {
                ++pieceCount;
                if (pieceCount > 1) {
                    break;
                }
            }
        }
        return (pieceCount === 1);
    }
    public printPieceCounts(): void {
        let active = this.activePieceCount();
        let home = this.homePieceCount();
        let onw = this.onwayoutCount();
        let exit = this.exitPieceCount();
        log.debug("active: " + active + " home: " + home + " onwayout: " + onw + " exit: " + exit + " length: " + this.pieces.length);
    }

    public homePieceCount(): number {
        let homePieceCounts = 0;
        for (let piece of this.pieces) {
            if (piece.isAtHome()) {
                ++homePieceCounts;
            }
        }
        return homePieceCounts;
    }

    public activePieceCount(): number {
        let activePieceCounts = 0;
        for (let piece of this.pieces) {
            if (piece.isActive()) {
                ++activePieceCounts;
            }
        }
        return activePieceCounts;
    }

    public onwayoutCount(): number {
        let onwayoutPieceCounts = 0;
        for (let piece of this.pieces) {
            if (piece.isOnWayOut()) {
                ++onwayoutPieceCounts;
            }
        }
        return onwayoutPieceCounts;
    }

    public exitPieceCount(): number {
        let exitPieceCounts = 0;
        for (let piece of this.pieces) {
            if (piece.isExited()) {
                ++exitPieceCounts;
            }
        }
        return exitPieceCounts;
    }

}

