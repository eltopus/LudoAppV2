/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import {PieceFactory} from "../entities/PieceFactory";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";
import {Board} from "./Board";
import {Dice} from "./Dice";
import {Player} from "./Player";
import {RuleEnforcer} from "../rules/RuleEnforcer";
import {Move} from "../rules/Move";
import {LudoPiece} from "../game/LudoPiece";


const log = factory.getLogger("model.RegularPlayer");
export class RegularPlayer extends Player {
    constructor(game: Phaser.Game, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal, playerName: string,
    socket: any, gameId: string, ludoPiece?: LudoPiece[],
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, playerId, turn, colorTypes, signal, playerName, socket, gameId, ludoPiece, previousDoubleSix);
        this.isAI = false;
    }
}
