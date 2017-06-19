
import * as checksum from "checksum";
import {LudoGame} from "./source/game/LudoGame";
import {Dictionary} from "typescript-collections";
import * as mongodb from "mongodb";
import * as assert from "assert";

declare var mongodb: any;

let MongoClient = mongodb.MongoClient;
let url = "mongodb://192.168.5.129:27017/ludodb";
let ludodb: any;

export class LudoPersistence {
    private static mongoInstance: LudoPersistence = new LudoPersistence();

    public static getInstance(): LudoPersistence {
        return LudoPersistence.mongoInstance;
    }

    constructor() {
        if (LudoPersistence.mongoInstance) {
            throw new Error("Error: Instantiation failed: Use LudoCacheInstance.getInstance() instead of new.");
        }
        LudoPersistence.mongoInstance = this;
    }

    public setValue(ludogame: LudoGame): void {
        this.insertDocuments(ludogame);
    }

    public setUpdate(ludogame: LudoGame): void {
        this.updateDocuments(ludogame);
    }

    public getValue(key: string, callback: any): void {
        this.findDocument(key, (result: any) => {
            callback(result);
        });
    }


    private insertDocuments(ludogame: LudoGame): void {
        MongoClient.connect(url, {autoReconnect : true }, (err: any, db: any) => {
            if (err) {
                return console.dir(err);
            }
            console.log("Connected correctly to mongodb server on insert document");
            db.collection("ludogames").insertOne(ludogame, (error: any, result: any) => {
                if (err) {
                    return console.dir(error);
                }
                console.log("Successfully inserted element " + 1);
                db.close();
            });
        });
    }

    private updateDocuments(ludogame: LudoGame): void {
        MongoClient.connect(url, {autoReconnect : true }, (err: any, db: any) => {
            if (err) {
                return console.dir(err);
            }
            console.log("Connected correctly to mongodb server on insert document");
            let query = {gameId: ludogame.gameId};
            db.collection("ludogames").update(query, {$set: {
                                                                currrentPlayerId: ludogame.currrentPlayerId,
                                                                ludoDice: ludogame.ludoDice,
                                                                ludoPlayers: ludogame.ludoPlayers,
                                                                status: ludogame.status,
                                                            },
                                                        },
             (error: any, result: any) => {
                if (err) {
                    return console.dir(error);
                }
                console.log("Successfully inserted element " + 1);
                db.close();
            });
        });
    }

    private findDocument(gameId: string, callback: any): void {
        MongoClient.connect(url, function(err: any, db: any) {
            if (err) {
                return console.dir(err);
            }
            console.log("Connected correctly to mongodb server on insert document");
            let query = {gameId: gameId};
            db.collection("ludogames").find(query).toArray(function(error: any, result: any) {
                if (error) {
                    return console.dir(err);
                }
                db.close();
                callback(result);
            });
        });
    }

}
