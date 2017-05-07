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

const log = factory.getLogger("model.RegularPlayer");
export class RegularPlayer extends Player {
    constructor(game: Phaser.Game, name: string, playerId: string, turn: boolean, colorTypes: ColorType[], signal: Phaser.Signal,
     ruleEnforcer?: RuleEnforcer, previousDoubleSix?: boolean) {
        super(game, name, playerId, turn, colorTypes, signal, previousDoubleSix);
        this.isAI = false;
    }
}
