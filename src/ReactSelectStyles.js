export const reactSelectStyles = {
    control: (base, state) => ({
        ...base,
        borderWidth: '2px',
        boxShadow: 'none',
        '&:focus-within': {
            borderColor: state.isFocused && 'var(--bs-teal)'
        },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: "0.99rem 0.7rem 0.75rem"
    }),
    placeholder: (base) => ({
        ...base,
        paddingBottom: "0.105rem"
    }),
    option: (base) => ({
        ...base,
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'var(--bg-primary-light2)'
        },
    }),
    multiValue: (base) => ({
        ...base,
        margin: '0 2px 0 0',
    }),
    multiValueLabel: (base) => ({
        ...base,
        backgroundColor: 'var(--bg-primary-light2)',
    }),
    multiValueRemove: (base) => ({
        ...base,
        backgroundColor: 'var(--bg-primary-light2)',
        '&:hover': {
            backgroundColor: 'var(--bg-primary-light2)'
        },
    }),
}