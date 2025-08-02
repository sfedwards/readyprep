import { KeyboardDatePicker } from "@material-ui/pickers";
import React, { ReactElement, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { useTextInputStyles } from "../../UI";
import { useDateInputStyles } from "./styles";

export interface DateInputProps {
  name?: string;
  control?: Control;
  defaultValue?: Date;
  disabled?: boolean;
}

export const DateInput = (
  {
    name,
    control,
    defaultValue,
    disabled = false,
  }: DateInputProps,
): ReactElement => {
  const [ isDatePickerOpen, setDatePickerOpen ] = useState( false );
  const [ debouncedDatePickerOpen ] = useDebounce( isDatePickerOpen, 100 )

  const classes = {
    textInput: useTextInputStyles({ label: true, disabled }),
    dateInput: useDateInputStyles(),
  }

  return (
    <Controller
      name={name ?? ''}
      control={control}
      defaultValue={defaultValue ?? ''}
      render={ ({ value, onChange }) =>
        <KeyboardDatePicker
          value={value}
          label="Date"
          disableFuture
          autoOk
          disabled={disabled}
          onChange={(...args) => {
            setDatePickerOpen(false);
            onChange(...args);
          }}
          cancelLabel=""
          okLabel=""
          inputVariant="outlined"
          size="medium"
          open={isDatePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          KeyboardButtonProps={{
            style: {
              marginTop: -20,
            },
          }}
          InputLabelProps={ 
            {
              shrink: false,
              variant: 'filled',
              className: classes.textInput.label,
            }
          }
          InputProps={{
            notched: false,
            className: classes.textInput.input,
            disabled,
            onClick: () => { if ( ! disabled ) setDatePickerOpen(true) },
            onFocus: () => { 
              if ( ! debouncedDatePickerOpen && ! disabled ) 
                setDatePickerOpen(true);
            },
          }}
          PopoverProps={{
            onClose: () => setDatePickerOpen(false),
          }}
          { 
            /* @ts-ignore */
            ... {
              classes: classes.dateInput,
            }
          }
        />
      }
    />
  );
}