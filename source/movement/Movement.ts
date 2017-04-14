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
    public homePaths: Paths.HomePaths;
    constructor() {
        this.activePath = new Paths.ActivePath();
        this.homePaths = new Paths.HomePaths();
    }

    public constructActivePath(piece: Piece, newIndex: number): Path {
        let currentIndex = piece.index;
        let path: Path = new Path();
        let finalIndex = currentIndex + newIndex;
        // log.debug("Moving to finalIndex " + finalIndex + " from: " + currentIndex);
        path = this.activePath.getPath(piece, finalIndex, path);
        // path.remainder has to be greater than zero to make this call
        if (path.moveStatus === MoveStatus.ShouldBeExiting && path.moveRemainder > 0) {
            path = this.constructHomePath(piece, 0, path.moveRemainder, path);
        }
        return path;
    }

    public constructHomePath(piece: Piece, from: number, newIndex: number, path?: Path): Path {
        if (typeof path === "undefined") {
            path = new Path();
            log.debug("Path is not defined");
        }
        path = this.homePaths.getPath(piece, from, newIndex, path);
        return path;
    }
}
