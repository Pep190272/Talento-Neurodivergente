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
    },
    features: {
      title: 'Welcome to the',
      titleHighlight: 'Feature',
      titleEnd: 'Page',
      subtitle: 'Discover the comprehensive suite of tools and services designed to unlock neurodivergent potential and build inclusive, high-performing organizations.',
      categories: {
        all: 'All Features',
        assessment: 'Assessment',
        matching: 'Matching',
        development: 'Development',
        training: 'Training',
        analytics: 'Analytics',
        support: 'Support'
      },
      items: {
        cognitive: { title: 'Cognitive Diversity Assessment', description: 'Advanced AI-powered assessment tools to identify and leverage unique cognitive strengths and neurodivergent superpowers.' },
        matching: { title: 'Smart Talent Matching', description: 'AI-driven matching algorithm that connects neurodivergent candidates with roles that align with their strengths and preferences.' },
        development: { title: 'Skills Development', description: 'Personalized learning paths and skill development programs tailored to individual neurodivergent profiles.' },
        training: { title: 'Inclusive Team Building', description: 'Comprehensive training and resources for companies to build diverse, inclusive, and high-performing teams.' },
        analytics: { title: 'Performance Analytics', description: 'Data-driven insights into team performance, productivity gains, and diversity impact metrics.' },
        support: { title: 'Workplace Accommodations', description: 'Expert guidance on implementing effective workplace accommodations and support systems.' },
        aiSupport: { title: 'AI-Powered Support', description: '24/7 AI assistant providing personalized guidance for both candidates and employers.' },
        partnerships: { title: 'Employer Partnerships', description: 'Strategic partnerships with forward-thinking companies committed to neurodiversity inclusion.' },
        career: { title: 'Career Acceleration', description: 'Fast-track career development programs designed for neurodivergent professionals.' },
        innovation: { title: 'Innovation Labs', description: 'Collaborative spaces where neurodivergent talent can showcase their unique problem-solving approaches.' },
        recognition: { title: 'Recognition Programs', description: 'Awards and recognition for companies and individuals leading in neurodiversity inclusion.' },
        consulting: { title: 'Custom Solutions', description: 'Tailored solutions and consulting services for organizations of all sizes.' }
      },
      stats: {
        productivity: { number: '85%', label: 'Productivity Increase', description: 'Average productivity boost in inclusive teams' },
        placements: { number: '750+', label: 'Successful Placements', description: 'Neurodivergent professionals placed' },
        partners: { number: '120+', label: 'Partner Companies', description: 'Organizations trust our solutions' },
        satisfaction: { number: '95%', label: 'Satisfaction Rate', description: 'Candidate and employer satisfaction' }
      },
      cta: {
        title: 'Ready to Transform Your Organization?',
        subtitle: 'Join hundreds of companies already leveraging neurodivergent talent to drive innovation and growth.',
        getStarted: 'Get Started Today',
        watchDemo: 'Watch Demo'
      },
      learnMore: 'Learn More'
    },
    about: {
      badge: 'About Eternals',
      title: 'Neurodiversity & Innovation',
      subtitle: 'A platform dedicated to celebrating cognitive diversity, fostering inclusive innovation, and empowering unique perspectives.',
      team: {
        title: 'Meet the Team',
        members: {
          developer: { role: 'Neurodiversity Conference Speaker', name: 'Elisa Farias', description: 'Diversia Ambassador in Mexico' },
          idea: { role: 'Idea Credit', name: 'Olga Cruz', description: 'Visionary behind the concept of neurodiversity and inclusive innovation' },
          assist: { role: 'Tech Assist', name: 'José Miguel Moreno Carrillo', description: 'Technical consultant providing expertise in accessibility and user experience' }
        }
      },
      keyFeatures: {
        title: 'Key Features',
        neuro: { title: 'Neurodiversity Focus', description: 'Celebrating cognitive diversity and unique perspectives' },
        tech: { title: 'Modern Tech Stack', description: 'Built with cutting-edge web technologies and AI integration' },
        accessibility: { title: 'Accessibility First', description: 'Designed with inclusive principles and universal access' },
        innovation: { title: 'Innovation Hub', description: 'Platform for showcasing creative solutions and ideas' }
      },
      contact: {
        title: 'Get in Touch',
        description: 'This platform was designed with passion for accessibility, inclusion, and modern web technologies. We\'d love to hear from you!',
        email: 'Contact: eternals@acelerai.com'
      }
    },
    dashboard: {
      welcome: 'Welcome back',
      subtitle: {
        individual: 'Neurodivergent Individual',
        company: 'Company Placement Manager',
        therapist: 'Therapist / Specialist'
      },
      logout: 'Logout',
      noProfile: {
        title: 'Welcome to the Dashboard',
        description: 'Please complete your profile to access personalized features.',
        button: 'Complete Profile'
      },
      quickActions: {
        title: 'Quick Actions',
        update: 'Update Profile',
        games: 'Play Games',
        assessment: 'Take Assessment'
      },
      aiInsights: {
        title: 'AI Insights'
      },
      recentActivity: {
        title: 'Recent Activity'
      },
      profileSummary: {
        title: 'Profile Summary'
      }
    },
    forms: {
      title: 'Registration & Profile Forms',
      subtitle: 'Join our platform and connect with opportunities tailored to your unique needs and skills',
      features: {
        secure: 'Secure & Private',
        quick: 'Quick Setup',
        premium: 'Premium Support',
        available: '24/7 Available'
      },
      tabs: {
        individual: {
          label: 'Neurodivergent Individual',
          description: 'Create your personal profile and connect with opportunities'
        },
        company: {
          label: 'Company Placement Manager',
          description: 'Manage talent placement and recruitment processes'
        },
        therapist: {
          label: 'Therapist / Specialist',
          description: 'Provide professional support and guidance'
        }
      },
      formTitle: {
        individual: 'Individual Registration',
        company: 'Company Registration',
        therapist: 'Therapist Registration'
      },
      formDescription: 'Please fill out all required fields to get started',
      fields: {
        fullName: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        skills: 'Skills & Interests',
        experience: 'Work Experience',
        companyName: 'Company Name',
        contactPerson: 'Contact Person',
        businessEmail: 'Business Email',
        industry: 'Industry',
        positions: 'Available Positions',
        license: 'License Number',
        professionalEmail: 'Professional Email',
        specialization: 'Specialization',
        yearsExperience: 'Years of Experience'
      },
      submit: 'Submit Registration',
      processing: 'Processing...',
      success: 'Submitted Successfully!',
      settingUp: 'Setting up:',
      needHelp: 'Need help? Contact our support team at',
      supportEmail: 'support@example.com'
    },
    gamesContent: {
      memoryGrid: {
        title: 'Memory Grid',
        moves: 'Moves',
        matched: 'Matched',
        flipCard: 'Flip card',
        matchedCard: 'Matched card',
        aiTips: 'Try to remember card positions and use patterns!'
      },
      colorMatch: {
        title: 'Color Match',
        matchColor: 'Match this color:',
        correct: 'Correct',
        incorrect: 'Incorrect',
        purple: 'Purple',
        gold: 'Gold',
        blue: 'Blue',
        pink: 'Pink',
        aiTips: 'Read the color name carefully and match to the button color!'
      },
      operacion: {
        title: 'Operación 2.0',
        tap: 'Tap the',
        head: 'Head',
        chest: 'Chest',
        leftArm: 'Left Arm',
        rightArm: 'Right Arm',
        leftLeg: 'Left Leg',
        rightLeg: 'Right Leg',
        hits: 'Hits',
        misses: 'Misses',
        aiTips: 'Focus on the highlighted area and react quickly!'
      },
      pathFinder: {
        title: 'Path Finder',
        moves: 'Moves',
        up: 'Up',
        down: 'Down',
        left: 'Left',
        right: 'Right',
        currentPosition: 'Current position',
        finish: 'Finish',
        cell: 'Cell',
        aiTips: 'Plan your path and use the shortest route!'
      },
      numberSequence: {
        title: 'Number Sequence',
        next: 'Next',
        correct: 'Correct',
        incorrect: 'Incorrect',
        number: 'Number',
        aiTips: 'Scan the grid and look for patterns to find numbers faster!'
      },
      simonSays: {
        title: 'Simon Says',
        round: 'Round',
        errors: 'Errors',
        purple: 'purple',
        gold: 'gold',
        blue: 'blue',
        pink: 'pink',
        aiTips: 'Focus on the sequence and repeat it in your mind!'
      },
      reactionTime: {
        title: 'Reaction Time',
        waitForGreen: 'Wait for green...',
        clickNow: 'Click!',
        gameOver: 'Game Over',
        tries: 'Tries',
        avg: 'Avg',
        aiTips: 'Try to stay relaxed and focused for faster reactions!'
      },
      patternMatrix: {
        title: 'Pattern Matrix',
        correct: 'Correct',
        incorrect: 'Incorrect',
        correctCell: 'Correct cell',
        incorrectCell: 'Incorrect cell',
        fillCell: 'Fill cell',
        aiTips: 'Look for symmetry and repetition in the patterns!'
      },
      shapeSorter: {
        title: 'Shape Sorter',
        correct: 'Correct',
        incorrect: 'Incorrect',
        circle: 'circle',
        square: 'square',
        star: 'star',
        heart: 'heart',
        targetFor: 'Target for',
        aiTips: 'Look for shape outlines and colors to match quickly!'
      },
      wordBuilder: {
        title: 'Word Builder',
        buildWord: 'Build this word:',
        pickLetter: 'Pick letter',
        attempts: 'Attempts',
        aiTips: 'Look for common letter patterns and try again if you get stuck!'
      }
    },
    quizContent: {
      dashboard: {
        title: 'Quiz & Assessment Dashboard',
        neurodiversity: {
          name: 'Neurodiversity Basics',
          description: 'Test your knowledge of neurodiversity concepts and terminology.'
        },
        workplace: {
          name: 'Workplace Skills',
          description: 'Assess your understanding of inclusive workplace practices.'
        },
        cognitive: {
          name: 'Cognitive Strengths',
          description: 'Explore your unique cognitive strengths and learning styles.'
        },
        aiQuiz: {
          name: 'AI-Generated Quiz',
          description: 'Let our AI create a custom quiz just for you, based on your interests and profile.',
          button: 'New AI Quiz',
          generating: 'Generating...'
        },
        startQuiz: 'Start Quiz'
      },
      quiz: {
        loading: 'Loading Quiz...',
        question: 'Question',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        showExplanation: 'Show Explanation',
        backToDashboard: 'Back to dashboard',
        closeQuiz: 'Close quiz',
        replayVoice: 'Replay Voice',
        textAnswer: 'Text answer',
        quizLabel: 'Quiz:',
        titles: {
          neurodiversity: 'Neurodiversity',
          workplace: 'Workplace',
          cognitive: 'Cognitive',
          ai: 'AI-Generated'
        },
        results: {
          title: 'Quiz Results',
          score: 'Score:',
          questions: 'Questions:',
          time: 'Time:',
          restart: 'Restart Quiz',
          congratulations: 'Congratulations! You completed the quiz. Great job! Here are your results and some tips for improvement.',
          yourScore: 'Quiz complete. Your score is',
          outOf: 'out of'
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
    },
    features: {
      title: 'Bienvenido a la página de',
      titleHighlight: 'Características',
      titleEnd: '',
      subtitle: 'Descubre el conjunto completo de herramientas y servicios diseñados para desbloquear el potencial neurodivergente y construir organizaciones inclusivas de alto rendimiento.',
      categories: {
        all: 'Todas las Características',
        assessment: 'Evaluación',
        matching: 'Emparejamiento',
        development: 'Desarrollo',
        training: 'Capacitación',
        analytics: 'Análisis',
        support: 'Soporte'
      },
      items: {
        cognitive: { title: 'Evaluación de Diversidad Cognitiva', description: 'Herramientas de evaluación avanzadas impulsadas por IA para identificar y aprovechar fortalezas cognitivas únicas y superpoderes neurodivergentes.' },
        matching: { title: 'Emparejamiento Inteligente de Talento', description: 'Algoritmo de emparejamiento impulsado por IA que conecta candidatos neurodivergentes con roles que se alinean con sus fortalezas y preferencias.' },
        development: { title: 'Desarrollo de Habilidades', description: 'Rutas de aprendizaje personalizadas y programas de desarrollo de habilidades adaptados a perfiles neurodivergentes individuales.' },
        training: { title: 'Construcción de Equipos Inclusivos', description: 'Capacitación integral y recursos para que las empresas construyan equipos diversos, inclusivos y de alto rendimiento.' },
        analytics: { title: 'Análisis de Rendimiento', description: 'Perspectivas basadas en datos sobre el rendimiento del equipo, ganancias de productividad y métricas de impacto en diversidad.' },
        support: { title: 'Adaptaciones en el Lugar de Trabajo', description: 'Orientación experta sobre la implementación de adaptaciones y sistemas de soporte efectivos en el lugar de trabajo.' },
        aiSupport: { title: 'Soporte Impulsado por IA', description: 'Asistente de IA 24/7 que brinda orientación personalizada tanto para candidatos como para empleadores.' },
        partnerships: { title: 'Asociaciones con Empleadores', description: 'Asociaciones estratégicas con empresas visionarias comprometidas con la inclusión de la neurodiversidad.' },
        career: { title: 'Aceleración Profesional', description: 'Programas de desarrollo profesional acelerado diseñados para profesionales neurodivergentes.' },
        innovation: { title: 'Laboratorios de Innovación', description: 'Espacios colaborativos donde el talento neurodivergente puede mostrar sus enfoques únicos para resolver problemas.' },
        recognition: { title: 'Programas de Reconocimiento', description: 'Premios y reconocimiento para empresas e individuos líderes en inclusión de neurodiversidad.' },
        consulting: { title: 'Soluciones Personalizadas', description: 'Soluciones a medida y servicios de consultoría para organizaciones de todos los tamaños.' }
      },
      stats: {
        productivity: { number: '85%', label: 'Aumento de Productividad', description: 'Impulso promedio de productividad en equipos inclusivos' },
        placements: { number: '750+', label: 'Colocaciones Exitosas', description: 'Profesionales neurodivergentes colocados' },
        partners: { number: '120+', label: 'Empresas Asociadas', description: 'Organizaciones confían en nuestras soluciones' },
        satisfaction: { number: '95%', label: 'Tasa de Satisfacción', description: 'Satisfacción de candidatos y empleadores' }
      },
      cta: {
        title: '¿Listo para Transformar tu Organización?',
        subtitle: 'Únete a cientos de empresas que ya están aprovechando el talento neurodivergente para impulsar la innovación y el crecimiento.',
        getStarted: 'Comienza Hoy',
        watchDemo: 'Ver Demostración'
      },
      learnMore: 'Saber Más'
    },
    about: {
      badge: 'Acerca de Eternals',
      title: 'Neurodiversidad e Innovación',
      subtitle: 'Una plataforma dedicada a celebrar la diversidad cognitiva, fomentar la innovación inclusiva y empoderar perspectivas únicas.',
      team: {
        title: 'Conoce al Equipo',
        members: {
          developer: { role: 'Conferenciante experta en neurodiversidad', name: 'Elisa Farias', description: 'Embajadora de Diversia en México' },
          idea: { role: 'Crédito de Idea', name: 'Olga Cruz', description: 'Visionaria detrás del concepto de neurodiversidad e innovación inclusiva' },
          assist: { role: 'Asistencia Técnica', name: 'José Miguel Moreno Carrillo', description: 'Consultor técnico que brinda experiencia en accesibilidad y experiencia de usuario' }
        }
      },
      keyFeatures: {
        title: 'Características Clave',
        neuro: { title: 'Enfoque en Neurodiversidad', description: 'Celebrando la diversidad cognitiva y perspectivas únicas' },
        tech: { title: 'Stack Tecnológico Moderno', description: 'Construido con tecnologías web de vanguardia e integración de IA' },
        accessibility: { title: 'Accesibilidad Primero', description: 'Diseñado con principios inclusivos y acceso universal' },
        innovation: { title: 'Centro de Innovación', description: 'Plataforma para mostrar soluciones creativas e ideas' }
      },
      contact: {
        title: 'Ponte en Contacto',
        description: 'Esta plataforma fue diseñada con pasión por la accesibilidad, inclusión y tecnologías web modernas. ¡Nos encantaría saber de ti!',
        email: 'Contacto: eternals@acelerai.com'
      }
    },
    dashboard: {
      welcome: 'Bienvenido de nuevo',
      subtitle: {
        individual: 'Individual Neurodivergente',
        company: 'Gerente de Colocación de Empresa',
        therapist: 'Terapeuta / Especialista'
      },
      logout: 'Cerrar Sesión',
      noProfile: {
        title: 'Bienvenido al Panel',
        description: 'Por favor completa tu perfil para acceder a funciones personalizadas.',
        button: 'Completar Perfil'
      },
      quickActions: {
        title: 'Acciones Rápidas',
        update: 'Actualizar Perfil',
        games: 'Jugar Juegos',
        assessment: 'Realizar Evaluación'
      },
      aiInsights: {
        title: 'Perspectivas de IA'
      },
      recentActivity: {
        title: 'Actividad Reciente'
      },
      profileSummary: {
        title: 'Resumen del Perfil'
      }
    },
    forms: {
      title: 'Formularios de Registro y Perfil',
      subtitle: 'Únete a nuestra plataforma y conéctate con oportunidades adaptadas a tus necesidades y habilidades únicas',
      features: {
        secure: 'Seguro y Privado',
        quick: 'Configuración Rápida',
        premium: 'Soporte Premium',
        available: 'Disponible 24/7'
      },
      tabs: {
        individual: {
          label: 'Individual Neurodivergente',
          description: 'Crea tu perfil personal y conéctate con oportunidades'
        },
        company: {
          label: 'Gerente de Colocación de Empresa',
          description: 'Gestiona la colocación de talento y procesos de reclutamiento'
        },
        therapist: {
          label: 'Terapeuta / Especialista',
          description: 'Brinda soporte y orientación profesional'
        }
      },
      formTitle: {
        individual: 'Registro Individual',
        company: 'Registro de Empresa',
        therapist: 'Registro de Terapeuta'
      },
      formDescription: 'Por favor completa todos los campos requeridos para comenzar',
      fields: {
        fullName: 'Nombre Completo',
        email: 'Dirección de Correo Electrónico',
        phone: 'Número de Teléfono',
        skills: 'Habilidades e Intereses',
        experience: 'Experiencia Laboral',
        companyName: 'Nombre de la Empresa',
        contactPerson: 'Persona de Contacto',
        businessEmail: 'Correo Empresarial',
        industry: 'Industria',
        positions: 'Posiciones Disponibles',
        license: 'Número de Licencia',
        professionalEmail: 'Correo Profesional',
        specialization: 'Especialización',
        yearsExperience: 'Años de Experiencia'
      },
      submit: 'Enviar Registro',
      processing: 'Procesando...',
      success: '¡Enviado Exitosamente!',
      settingUp: 'Configurando:',
      needHelp: '¿Necesitas ayuda? Contacta a nuestro equipo de soporte en',
      supportEmail: 'support@example.com'
    },
    gamesContent: {
      memoryGrid: {
        title: 'Cuadrícula de Memoria',
        moves: 'Movimientos',
        matched: 'Emparejados',
        flipCard: 'Voltear carta',
        matchedCard: 'Carta emparejada',
        aiTips: '¡Intenta recordar las posiciones de las cartas y usa patrones!'
      },
      colorMatch: {
        title: 'Emparejamiento de Colores',
        matchColor: 'Empareja este color:',
        correct: 'Correcto',
        incorrect: 'Incorrecto',
        purple: 'Morado',
        gold: 'Dorado',
        blue: 'Azul',
        pink: 'Rosa',
        aiTips: '¡Lee el nombre del color cuidadosamente y emparéjalo con el color del botón!'
      },
      operacion: {
        title: 'Operación 2.0',
        tap: 'Toca el',
        head: 'Cabeza',
        chest: 'Pecho',
        leftArm: 'Brazo Izquierdo',
        rightArm: 'Brazo Derecho',
        leftLeg: 'Pierna Izquierda',
        rightLeg: 'Pierna Derecha',
        hits: 'Aciertos',
        misses: 'Fallos',
        aiTips: '¡Concéntrate en el área resaltada y reacciona rápidamente!'
      },
      pathFinder: {
        title: 'Buscador de Caminos',
        moves: 'Movimientos',
        up: 'Arriba',
        down: 'Abajo',
        left: 'Izquierda',
        right: 'Derecha',
        currentPosition: 'Posición actual',
        finish: 'Meta',
        cell: 'Celda',
        aiTips: '¡Planifica tu ruta y usa el camino más corto!'
      },
      numberSequence: {
        title: 'Secuencia Numérica',
        next: 'Siguiente',
        correct: 'Correcto',
        incorrect: 'Incorrecto',
        number: 'Número',
        aiTips: '¡Escanea la cuadrícula y busca patrones para encontrar números más rápido!'
      },
      simonSays: {
        title: 'Simón Dice',
        round: 'Ronda',
        errors: 'Errores',
        purple: 'morado',
        gold: 'dorado',
        blue: 'azul',
        pink: 'rosa',
        aiTips: '¡Concéntrate en la secuencia y repítela en tu mente!'
      },
      reactionTime: {
        title: 'Tiempo de Reacción',
        waitForGreen: 'Espera el verde...',
        clickNow: '¡Haz clic!',
        gameOver: 'Fin del Juego',
        tries: 'Intentos',
        avg: 'Promedio',
        aiTips: '¡Intenta relajarte y concentrarte para reacciones más rápidas!'
      },
      patternMatrix: {
        title: 'Matriz de Patrones',
        correct: 'Correcto',
        incorrect: 'Incorrecto',
        correctCell: 'Celda correcta',
        incorrectCell: 'Celda incorrecta',
        fillCell: 'Llenar celda',
        aiTips: '¡Busca simetría y repetición en los patrones!'
      },
      shapeSorter: {
        title: 'Clasificador de Formas',
        correct: 'Correcto',
        incorrect: 'Incorrecto',
        circle: 'círculo',
        square: 'cuadrado',
        star: 'estrella',
        heart: 'corazón',
        targetFor: 'Objetivo para',
        aiTips: '¡Busca los contornos y colores de las formas para emparejar rápidamente!'
      },
      wordBuilder: {
        title: 'Constructor de Palabras',
        buildWord: 'Construye esta palabra:',
        pickLetter: 'Elegir letra',
        attempts: 'Intentos',
        aiTips: '¡Busca patrones de letras comunes e intenta de nuevo si te atascas!'
      }
    },
    quizContent: {
      dashboard: {
        title: 'Panel de Evaluaciones y Cuestionarios',
        neurodiversity: {
          name: 'Fundamentos de Neurodiversidad',
          description: 'Evalúa tu conocimiento sobre conceptos y terminología de neurodiversidad.'
        },
        workplace: {
          name: 'Habilidades Laborales',
          description: 'Evalúa tu comprensión de prácticas inclusivas en el lugar de trabajo.'
        },
        cognitive: {
          name: 'Fortalezas Cognitivas',
          description: 'Explora tus fortalezas cognitivas únicas y estilos de aprendizaje.'
        },
        aiQuiz: {
          name: 'Cuestionario Generado por IA',
          description: 'Deja que nuestra IA cree un cuestionario personalizado para ti, basado en tus intereses y perfil.',
          button: 'Nuevo Cuestionario IA',
          generating: 'Generando...'
        },
        startQuiz: 'Iniciar Cuestionario'
      },
      quiz: {
        loading: 'Cargando Cuestionario...',
        question: 'Pregunta',
        back: 'Atrás',
        next: 'Siguiente',
        submit: 'Enviar',
        showExplanation: 'Mostrar Explicación',
        backToDashboard: 'Volver al panel',
        closeQuiz: 'Cerrar cuestionario',
        replayVoice: 'Reproducir Voz',
        textAnswer: 'Respuesta de texto',
        quizLabel: 'Cuestionario:',
        titles: {
          neurodiversity: 'Neurodiversidad',
          workplace: 'Laboral',
          cognitive: 'Cognitivo',
          ai: 'Generado por IA'
        },
        results: {
          title: 'Resultados del Cuestionario',
          score: 'Puntuación:',
          questions: 'Preguntas:',
          time: 'Tiempo:',
          restart: 'Reiniciar Cuestionario',
          congratulations: '¡Felicidades! Has completado el cuestionario. ¡Excelente trabajo! Aquí están tus resultados y algunos consejos para mejorar.',
          yourScore: 'Cuestionario completado. Tu puntuación es',
          outOf: 'de'
        }
      }
    }
  }
};
