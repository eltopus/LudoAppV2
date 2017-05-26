import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import {Ludo} from "./Ludo";

class Server {
    public static PORT = 3000;
    public app: any;
    private server: any;
    private io: any;
    private port: number;
    private ludo = new Ludo();

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.createApp();
        this.middleware();
        this.config();
        this.routes();
        this.createServer();
        this.sockets();
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
        router.get("/setup", (req, res, next) => {
            res.sendFile(path.join(__dirname + "/views/setup.html"));
        });

        router.get("/", (req, res, next) => {
            res.sendFile(path.join(__dirname + "/views/index.html"));
        });
        this.app.use("/", router);
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private  normalizePort(val): number {
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
            console.log("Connected client on port %s.", this.port);
            this.ludo.initLudo(this.io, socket);
        });

        this.io.on("connect", (socket: any) => {
            console.log("Connected client on port %s.", this.port);

            socket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        });
    }
}
let server = Server.bootstrap();
export default server.app;
