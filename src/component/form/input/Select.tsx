import React from 'react';
import { Control, Controller } from 'react-hook-form';
import ReactSelect from 'react-select';

export const clearSelect = (ref: React.MutableRefObject<any>) => {
  ref.current.select.clearValue();
};

const Select = (props: {
  name: string;
  control: Control;
  options: { value: string; label: string }[];
  inputRef: React.MutableRefObject<any>;
}) => {
  const { name, control, options, inputRef } = props;

  const styles = {
    option: (provided: any, state: { isSelected: any }) => ({
      ...provided,
      color: state.isSelected ? '#c9cecb' : '#c9cecb',
      fontSize: '2vw',
    }),
    control: (base: any) => ({
      ...base,
      border: 0,
      fontSize: '2vw',
    }),
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <ReactSelect
            {...field}
            options={options}
            theme={(theme) => ({
              ...theme,
              borderRadius: 5,
              colors: {
              ...theme.colors,
                primary: '#323437',
                primary25: '#2e3033',
                primary50: '#2e3033', // click background
                primary75: 'red', // ???
                neutral0: '#323437',
                neutral5: 'red', // ???
                neutral10: 'red', // ???
                neutral20: '#c9cecb', // border, arrow
                neutral30: '#c9cecb', // focus border
                neutral40: '#c9cecb', // no options
                neutral50: '#c9cecb', // Select ...
                neutral60: '#c9cecb', // arrow
                neutral70: 'red', // ??
                neutral80: '#c9cecb', // text
                neutral90: '#c9cecb', // ??
              },
            })}
            styles={styles}
            ref={inputRef}
          />
        )}
      />
    </>
  );
};

export default Select;
