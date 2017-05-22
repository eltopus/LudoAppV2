import * as sio from "socket.io";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.PlayerSockets");

export class PlayerSockets {

    public emitRollDice(): void {
        log.debug("Emit rollDice");
    }

    public emitSelectDie(): void {
        log.debug("Select Die");
    }

    public emitUnselectDie(): void {
        log.debug("Unselect Die");
    }

    public emitSelectPiece(): void {
        log.debug("Select piece");
    }

    public emitUnselectPiece(): void {
        log.debug("Unselect Piece");
    }

    public emitPlayPiece(): void {
        log.debug("Play piece");
    }
}
