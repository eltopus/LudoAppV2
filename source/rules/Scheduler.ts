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
        // log.debug("Before schedule " + this.schedule.peek().name);
        let player: Player = this.schedule.dequeue();
        this.schedule.enqueue(player);
        // log.debug("After schedule " + this.schedule.peek().name);
        return player;
    }

    public getCurrentPlayer(): Player {
        return (this.schedule.peek());
    }
}
