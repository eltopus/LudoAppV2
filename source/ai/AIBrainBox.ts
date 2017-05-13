/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {RuleEnforcer} from "../rules/RuleEnforcer";
import {AllPossibleMoves} from "../rules/AllPossibleMoves";
import {MockPiece} from "./MockPiece";
import {PieceMovement} from "../movement/Movement";
import {Piece} from "../entities/Piece";
import {Path} from "../entities/Path";
import {PieceInterface} from "../entities/Piece";




export class AIBrainBox {
    private ruleEnforcer: RuleEnforcer;
    private movement: PieceMovement;
    private signal: Phaser.Signal;

    constructor(ruleEnforcer: RuleEnforcer, signal: Phaser.Signal) {
        this.ruleEnforcer = ruleEnforcer;
        this.signal = signal;
        this.movement = new PieceMovement(signal);
    }

    public constructMockpath(mockPiece: PieceInterface, index: number): Path {
        let path = new Path();
        if (mockPiece.isAtHome() || mockPiece.isActive()) {
            path = this.movement.constructActivePath(mockPiece, index);
        }else if (mockPiece.isOnWayOut()) {
            path = this.movement.constructOnWayOutPath(mockPiece, mockPiece.index, index);
        }
        return path;
    }

}
