'use client'
import { useState } from 'react';
import './GetStarted.css';
import { useRouter } from 'next/navigation';
import { getRedirectUrlByRole } from '../../lib/auth-redirect';

const GetStarted = ({ mode }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(mode || 'selection'); // 'selection', 'candidate', 'company', 'therapist'
  const [userType, setUserType] = useState(mode || '');
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    email: '',
    phone: '',

    // Candidate specific
    age: '',
    education: '',
    experience: '',
    skills: [],
    neurodivergentType: '',
    accommodations: '',
    workPreference: '',

    // Company specific
    companyName: '',
    industry: '',
    companySize: '',
    position: '',
    hiringGoals: '',
    diversityExperience: '',
    jobTypes: [],

    // Therapist specific
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    certifications: [],
    therapyTypes: [],
    availability: '',
    consultationFee: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from prop if provided
  // (We use initial state above, but this handles prop updates if any)
  // ...

  // Handle user type selection
  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setCurrentStep(type);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Common validation
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.email.trim()) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Formato de correo electrónico inválido';

    if (userType === 'candidate') {
      if (!formData.age) newErrors.age = 'La edad es requerida';
      if (!formData.education) newErrors.education = 'El nivel de educación es requerido';
      if (!formData.experience) newErrors.experience = 'El nivel de experiencia es requerido';
      if (formData.skills.length === 0) newErrors.skills = 'Selecciona al menos una habilidad';
    }

    if (userType === 'company') {
      if (!formData.companyName.trim()) newErrors.companyName = 'El nombre de la empresa es requerido';
      if (!formData.industry) newErrors.industry = 'La industria es requerida';
      if (!formData.companySize) newErrors.companySize = 'El tamaño de la empresa es requerido';
      if (!formData.position.trim()) newErrors.position = 'Tu posición es requerida';
    }

    if (userType === 'therapist') {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'El número de licencia es requerido';
      if (!formData.specialization) newErrors.specialization = 'La especialización es requerida';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Los años de experiencia son requeridos';
      if (formData.certifications.length === 0) newErrors.certifications = 'Selecciona al menos una certificación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create user data object
      const userData = {
        userType,
        ...formData,
        registrationDate: new Date().toISOString(),
        isRegistered: true
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('diversia_user_data', JSON.stringify(userData));

        // Here you would typically send data to your backend
        console.log('Form submitted:', userData);

        // Show success message
        alert(`¡Bienvenido a Diversia Eternals, ${formData.firstName}! Tu perfil ha sido creado exitosamente.`);

        // Redirect to appropriate dashboard using standard logic
        const targetUrl = getRedirectUrlByRole(userType);
        router.push(targetUrl);
      }

    } catch (error) {
      console.error('Submission error:', error);
      alert('Algo salió mal. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Go back to selection
  const handleGoBack = () => {
    if (mode) {
      router.push('/get-started');
      return;
    }
    setCurrentStep('selection');
    setUserType('');
  };

  // Render selection screen
  const renderSelection = () => (
    <div className="selectionContainer">
      <div className="headerSection">
        <h1 className="mainTitle">
          Comienza con <span className="brandText">Diversia Eternals</span>
        </h1>
        <p className="subtitle">
          Elige tu camino para desbloquear superpoderes neurodivergentes
        </p>
      </div>

      <div className="optionsGrid">
        <div
          className="optionCard"
          onClick={() => handleUserTypeSelection('candidate')}
        >
          <div className="optionIcon">👤</div>
          <h3 className="optionTitle">Soy un Candidato</h3>
          <p className="optionDescription">
            Descubre tus fortalezas únicas y encuentra roles que coincidan con tus superpoderes
          </p>
          <div className="optionFeatures">
            <span>✨ Evaluación de Superpoderes</span>
            <span>🎯 Emparejamiento Personalizado</span>
            <span>📈 Desarrollo Profesional</span>
          </div>
          <button className="optionButton">Comienza tu Viaje</button>
        </div>

        <div
          className="optionCard"
          onClick={() => handleUserTypeSelection('company')}
        >
          <div className="optionIcon">🏢</div>
          <h3 className="optionTitle">Soy una Empresa</h3>
          <p className="optionDescription">
            Encuentra talento neurodivergente excepcional y aprende a construir equipos inclusivos
          </p>
          <div className="optionFeatures">
            <span>🔍 Acceso a Talento Premium</span>
            <span>🎓 Recursos de Capacitación</span>
            <span>📊 Análisis de Diversidad</span>
          </div>
          <button className="optionButton">Buscar Talento</button>
        </div>

        <div
          className="optionCard"
          onClick={() => handleUserTypeSelection('therapist')}
        >
          <div className="optionIcon">🩺</div>
          <h3 className="optionTitle">Soy un Terapeuta</h3>
          <p className="optionDescription">
            Apoya a individuos neurodivergentes y ayúdales a prosperar en su camino profesional
          </p>
          <div className="optionFeatures">
            <span>👥 Gestión de Clientes</span>
            <span>📋 Herramientas de Evaluación</span>
            <span>💼 Recursos Profesionales</span>
          </div>
          <button className="optionButton">Comenzar a Ayudar</button>
        </div>
      </div>
    </div>
  );

  // Render candidate form
  const renderCandidateForm = () => (
    <div className="formContainer">
      <div className="formHeader">
        <button className="backButton" onClick={handleGoBack}>← Volver</button>
        <h2 className="formTitle">Registro de Candidato</h2>
        <p className="formSubtitle">Descubramos tus superpoderes</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="formSection">
          <h3 className="sectionTitle">Información Personal</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input ${errors.firstName ? 'inputError' : ''}`}
                placeholder="Ingresa tu nombre"
              />
              {errors.firstName && <span className="errorText">{errors.firstName}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input ${errors.lastName ? 'inputError' : ''}`}
                placeholder="Ingresa tu apellido"
              />
              {errors.lastName && <span className="errorText">{errors.lastName}</span>}
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label className="label">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input ${errors.email ? 'inputError' : ''}`}
                placeholder="tu.correo@ejemplo.com"
              />
              {errors.email && <span className="errorText">{errors.email}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="+34 600 123 456"
              />
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Antecedentes Profesionales</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Rango de Edad *</label>
              <select
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`select ${errors.age ? 'inputError' : ''}`}
              >
                <option value="">Seleccionar rango de edad</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="55+">55+</option>
              </select>
              {errors.age && <span className="errorText">{errors.age}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Nivel Educativo *</label>
              <select
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className={`select ${errors.education ? 'inputError' : ''}`}
              >
                <option value="">Seleccionar nivel educativo</option>
                <option value="high-school">Bachillerato</option>
                <option value="associate">Técnico Superior</option>
                <option value="bachelor">Licenciatura</option>
                <option value="master">Maestría</option>
                <option value="phd">Doctorado</option>
                <option value="other">Otro</option>
              </select>
              {errors.education && <span className="errorText">{errors.education}</span>}
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Nivel de Experiencia *</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className={`select ${errors.experience ? 'inputError' : ''}`}
            >
              <option value="">Seleccionar nivel de experiencia</option>
              <option value="entry">Nivel Inicial (0-2 años)</option>
              <option value="mid">Nivel Intermedio (3-5 años)</option>
              <option value="senior">Nivel Senior (6-10 años)</option>
              <option value="expert">Nivel Experto (10+ años)</option>
            </select>
            {errors.experience && <span className="errorText">{errors.experience}</span>}
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Habilidades y Preferencias</h3>
          <div className="formGroup">
            <label className="label">Habilidades Principales * (Selecciona todas las que apliquen)</label>
            <div className="checkboxGrid">
              {['Programación', 'Análisis de Datos', 'Diseño', 'Redacción', 'Investigación', 'Resolución de Problemas', 'Reconocimiento de Patrones', 'Atención al Detalle'].map(skill => (
                <label key={skill} className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    checked={formData.skills.includes(skill)}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  {skill}
                </label>
              ))}
            </div>
            {errors.skills && <span className="errorText">{errors.skills}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Tipo de Neurodivergencia (Opcional)</label>
            <select
              name="neurodivergentType"
              value={formData.neurodivergentType}
              onChange={handleInputChange}
              className="select"
            >
              <option value="">Prefiero no especificar</option>
              <option value="autism">Espectro Autista</option>
              <option value="adhd">TDAH</option>
              <option value="dyslexia">Dislexia</option>
              <option value="dyspraxia">Dispraxia</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label">Preferencia de Trabajo</label>
            <select
              name="workPreference"
              value={formData.workPreference}
              onChange={handleInputChange}
              className="select"
            >
              <option value="">Seleccionar preferencia</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
              <option value="onsite">Presencial</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label">Adaptaciones Necesarias (Opcional)</label>
            <textarea
              name="accommodations"
              value={formData.accommodations}
              onChange={handleInputChange}
              className="textarea"
              placeholder="Describe las adaptaciones laborales que te ayudarían a desempeñarte mejor..."
              rows="4"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submitButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando Tu Perfil...' : 'Crear Mi Perfil'}
        </button>
      </form>
    </div>
  );

  // Render company form
  const renderCompanyForm = () => (
    <div className="formContainer">
      <div className="formHeader">
        <button className="backButton" onClick={handleGoBack}>← Volver</button>
        <h2 className="formTitle">Registro de Empresa</h2>
        <p className="formSubtitle">Conéctate con talento neurodivergente excepcional</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="formSection">
          <h3 className="sectionTitle">Información de Contacto</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input ${errors.firstName ? 'inputError' : ''}`}
                placeholder="Ingresa tu nombre"
              />
              {errors.firstName && <span className="errorText">{errors.firstName}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input ${errors.lastName ? 'inputError' : ''}`}
                placeholder="Ingresa tu apellido"
              />
              {errors.lastName && <span className="errorText">{errors.lastName}</span>}
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label className="label">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input ${errors.email ? 'inputError' : ''}`}
                placeholder="your.email@company.com"
              />
              {errors.email && <span className="errorText">{errors.email}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Información de la Empresa</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Nombre de la Empresa *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`input ${errors.companyName ? 'inputError' : ''}`}
                placeholder="Ingresa el nombre de la empresa"
              />
              {errors.companyName && <span className="errorText">{errors.companyName}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Tu Posición *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`input ${errors.position ? 'inputError' : ''}`}
                placeholder="ej. Gerente de RH, CEO, Reclutador"
              />
              {errors.position && <span className="errorText">{errors.position}</span>}
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label className="label">Industria *</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`select ${errors.industry ? 'inputError' : ''}`}
              >
                <option value="">Seleccionar industria</option>
                <option value="technology">Tecnología</option>
                <option value="healthcare">Salud</option>
                <option value="finance">Finanzas</option>
                <option value="education">Educación</option>
                <option value="manufacturing">Manufactura</option>
                <option value="retail">Retail</option>
                <option value="consulting">Consultoría</option>
                <option value="other">Otro</option>
              </select>
              {errors.industry && <span className="errorText">{errors.industry}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Tamaño de la Empresa *</label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className={`select ${errors.companySize ? 'inputError' : ''}`}
              >
                <option value="">Seleccionar tamaño de empresa</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="201-1000">201-1000 empleados</option>
                <option value="1000+">1000+ empleados</option>
              </select>
              {errors.companySize && <span className="errorText">{errors.companySize}</span>}
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Preferencias de Contratación</h3>
          <div className="formGroup">
            <label className="label">Tipos de Trabajo que Estás Contratando (Selecciona todos los que apliquen)</label>
            <div className="checkboxGrid">
              {['Tiempo Completo', 'Medio Tiempo', 'Contrato', 'Prácticas', 'Remoto', 'Híbrido'].map(type => (
                <label key={type} className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="jobTypes"
                    value={type}
                    checked={formData.jobTypes.includes(type)}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Objetivos de Contratación</label>
            <textarea
              name="hiringGoals"
              value={formData.hiringGoals}
              onChange={handleInputChange}
              className="textarea"
              placeholder="Describe tus objetivos de contratación y qué roles buscas cubrir..."
              rows="4"
            />
          </div>

          <div className="formGroup">
            <label className="label">Experiencia en Diversidad e Inclusión</label>
            <select
              name="diversityExperience"
              value={formData.diversityExperience}
              onChange={handleInputChange}
              className="select"
            >
              <option value="">Seleccionar nivel de experiencia</option>
              <option value="beginner">Comenzando</option>
              <option value="some">Algo de experiencia</option>
              <option value="experienced">Muy experimentado</option>
              <option value="expert">Líder en prácticas de la industria</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="submitButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando Tu Cuenta...' : 'Comenzar a Encontrar Talento'}
        </button>
      </form>
    </div>
  );

  // Render therapist form
  const renderTherapistForm = () => (
    <div className="formContainer">
      <div className="formHeader">
        <button className="backButton" onClick={handleGoBack}>← Volver</button>
        <h2 className="formTitle">Registro de Terapeuta</h2>
        <p className="formSubtitle">Únete a nuestra red de profesionales de apoyo neurodivergente</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="formSection">
          <h3 className="sectionTitle">Información Personal</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input ${errors.firstName ? 'inputError' : ''}`}
                placeholder="Ingresa tu nombre"
              />
              {errors.firstName && <span className="errorText">{errors.firstName}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Apellido *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input ${errors.lastName ? 'inputError' : ''}`}
                placeholder="Ingresa tu apellido"
              />
              {errors.lastName && <span className="errorText">{errors.lastName}</span>}
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label className="label">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input ${errors.email ? 'inputError' : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="errorText">{errors.email}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Credenciales Profesionales</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Número de Licencia *</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={`input ${errors.licenseNumber ? 'inputError' : ''}`}
                placeholder="Ingresa tu número de licencia profesional"
              />
              {errors.licenseNumber && <span className="errorText">{errors.licenseNumber}</span>}
            </div>
            <div className="formGroup">
              <label className="label">Años de Experiencia *</label>
              <select
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className={`select ${errors.yearsOfExperience ? 'inputError' : ''}`}
              >
                <option value="">Seleccionar nivel de experiencia</option>
                <option value="0-2">0-2 años</option>
                <option value="3-5">3-5 años</option>
                <option value="6-10">6-10 años</option>
                <option value="11-15">11-15 años</option>
                <option value="15+">15+ años</option>
              </select>
              {errors.yearsOfExperience && <span className="errorText">{errors.yearsOfExperience}</span>}
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Especialización Principal *</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className={`select ${errors.specialization ? 'inputError' : ''}`}
            >
              <option value="">Seleccionar especialización</option>
              <option value="adhd">Especialista en TDAH</option>
              <option value="autism">Especialista en Espectro Autista</option>
              <option value="dyslexia">Especialista en Dislexia</option>
              <option value="dyspraxia">Especialista en Dispraxia</option>
              <option value="general">Apoyo General Neurodivergente</option>
              <option value="occupational">Terapia Ocupacional</option>
              <option value="psychology">Psicología Clínica</option>
              <option value="other">Otro</option>
            </select>
            {errors.specialization && <span className="errorText">{errors.specialization}</span>}
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Certificaciones y Capacitación</h3>
          <div className="formGroup">
            <label className="label">Certificaciones Profesionales * (Selecciona todas las que apliquen)</label>
            <div className="checkboxGrid">
              {['Psicólogo Clínico Licenciado', 'Consejero Profesional Licenciado', 'Terapeuta Ocupacional', 'Coach de TDAH', 'Especialista en Autismo', 'Especialista en Dislexia', 'Coach Neurodivergente', 'Consejero de Carrera'].map(cert => (
                <label key={cert} className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="certifications"
                    value={cert}
                    checked={formData.certifications.includes(cert)}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  {cert}
                </label>
              ))}
            </div>
            {errors.certifications && <span className="errorText">{errors.certifications}</span>}
          </div>

          <div className="formGroup">
            <label className="label">Tipos de Terapia Ofrecidos (Selecciona todos los que apliquen)</label>
            <div className="checkboxGrid">
              {['Terapia Individual', 'Terapia Grupal', 'Terapia Familiar', 'Asesoría Profesional', 'Evaluación y Valoración', 'Entrenamiento de Habilidades', 'Planificación de Adaptaciones', 'Apoyo Laboral'].map(type => (
                <label key={type} className="checkboxLabel">
                  <input
                    type="checkbox"
                    name="therapyTypes"
                    value={type}
                    checked={formData.therapyTypes.includes(type)}
                    onChange={handleInputChange}
                    className="checkbox"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3 className="sectionTitle">Información de Práctica</h3>
          <div className="formRow">
            <div className="formGroup">
              <label className="label">Disponibilidad</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="select"
              >
                <option value="">Seleccionar disponibilidad</option>
                <option value="full-time">Tiempo Completo</option>
                <option value="part-time">Medio Tiempo</option>
                <option value="weekends">Solo Fines de Semana</option>
                <option value="evenings">Solo Tardes</option>
                <option value="flexible">Horario Flexible</option>
              </select>
            </div>
            <div className="formGroup">
              <label className="label">Tarifa de Consulta (USD)</label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleInputChange}
                className="input"
                placeholder="e.g., 150"
                min="0"
              />
            </div>
          </div>

          <div className="formGroup">
            <label className="label">Biografía Profesional</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="textarea"
              placeholder="Cuéntanos sobre tu experiencia, enfoque y cómo ayudas a individuos neurodivergentes..."
              rows="4"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submitButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando Tu Perfil...' : 'Unirme a la Red'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="container">
      <div className="background">
        <div className="backgroundShape1"></div>
        <div className="backgroundShape2"></div>
        <div className="backgroundShape3"></div>
      </div>

      <div className="content">
        {currentStep === 'selection' && renderSelection()}
        {currentStep === 'candidate' && renderCandidateForm()}
        {currentStep === 'company' && renderCompanyForm()}
        {currentStep === 'therapist' && renderTherapistForm()}
      </div>
    </div>
  );
};

export default GetStarted;