import React from 'react';

const FormInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error, 
  options = [],
  required = false,
  min,
  max,
  step,
  className = '',
  ...props 
}) => {
  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          required={required}
          {...props}
        >
          <option value="">Selecciona una opción</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    
    if (type === "range") {
      return (
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-neutral-700">{label}</span>
            <span className="text-sm font-semibold text-primary-600">{value}%</span>
          </div>
          <input
            type="range"
            id={name}
            name={name}
            min={min || 0}
            max={max || 100}
            step={step || 1}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            {...props}
          />
        </div>
      );
    }
    
    if (type === "textarea") {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          required={required}
          rows="3"
          {...props}
        />
      );
    }
    
    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        required={required}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FormInput;
