"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var route_1 = require("./route");
/**
 * / route
 *
 * @class User
 */
var IndexRoute = (function (_super) {
    __extends(IndexRoute, _super);
    /**
     * Constructor
     *
     * @class IndexRoute
     * @constructor
     */
    function IndexRoute() {
        _super.call(this);
    }
    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */
    IndexRoute.create = function (router) {
        // log
        console.log("[IndexRoute::create] Creating index route.");
        // add home page route
        router.get("/", function (req, res, next) {
            new IndexRoute().index(req, res, next);
        });
    };
    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @next {NextFunction} Execute the next method.
     */
    IndexRoute.prototype.indexs = function (req, res, next) {
        // set custom title
        this.title = "Home | Tour of Heros";
        // set options
        var options = {
            "message": "Welcome to the Tour of Heros"
        };
        // render template
        this.render(req, res, "index", options);
    };
    IndexRoute.prototype.index = function (req, res, next) {
        // set custom title
        this.title = "Home | Tour of Heros";
        // set options
        var options = {
            "message": "Welcome to the Tour of Heros"
        };
        // render template
        this.sendFile(req, res, "/views/index.html", options);
    };
    return IndexRoute;
}(route_1.BaseRoute));
exports.IndexRoute = IndexRoute;
