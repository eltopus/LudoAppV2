/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Dice} from "./Dice";
import {Perimeters} from "./Perimeters";
import {Perimeter} from "./Perimeters";
import {LudoPiece} from "../game/LudoPiece";

const log = factory.getLogger("model.Player");

export abstract class Player extends PieceFactory {
    public name: string;
    public playerId: string;
    public turn: boolean;
    public pieces: Piece[] = [];
    public signal: Phaser.Signal;
    public currentSelectedPiece: Piece;
    public previousDoubleSix = false;
    public colorTypes: ColorType[];
    public isAI = false;
    public sequenceNumber = 0;
    private perimeters: Perimeters;
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal, ludoPieces: LudoPiece[],
     previousDoubleSix?: boolean) {
        super(game);
        this.name = name;
        this.playerId = playerId;
        this.turn = turn;
        this.pieces = new Array<Piece>();
        this.signal = signal;
        this.signal.add(this.selectCurrentPiece, this, 0, "select");
        this.currentSelectedPiece = null;
        this.perimeters = new Perimeters();
        this.colorTypes = colorTypes;
        if (typeof previousDoubleSix !== "undefined") {
            this.previousDoubleSix = previousDoubleSix;
        }
        if (typeof ludoPieces !== "undefined" && ludoPieces !== null) {
            this.pieces = this.createExistingPieces(ludoPieces, this.signal);
        }else {
            for (let x = 0; x < colorTypes.length; x++) {
            let playerPieces = this.createNewPieces(colorTypes[x], playerId, this.signal);
            for (let piece of playerPieces){
                this.pieces.push(piece);
            }
        }
        }
    }

    public setSelectedPieceByUniqueId(uniqueId: string): void {
        for (let piece of this.pieces){
            if (piece.uniqueId === uniqueId) {
                this.currentSelectedPiece = piece;
                this.currentSelectedPiece.select();
                break;
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

    public getSampleActivePieces(): Piece[] {
        let activePieces: Piece[] = [];
        for (let piece of this.pieces) {
            if (piece.isActive()) {
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

    public getSampleHomePieces(): Piece[] {
        let homePieces: Piece[] = [];
        let color: ColorType = null;
        for (let piece of this.pieces) {
            if (piece.isAtHome() && piece.color !== color) {
                homePieces.push(piece);
                color = piece.color;
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

    public piecesWithinHomePerimeters(homePieces: Piece[]): Perimeter[] {
        let piecePerimeter: Perimeter[] = [];
        for (let piece of this.pieces) {
            for (let homePiece of homePieces){
                if (piece.isWithinHomePerimeters(homePiece)) {
                    let perimeter = this.perimeters.getNewPerimeter();
                    perimeter.setPerimeters(piece.index, piece.color, this.playerId);
                    piecePerimeter.push(perimeter);
                }
            }
        }
        return piecePerimeter;
    }

    public piecesWithinActivePerimeterss(activePieces: Piece[]): number[] {
        let piecePerimeter: number[] = [];
        for (let piece of this.pieces) {
            for (let activePiece of activePieces){
                if (piece.isWithinHomePerimeters(activePiece)) {
                    piecePerimeter.push(piece.index);
                }
            }
        }
        return piecePerimeter;
    }

    public addPerimetersToPool(perimeters: Perimeter[]): void {
        for (let perimeter of perimeters){
            if (perimeter.playerId === this.playerId) {
                this.perimeters.addPerimetersToPool(perimeter, this.playerId);
            }
        }
    }

}

