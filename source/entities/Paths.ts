import {ColorType} from "../enums/ColorType";
import {MoveStatus} from "../enums/MoveStatus";
import {Path} from "./Path";
import {factory} from "../logging/ConfigLog4j";
const alog = factory.getLogger("model.Paths.ActivePath");
const hlog = factory.getLogger("model.Paths.OnWayOutPaths");
import {Piece} from "../entities/Piece";
import {PiecePosition} from "./PiecePosition";
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
            path.newIndex = piece.startIndex;
            // alog.debug("Setting piece to active: " + piece.index);
        }

        let entryPoint = piece.entryIndex;
        let from = piece.index + 1;

        // Necessary to force condition that moves piece in to entrypoint index
        if (piece.isAtEntryPoint())  {
            from = piece.index;
        }

        // alog.debug("Stepping into From: " + from + " to: " + to + " entryPoint: " + entryPoint);
        for (let i = from; i < to + 1; i++) {
            // When piece has reached entry index and needs to enter entrytpoint
            if (i < 52) {
                if (i === entryPoint) {
                    // Make sure to push entry point
                    path.x.push(this.x[i]);
                    path.y.push(this.y[i]);
                    let remainder = (to % entryPoint);
                    // alog.debug("Remainder is " + remainder + " to  is " + to);
                    path.moveRemainder = remainder;
                    path.newIndex = entryPoint;
                    path.moveStatus = MoveStatus.ShouldBeExiting;
                    // alog.debug("i === entryPoint " + entryPoint + " time to enter entry with " + path.moveRemainder);
                    break;
                }else {
                     // when a piece is somewhere between entryindex and end of active index
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

    public getPiecePostionByIndex(index: number): PiecePosition {
        if (index > 51) {
            let newIndex: number = index % 51;
            return new PiecePosition(this.x[newIndex], this.y[newIndex]);
        }else {
            return new PiecePosition(this.x[index], this.y[index]);
        }
    }


}

export class OnWayOutPaths {
    public red_x: number[] = [48,  96, 144, 192, 240, 288];
    public red_y: number[] = [336, 336, 336, 336, 336, 336];

    public blue_x: number[] = [336, 336, 336, 336, 336, 336];
    public blue_y: number[] = [48, 96,  144, 192, 240, 288];

    public yellow_x: number[] = [624, 576, 528, 480, 432, 384];
    public yellow_y: number[] = [336, 336,  336, 336, 336, 336];

    public green_x: number[] = [336, 336, 336, 336, 336, 336];
    public green_y: number[] = [624, 572, 528, 480, 432, 384];

    public getPath(piece: Piece, from: number, to: number, path: Path): Path {
        let pieceOnWayoutPath: [number[], number[]];
        pieceOnWayoutPath = this.getPiecePath(piece);
        let x: number[] = pieceOnWayoutPath[0];
        let y: number[] = pieceOnWayoutPath[1];
        // hlog.debug("Piece " + piece.uniqueId + " is on the way out ");

        // Different workflow depending on the states
        if (piece.isActive()) {
            // This condition should have been taken care of by the Rule.
            if (to > 6) {
                hlog.debug("to " + to + " is greater than six! Something went wrong!!!");
            }else {
                for (let i = from; i < to; i++) {
                    path.x.push(x[i]);
                    path.y.push(y[i]);
                }
                path.newIndex = to - 1;
                piece.index = path.newIndex;
                if (piece.index === 5) {
                    piece.setExited();
                }else {
                    piece.setOnWayOut();
                }
                // hlog.debug("Active Path x " + path.x.join() + " newIndex " + path.newIndex);
                // hlog.debug("Active Path y " + path.y.join() + " newIndex " + path.newIndex);

            }
        }else if (piece.isOnWayOut()) {
            if (to > 5) {
                hlog.debug("to " + to + " is greater than five! Something went wrong!!!");
            }else {
                for (let i = from; i < to + 1; i++) {
                    path.x.push(x[i]);
                    path.y.push(y[i]);
                }
                path.newIndex = to;
                // hlog.debug("On Way Out Path x " + path.x.join() + " newIndex " + to);
                // hlog.debug("On Way Out Path y " + path.y.join() + " newIndex " + to);
                if (to === 5) {
                    piece.setExited();
                }
            }
        }
        return path;
    }

    public getPiecePostionByIndex(piece: Piece, newIndex: number): PiecePosition {
        let pieceOnWayoutPath: [number[], number[]];
        pieceOnWayoutPath = this.getPiecePath(piece);
        let x: number[] = pieceOnWayoutPath[0];
        let y: number[] = pieceOnWayoutPath[1];
        if (newIndex > 6) {
            hlog.debug("Error!!! Index cannot be greater than six");
            return;
        }else {
            return new PiecePosition(x[newIndex], y[newIndex]);
        }
    }

    private getPiecePath(piece: Piece):[number[], number[]]{
        let pieceOnWayoutPath: [number[], number[]];
        switch (piece.color) {
            case ColorType.Red:
                pieceOnWayoutPath = [this.red_x, this.red_y];
                break;
            case ColorType.Blue:
                pieceOnWayoutPath = [this.blue_x, this.blue_y];
                break;
            case ColorType.Yellow:
                pieceOnWayoutPath = [this.yellow_x, this.yellow_y];
                break;
            case ColorType.Green:
                pieceOnWayoutPath = [this.green_x, this.green_y];
                break;
            default:
                break;
            }
        return pieceOnWayoutPath;
    }
}