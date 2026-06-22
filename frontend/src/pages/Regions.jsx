import { useEffect, useState, useCallback } from 'react';
import axios from '@services/root.service.js';
import Popup from '@components/Popup';
import Search from '@components/Search';
import { createVolunteerOnSite } from '@services/volunteer.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import useEditVolunteer from '@hooks/users/useEditVolunteer';
import useDeleteUser from '@hooks/users/useDeleteUser';
import PlusIcon from '@assets/plusIcon.svg';
import DeleteIcon from '@assets/deleteIcon.svg';
import UpdateIcon from '@assets/updateIcon.svg';
import UpdateIconDisable from '@assets/updateIconDisabled.svg';
import DeleteIconDisable from '@assets/deleteIconDisabled.svg';
import '@styles/regions.css';

const Regions = () => {
  const [data, setData] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [openRegions, setOpenRegions] = useState({});
  const [openComunas, setOpenComunas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRut, setFilterRut] = useState('');
  const [popupMode, setPopupMode] = useState('edit');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedRegionForForm, setSelectedRegionForForm] = useState('');

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditVolunteer(() => fetchData());

  const fetchData = async () => {
    try {
      setLoading(true);
      let res;

      try {
        const response = await axios.get('/volunteer/regions');
        res = response.data;
      } catch (error) {
        console.warn('Error fetching /volunteer/regions, retrying with /volunteer/regions/list', error);
        const response = await axios.get('/volunteer/regions/list');
        res = response.data;
      }

      if (res && res.status === 'Success') {
        const regionsData = Array.isArray(res.data) ? res.data : [];
        setData(regionsData);
        setSelectedRegionForForm(regionsData[0]?.region || '');

        // Flatten all volunteers for filtering
        const allVols = [];
        regionsData.forEach(region => {
          const comunas = Array.isArray(region.comunas) ? region.comunas : [];
          comunas.forEach(c => {
            const volunteers = typeof c === 'string' ? [] : c.volunteers || [];
            allVols.push(...volunteers);
          });
        });
        setAllVolunteers(allVols);
      } else {
        setError(res?.message || 'Error al obtener regiones');
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError(err?.response?.data?.message || err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { handleDelete } = useDeleteUser(fetchData, setDataUser);

  const handleClickAdd = () => {
    setDataUser([]);
    setPopupMode('create');
    setSelectedRegionForForm(data[0]?.region || '');
    setIsPopupOpen(true);
  };

  const handleRegionFieldChange = (e) => {
    setSelectedRegionForForm(e.target.value);
  };

  const handleCreate = async (newVolunteerData) => {
    try {
      const payload = {
        ...newVolunteerData,
        region: newVolunteerData.region || selectedRegionForForm,
        comuna: newVolunteerData.comuna || '',
        numeroContacto: newVolunteerData.numeroContacto || newVolunteerData.telefono,
      };
      delete payload.telefono;

      const response = await createVolunteerOnSite(payload);
      if (!response || response.status === 'Client error' || response.status === 'Server error') {
        const message = response?.details || response?.message || 'Ocurrió un error al agregar el voluntario.';
        return showErrorAlert('Error', message);
      }

      const created = response.data;
      if (!created) {
        return showErrorAlert('Error', 'Respuesta inválida del servidor.');
      }

      // Optimistic UI: insert the created volunteer into the local `data` state
      setData(prevData => {
        const next = JSON.parse(JSON.stringify(prevData || []));

        // find region
        const regionIdx = next.findIndex(r => r.region === (created.region || selectedRegionForForm));
        if (regionIdx === -1) {
          // region not in list (unlikely) -> return prev
          return prevData;
        }

        const regionObj = next[regionIdx];
        // find comuna object
        let comunaIdx = regionObj.comunas.findIndex(c => (typeof c !== 'string' && c.comuna === created.comuna));
        if (comunaIdx === -1) {
          // add new comuna object
          regionObj.comunas.push({ comuna: created.comuna || 'Sin comuna', volunteers: [created] });
          comunaIdx = regionObj.comunas.length - 1;
        } else {
          // push volunteer into existing comuna
          const comunaObj = regionObj.comunas[comunaIdx];
          if (!comunaObj.volunteers) comunaObj.volunteers = [];
          comunaObj.volunteers.push(created);
        }

        // open region and comuna so user sees the new volunteer
        setOpenRegions(prev => ({ ...prev, [regionIdx]: true }));
        setOpenComunas(prev => ({ ...prev, [`${regionIdx}-${comunaIdx}`]: true }));

        return next;
      });

      // update flattened list
      setAllVolunteers(prev => [...prev, created]);

      showSuccessAlert('¡Agregado!', 'El voluntario ha sido agregado correctamente.');
      setIsPopupOpen(false);
      setDataUser([]);
      setFilterRut('');
    } catch (error) {
      console.error('Error al añadir voluntario:', error);
      showErrorAlert('Cancelado', 'Ocurrió un error al añadir el voluntario.');
    }
  };

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleVolunteerSelect = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setDataUser([volunteer]);
  };

  const regionOptions = data.map(region => ({ value: region.region, label: region.region }));
  const mapComunaOption = (comuna) => {
    const comunaName = typeof comuna === 'string' ? comuna : comuna?.comuna || '';
    return { value: comunaName, label: comunaName };
  };

  const comunaOptions = selectedRegionForForm
    ? data.find(region => region.region === selectedRegionForForm)?.comunas.map(mapComunaOption) || []
    : data.flatMap(region => region.comunas.map(mapComunaOption));

  const formFields = [
    {
      label: "Nombre completo",
      name: "nombreCompleto",
      defaultValue: '',
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
      defaultValue: '',
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
      defaultValue: '',
      placeholder: '21.308.770-3',
      fieldType: 'input',
      type: "text",
      required: true,
      minLength: 9,
      maxLength: 12,
      pattern: /^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/,
      patternMessage: "Debe ser xx.xxx.xxx-x o xxxxxxxx-x",
    },
    {
      label: "Número de contacto",
      name: "numeroContacto",
      defaultValue: '',
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
      defaultValue: '',
      placeholder: '1990-01-01',
      fieldType: 'input',
      type: "date",
      required: true,
    },
    {
      label: "Género",
      name: "genero",
      defaultValue: '',
      fieldType: 'select',
      options: [
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
        { value: 'otro', label: 'Otro' },
      ],
      required: true,
    },
    {
      label: "Región",
      name: "region",
      defaultValue: selectedRegionForForm,
      fieldType: 'select',
      options: regionOptions,
      required: true,
      onChange: handleRegionFieldChange,
    },
    {
      label: "Comuna",
      name: "comuna",
      defaultValue: comunaOptions[0]?.value || '',
      fieldType: 'select',
      options: comunaOptions,
      required: true,
    },
    {
      label: "Disponibilidad",
      name: "disponibilidad",
      defaultValue: '',
      placeholder: 'Ej. Indefinida, fin de semana, horario libre',
      fieldType: 'input',
      type: "text",
      required: false,
      maxLength: 100,
    },
  ];

  const toggleRegion = (idx) => {
    setOpenRegions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleComuna = (rIdx, cIdx) => {
    const key = `${rIdx}-${cIdx}`;
    setOpenComunas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTotalVolunteers = () => {
    return allVolunteers.length;
  };

  const getTotalComunas = () => {
    return data.reduce((total, region) => total + region.comunas.length, 0);
  };

  // Filter volunteers by RUT
  const getFilteredData = () => {
    if (!filterRut.trim()) {
      return data;
    }

    const filterLower = filterRut.toLowerCase();
    return data.map(region => ({
      ...region,
      comunas: region.comunas.map(c => {
        if (typeof c === 'string') return c;
        const volunteers = c.volunteers ? c.volunteers.filter(v => 
          v.rut.toLowerCase().includes(filterLower)
        ) : [];
        return { ...c, volunteers };
      }).filter(c => {
        if (typeof c === 'string') return true;
        return c.volunteers && c.volunteers.length > 0;
      })
    })).filter(region => region.comunas.length > 0);
  };

  const filteredData = getFilteredData();

  return (
    <div className='regions-container'>
      <div className='regions-wrapper'>
        {/* Header */}
        <div className='regions-header'>
          <h1>🗺️ Voluntarios por Región</h1>
          <p>Explora y gestiona todos los voluntarios registrados por región y comuna</p>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className='regions-stats'>
            <div className='stat-card'>
              <span className='stat-number'>{data.length}</span>
              <span className='stat-label'>Regiones</span>
            </div>
            <div className='stat-card'>
              <span className='stat-number'>{getTotalComunas()}</span>
              <span className='stat-label'>Comunas</span>
            </div>
            <div className='stat-card'>
              <span className='stat-number'>{getTotalVolunteers()}</span>
              <span className='stat-label'>Voluntarios</span>
            </div>
          </div>
        )}

        {/* Filter and Actions */}
        {!loading && !error && (
          <div className='regions-filter-actions'>
            <Search 
              value={filterRut} 
              onChange={handleRutFilterChange} 
              placeholder={'Filtrar por rut'} 
            />
            <button className='edit-user-button' type='button' onClick={handleClickUpdate} disabled={dataUser.length === 0}>
              {dataUser.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
              <span>Editar</span>
            </button>
            <button className='add-user-button' type='button' onClick={handleClickAdd}>
              <img src={PlusIcon} alt="add" />
              <span>Añadir</span>
            </button>
            <button className='delete-user-button' type='button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
              {dataUser.length === 0 ? (
                <img src={DeleteIconDisable} alt="delete-disabled" />
              ) : (
                <img src={DeleteIcon} alt="delete" />
              )}
              <span>Eliminar</span>
            </button>
          </div>
        )}

        {/* Content */}
        {loading && (
          <div className='loading-spinner'>
            <div className='spinner'></div>
            <span style={{ marginLeft: 16, fontSize: '1.1rem' }}>Cargando regiones...</span>
          </div>
        )}

        {error && (
          <div className='error-message'>
            ❌ Error: {error}
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && filterRut && (
          <div className='no-data-message'>
            ℹ️ No hay voluntarios que coincidan con el RUT "{filterRut}"
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className='no-data-message'>
            ℹ️ No hay regiones disponibles en este momento
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div>
            {filteredData.map((regionObj, rIdx) => (
              <div 
                key={rIdx} 
                className={`region-item ${openRegions[rIdx] ? 'open' : ''}`}
              >
                <button
                  className='region-header'
                  type='button'
                  onClick={() => toggleRegion(rIdx)}
                >
                  <div className='region-title'>
                    <span className='region-icon'>📍</span>
                    <span>{regionObj.region}</span>
                  </div>
                  <div className='region-count'>
                    {regionObj.comunas.length} comunas
                  </div>
                  <div className='chevron'>⌄</div>
                </button>

                {openRegions[rIdx] && (
                  <div className='region-content'>
                    <div className='comunas-grid'>
                      {regionObj.comunas.map((c, cIdx) => {
                        const comunaName = typeof c === 'string' ? c : c.comuna;
                        const volunteers = typeof c === 'string' ? [] : c.volunteers || [];
                        return (
                          <div key={cIdx} className={`comuna-item ${openComunas[`${rIdx}-${cIdx}`] ? 'open' : ''}`}>
                            <button
                              className='comuna-header'
                              type='button'
                              onClick={() => toggleComuna(rIdx, cIdx)}
                            >
                              <div className='comuna-name'>
                                <span className='comuna-icon'>🏘️</span>
                                <span>{comunaName}</span>
                              </div>
                              <div className={`volunteers-count ${volunteers.length === 0 ? 'empty' : ''}`}>
                                {volunteers.length}
                              </div>
                            </button>

                            {openComunas[`${rIdx}-${cIdx}`] && (
                              <div className='comuna-content'>
                                {volunteers.length > 0 ? (
                                  <table className='volunteers-table'>
                                    <thead>
                                      <tr>
                                        <th>👤 Nombre</th>
                                        <th>✉️ Correo</th>
                                        <th>📱 Teléfono</th>
                                        <th>✓ Estado</th>
                                        <th style={{ width: 100, textAlign: 'center' }}>Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {volunteers.map(v => (
                                        <tr 
                                          key={v.id}
                                          onClick={() => handleVolunteerSelect(v)}
                                          style={{ cursor: 'pointer', backgroundColor: selectedVolunteer?.id === v.id ? '#e8ecff' : 'transparent' }}
                                        >
                                          <td>{v.nombreCompleto}</td>
                                          <td>{v.email}</td>
                                          <td>{v.numeroContacto}</td>
                                          <td>
                                            <span className={`status-badge ${v.status || 'pending'}`}>
                                              {v.status || 'Pendiente'}
                                            </span>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <button 
                                              className='action-button edit'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleVolunteerSelect(v);
                                                setPopupMode('edit');
                                                setIsPopupOpen(true);
                                              }}
                                              title="Editar voluntario"
                                            >
                                              ✏️
                                            </button>
                                            <button 
                                              className='action-button delete'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleVolunteerSelect(v);
                                                handleDelete([v]);
                                              }}
                                              title="Eliminar voluntario"
                                            >
                                              🗑️
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className='no-volunteers-message'>
                                    ℹ️ No hay voluntarios registrados en esta comuna
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup for create/edit */}
      <Popup
        show={isPopupOpen}
        setShow={setIsPopupOpen}
        data={dataUser}
        action={popupMode === 'create' ? handleCreate : handleUpdate}
        mode={popupMode}
        fields={popupMode === 'create' ? formFields : undefined}
      />
    </div>
  );
};

export default Regions;
