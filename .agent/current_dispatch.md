🏁 ORDEN DE DESPACHO
DESTINATARIO: AGENTE 08 - TESTING_AGENT (Quality Assurance Specialist)
TAREA: Implementar Test de Integración E2E para el Flujo de Registro de Individuos
CONTEXTO:
- Se han validado unitariamente: Security (Auth/Encrypt) y Storage (Layer de datos).
- El sistema de archivos limpia `data/` antes de cada test (`setup.js`).
- Existe `app/api/individuals/route.js` como endpoint principal.
- Existe `app/lib/individuals.js` como lógica de negocio.

OBJETIVOS:
1. Crear `tests/integration/registration-flow.test.js`.
2. Simular un POST a `/api/individuals` con datos válidos.
3. Verificar que la respuesta es 201 Created.
4. Verificar que el archivo se crea en `data/users/individuals/`.
5. Verificar que los datos sensibles (diagnoses) están encriptados en disco (usando `fs` directo).
6. Verificar que `findUserByEmail` devuelve el usuario correctamente (desencriptado).

RESTRICCIONES:
- Seguridad: No dejar datos de prueba en disco (el `setup.js` debe encargarse, pero verificar limpieza).
- Calidad: Usar `supertest` o `node-mocks-http` si es necesario para simular la request Next.js, O llamar directamente a la función `POST` del handler si es más fácil en Vitest.
- Mocking: Mockear `NextResponse.json` si se invoca el handler directamente.

ESTADO: PENDIENTE DE EJECUCIÓN
