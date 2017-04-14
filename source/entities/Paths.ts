import {ColorType} from "../enums/ColorType";
import {MoveStatus} from "../enums/MoveStatus";
import {Path} from "./Path";
import {factory} from "../logging/ConfigLog4j";
const alog = factory.getLogger("model.Paths.ActivePath");
const hlog = factory.getLogger("model.Paths.HomePath");
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
        if (piece.isAtHome()) {
            path.x.push(piece.startPosition.x);
            path.y.push(piece.startPosition.y);
            piece.setActive();
            // alog.debug("Setting piece to active: " + piece.isActive());
        }

        let exitPoint = piece.exitIndex;
        let from = piece.index + 1;

        // Necessary to force condition that moves piece in to exitpoint index
        if (piece.isAtExitPoint())  {
            from = piece.index;
        }

        // alog.debug("Stepping into From: " + from + " to: " + to + " exitPoint: " + exitPoint);
        for (let i = from; i < to + 1; i++) {
            // When piece has reached exit index and needs to enter exitpoint
            if (i < 52) {
                if (i === exitPoint) {
                    // Make sure to push exit point
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    let remainder = (to % exitPoint);
                    // alog.debug("Remainder is " + remainder + " to  is " + to);
                    path.moveRemainder = remainder;
                    path.newIndex = exitPoint;
                    path.moveStatus = MoveStatus.ShouldBeExiting;
                    alog.debug("i === exitPoint " + exitPoint + " time to enter exit with " + path.moveRemainder);
                    break;
                }else {
                     // when a piece is somewhere between exit index and end of active index
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    path.newIndex = i;
                }
                // When a piece has reached end of active index and needs to roundrobin
            }else if (i > 51) {
                let remainder = (to % 51);
                // hlog.debug("k > 51 " + i + " time to round robin with remainder " + remainder);
                for (let j = 0; j < remainder; j++) {
                    // alog.debug("After x " + this.x[j] + " y: " + this.y[j] + " remainder: " + remainder);
                    path.x.push(this.x[j]);
                    path.y.push(this.y[j]);
                }
                path.newIndex  = remainder - 1;
                break;
            }
        }
        // log.debug("Nothing to do.... " + path.moveRemainder);
        // hlog.debug("Path x " + path.x.join());
        // hlog.debug("Path y " + path.y.join());
        return path;
    }

}

export class HomePaths {
    public red_x: number[] = [48,  96, 144, 192, 240, 288];
    public red_y: number[] = [336, 336, 336, 336, 336, 336];

    public blue_x: number[] = [336, 336, 336, 336, 336, 336];
    public blue_y: number[] = [48, 96,  144, 192, 240, 288];

    public yellow_x: number[] = [624, 576, 528, 480, 432, 384];
    public yellow_y: number[] = [336, 336,  336, 336, 336, 336];

    public green_x: number[] = [336, 336, 336, 336, 336, 336];
    public green_y: number[] = [624, 572, 528, 480, 432, 384];

    public getPath(piece: Piece, from: number, to: number, path: Path): Path {
        let x: number[] = [];
        let y: number[] = [];
        hlog.debug("Piece " + piece.uniqueId + " is on the way out ");
        switch (piece.color) {
            case ColorType.Red:
                x = this.red_x;
                y = this.red_y;
                break;
            case ColorType.Blue:
                x = this.blue_x;
                y = this.blue_y;
                break;
            case ColorType.Yellow:
                x = this.yellow_x;
                y = this.yellow_y;
                break;
            case ColorType.Green:
                x = this.green_x;
                y = this.green_y;
                break;
            default:
                break;
            }
            if (to > 6) {
                hlog.debug("to " + to + " is greater than six! Something went wrong!!!");
                to = 6;
            }
            for (let i = from; i < to; i++) {
                path.x.push(x[i]);
                path.y.push(y[i]);
            }
            path.newIndex = to - 1;
            piece.setOnWayOut();
            // hlog.debug("Path x " + path.x.join());
            // hlog.debug("Path y " + path.y.join());
            return path;
    }

}

