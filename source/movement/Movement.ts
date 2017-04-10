/// <reference path = "../../node_modules/phaser/typescript/phaser.d.ts" />
import {Piece} from "../entities/Piece";
import * as Paths from "../entities/Paths";
import {Path} from "../entities/Path";
import {factory} from "../logging/ConfigLog4j";
const log = factory.getLogger("model.Movement");

export interface Movement {
    constructActivePath(piece: Piece, destinationIndex: number): Path;
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

    public constructActivePath(piece: Piece, destinationIndex: number): Path {
        let currentIndex = piece.index + 1;
        let destIndex = piece.index + destinationIndex + 1;
        let path: Path = new Path();
        let pathX: number[] = new Array();
        let pathY: number[] = new Array();
        if (destIndex <= piece.getEndIndex()) {
            for (let x = 0; x < destIndex; x++) {
                pathX.push(this.activePath.x[x]);
                pathY.push(this.activePath.y[x]);
            }
        }
        path.setPath(pathX, pathY);
        return path;

    }
}
