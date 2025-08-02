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
var Initialization9999999999999 = /** @class */ (function () {
    function Initialization9999999999999() {
        this.name = 'Initialization9999999999999';
    }
    Initialization9999999999999.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var baseVolumeUnitId, baseWeightUnitId, basePureUnitId, baseVolumeUnitId_1, baseWeightUnitId_1, basePureUnitId_1, id, id, id, id, id, id, id, id, id, id, id, id, id, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Enable pg_trgm extension for searching
                    return [4 /*yield*/, queryRunner.query('CREATE EXTENSION pg_trgm;')];
                    case 1:
                        // Enable pg_trgm extension for searching
                        _a.sent();
                        // Session Table for connect-pg-simple
                        return [4 /*yield*/, queryRunner.query("\n        CREATE TABLE \"session\" (\n          \"sid\" varchar NOT NULL COLLATE \"default\",\n          \"sess\" json NOT NULL,\n          \"expire\" timestamp(6) NOT NULL\n        ) WITH (OIDS=FALSE);\n      ")];
                    case 2:
                        // Session Table for connect-pg-simple
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('CREATE INDEX "IDX_session_expire" ON "session" ("expire");')];
                    case 4:
                        _a.sent();
                        // Roles
                        return [4 /*yield*/, queryRunner.query('INSERT INTO role (type) VALUES (\'ACCOUNT_OWNER\');')];
                    case 5:
                        // Roles
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Milliliter\',\'ml\',\'VOLUME\',1) RETURNING id;')];
                    case 6:
                        baseVolumeUnitId_1 = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseVolumeUnitId_1 + "','milliliters');")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseVolumeUnitId_1 + "','millilitres');")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseVolumeUnitId_1 + "','milliliter');")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseVolumeUnitId_1 + "','millilitre');")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseVolumeUnitId_1 + "','ml');")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Milligram\',\'mg\',\'WEIGHT\',1) RETURNING id;')];
                    case 12:
                        baseWeightUnitId_1 = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseWeightUnitId_1 + "','milligrams');")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseWeightUnitId_1 + "','milligram');")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + baseWeightUnitId_1 + "','mg');")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Count\',\'ct\',\'PURE\',1) RETURNING id;')];
                    case 16:
                        basePureUnitId_1 = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + basePureUnitId_1 + "','count');")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + basePureUnitId_1 + "','ct');")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Cup\',\'cup\',\'VOLUME\',240) RETURNING id;')];
                    case 19:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','cups');")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','cup');")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Fluid Ounce\',\'fl oz\',\'VOLUME\',29.5735296) RETURNING id;')];
                    case 22:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','fluid ounce');")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','fl oz');")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Gallon\',\'gal\',\'VOLUME\',3785.41178) RETURNING id;')];
                    case 25:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','gallons');")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','gallon');")];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','gal');")];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Liter\',\'L\',\'VOLUME\',1000) RETURNING id;')];
                    case 29:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','liters');")];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','litres');")];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','liter');")];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','litre');")];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','l');")];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Pint\',\'pt\',\'VOLUME\',473.176473) RETURNING id;')];
                    case 35:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','pints');")];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','pint');")];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','pt');")];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Quart\',\'qt\',\'VOLUME\',946.352946) RETURNING id;')];
                    case 39:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','quarts');")];
                    case 40:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','quart');")];
                    case 41:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','qt');")];
                    case 42:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Tablespoon\',\'tbsp\',\'VOLUME\',15) RETURNING id;')];
                    case 43:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tablespoons');")];
                    case 44:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tablespoon');")];
                    case 45:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tbsp');")];
                    case 46:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tbsp');")];
                    case 47:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tbs');")];
                    case 48:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Teaspoon\',\'tsp\',\'VOLUME\',5) RETURNING id;')];
                    case 49:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','teaspoons');")];
                    case 50:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','teaspoon');")];
                    case 51:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tsps');")];
                    case 52:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','tsp');")];
                    case 53:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Gram\',\'g\',\'WEIGHT\',1000) RETURNING id;')];
                    case 54:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','grams');")];
                    case 55:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','gram');")];
                    case 56:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','g');")];
                    case 57:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Kilogram\',\'kg\',\'WEIGHT\',1000000) RETURNING id;')];
                    case 58:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','kilograms');")];
                    case 59:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','kilogram');")];
                    case 60:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','kg');")];
                    case 61:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Pound\',\'lb\',\'WEIGHT\',453592.37) RETURNING id;')];
                    case 62:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','pounds');")];
                    case 63:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','pound');")];
                    case 64:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','lb');")];
                    case 65:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','lbs');")];
                    case 66:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','lbf');")];
                    case 67:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','lbm');")];
                    case 68:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Ounce\',\'oz\',\'WEIGHT\',28349.5231) RETURNING id;')];
                    case 69:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','ounces');")];
                    case 70:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','ounce');")];
                    case 71:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','oz');")];
                    case 72:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'12 units\',\'dozen\',\'PURE\',12) RETURNING id;')];
                    case 73:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','dozens');")];
                    case 74:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','dozen');")];
                    case 75:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('INSERT INTO unit (id,name,symbol,type,magnitude) VALUES (DEFAULT,\'Each\',\'ea\',\'PURE\',1) RETURNING id;')];
                    case 76:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','each');")];
                    case 77:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO unit_alias (\"unitId\",name) VALUES ('" + id + "','ea');")];
                    case 78:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Initialization9999999999999.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query('DELETE FROM role WHERE type = \'ACCOUNT_OWNER\';')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('DELETE FROM unit_alias;')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('DELETE FROM unit;')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Initialization9999999999999;
}());
exports.Initialization9999999999999 = Initialization9999999999999;
