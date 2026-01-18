# Tests Pendientes

Estos tests están escritos pero las funciones que testean **aún no existen**.

Siguiendo TDD, estos tests definen el comportamiento esperado. Cuando se implementen las funciones, estos tests deben moverse de vuelta a `/tests/unit/`.

## Estructura

```
pending/
├── unit/
│   ├── actors/
│   │   └── therapist.test.js    # createTherapist, getTherapistClients, etc.
│   ├── matching/
│   │   ├── algorithm.test.js    # getMatchCandidates, calculateMatchScore, etc.
│   │   └── consent.test.js      # grantConsent, revokeConsent, etc.
│   ├── dashboards/
│   │   └── dashboards.test.js   # getIndividualDashboardData, etc.
│   └── privacy/
│       └── audit.test.js        # logAccessEvent, detectAnomalies, etc.
```

## Cómo usar

1. **Implementar función** en `/app/lib/`
2. **Mover test** de `/tests/pending/` a `/tests/unit/`
3. **Correr test** y verificar que pasa
4. **Commit** con el test y la implementación

## Prioridad de implementación

Ver `TODO.md` para el orden recomendado.

## Fecha de movimiento

2026-01-18 - Limpieza inicial del repositorio
