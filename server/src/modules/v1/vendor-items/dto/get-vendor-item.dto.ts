import { Pack } from '@modules/v1/ingredients/pack.entity';
import { VendorItem } from '../interface/vendor-item.interface';

export class GetVendorItemResponseDTO extends VendorItem {
  constructor(vendorItem: Pack) {
    super();

    Object.assign(this, vendorItem);
    this.unit = vendorItem.itemUnit.symbol;
  }
}
