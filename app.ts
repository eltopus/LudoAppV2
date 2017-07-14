import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as ExpressSession from "express-session";
import * as sharedSession from "express-socket.io-session";
import {Ludo} from "./Ludo";

let MongoStore = require("connect-mongo")(ExpressSession);
class Server {
    public static PORT = 3000;
    public app: any;
    private server: any;
    private io: any;
    private port: number;
    private sharedsession: any;
    private session: any;
    private memoryStore: any;

    private ludo = new Ludo();

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.createApp();
        this.createServer();
        this.middleware();
        this.sessionStorage();
        this.sockets();
        this.config();
        this.routes();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private config(): void {
        this.port = this.normalizePort(process.env.PORT || Server.PORT);
        this.app.use("/phaser", express.static(__dirname + "/node_modules/phaser/build/"));
        this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
        this.app.use("/dist", express.static(path.join(__dirname, "/dist")));
        this.app.use("/images", express.static(path.join(__dirname, "/images")));
        this.app.use("/js", express.static(path.join(__dirname, "/public/js")));
        this.app.use("/css", express.static(path.join(__dirname, "/public/css")));
    }

    private middleware(): void {
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
    }

    private routes(): void {
        let router = express.Router();

        router.get("/", (req: any, res: any, next) => {
            res.sendFile(path.join(__dirname + "/views/index.html"));
        });

        router.post("/refresh", (req: any, res, next) => {
            if (req.session.gameId) {
                this.ludo.getRefreshGame(req, (ludogame: any) => {
                    res.send(ludogame);
                });
            }else {
                res.send({message: `This condition for gameId ${req.session.gameId} should never be needed!`});
            }
        });

        router.post("/cancelrefresh", (req: any, res, next) => {
            if (req.session.gameId) {
                this.ludo.cancelRefreshGame(req, (message: any) => {
                    res.send(message);
                });
            }else {
                res.send({message: `${req.session.gameId} cannot be found!`});
            }
        });

        router.post("/join", (req, res, next) => {
            if (req.body.gameId) {
                this.ludo.getExistingGame(req, (ludogame: any) => {
                    res.send(ludogame);
                });
            }else {
                res.send({message: `This condition for gameId ${req.body.gameId} should never be needed!`});
            }
        });


        this.app.use("/", router);
    }

    private sessionStorage(): void {
        this.session = ExpressSession({
            resave: false,
            saveUninitialized: true,
            secret: "i-love-husky",
            store: new MongoStore({
                url: "mongodb://192.168.5.129:27017/ludodb",
                // ttl: 14 * 24 * 60 * 60, // = 14 days. Default
                maxAge: 7 * 24 * 60 * 60 * 1000,
                fallbackMemory: true,
            }),
        });
        this.app.use(this.session);
    }

    private sockets(): void {
        this.io = socketIo(this.server);
        this.io.use(sharedSession(this.session, {autoSave: true}));
    }

    private  normalizePort(val: any): number {
        let port = parseInt(val, 10);
        if (isNaN(port)) {
            return val;
        }
        if (port >= 0) {
            // port number
            return port;
        }
        return port;
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });

        this.io.on("connection", (socket: any) => {
            console.log("ON Connection Connected client on port %s.", this.port);
            this.ludo.initLudo(this.io, socket);
        });

        this.io.on("reconnect", (sock: any) => {
            console.log("ON Reconnected client on port %s.", this.port);
            console.log("GameId: " + sock.handshake.session.gameId + " PlayerId: " + sock.handshake.session.playerId + " playerName: " + sock.handshake.session.playerName);
        });
    }
}
let server = Server.bootstrap();
export default server.app;
