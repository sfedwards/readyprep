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
exports.vendorOrdering1609978207379 = void 0;
var vendorOrdering1609978207379 = /** @class */ (function () {
    function vendorOrdering1609978207379() {
        this.name = 'vendorOrdering1609978207379';
    }
    vendorOrdering1609978207379.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE \"vendor_address\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"street1\" character varying NOT NULL, \"street2\" character varying NOT NULL, \"city\" character varying NOT NULL, \"state\" character varying NOT NULL, \"zip\" character varying NOT NULL, \"vendorId\" uuid, CONSTRAINT \"REL_53bce62b6aa30cb9c8e4c6e743\" UNIQUE (\"vendorId\"), CONSTRAINT \"PK_ae20cddf20aebaa785797ef1871\" PRIMARY KEY (\"id\"))")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"vendor_contact\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" character varying NOT NULL, \"email\" character varying NOT NULL, \"officePhone\" character varying NOT NULL, \"mobilePhone\" character varying NOT NULL, \"vendorId\" uuid, CONSTRAINT \"REL_4902def964a93d3cf0384e2c3a\" UNIQUE (\"vendorId\"), CONSTRAINT \"PK_e9bd678abfdeb8964f9eb9022ea\" PRIMARY KEY (\"id\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TYPE \"vendor_ordermethod_enum\" AS ENUM('email', 'manual')")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"vendor\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"locationId\" uuid, \"name\" character varying NOT NULL, \"accountNumber\" character varying NOT NULL, \"orderMethod\" \"vendor_ordermethod_enum\" NOT NULL, \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, CONSTRAINT \"PK_931a23f6231a57604f5a0e32780\" PRIMARY KEY (\"id\"))")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"invoice\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"locationId\" uuid, \"vendorId\" uuid NOT NULL, \"number\" character varying NOT NULL, \"date\" date NOT NULL, \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, CONSTRAINT \"PK_15d25c200d9bcd8a33f698daf18\" PRIMARY KEY (\"id\"))")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"invoice_item\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"invoiceId\" uuid NOT NULL, \"packId\" uuid NOT NULL, \"pricePaid\" integer NOT NULL, \"numPacks\" integer NOT NULL, \"inventoryLogId\" uuid NOT NULL, \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, CONSTRAINT \"REL_c3f097747765fa8d80655d7668\" UNIQUE (\"inventoryLogId\"), CONSTRAINT \"PK_621317346abdf61295516f3cb76\" PRIMARY KEY (\"id\"))")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"vendor_order\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"locationId\" uuid, \"vendorId\" uuid NOT NULL, \"invoiceId\" uuid, \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, CONSTRAINT \"PK_1f6be69b3697c35a9a1e8cf817f\" PRIMARY KEY (\"id\"))")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"vendor_order_item\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"orderId\" uuid NOT NULL, \"packId\" uuid NOT NULL, \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, CONSTRAINT \"PK_fd35c1436325351bec756411e8c\" PRIMARY KEY (\"id\"))")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" ADD \"vendorId\" uuid")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" ADD \"catalogNumber\" character varying NOT NULL DEFAULT ''")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"account\" ADD \"isInSandboxMode\" boolean DEFAULT true")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP INDEX \"IDX_9cbce3a8e51827005afc6ec221\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_9cbce3a8e51827005afc6ec221\" ON \"inventory_log\" (\"locationId\", \"ingredientId\", \"time\", \"type\") ")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_address\" ADD CONSTRAINT \"FK_53bce62b6aa30cb9c8e4c6e743d\" FOREIGN KEY (\"vendorId\") REFERENCES \"vendor\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_contact\" ADD CONSTRAINT \"FK_4902def964a93d3cf0384e2c3a2\" FOREIGN KEY (\"vendorId\") REFERENCES \"vendor\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor\" ADD CONSTRAINT \"FK_1fece03332202696713a170e1b5\" FOREIGN KEY (\"locationId\") REFERENCES \"location\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" ADD CONSTRAINT \"FK_2bf0d2b3030966422cc7be93448\" FOREIGN KEY (\"vendorId\") REFERENCES \"vendor\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice\" ADD CONSTRAINT \"FK_1dd00b3f543e163c640e54bf70d\" FOREIGN KEY (\"locationId\") REFERENCES \"location\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice\" ADD CONSTRAINT \"FK_f5585028c4661f295b5cf41eb7e\" FOREIGN KEY (\"vendorId\") REFERENCES \"vendor\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" ADD CONSTRAINT \"FK_553d5aac210d22fdca5c8d48ead\" FOREIGN KEY (\"invoiceId\") REFERENCES \"invoice\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" ADD CONSTRAINT \"FK_4ffa51090cddc15f9e00aec09db\" FOREIGN KEY (\"packId\") REFERENCES \"pack\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" ADD CONSTRAINT \"FK_c3f097747765fa8d80655d7668d\" FOREIGN KEY (\"inventoryLogId\") REFERENCES \"inventory_log\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" ADD CONSTRAINT \"FK_8ac7dc5ba388d7d45d92b4e1cb8\" FOREIGN KEY (\"locationId\") REFERENCES \"location\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" ADD CONSTRAINT \"FK_d770363e66c27742babd24dce11\" FOREIGN KEY (\"vendorId\") REFERENCES \"vendor\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" ADD CONSTRAINT \"FK_f3243ae4aed7893ce47a27d89b7\" FOREIGN KEY (\"invoiceId\") REFERENCES \"invoice\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order_item\" ADD CONSTRAINT \"FK_11c0fdef6dec1660a5da0a9f06f\" FOREIGN KEY (\"orderId\") REFERENCES \"vendor_order\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order_item\" ADD CONSTRAINT \"FK_44fa609f4d3aa2d553bfe4f0ddb\" FOREIGN KEY (\"packId\") REFERENCES \"pack\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION")];
                    case 27:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    vendorOrdering1609978207379.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order_item\" DROP CONSTRAINT \"FK_44fa609f4d3aa2d553bfe4f0ddb\"")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order_item\" DROP CONSTRAINT \"FK_11c0fdef6dec1660a5da0a9f06f\"")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" DROP CONSTRAINT \"FK_f3243ae4aed7893ce47a27d89b7\"")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" DROP CONSTRAINT \"FK_d770363e66c27742babd24dce11\"")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_order\" DROP CONSTRAINT \"FK_8ac7dc5ba388d7d45d92b4e1cb8\"")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" DROP CONSTRAINT \"FK_c3f097747765fa8d80655d7668d\"")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" DROP CONSTRAINT \"FK_4ffa51090cddc15f9e00aec09db\"")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice_item\" DROP CONSTRAINT \"FK_553d5aac210d22fdca5c8d48ead\"")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice\" DROP CONSTRAINT \"FK_f5585028c4661f295b5cf41eb7e\"")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"invoice\" DROP CONSTRAINT \"FK_1dd00b3f543e163c640e54bf70d\"")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" DROP CONSTRAINT \"FK_2bf0d2b3030966422cc7be93448\"")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor\" DROP CONSTRAINT \"FK_1fece03332202696713a170e1b5\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_contact\" DROP CONSTRAINT \"FK_4902def964a93d3cf0384e2c3a2\"")];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"vendor_address\" DROP CONSTRAINT \"FK_53bce62b6aa30cb9c8e4c6e743d\"")];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP INDEX \"IDX_9cbce3a8e51827005afc6ec221\"")];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_9cbce3a8e51827005afc6ec221\" ON \"inventory_log\" (\"time\", \"locationId\", \"ingredientId\", \"type\") ")];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"account\" ALTER COLUMN \"isInSandboxMode\" SET DEFAULT false")];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" DROP COLUMN \"catalogNumber\"")];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" DROP COLUMN \"vendorId\"")];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"vendor_order_item\"")];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"vendor_order\"")];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"invoice_item\"")];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"invoice\"")];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"vendor\"")];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TYPE \"vendor_ordermethod_enum\"")];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"vendor_contact\"")];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"vendor_address\"")];
                    case 27:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return vendorOrdering1609978207379;
}());
exports.vendorOrdering1609978207379 = vendorOrdering1609978207379;
