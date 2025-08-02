"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.cloverIntegration1635889332619 = void 0;
var cloverIntegration1635889332619 = /** @class */ (function () {
    function cloverIntegration1635889332619() {
        this.name = 'cloverIntegration1635889332619';
    }
    cloverIntegration1635889332619.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE \"clover_token\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"accountId\" uuid NOT NULL, \"cloverMerchantId\" character varying NOT NULL, \"accessToken\" character varying NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"version\" integer NOT NULL, CONSTRAINT \"PK_063b1904ec8fcefbbcebf013387\" PRIMARY KEY (\"id\"))")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"clover_pos\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"accountId\" uuid NOT NULL, \"locationId\" uuid NOT NULL, \"cloverMerchantId\" character varying NOT NULL, \"itemLinksId\" uuid, \"tokenId\" uuid, CONSTRAINT \"REL_858edbd73604dee7cbba29fab8\" UNIQUE (\"tokenId\"), CONSTRAINT \"PK_d38006959b7fb208f78ef61abad\" PRIMARY KEY (\"id\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"clover_pos_item_link\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"posId\" uuid NOT NULL, \"itemId\" uuid, \"idInPos\" character varying NOT NULL, CONSTRAINT \"UQ_c5d6909b851ea9770dd9847cde5\" UNIQUE (\"posId\", \"idInPos\"), CONSTRAINT \"PK_e5f8e9274b3f984532e58eb1a8a\" PRIMARY KEY (\"id\"))")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"clover_order\" (\"id\" character varying NOT NULL, \"orderId\" text NOT NULL, CONSTRAINT \"PK_c3c74f4908b0c017d056f776781\" PRIMARY KEY (\"id\"))")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP INDEX \"IDX_9cbce3a8e51827005afc6ec221\"")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_9cbce3a8e51827005afc6ec221\" ON \"inventory_log\" (\"locationId\", \"ingredientId\", \"time\", \"type\") ")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_token\" ADD CONSTRAINT \"FK_96aed0b910e43e31a8bfdec2052\" FOREIGN KEY (\"accountId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" ADD CONSTRAINT \"FK_031e4b15cc3118ae7c228a023c9\" FOREIGN KEY (\"accountId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" ADD CONSTRAINT \"FK_2d465cafb154c59b3c613f712c9\" FOREIGN KEY (\"locationId\") REFERENCES \"location\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" ADD CONSTRAINT \"FK_9883155e48c900e7656fa7b3374\" FOREIGN KEY (\"itemLinksId\") REFERENCES \"clover_pos_item_link\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" ADD CONSTRAINT \"FK_858edbd73604dee7cbba29fab87\" FOREIGN KEY (\"tokenId\") REFERENCES \"clover_token\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos_item_link\" ADD CONSTRAINT \"FK_0783380a5131494cf61ce5091b6\" FOREIGN KEY (\"posId\") REFERENCES \"clover_pos\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos_item_link\" ADD CONSTRAINT \"FK_45a5e94cd2645aa061e8c4eb6bc\" FOREIGN KEY (\"itemId\") REFERENCES \"menu_item\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 13:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    cloverIntegration1635889332619.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos_item_link\" DROP CONSTRAINT \"FK_45a5e94cd2645aa061e8c4eb6bc\"")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos_item_link\" DROP CONSTRAINT \"FK_0783380a5131494cf61ce5091b6\"")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" DROP CONSTRAINT \"FK_858edbd73604dee7cbba29fab87\"")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" DROP CONSTRAINT \"FK_9883155e48c900e7656fa7b3374\"")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" DROP CONSTRAINT \"FK_2d465cafb154c59b3c613f712c9\"")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_pos\" DROP CONSTRAINT \"FK_031e4b15cc3118ae7c228a023c9\"")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"clover_token\" DROP CONSTRAINT \"FK_96aed0b910e43e31a8bfdec2052\"")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP INDEX \"IDX_9cbce3a8e51827005afc6ec221\"")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_9cbce3a8e51827005afc6ec221\" ON \"inventory_log\" (\"time\", \"locationId\", \"ingredientId\", \"type\") ")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"clover_order\"")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"clover_pos_item_link\"")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"clover_pos\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"clover_token\"")];
                    case 13:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return cloverIntegration1635889332619;
}());
exports.cloverIntegration1635889332619 = cloverIntegration1635889332619;
