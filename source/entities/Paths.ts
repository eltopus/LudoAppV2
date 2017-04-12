import {ColorType} from "../enums/ColorType";
import {MoveStatus} from "../enums/MoveStatus";
import {Path} from "./Path";
import {factory} from "../logging/ConfigLog4j";
const log = factory.getLogger("model.ActivePath");
import {Piece} from "../entities/Piece";
export class ActivePath {
    public x: number[] = [
        0, 48, 96, 144, 192, 240, 288, 288, 288, 288,
        288, 288, 336, 384, 384, 384, 384, 384, 384, 432,
        480, 528, 576, 624, 672, 672, 672, 624, 576, 528,
        480, 432, 384, 384, 384, 384, 384,  384, 336, 288,
        288, 288,  288, 288, 288, 240, 192, 144, 96, 48,
        0, 0, 0,
    ];
    public y: number[] = [
        288, 288,  288, 288,  288, 288, 237, 189.6, 142.2, 94.8,
        47.4, 0, 0, 0, 48, 95, 142.5, 190, 237.5, 288,
        288, 288, 288, 288, 288, 336, 384, 384, 384, 384,
        384, 384, 432, 480, 528, 576, 624,  672, 672, 672,
        624, 576, 528, 480, 432, 384, 384, 384, 384, 384,
        384, 336, 285,
    ];

    public getPath(piece: Piece, to: number, path: Path): Path {

        // check if piece is at home
        let from = piece.index + 1;
        let exitPoint = piece.getExitIndex();
        if (piece.isAtHome()) {
            // log.debug("Piece is at home. Setting start position x: " + piece.startPosition.x + " y: " + piece.startPosition.y);
            path.x.push(piece.startPosition.x);
            path.y.push(piece.startPosition.y);
            piece.setActive();
        }
        // log.debug("Stepping into From: " + from + " to: " + to + " exitPoint: " + exitPoint);
        for (let i = from; i < to + 1; i++) {
            if (i < 52) {
                path.x.push(this.x[i]);
                path.y.push(this.y[i]);
            }
            if (i > 51) {
                let remainder = (to % 51);
                // log.debug("k > 51 " + i + " time to round robin with remainder " + remainder);
                for (let j = 0; j < remainder; j++) {
                    // log.debug("After x " + this.x[j] + " y: " + this.y[j] + " remainder: " + remainder);
                    path.x.push(this.x[j]);
                    path.y.push(this.y[j]);
                }
                // log.debug("Path x " + path.x.join());
                // log.debug("Path y " + path.y.join());
                return path;
            }else if (i === exitPoint) {
                path.moveRemainder = (to % 51);
                // log.debug("i === exitPoint " + exitPoint + " time to enter exit with " + path.moveRemainder);
                return path;
            }
        }
        // log.debug("Nothing to do.... " + path.moveRemainder);
        // log.debug("Path x " + path.x.join());
        // log.debug("Path y " + path.y.join());
        return path;
    }

}

export class RedHomePath {
    public x: number[] = [
       48,  96, 144, 192, 240, 288,
    ];
    public y: number[] = [
        336, 336, 336, 336, 336, 336,
    ];

    public getPath(from: number, to: number, exitPoint: number, path: Path): Path {
        for (let x = from; x < to; x++) {
            path.x.push(this.x[x]);
            path.y.push(this.y[x]);
        }
        return path;
    }
}

export class BlueHomePath {
    public x: number[] = [
       336, 336, 336, 336, 336, 336,
    ];
    public y: number[] = [
        48, 96,  144, 192, 240, 288,
    ];
    public getPath(from: number, to: number, exitPoint: number, path: Path): Path {
        for (let x = from; x < to; x++) {
            path.x.push(this.x[x]);
            path.y.push(this.y[x]);
        }
        return path;
    }
}

export class YellowHomePath {
    public x: number[] = [
       624, 576, 528, 480, 432, 384,
    ];
    public y: number[] = [
        336, 336,  336, 336, 336, 336,
    ];

    public getPath(from: number, to: number, exitPoint: number, path: Path): Path {
        for (let x = from; x < to; x++) {
            path.x.push(this.x[x]);
            path.y.push(this.y[x]);
        }
        return path;
    }
}

export class GreenHomePath {
    public x: number[] = [
       336, 336, 336, 336, 336, 336,
    ];
    public y: number[] = [
        624, 572, 528, 480, 432, 384,
    ];

    public getPath(from: number, to: number, exitPoint: number, path: Path): Path {
        for (let x = from; x < to; x++) {
            path.x.push(this.x[x]);
            path.y.push(this.y[x]);
        }
        return path;
    }
}

