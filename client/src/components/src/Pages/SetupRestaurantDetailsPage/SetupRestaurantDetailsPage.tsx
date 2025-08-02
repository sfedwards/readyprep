import { Box, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, TextInput } from '../../../UI';
import { Logo } from '../../../UI/Logo';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { restaurantDetailsFormSchema, RestaurantsDetailsForm } from '../../../../forms';
import { useLocationsApi } from '../../../../services/api/hooks/useLocationsApi.api.hook';
import { useAddressFieldStyles } from './styles';




export const SetupRestaurantDetailsPage = (): ReactElement => {

  const restaurantDetailsForm = useForm({
    resolver: yupResolver( restaurantDetailsFormSchema ),
  });

  const locationsApi = useLocationsApi();

  const history = useHistory();

  const handleSubmit = async ( data: RestaurantsDetailsForm ) => {
    await locationsApi.addLocation( {
      name: data.name,
      address: data.address,
      phoneNumber: data.phone,
    });

    history.replace( '/getting-started' );
  };

  const classes = {
    addressField: useAddressFieldStyles(),
  };

  return (
    <>
      <Box style={{ background: '#fff' }}>
        <Box maxWidth={1080} margin="auto" lineHeight={0}>
          <Link to="/"><Logo style={{ height: '4.5rem', maxWidth: '90%' }} /></Link>
        </Box>
      </Box>
      <Box maxWidth={1080} margin="auto" p={4}>
        <Typography variant="h3">
          Setup Your Account
        </Typography>
        <Typography>
          Please enter your Restaurant details to complete your account setup
        </Typography>
        <form onSubmit={restaurantDetailsForm.handleSubmit(handleSubmit)}>
          <Box maxWidth={600} mt={2}>
            <Box maxWidth={260}>
              <TextInput
                label={`Restaurant Name${restaurantDetailsForm.errors.name?.message ? ` (${restaurantDetailsForm.errors.name?.message})` : ''}`}
                name="name"
                inputRef={restaurantDetailsForm.register}
                error={!!restaurantDetailsForm.errors.name}
              />
            </Box>
            <Box width="50%">
              <TextInput
                label={`Address${restaurantDetailsForm.errors.address?.message ? ` (${restaurantDetailsForm.errors.address?.message})` : ''}`}
                name="address"
	            	multiline
                inputRef={restaurantDetailsForm.register}
                error={!!restaurantDetailsForm.errors.address}
		            className={classes.addressField.root}
              />
            </Box>
            <Box width="50%">
              <TextInput
                label={`Phone Number${restaurantDetailsForm.errors.phone?.message ? ` (${restaurantDetailsForm.errors.phone?.message})` : ''}`}
                name="phone"
                inputRef={restaurantDetailsForm.register}
                error={!!restaurantDetailsForm.errors.phone}
              />
            </Box>
            <Box mt={1}>
              <Button type="submit">Complete Setup</Button>
            </Box>
          </Box>
        </form>
      </Box>
    </>
  );
};
