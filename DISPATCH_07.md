# 🏁 ORDEN DE DESPACHO #7: ECOSISTEMA 360 (TERAPEUTAS)

**DESTINATARIO:** Equipo de Ingeniería (Backend & Frontend)
**TAREA:** Expandir el modelo de datos y la UI para integrar a los Terapeutas como actores activos.

**CONTEXTO:**
- Actualmente `Connection` solo une `Individual` <-> `Company`.
- El CEO requiere un sistema "360":
    - **Empresas** contratan Terapeutas (Formación/Consultoría).
    - **Candidatos** contactan Terapeutas (Apoyo/Coaching).
- Ya existe el "Mock Therapist" en la DB, pero está aislado.

**RESTRICCIONES:**
- 🛡️ **Privacidad**: La conexión con un terapeuta es CONFIDENCIAL. Una empresa NO debe saber qué terapeutas ve un candidato.
- 🏗️ **Schema**: Evitar tablas duplicadas. Usar modelo flexible de conexiones.

**PLAN DE EJECUCIÓN (GACE PROTOCOL):**

### 1. 🏗️ Arquitectura de Datos (@Backend_Architect)
Modificar `prisma/schema.prisma`:
- Actualizar `Connection` para soportar `therapistId`.
- Reglas de Conexión:
    - (Individual + Company) = Empleo
    - (Individual + Therapist) = Terapia
    - (Company + Therapist) = Formación

### 2. 🧪 Datos de Prueba (@QA_Specialist)
Actualizar `prisma/seed.ts`:
- Crear conexión de prueba: `Mock Company` <-> `Dr. Neuro Inclusive` (Contrato de Formación).
- Crear conexión de prueba: `Mock Candidate` <-> `Dr. Neuro Inclusive` (Sesión Privada).

### 3. 🎨 Interfaz de Usuario (@Frontend_Designer)
Nuevo Módulo en Dashboard: `/dashboard/partners` (o `/network`):
- **Candidato**: Ve "Mis Terapeutas" y "Buscar Soporte".
- **Empresa**: Ve "Mis Formadores" y "Directorio de Expertos".

---
**COMANDOS PREPARADOS PARA EL CHAT:**

**1. @Backend_Architect**
```text
/atlas dispatch --role Backend_Architect
--task "Evolucionar Schema para 360"
--context "Hacer Connection flexible: permitir Therapist <-> Company y Therapist <-> Individual"
--constraint "Mantener integridad referencial (no orphan records)"
```

**2. @QA_Specialist**
```text
/atlas dispatch --role QA_Specialist
--task "Sembrar Conexiones 360"
--context "Crear relaciones de prueba entre los actores Mock existentes"
--constraint "Validar que una Empresa NO pueda ver los terapeutas de un Candidato"
```

**3. @Frontend_Designer**
```text
/atlas dispatch --role Frontend_Designer
--task "Grid de Especialistas"
--context "Crear tarjetas de perfil para Terapeutas visibles en el Dashboard"
--constraint "Reutilizar componentes de UI existentes (Cards)"
```
