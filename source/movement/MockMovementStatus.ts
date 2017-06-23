import { Move } from "../rules/Move";
export class MockMovementStatus {
    public peckingMovements: Move[] = [];
    public passingMovements: Move[] = [];
    public crossingMovements: Move[] = [];
    public ludoingMovements: Move[] = [];

    public containsPecking(): boolean {
        return this.peckingMovements.length > 0;
    }

    public containsPassing(): boolean {
        return this.passingMovements.length > 0;
    }

    public containsCrossing(): boolean {
        return this.crossingMovements.length > 0;
    }

    public containsLudoing(): boolean {
        return this.ludoingMovements.length > 0;
    }

    public isPecking(movement: Move): boolean {
        return (this.peckingMovements.indexOf(movement) >= 0);
    }

    public isPassing(movement: Move): boolean {
        return (this.passingMovements.indexOf(movement) >= 0);
    }

    public isCrossing(movement: Move): boolean {
        return (this.crossingMovements.indexOf(movement) >= 0);
    }

    public isLudoing(movement: Move): boolean {
        return (this.ludoingMovements.indexOf(movement) >= 0);
    }

    public resetAll(): void {
        this.peckingMovements = [];
        this.passingMovements = [];
        this.crossingMovements = [];
        this.ludoingMovements = [];
    }

    public isEmpty(): boolean {
        return (this.passingMovements.length === 0 && this.peckingMovements.length === 0
         && this.ludoingMovements.length === 0 && this.crossingMovements.length === 0);
    }
}
