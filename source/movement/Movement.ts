/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import * as Paths from "../entities/Paths";
import {Path} from "../entities/Path";
import {factory} from "../logging/ConfigLog4j";
import {MoveStatus} from "../enums/MoveStatus";
const log = factory.getLogger("model.Movement");

export interface Movement {
    constructActivePath(piece: Piece, newIndex: number): Path;
}

export class Move implements Movement {
    public activePath: Paths.ActivePath;
    public redHomePath: Paths.RedHomePath;
    public blueHomePath: Paths.BlueHomePath;
    public yellowHomePath: Paths.YellowHomePath;
    public greenHomepath: Paths.GreenHomePath;

    constructor() {
        this.activePath = new Paths.ActivePath();
        this.redHomePath = new Paths.RedHomePath();
        this.blueHomePath = new Paths.BlueHomePath();
        this.yellowHomePath = new Paths.YellowHomePath();
        this.greenHomepath = new Paths.GreenHomePath();
    }

    public constructActivePath(piece: Piece, newIndex: number): Path {
        let currentIndex = piece.getCurrentIndex();
        let path: Path = new Path();
        let finalIndex = piece.index + newIndex;
        log.debug("finalIndex " + finalIndex + " index: " + piece.index);
        path = this.activePath.getPath(piece, finalIndex, path);
        return path;
    }
}
