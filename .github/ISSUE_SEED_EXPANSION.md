# Issue: Expandir datos seed — oficios manuales, neurodivergencias adicionales y roles de entrada

**Labels:** `enhancement`, `seed-data`, `demo`

## Contexto

Los datos seed actuales (10 empresas, 16 candidatos, 6 terapeutas) no cubren adecuadamente:
- **Oficios manuales** donde muchas personas neurodivergentes disfrutan y destacan (construcción, mecánica, jardinería, artesanía, cocina de línea)
- **Roles de entrada** como peón, ayudante, aprendiz que son la puerta de acceso al mercado laboral
- **Diagnósticos duales/múltiples** (TDAH+Dislexia, TAG+TDAH) que son muy comunes en la realidad
- **Neurodivergencias frecuentes** como TAG, Bipolar tipo II, TEA nivel 2
- **Terapeutas especializados** en oficios manuales (terapia ocupacional) y trauma (EMDR)

## Tareas

### Nuevas empresas de oficios manuales
- [x] Construcción: peón, albañil, pintor/a, carpintero/a, lampista, solador/a (6 ofertas)
- [x] Taller mecánico: mecánico/a, electricista auto, aprendiz, chapista (4 ofertas)
- [x] Viveros/Agricultura: jardinero/a, peón agrícola, florista (3 ofertas)
- [x] Artesanía: ceramista, ebanista, restaurador/a (3 ofertas)

### Ampliación empresas existentes
- [x] Cocina Inclusiva: +ayudante cocina, +cocinero/a línea, +friegaplatos (office)

### Nuevos candidatos neurodivergentes (oficios manuales)
- [x] Fernando Rueda (TDAH + Dislexia) — albañil/solador
- [x] Adrián Campos (TEA) — viverista/jardinero botánico
- [x] Rosa Molina (Tourette) — cocinera de línea
- [x] Óscar Prieto (TEA nivel 2) — mecánico de taller
- [x] Marina Gil (TDAH) — pintora de obra
- [x] Héctor Blanco (Dislexia) — ebanista/carpintero artesanal
- [x] Carmen Sáez (TAG + TDAH) — ceramista/alfarera
- [x] Tomás Guerrero (Bipolar tipo II) — peón agrícola/jardinero

### Nuevos terapeutas
- [x] Lda. Lucía Ramos — Terapeuta Ocupacional (adaptación oficios manuales)
- [x] Dr. Rafael Torres — EMDR/Trauma (burnout, bipolaridad, ansiedad)

### Matchings y conexiones
- [x] 25+ nuevos matchings para candidatos manuales (scores 55-97)
- [x] 15 conexiones terapia para nuevos candidatos
- [x] 7 conexiones consulting para nuevas empresas

### Documentación
- [x] Actualizar CHANGELOG.md (v2.7.0)
- [x] Añadir sección 14 "Datos Seed para Demo" a DOCUMENTACION_PROYECTO.md

## Principio clave

> **Todos los datos seed usan `@seed.diversia.com` y JAMÁS se mezclan con datos reales de producción.**
> La plataforma ya está en producción recogiendo datos reales. Los seed son exclusivamente para demo.

## Resultado

| Métrica | Antes | Después |
|---------|-------|---------|
| Empresas | 10 | 14 |
| Ofertas de empleo | 22 | 33 |
| Candidatos | 16 | 24 |
| Terapeutas | 6 | 8 |
| Matchings | ~30 | 55+ |
| Conexiones | ~27 | 49+ |
| Neurodivergencias | 11 | 15 |
