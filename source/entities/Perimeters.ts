import {Piece} from "./Piece";
import {ColorType} from "../enums/ColorType";
import {factory} from "../logging/ConfigLog4j";

const log = factory.getLogger("model.Perimeters");

export class Perimeter {
    public pieceIndex: number = -1;
    public pieceColor: ColorType = null;
    public playerId = "";

    public resetPerimeter(): void {
        this.pieceIndex = -1;
        this.pieceColor = null;
        this.playerId = "";
    }

    public setPerimeters(pieceIndex: number, pieceColor: ColorType, playerId: string): void {
        this.pieceIndex = pieceIndex;
        this.pieceColor = pieceColor;
        this.playerId = playerId;
    }


}

export class Perimeters {
    private perimeterPool: Perimeter[];
    private activePerimeterPool: Perimeter[];
    constructor() {
        this.activePerimeterPool = [];
        this.perimeterPool = [];
        for (let i = 0; i < 1; i++) {
            this.perimeterPool.push(new Perimeter());
        }
    }

    public getNewPerimeter(): Perimeter {
        let perimeter: Perimeter = null;
        if (this.perimeterPool.length > 0) {
            perimeter = this.perimeterPool.pop();
        }else {
            perimeter = new Perimeter();
            this.activePerimeterPool.push(perimeter);
        }
        return perimeter;
    }

    public addPerimetersToPool(perimeter: Perimeter, playerId: string): void {
        for (let i = 0, l = this.activePerimeterPool.length; i < l; i++) {
            if (this.activePerimeterPool[i] === perimeter) {
                this.activePerimeterPool.splice(i, 1);
            }
            perimeter.resetPerimeter();
            this.perimeterPool.push(perimeter);
        }
        this.showPerimeterPool(playerId);
    }

    public showPerimeterPool(playerId: string): void {
        // log.debug(playerId + " PerimeterRoolPool: " + this.perimeterPool.length + " activePerimeterPool: " + this.activePerimeterPool.length);
    }

}
