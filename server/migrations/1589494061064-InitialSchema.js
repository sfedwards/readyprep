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
exports.InitialSchema1589494061064 = void 0;
var InitialSchema1589494061064 = /** @class */ (function () {
    function InitialSchema1589494061064() {
        this.name = 'InitialSchema1589494061064';
    }
    InitialSchema1589494061064.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Enable pg_trgm extension for searching
                    return [4 /*yield*/, queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;')];
                    case 1:
                        // Enable pg_trgm extension for searching
                        _a.sent();
                        // Session Table for connect-pg-simple
                        return [4 /*yield*/, queryRunner.query("\n            CREATE TABLE \"session\" (\n            \"sid\" varchar NOT NULL COLLATE \"default\",\n            \"sess\" json NOT NULL,\n            \"expire\" timestamp(6) NOT NULL\n            ) WITH (OIDS=FALSE);\n        ")];
                    case 2:
                        // Session Table for connect-pg-simple
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query('CREATE INDEX "IDX_session_expire" ON "session" ("expire");')];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"unit_alias\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" character varying NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"unitId\" uuid, CONSTRAINT \"PK_fda7c8988125c48e9eb11bbe8f5\" PRIMARY KEY (\"id\"))", undefined)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TYPE \"unit_type_enum\" AS ENUM('PURE', 'WEIGHT', 'VOLUME')", undefined)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"unit\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"ownerId\" uuid, \"scopedId\" integer, \"name\" character varying, \"symbol\" character varying NOT NULL, \"magnitude\" integer, \"type\" \"unit_type_enum\", \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"definitionUnitId\" uuid, CONSTRAINT \"PK_4252c4be609041e559f0c80f58a\" PRIMARY KEY (\"id\"))", undefined)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_6a42ed5f5c3a860fe2eb83d999\" ON \"unit\" (\"symbol\") WHERE \"ownerId\" IS NULL", undefined)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_4f11f0113ffe0a4a96bc00518b\" ON \"unit\" (\"ownerId\", \"symbol\") WHERE \"deletedAt\" IS NULL", undefined)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_c25df908cad8ce222435cb6097\" ON \"unit\" (\"ownerId\", \"scopedId\") ", undefined)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"nutrient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"ingredientId\" uuid NOT NULL, \"name\" character varying NOT NULL, \"amount\" integer NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"unitId\" uuid, CONSTRAINT \"PK_627939b71671bf88d1a352b490e\" PRIMARY KEY (\"id\"))", undefined)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"unit_conversion\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"ingredientId\" uuid NOT NULL, \"scopedId\" integer NOT NULL, \"amountA\" numeric(16,4) NOT NULL, \"amountB\" numeric(16,4) NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"unitAId\" uuid, \"unitBId\" uuid, CONSTRAINT \"PK_7c0f8ede18930f4f000c820fbda\" PRIMARY KEY (\"id\"))", undefined)];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"ingredient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"type\" character varying NOT NULL, \"ownerId\" uuid NOT NULL, \"scopedId\" integer NOT NULL, \"name\" character varying NOT NULL, \"yieldPercent\" numeric(5,2) DEFAULT 100, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"orderFrequency\" integer, \"recipeId\" uuid, \"prepFrequency\" integer, \"shelfLife\" integer, \"systemIngredientLinkId\" uuid, CONSTRAINT \"REL_a19a4b507b9e2d1efd2d73b37b\" UNIQUE (\"recipeId\"), CONSTRAINT \"PK_6f1e945604a0b59f56a57570e98\" PRIMARY KEY (\"id\"))", undefined)];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_27290c4a85461ccf25d21ce1d9\" ON \"ingredient\" (\"ownerId\", \"scopedId\") WHERE \"deletedAt\" IS NULL", undefined)];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_2571ddb36653ff299ac4a21702\" ON \"ingredient\" (\"ownerId\", \"type\", \"name\") WHERE \"deletedAt\" IS NULL", undefined)];
                    case 15:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_1589fd6ab1ade2f02694c9de06\" ON \"ingredient\" (\"type\") ", undefined)];
                    case 16:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"recipe_ingredient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"scopedId\" integer NOT NULL, \"recipeId\" uuid NOT NULL, \"ingredientId\" uuid NOT NULL, \"modifier\" character varying, \"amount\" numeric(8,3) NOT NULL, \"unitId\" uuid NOT NULL, \"yieldPercent\" numeric(5,2) DEFAULT 0, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_a13ac3f2cebdd703ac557c5377c\" PRIMARY KEY (\"id\"))", undefined)];
                    case 17:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"recipe\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"type\" character varying NOT NULL, \"instructions\" character varying NOT NULL DEFAULT '', \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"name\" character varying, \"batchSize\" numeric(7,3), \"batchUnitId\" uuid, CONSTRAINT \"PK_e365a2fedf57238d970e07825ca\" PRIMARY KEY (\"id\"))", undefined)];
                    case 18:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_8bdebdf63f6f4a559f3efbfea2\" ON \"recipe\" (\"type\") ", undefined)];
                    case 19:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"menu_item\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"ownerId\" uuid NOT NULL, \"scopedId\" integer NOT NULL, \"name\" character varying NOT NULL, \"recipeId\" uuid NOT NULL, \"price\" numeric(6,2), \"averageWeeklySales\" numeric(10,4), \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"REL_5c891aa24f4c866fbf9fc614ef\" UNIQUE (\"recipeId\"), CONSTRAINT \"PK_722c4de0accbbfafc77947a8556\" PRIMARY KEY (\"id\"))", undefined)];
                    case 20:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_3b77114c934684adb520b8a9e7\" ON \"menu_item\" (\"ownerId\", \"name\") WHERE \"deletedAt\" IS NULL", undefined)];
                    case 21:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_ad24d5f2ba47ad8665a5816512\" ON \"menu_item\" (\"ownerId\", \"scopedId\") ", undefined)];
                    case 22:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"menu_section\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"menuId\" uuid NOT NULL, \"name\" character varying NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_bdb64b3aaf192ece146d3d232f7\" PRIMARY KEY (\"id\"))", undefined)];
                    case 23:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"menu\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"ownerId\" uuid NOT NULL, \"scopedId\" integer NOT NULL, \"name\" character varying NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"version\" integer NOT NULL, \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_35b2a8f47d153ff7a41860cceeb\" PRIMARY KEY (\"id\"))", undefined)];
                    case 24:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_62643f818b9c59af16a3ba89aa\" ON \"menu\" (\"ownerId\", \"name\") WHERE \"deletedAt\" IS NULL", undefined)];
                    case 25:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_5a3406bc34c371f648c3f3381a\" ON \"menu\" (\"ownerId\", \"scopedId\") ", undefined)];
                    case 26:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TYPE \"role_type_enum\" AS ENUM('ACCOUNT_OWNER')", undefined)];
                    case 27:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"role\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"type\" \"role_type_enum\" NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_b36bcfe02fc8de3c57a8b2391c2\" PRIMARY KEY (\"id\"))", undefined)];
                    case 28:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"user\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"accountId\" uuid NOT NULL, \"name\" character varying NOT NULL, \"email\" character varying NOT NULL, \"passwordHash\" character varying, \"googleId\" character varying, \"photoUrl\" character varying, \"allowNotificationEmails\" boolean NOT NULL DEFAULT false, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_cace4a159ff9f2512dd42373760\" PRIMARY KEY (\"id\"))", undefined)];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_e12875dfb3b1d92d7d7c5377e2\" ON \"user\" (\"email\") ", undefined)];
                    case 30:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"account\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"stripeCustomerId\" character varying, \"plan\" character varying NOT NULL DEFAULT 'FREE', \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_54115ee388cdb6d86bb4bf5b2ea\" PRIMARY KEY (\"id\"))", undefined)];
                    case 31:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE UNIQUE INDEX \"IDX_6eae8a9883062c4038eafaeacf\" ON \"account\" (\"stripeCustomerId\") ", undefined)];
                    case 32:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"fdc_link\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"fdc_id\" integer NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"systemIngredientId\" uuid, CONSTRAINT \"REL_6b39a6f0a4d1ab10a69b113a32\" UNIQUE (\"systemIngredientId\"), CONSTRAINT \"PK_e3b69fed59ec0f4474bd727bb43\" PRIMARY KEY (\"id\"))", undefined)];
                    case 33:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"system_nutrient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"systemIngredientId\" uuid NOT NULL, \"name\" character varying NOT NULL, \"amount\" integer NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"unitId\" uuid, CONSTRAINT \"PK_42e76bee5cdb22e15b4b14a4a16\" PRIMARY KEY (\"id\"))", undefined)];
                    case 34:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"system_ingredient\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"name\" character varying NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, CONSTRAINT \"PK_373f45d4e0ce5f5e2944097a0cc\" PRIMARY KEY (\"id\"))", undefined)];
                    case 35:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"pack\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"pantryIngredientId\" uuid NOT NULL, \"price\" numeric(8,2) DEFAULT 0, \"numItems\" numeric(8,2) DEFAULT 1, \"amountPerItem\" numeric(8,2) DEFAULT 0, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"itemUnitId\" uuid, CONSTRAINT \"PK_c125718b999b41a621b0d799e02\" PRIMARY KEY (\"id\"))", undefined)];
                    case 36:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"system_unit_conversion\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"systemIngredientId\" uuid NOT NULL, \"grams\" integer NOT NULL, \"createdAt\" TIMESTAMP NOT NULL DEFAULT now(), \"updatedAt\" TIMESTAMP NOT NULL DEFAULT now(), \"deletedAt\" TIMESTAMP, \"unitId\" uuid, CONSTRAINT \"REL_0fd51c71ec1ed86dd0d3add07f\" UNIQUE (\"systemIngredientId\"), CONSTRAINT \"PK_344c5512a479d15e1f90818ade1\" PRIMARY KEY (\"id\"))", undefined)];
                    case 37:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"menu_item_sections_menu_section\" (\"menuItemId\" uuid NOT NULL, \"menuSectionId\" uuid NOT NULL, CONSTRAINT \"PK_b1dd267d5842070704d471d86dd\" PRIMARY KEY (\"menuItemId\", \"menuSectionId\"))", undefined)];
                    case 38:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_4a239e1e7ed95f25c6f8a77a16\" ON \"menu_item_sections_menu_section\" (\"menuItemId\") ", undefined)];
                    case 39:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_b67d6f7ab3904154e1d87a5eca\" ON \"menu_item_sections_menu_section\" (\"menuSectionId\") ", undefined)];
                    case 40:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"user_roles_role\" (\"userId\" uuid NOT NULL, \"roleId\" uuid NOT NULL, CONSTRAINT \"PK_b47cd6c84ee205ac5a713718292\" PRIMARY KEY (\"userId\", \"roleId\"))", undefined)];
                    case 41:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_5f9286e6c25594c6b88c108db7\" ON \"user_roles_role\" (\"userId\") ", undefined)];
                    case 42:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE INDEX \"IDX_4be2f7adf862634f5f803d246b\" ON \"user_roles_role\" (\"roleId\") ", undefined)];
                    case 43:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit_alias\" ADD CONSTRAINT \"FK_62fa7ddde7c03c4e49c2c36760f\" FOREIGN KEY (\"unitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 44:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit\" ADD CONSTRAINT \"FK_624de45d489ffabc237c287e2b0\" FOREIGN KEY (\"ownerId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 45:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit\" ADD CONSTRAINT \"FK_4607902552ed0fc064c668a2805\" FOREIGN KEY (\"definitionUnitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 46:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"nutrient\" ADD CONSTRAINT \"FK_5d220215c7c2df8d77fbd649706\" FOREIGN KEY (\"ingredientId\") REFERENCES \"ingredient\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 47:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"nutrient\" ADD CONSTRAINT \"FK_30619a040705ae27dd09a538b6c\" FOREIGN KEY (\"unitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 48:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit_conversion\" ADD CONSTRAINT \"FK_596f3d384d857f30061797876bf\" FOREIGN KEY (\"ingredientId\") REFERENCES \"ingredient\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 49:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit_conversion\" ADD CONSTRAINT \"FK_9d540dc3d447b2b50b50802de35\" FOREIGN KEY (\"unitAId\") REFERENCES \"unit\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 50:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"unit_conversion\" ADD CONSTRAINT \"FK_0d3f95382e8d30f410f54b1729c\" FOREIGN KEY (\"unitBId\") REFERENCES \"unit\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 51:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"ingredient\" ADD CONSTRAINT \"FK_3803b779423da212b6e93817f3b\" FOREIGN KEY (\"ownerId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 52:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"ingredient\" ADD CONSTRAINT \"FK_a7e165fff0a4625b30ec238f8d5\" FOREIGN KEY (\"systemIngredientLinkId\") REFERENCES \"system_ingredient\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 53:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"ingredient\" ADD CONSTRAINT \"FK_a19a4b507b9e2d1efd2d73b37bc\" FOREIGN KEY (\"recipeId\") REFERENCES \"recipe\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 54:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"recipe_ingredient\" ADD CONSTRAINT \"FK_1ad3257a7350c39854071fba211\" FOREIGN KEY (\"recipeId\") REFERENCES \"recipe\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 55:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"recipe_ingredient\" ADD CONSTRAINT \"FK_2879f9317daa26218b5915147e7\" FOREIGN KEY (\"ingredientId\") REFERENCES \"ingredient\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 56:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"recipe_ingredient\" ADD CONSTRAINT \"FK_61b0c4afd7f6262fcc2f3829d83\" FOREIGN KEY (\"unitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 57:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"recipe\" ADD CONSTRAINT \"FK_e719fecc636b02b749a5cfdb723\" FOREIGN KEY (\"batchUnitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 58:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu_item\" ADD CONSTRAINT \"FK_f2e33a159e38783a09e3b17f830\" FOREIGN KEY (\"ownerId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 59:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu_item\" ADD CONSTRAINT \"FK_5c891aa24f4c866fbf9fc614ef0\" FOREIGN KEY (\"recipeId\") REFERENCES \"recipe\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 60:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu_section\" ADD CONSTRAINT \"FK_9ffc9c65198775e1f6f50bdecbf\" FOREIGN KEY (\"menuId\") REFERENCES \"menu\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 61:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu\" ADD CONSTRAINT \"FK_e2b99049a94009740ea5cef1a88\" FOREIGN KEY (\"ownerId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 62:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"user\" ADD CONSTRAINT \"FK_68d3c22dbd95449360fdbf7a3f1\" FOREIGN KEY (\"accountId\") REFERENCES \"account\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 63:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"fdc_link\" ADD CONSTRAINT \"FK_6b39a6f0a4d1ab10a69b113a32d\" FOREIGN KEY (\"systemIngredientId\") REFERENCES \"system_ingredient\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 64:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"system_nutrient\" ADD CONSTRAINT \"FK_623f69da2eaa4ecd51f07a47ea7\" FOREIGN KEY (\"systemIngredientId\") REFERENCES \"system_ingredient\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 65:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"system_nutrient\" ADD CONSTRAINT \"FK_eebbf0cc13ea342f0db90eaf2fd\" FOREIGN KEY (\"unitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 66:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" ADD CONSTRAINT \"FK_8685fbe1a28bb6e0f5f44f7bf2f\" FOREIGN KEY (\"pantryIngredientId\") REFERENCES \"ingredient\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 67:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"pack\" ADD CONSTRAINT \"FK_fafd751bba96056a95e7b75de73\" FOREIGN KEY (\"itemUnitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 68:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"system_unit_conversion\" ADD CONSTRAINT \"FK_0fd51c71ec1ed86dd0d3add07f1\" FOREIGN KEY (\"systemIngredientId\") REFERENCES \"system_ingredient\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 69:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"system_unit_conversion\" ADD CONSTRAINT \"FK_7cc41573123080c1402f3062b5f\" FOREIGN KEY (\"unitId\") REFERENCES \"unit\"(\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION", undefined)];
                    case 70:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu_item_sections_menu_section\" ADD CONSTRAINT \"FK_4a239e1e7ed95f25c6f8a77a166\" FOREIGN KEY (\"menuItemId\") REFERENCES \"menu_item\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 71:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"menu_item_sections_menu_section\" ADD CONSTRAINT \"FK_b67d6f7ab3904154e1d87a5eca2\" FOREIGN KEY (\"menuSectionId\") REFERENCES \"menu_section\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 72:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"user_roles_role\" ADD CONSTRAINT \"FK_5f9286e6c25594c6b88c108db77\" FOREIGN KEY (\"userId\") REFERENCES \"user\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 73:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"user_roles_role\" ADD CONSTRAINT \"FK_4be2f7adf862634f5f803d246b8\" FOREIGN KEY (\"roleId\") REFERENCES \"role\"(\"id\") ON DELETE CASCADE ON UPDATE NO ACTION", undefined)];
                    case 74:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InitialSchema1589494061064.prototype.down = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return InitialSchema1589494061064;
}());
exports.InitialSchema1589494061064 = InitialSchema1589494061064;
