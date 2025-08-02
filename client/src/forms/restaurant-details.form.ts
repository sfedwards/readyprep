import * as yup from 'yup';

export interface RestaurantsDetailsForm {
  name: string;
  address: string;
  phone: string;
}

export const restaurantDetailsFormSchema = yup.object().shape({
  name: yup.string().required('Required'),
  address: yup.string().required('Required'),
  phone: yup.string().required('Required'),
});
