"use strict";
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var logger = require("morgan");
var path = require("path");
var favicon = require("serve-favicon");
var errorHandler = require("errorhandler");
var methodOverride = require("method-override");
var index_1 = require("../routes/index");
var Server = (function () {
    /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
    function Server() {
        // create expressjs application
        this.app = express();
        // configure application
        this.config();
        // add routes
        this.routes();
        // add api
        this.api();
    }
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */
    Server.bootstrap = function () {
        return new Server();
    };
    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    Server.prototype.api = function () {
        // empty for now
    };
    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    Server.prototype.config = function () {
        // add static paths
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.use(express.static(path.join(__dirname, "dist")));
        // configure pug
        // this.app.set("views", path.join(__dirname, "views"));
        // this.app.set("view engine", "pug");
        // use favicon middleware
        this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
        // use logger middlware
        this.app.use(logger("dev"));
        // use json form parser middlware
        this.app.use(bodyParser.json());
        // use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        //  use cookie parker middleware middlware
        this.app.use(cookieParser("SECRET_GOES_HERE"));
        //  use override middlware
        this.app.use(methodOverride());
        // use phaser static
        this.app.use("/phaser", express.static(__dirname + "/node_modules/phaser/build/"));
        // catch 404 and forward to error handler
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        // error handling
        this.app.use(errorHandler());
    };
    /**
     * Create router
     *
     * @class Server
     * @method api
     */
    Server.prototype.routes = function () {
        // empty for now
        var router;
        router = express.Router();
        // IndexRoute
        index_1.IndexRoute.create(router);
        // use router middleware
        this.app.use(router);
    };
    return Server;
}());
exports.Server = Server;
