import {ColorType} from "../source/enums/ColorType";
import {FactoryLudoPiece} from "./FactoryLudoPiece";

export class FactoryLudoPlayer {
    public name: string;
    public playerId: string;
    public playerName: string;
    public turn: boolean;
    public pieces: FactoryLudoPiece[] = [];
    public currentSelectedPiece: string = null;
    public previousDoubleSix: boolean;
    public colorTypes: ColorType[];
    public isAI: boolean;
    public sequenceNumber: number;
    public colors: string[];
    public isEmpty = true;
}
