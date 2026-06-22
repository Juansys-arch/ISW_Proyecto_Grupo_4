import { useForm } from 'react-hook-form';
import { useState } from 'react';
import '@styles/form.css';
import HideIcon from '../assets/HideIcon.svg';
import ViewIcon from '../assets/ViewIcon.svg';

const Form = ({ title, fields, buttonText, onSubmit, footerContent, backgroundColor, initialValues }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialValues || {}
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <form
            className="form"
            style={{ backgroundColor: backgroundColor }}
            onSubmit={handleSubmit(onFormSubmit)}
            autoComplete="off"
        >
            {title && <h1>{title}</h1>}
            {fields && fields.map((field, index) => {
                // Detectar tipo de campo automáticamente
                const fieldType = field.fieldType || (field.type === 'textarea' ? 'textarea' : field.type === 'select' ? 'select' : 'input');
                const isPasswordField = (field.type === 'password');
                const isText = fieldType === 'input' || fieldType === 'text' || fieldType === 'number' || fieldType === 'date' || fieldType === 'time' || fieldType === 'email' || fieldType === 'password';
                
                return (
                    <div className="container_inputs" key={index}>
                        {field.label && <label htmlFor={field.name}>{field.label}</label>}
                        
                        {isText && (
                            <input
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                    maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                    pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                    validate: field.validate || {},
                                })}
                                name={field.name}
                                placeholder={field.placeholder || ''}
                                type={isPasswordField && field.name === 'password' ? (showPassword ? 'text' : 'password') :
                                    isPasswordField && field.name === 'newPassword' ? (showNewPassword ? 'text' : 'password') :
                                    field.type}
                                disabled={field.disabled || false}
                                onChange={field.onChange}
                            />
                        )}
                        
                        {fieldType === 'textarea' && (
                            <textarea
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    minLength: field.minLength ? { value: field.minLength, message: `Debe tener al menos ${field.minLength} caracteres` } : false,
                                    maxLength: field.maxLength ? { value: field.maxLength, message: `Debe tener máximo ${field.maxLength} caracteres` } : false,
                                    pattern: field.pattern ? { value: field.pattern, message: field.patternMessage || 'Formato no válido' } : false,
                                    validate: field.validate || {},
                                })}
                                name={field.name}
                                placeholder={field.placeholder || ''}
                                disabled={field.disabled || false}
                                onChange={field.onChange}
                            />
                        )}
                        
                        {fieldType === 'select' && (
                            <select
                                {...register(field.name, {
                                    required: field.required ? 'Este campo es obligatorio' : false,
                                    validate: field.validate || {},
                                })}
                                name={field.name}
                                disabled={field.disabled || false}
                                onChange={field.onChange}
                            >
                                <option value="">Seleccionar opción</option>
                                {field.options && field.options.map((option, optIndex) => (
                                    <option className="options-class" key={optIndex} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        
                        {isPasswordField && field.name === 'password' && (
                            <span className="toggle-password-icon" onClick={togglePasswordVisibility}>
                                <img src={showPassword ? ViewIcon : HideIcon} alt="toggle" />
                            </span>
                        )}
                        {isPasswordField && field.name === 'newPassword' && (
                            <span className="toggle-password-icon" onClick={toggleNewPasswordVisibility}>
                                <img src={showNewPassword ? ViewIcon : HideIcon} alt="toggle" />
                            </span>
                        )}
                        
                        <div className={`error-message ${errors[field.name] || field.errorMessageData ? 'visible' : ''}`}>
                            {errors[field.name]?.message || field.errorMessageData || ''}
                        </div>
                    </div>
                );
            })}
            {buttonText && <button type="submit">{buttonText}</button>}
            {footerContent && <div className="footerContent">{footerContent}</div>}
        </form>
    );
};

export default Form;