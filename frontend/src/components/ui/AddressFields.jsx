import Field from './Field.jsx'

export default function AddressFields({ value, onChange, errors = {} }) {
  const fields = [
    ['logradouro', 'Logradouro', 'street-address', 200],
    ['numero', 'Número', 'off', 30],
    ['complemento', 'Complemento (opcional)', 'address-line2', 100],
    ['bairro', 'Bairro', 'address-level3', 100],
    ['cidade', 'Cidade', 'address-level2', 100],
    ['uf', 'UF', 'address-level1', 2],
    ['cep', 'CEP', 'postal-code', 9],
  ]
  return (
    <div className="field-grid field-grid--tight">
      {fields.map(([name, label, autoComplete, maxLength]) => (
        <Field
          key={name}
          label={label}
          name={name}
          value={value[name]}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={name !== 'complemento'}
          pattern={
            name === 'uf' ? '[a-zA-Z]{2}' : name === 'cep' ? '[0-9]{5}-?[0-9]{3}' : undefined
          }
          error={errors[`endereco.${name}`]}
          onChange={(event) =>
            onChange({
              ...value,
              [name]: name === 'uf' ? event.target.value.toUpperCase() : event.target.value,
            })
          }
        />
      ))}
    </div>
  )
}
