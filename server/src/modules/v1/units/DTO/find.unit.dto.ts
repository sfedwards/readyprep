import { PaginatedRequest } from '../../pagination/DTO/pagination.dto';
import { Unit } from '../unit.entity';

export class FindUnitsRequest extends PaginatedRequest {
  pageSize = 500;
}

type ResponseUnit = {
  id?: number;
  name: string;
  symbol: string;
  type: string;
  wellDefined: boolean;
  amount?: number;
  unit?: string;
  magnitude?: number;
};

export class FindUnitsResponse {
  private readonly items: ResponseUnit[];

  constructor(units: Unit[], private readonly numPages: number) {
    this.items = units.map((unit) => {
      const { name, scopedId, symbol, type, definitionUnit } = unit;

      const result: ResponseUnit = {
        id: scopedId,
        name,
        symbol,
        type,
        wellDefined: unit.magnitude !== null,
      };

      if (unit.definitionUnit) {
        result.amount = unit.magnitude / definitionUnit.magnitude;
        result.unit = definitionUnit.symbol;
      }

      if (unit.magnitude) {
        result.magnitude = unit.magnitude;
      }

      return result;
    });
  }
}
