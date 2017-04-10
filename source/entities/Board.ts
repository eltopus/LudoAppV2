/// <reference path = "../../node_modules/typescript-collections/dist/lib/index.d.ts" />
/// <reference path = "../../node_modules/angular2-uuid/index.d.ts" />
import * as Collections from "typescript-collections";
import { UUID } from "angular2-uuid";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Board");

export abstract class Board {
    public signal: Phaser.Signal;

    constructor(signal: Phaser.Signal) {
        this.signal = signal;
        this.signal.add(this.movement, this, 0, "eom");
    }
    public abstract movement(listener: string, uniqueId: string, index: number): void;

}
