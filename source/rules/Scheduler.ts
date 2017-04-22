/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import * as Collections from "typescript-collections";
import {Player} from "../entities/Player";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Scheduler");

export class Scheduler {
    public schedule: Collections.Queue<Player>;
    constructor() {
        this.schedule = new Collections.Queue<Player>();
    }

    public getNextPlayer(): Player {
        // let player: Player = this.schedule.dequeue();
        let player: Player = this.getCurrentPlayer();
        /*
        player.unselectAllPiece();
        this.schedule.enqueue(player);
        player = this.schedule.peek();
        player.selectAllPiece();
        */
        return player;
    }

    public getCurrentPlayer(): Player {
        return (this.schedule.peek());
    }
}
