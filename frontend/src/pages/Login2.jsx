import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import { showErrorAlert } from '@helpers/sweetAlert.js';
import Form from '@components/Form';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/form.css';

const Login = () => {
    const navigate = useNavigate();
    const {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    } = useLogin();

    const loginSubmit = async (data) => {
        try {
            const response = await login(data);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                if (response.details && response.details.dataInfo === 'status') {
                    showErrorAlert('Acceso restringido', response.details.message);
                } else {
                    errorData(response.details);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="logo-icon">🏢</div>
                        <h1 className="login-title">TECHO-CORE</h1>
                    </div>
                    <p className="login-subtitle">Sistema de Gestión de Jornadas</p>
                </div>

                <Form
                    title="Iniciar sesión"
                    fields={[
                        {
                            label: "Correo electrónico",
                            name: "email",
                            placeholder: "example@gmail.cl",
                            fieldType: 'input',
                            type: "email",
                            required: true,
                            minLength: 15,
                            maxLength: 30,
                            errorMessageData: errorEmail,
                            validate: {
                                emailDomain: (value) => value.endsWith('@gmail.cl') || 'El correo debe ser institucional (@gmail.cl)'
                            },
                            onChange: (e) => handleInputChange('email', e.target.value),
                        },
                        {
                            label: "Contraseña",
                            name: "password",
                            placeholder: "**********",
                            fieldType: 'input',
                            type: "password",
                            required: true,
                            minLength: 8,
                            maxLength: 26,
                            pattern: /^[a-zA-Z0-9]+$/,
                            patternMessage: "Debe contener solo letras y números",
                            errorMessageData: errorPassword,
                            onChange: (e) => handleInputChange('password', e.target.value)
                        },
                    ]}
                    buttonText="Iniciar sesión"
                    onSubmit={loginSubmit}
                    footerContent={
                        <p className="login-footer">
                            ¿No tienes cuenta?, <a href="/register">¡Regístrate aquí!</a>
                        </p>
                    }
                />

                <div className="login-footer-info">
                    <p>© 2026 TECHO-CORE. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;