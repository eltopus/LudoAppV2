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

export class PieceMovement implements Movement {
    public activePath: Paths.ActivePath;
    public onWayOutPaths: Paths.OnWayOutPaths;
    private signal: Phaser.Signal;
    constructor(signal: Phaser.Signal) {
        this.activePath = new Paths.ActivePath();
        this.onWayOutPaths = new Paths.OnWayOutPaths();
        this.signal = signal;
    }

    public constructActivePath(piece: Piece, newIndex: number): Path {
        let currentIndex = piece.index;
        let path: Path = new Path();
        let finalIndex = currentIndex + newIndex;
        // log.debug("Moving to finalIndex " + finalIndex + " from: " + currentIndex);
        path = this.activePath.getPath(piece, finalIndex, path);
        // path.remainder has to be greater than zero to make this call
        if (path.moveStatus === MoveStatus.ShouldBeExiting && path.moveRemainder > 0) {
            path = this.constructOnWayOutPath(piece, 0, path.moveRemainder, path);
            this.signal.dispatch("onwayout", piece);

        }
        return path;
    }

    public constructOnWayOutPath(piece: Piece, from: number, newIndex: number, path?: Path): Path {
        if (typeof path === "undefined") {
            path = new Path();
            let finalIndex = piece.index + newIndex;
            path = this.onWayOutPaths.getPath(piece, from, finalIndex, path);
        }else {
            path = this.onWayOutPaths.getPath(piece, from, newIndex, path);
        }
        return path;
    }
}
