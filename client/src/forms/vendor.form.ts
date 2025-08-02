import * as yup from 'yup';

import { ORDER_METHODS, OrderMethod } from '../enum/order-methods.enum';

import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export interface VendorForm {
  name: string;
  accountNumber: string;
  orderMethod: OrderMethod;
  includePricesOnPurchaseOrders: boolean;
  primaryContact: {
    name: string;
    email: string;
    officePhone: string;
    mobilePhone: string;
  }
  address: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
  }
}

type Mutable<T> = {
  -readonly[P in keyof T]: T[P]
}

export const vendorFormSchema = yup.object().shape({
  name: yup.string().required(),
  accountNumber: yup.string(),
  orderMethod: yup.string().oneOf( ORDER_METHODS as Mutable<typeof ORDER_METHODS> ),
  includePricesOnPurchaseOrders: yup.boolean(),
  primaryContact: yup.object().shape({
    name: yup.string(),
    email: yup.string().email('invalid').when( 
      'orderMethod', 
      {
        is: 'email',
        then: yup.string().required(),
      }
    ),
    officePhone: yup.string().test(
      'us-phone', 
      'invalid phone #', 
      value => {
        console.log( value );
        return ! value || phoneUtil.isValidNumberForRegion( phoneUtil.parse( value, 'US' ), 'US' )
      }
    ),
    mobilePhone: yup.string().test(
      'us-phone', 
      'invalid phone #', 
      value => {
        return ! value || phoneUtil.isValidNumberForRegion( phoneUtil.parse( value, 'US' ), 'US' )
      }
    ),
  }),
  address: yup.object().shape({
    street1: yup.string(),
    street2: yup.string(),
    city: yup.string(),
    state: yup.string(),
    zip: yup.string(),
  }),
});