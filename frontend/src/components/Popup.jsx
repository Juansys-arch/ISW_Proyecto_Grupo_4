import Form from './Form';
import '@styles/popup.css';
import CloseIcon from '@assets/XIcon.svg';
import QuestionIcon from '@assets/QuestionCircleIcon.svg';

export default function Popup({ show, setShow, data, action, mode = 'edit', fields: customFields = null }) {
    const isCreateMode = mode === 'create';
    const userData = data && data.length > 0 ? data[0] : {};

    const handleSubmit = (formData) => {
        action(formData);
    };

    const patternRut = new RegExp(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/);

    const volunteerFields = [
        {
            label: "Nombre completo",
            name: "nombreCompleto",
            defaultValue: userData.nombreCompleto || "",
            placeholder: 'Diego Alexis Salazar Jara',
            fieldType: 'input',
            type: "text",
            required: true,
            minLength: 15,
            maxLength: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            patternMessage: "Debe contener solo letras y espacios",
        },
        {
            label: "Correo electrónico",
            name: "email",
            defaultValue: userData.email || "",
            placeholder: 'example@gmail.cl',
            fieldType: 'input',
            type: "email",
            required: true,
            minLength: 15,
            maxLength: 35,
        },
        {
            label: "Rut",
            name: "rut",
            defaultValue: userData.rut || "",
            placeholder: '21.308.770-3',
            fieldType: 'input',
            type: "text",
            required: true,
            minLength: 9,
            maxLength: 12,
            pattern: patternRut,
            patternMessage: "Debe ser xx.xxx.xxx-x o xxxxxxxx-x",
        },
        {
            label: "Número de contacto",
            name: "numeroContacto",
            defaultValue: userData.numeroContacto || userData.telefono || "",
            placeholder: '+56912345678',
            fieldType: 'input',
            type: "text",
            required: true,
            minLength: 8,
            maxLength: 20,
            pattern: /^[0-9+\-\s]+$/,
            patternMessage: "Debe contener solo números, espacios, + y -",
        },
        {
            label: "Fecha de nacimiento",
            name: "fechaNacimiento",
            defaultValue: userData.fechaNacimiento || "",
            placeholder: '1990-01-01',
            fieldType: 'input',
            type: "date",
            required: true,
        },
        {
            label: "Género",
            name: "genero",
            defaultValue: userData.genero || "",
            fieldType: 'select',
            options: [
                { value: 'masculino', label: 'Masculino' },
                { value: 'femenino', label: 'Femenino' },
                { value: 'otro', label: 'Otro' },
            ],
            required: true,
        },
        {
            label: "Dirección",
            name: "direccion",
            defaultValue: userData.direccion || "",
            placeholder: 'Dirección del voluntario',
            fieldType: 'input',
            type: "text",
            required: false,
            maxLength: 255,
        },
        {
            label: "Región",
            name: "region",
            defaultValue: userData.region || "",
            placeholder: 'Región del voluntario',
            fieldType: 'input',
            type: "text",
            required: false,
            maxLength: 100,
        },
        {
            label: "Comuna",
            name: "comuna",
            defaultValue: userData.comuna || "",
            placeholder: 'Comuna del voluntario',
            fieldType: 'input',
            type: "text",
            required: false,
            maxLength: 100,
        },
        {
            label: "Disponibilidad",
            name: "disponibilidad",
            defaultValue: userData.disponibilidad || "",
            placeholder: 'Ej. Indefinida, fin de semana, horario libre',
            fieldType: 'input',
            type: "text",
            required: false,
            maxLength: 100,
        },
    ];

    const defaultFields = isCreateMode
        ? volunteerFields
        : [
            ...volunteerFields,
            {
                label: (
                    <span>
                        Nueva contraseña
                        <span className='tooltip-icon'>
                            <img src={QuestionIcon} />
                            <span className='tooltip-text'>Este campo es opcional</span>
                        </span>
                    </span>
                ),
                name: "newPassword",
                placeholder: "**********",
                fieldType: 'input',
                type: "password",
                required: false,
                minLength: 8,
                maxLength: 26,
                pattern: /^[a-zA-Z0-9]+$/,
                patternMessage: "Debe contener solo letras y números",
            },
        ];

    const fields = customFields || defaultFields;

    return (
        <div>
            { show && (
            <div className="bg">
                <div className="popup">
                    <button className='close' onClick={() => setShow(false)}>
                        <img src={CloseIcon} />
                    </button>
                    <Form
                        title={isCreateMode ? "Añadir voluntario" : "Editar voluntario"}
                        fields={fields}
                        onSubmit={handleSubmit}
                        buttonText={isCreateMode ? "Añadir" : "Guardar cambios"}
                        backgroundColor={'#fff'}
                    />
                </div>
            </div>
            )}
        </div>
    );
}