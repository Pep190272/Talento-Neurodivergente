// Archivo de traducciones extendido - importar las traducciones base y agregar el resto
import { translations as baseTranslations } from './translations';

export const extendedTranslations = {
  en: {
    ...baseTranslations.en,
    faq: {
      title: 'Frequently Asked Questions',
      questions: {
        q1: {
          question: 'What is neurodiversity?',
          answer: 'Neurodiversity refers to the natural variation in human brains and minds. It includes conditions like autism, ADHD, dyslexia, and more, emphasizing strengths as well as challenges.'
        },
        q2: {
          question: 'How does the talent matching work?',
          answer: 'Our AI-driven algorithm matches candidates with roles based on their unique strengths, preferences, and assessment results, ensuring the best fit for both individuals and companies.'
        },
        q3: {
          question: 'Is my data secure and private?',
          answer: 'Yes. We use secure, encrypted storage and never share your personal data without your consent. You control your information at all times.'
        },
        q4: {
          question: 'Can companies and therapists join?',
          answer: 'Absolutely! We support individuals, companies, and therapists with tailored resources, tools, and support.'
        },
        q5: {
          question: 'How do I get started?',
          answer: 'Simply sign up, complete your profile, and take an assessment. Our platform will guide you through the next steps.'
        }
      }
    },
    newsletter: {
      title: 'Stay in the Loop',
      description: 'Subscribe to our newsletter for updates, resources, and neurodiversity insights.',
      placeholder: 'Your email address',
      subscribe: 'Subscribe',
      thankYou: 'Thank you for subscribing!',
      error: 'Please enter a valid email address.',
      privacy: 'We respect your privacy. Unsubscribe at any time.'
    },
    footer: {
      copyright: 'Eternals NeuroTalent Platform. All rights reserved.',
      home: 'Home',
      features: 'Features',
      forms: 'Forms',
      games: 'Games',
      quiz: 'Quiz'
    },
    getStarted: {
      mainTitle: 'Get Started with',
      brandText: 'DiversIA',
      subtitle: 'Choose your path to unlock neurodivergent superpowers',
      back: 'Back',
      candidate: {
        title: "I'm a Candidate",
        description: 'Discover your unique strengths and find roles that match your superpowers',
        feature1: 'Superpower Assessment',
        feature2: 'Personalized Job Matching',
        feature3: 'Career Development',
        button: 'Start Your Journey',
        formTitle: 'Candidate Registration',
        formSubtitle: "Let's discover your superpowers",
        submit: 'Create My Profile',
        submitting: 'Creating Your Profile...'
      },
      company: {
        title: "I'm a Company",
        description: 'Find exceptional neurodivergent talent and learn how to build inclusive teams',
        feature1: 'Access Top Talent',
        feature2: 'Team Training Resources',
        feature3: 'Diversity Analytics',
        button: 'Find Talent',
        formTitle: 'Company Registration',
        formSubtitle: 'Connect with exceptional neurodivergent talent',
        submit: 'Start Finding Talent',
        submitting: 'Creating Your Account...'
      },
      therapist: {
        title: "I'm a Therapist",
        description: 'Support neurodivergent individuals and help them thrive in their professional journey',
        feature1: 'Client Management',
        feature2: 'Assessment Tools',
        feature3: 'Professional Resources',
        button: 'Start Helping',
        formTitle: 'Therapist Registration',
        formSubtitle: 'Join our network of neurodivergent support professionals',
        submit: 'Join Our Network',
        submitting: 'Creating Your Profile...'
      },
      form: {
        personalInfo: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        required: '*',
        firstNamePlaceholder: 'Enter your first name',
        lastNamePlaceholder: 'Enter your last name',
        emailPlaceholder: 'your.email@example.com',
        phonePlaceholder: '+1 (555) 123-4567',

        professionalBackground: 'Professional Background',
        ageRange: 'Age Range',
        selectAge: 'Select age range',
        education: 'Education Level',
        selectEducation: 'Select education level',
        experience: 'Experience Level',
        selectExperience: 'Select experience level',

        skillsPreferences: 'Skills & Preferences',
        coreSkills: 'Core Skills',
        selectSkills: 'Select all that apply',
        neurodivergentType: 'Neurodivergent Type',
        optional: 'Optional',
        preferNotSpecify: 'Prefer not to specify',
        workPreference: 'Work Preference',
        selectPreference: 'Select preference',
        accommodations: 'Accommodations Needed',
        accommodationsPlaceholder: 'Describe any workplace accommodations that would help you perform your best...',

        companyInfo: 'Company Information',
        companyName: 'Company Name',
        companyNamePlaceholder: 'Enter company name',
        position: 'Your Position',
        positionPlaceholder: 'e.g., HR Manager, CEO, Recruiter',
        industry: 'Industry',
        selectIndustry: 'Select industry',
        companySize: 'Company Size',
        selectCompanySize: 'Select company size',

        hiringPreferences: 'Hiring Preferences',
        jobTypes: "Job Types You're Hiring For",
        hiringGoals: 'Hiring Goals',
        hiringGoalsPlaceholder: "Describe your hiring goals and what roles you're looking to fill...",
        diversityExperience: 'Diversity & Inclusion Experience',
        selectDiversityExperience: 'Select experience level',

        professionalCredentials: 'Professional Credentials',
        licenseNumber: 'License Number',
        licenseNumberPlaceholder: 'Enter your professional license number',
        yearsExperience: 'Years of Experience',
        selectYearsExperience: 'Select experience level',
        specialization: 'Primary Specialization',
        selectSpecialization: 'Select specialization',

        certificationsTraining: 'Certifications & Training',
        professionalCertifications: 'Professional Certifications',
        therapyTypes: 'Therapy Types Offered',

        practiceInfo: 'Practice Information',
        availability: 'Availability',
        selectAvailability: 'Select availability',
        consultationFee: 'Consultation Fee (USD)',
        consultationFeePlaceholder: 'e.g., 150',
        professionalBio: 'Professional Bio',
        bioPlaceholder: 'Tell us about your experience, approach, and how you help neurodivergent individuals...',

        errors: {
          firstNameRequired: 'First name is required',
          lastNameRequired: 'Last name is required',
          emailRequired: 'Email is required',
          emailInvalid: 'Invalid email format',
          ageRequired: 'Age is required',
          educationRequired: 'Education level is required',
          experienceRequired: 'Experience level is required',
          skillsRequired: 'Select at least one skill',
          companyNameRequired: 'Company name is required',
          industryRequired: 'Industry is required',
          companySizeRequired: 'Company size is required',
          positionRequired: 'Your position is required',
          licenseRequired: 'License number is required',
          specializationRequired: 'Specialization is required',
          yearsExperienceRequired: 'Years of experience is required',
          certificationsRequired: 'Select at least one certification'
        }
      }
    }
  },
  es: {
    ...baseTranslations.es,
    faq: {
      title: 'Preguntas Frecuentes',
      questions: {
        q1: {
          question: '¿Qué es la neurodiversidad?',
          answer: 'La neurodiversidad se refiere a la variación natural en los cerebros y mentes humanas. Incluye condiciones como autismo, TDAH, dislexia y más, enfatizando tanto las fortalezas como los desafíos.'
        },
        q2: {
          question: '¿Cómo funciona el emparejamiento de talento?',
          answer: 'Nuestro algoritmo impulsado por IA empareja candidatos con roles basándose en sus fortalezas únicas, preferencias y resultados de evaluación, asegurando el mejor ajuste para individuos y empresas.'
        },
        q3: {
          question: '¿Mis datos están seguros y son privados?',
          answer: 'Sí. Usamos almacenamiento encriptado y seguro y nunca compartimos tus datos personales sin tu consentimiento. Tú controlas tu información en todo momento.'
        },
        q4: {
          question: '¿Pueden unirse empresas y terapeutas?',
          answer: '¡Absolutamente! Apoyamos a individuos, empresas y terapeutas con recursos, herramientas y soporte personalizados.'
        },
        q5: {
          question: '¿Cómo empiezo?',
          answer: 'Simplemente regístrate, completa tu perfil y realiza una evaluación. Nuestra plataforma te guiará en los próximos pasos.'
        }
      }
    },
    newsletter: {
      title: 'Mantente Informado',
      description: 'Suscríbete a nuestro boletín para actualizaciones, recursos e información sobre neurodiversidad.',
      placeholder: 'Tu dirección de correo',
      subscribe: 'Suscribirse',
      thankYou: '¡Gracias por suscribirte!',
      error: 'Por favor ingresa una dirección de correo válida.',
      privacy: 'Respetamos tu privacidad. Cancela la suscripción en cualquier momento.'
    },
    footer: {
      copyright: 'Eternals NeuroTalent Platform. Todos los derechos reservados.',
      home: 'Inicio',
      features: 'Características',
      forms: 'Formularios',
      games: 'Juegos',
      quiz: 'Evaluación'
    },
    getStarted: {
      mainTitle: 'Comienza con',
      brandText: 'DiversIA',
      subtitle: 'Elige tu camino para desbloquear superpoderes neurodivergentes',
      back: 'Atrás',
      candidate: {
        title: 'Soy un Candidato',
        description: 'Descubre tus fortalezas únicas y encuentra roles que coincidan con tus superpoderes',
        feature1: 'Evaluación de Superpoderes',
        feature2: 'Emparejamiento de Trabajo Personalizado',
        feature3: 'Desarrollo Profesional',
        button: 'Comienza Tu Viaje',
        formTitle: 'Registro de Candidato',
        formSubtitle: 'Descubramos tus superpoderes',
        submit: 'Crear Mi Perfil',
        submitting: 'Creando Tu Perfil...'
      },
      company: {
        title: 'Soy una Empresa',
        description: 'Encuentra talento neurodivergente excepcional y aprende a construir equipos inclusivos',
        feature1: 'Accede a Talento de Primera',
        feature2: 'Recursos de Capacitación',
        feature3: 'Análisis de Diversidad',
        button: 'Encontrar Talento',
        formTitle: 'Registro de Empresa',
        formSubtitle: 'Conéctate con talento neurodivergente excepcional',
        submit: 'Comenzar a Buscar Talento',
        submitting: 'Creando Tu Cuenta...'
      },
      therapist: {
        title: 'Soy un Terapeuta',
        description: 'Apoya a individuos neurodivergentes y ayúdalos a prosperar en su trayectoria profesional',
        feature1: 'Gestión de Clientes',
        feature2: 'Herramientas de Evaluación',
        feature3: 'Recursos Profesionales',
        button: 'Comenzar a Ayudar',
        formTitle: 'Registro de Terapeuta',
        formSubtitle: 'Únete a nuestra red de profesionales de apoyo neurodivergente',
        submit: 'Unirme a la Red',
        submitting: 'Creando Tu Perfil...'
      },
      form: {
        personalInfo: 'Información Personal',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        phone: 'Teléfono',
        required: '*',
        firstNamePlaceholder: 'Ingresa tu nombre',
        lastNamePlaceholder: 'Ingresa tu apellido',
        emailPlaceholder: 'tu.correo@ejemplo.com',
        phonePlaceholder: '+1 (555) 123-4567',

        professionalBackground: 'Experiencia Profesional',
        ageRange: 'Rango de Edad',
        selectAge: 'Selecciona rango de edad',
        education: 'Nivel Educativo',
        selectEducation: 'Selecciona nivel educativo',
        experience: 'Nivel de Experiencia',
        selectExperience: 'Selecciona nivel de experiencia',

        skillsPreferences: 'Habilidades y Preferencias',
        coreSkills: 'Habilidades Principales',
        selectSkills: 'Selecciona todas las que apliquen',
        neurodivergentType: 'Tipo de Neurodivergencia',
        optional: 'Opcional',
        preferNotSpecify: 'Prefiero no especificar',
        workPreference: 'Preferencia de Trabajo',
        selectPreference: 'Selecciona preferencia',
        accommodations: 'Adaptaciones Necesarias',
        accommodationsPlaceholder: 'Describe cualquier adaptación en el lugar de trabajo que te ayudaría a rendir mejor...',

        companyInfo: 'Información de la Empresa',
        companyName: 'Nombre de la Empresa',
        companyNamePlaceholder: 'Ingresa nombre de la empresa',
        position: 'Tu Posición',
        positionPlaceholder: 'ej., Gerente de RRHH, CEO, Reclutador',
        industry: 'Industria',
        selectIndustry: 'Selecciona industria',
        companySize: 'Tamaño de la Empresa',
        selectCompanySize: 'Selecciona tamaño de empresa',

        hiringPreferences: 'Preferencias de Contratación',
        jobTypes: 'Tipos de Trabajo que Estás Contratando',
        hiringGoals: 'Objetivos de Contratación',
        hiringGoalsPlaceholder: 'Describe tus objetivos de contratación y qué roles buscas cubrir...',
        diversityExperience: 'Experiencia en Diversidad e Inclusión',
        selectDiversityExperience: 'Selecciona nivel de experiencia',

        professionalCredentials: 'Credenciales Profesionales',
        licenseNumber: 'Número de Licencia',
        licenseNumberPlaceholder: 'Ingresa tu número de licencia profesional',
        yearsExperience: 'Años de Experiencia',
        selectYearsExperience: 'Selecciona nivel de experiencia',
        specialization: 'Especialización Principal',
        selectSpecialization: 'Selecciona especialización',

        certificationsTraining: 'Certificaciones y Capacitación',
        professionalCertifications: 'Certificaciones Profesionales',
        therapyTypes: 'Tipos de Terapia Ofrecidos',

        practiceInfo: 'Información de la Práctica',
        availability: 'Disponibilidad',
        selectAvailability: 'Selecciona disponibilidad',
        consultationFee: 'Tarifa de Consulta (USD)',
        consultationFeePlaceholder: 'ej., 150',
        professionalBio: 'Biografía Profesional',
        bioPlaceholder: 'Cuéntanos sobre tu experiencia, enfoque y cómo ayudas a individuos neurodivergentes...',

        errors: {
          firstNameRequired: 'El nombre es requerido',
          lastNameRequired: 'El apellido es requerido',
          emailRequired: 'El correo electrónico es requerido',
          emailInvalid: 'Formato de correo inválido',
          ageRequired: 'La edad es requerida',
          educationRequired: 'El nivel educativo es requerido',
          experienceRequired: 'El nivel de experiencia es requerido',
          skillsRequired: 'Selecciona al menos una habilidad',
          companyNameRequired: 'El nombre de la empresa es requerido',
          industryRequired: 'La industria es requerida',
          companySizeRequired: 'El tamaño de la empresa es requerido',
          positionRequired: 'Tu posición es requerida',
          licenseRequired: 'El número de licencia es requerido',
          specializationRequired: 'La especialización es requerida',
          yearsExperienceRequired: 'Los años de experiencia son requeridos',
          certificationsRequired: 'Selecciona al menos una certificación'
        }
      }
    }
  }
};
