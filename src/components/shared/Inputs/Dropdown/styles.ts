const valueStyleOptions = {
  background: 'var(--blue)',
  padding: '3px',
  color: 'white',
};

export const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    fontFamily: 'cera-medium',
    background: state.isFocused ? 'var(--blue-06)' : 'transparent',
    opacity: state.isDisabled ? 0.4 : 1,
    color: 'white',
    border: state.isFocused ? '2px solid var(--purple-aux)' : '1px solid var(--blue-03)',
    height: '50px',
    boxShadow: state.isFocused ? null : null,
  }),
  menu: (provided: any) => ({
    ...provided,
    background: 'var(--blue-06)',
    borderRight: 'none',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'white',
    fontWeight: '400',
    fontSize: '16px',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    padding: '0',
    background: state.isFocused ? 'var(--blue-05)' : 'var(--blue-06)',
    minHeight: '50px',
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    '&:hover': {
      background: 'var(--blue-05)',
    },
    paddingLeft: '14px',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: 'transparent',
  }),
  multiValue: (provided: any) => ({
    ...provided,
    ...valueStyleOptions,
    color: 'white',
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    ...valueStyleOptions,
    color: 'white',
    background: 'transparent',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    color: 'white',
    borderRight: 'red',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'white !important',
    cursor: 'pointer',
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    color: 'white !important',
    cursor: 'pointer',
  }),
};
