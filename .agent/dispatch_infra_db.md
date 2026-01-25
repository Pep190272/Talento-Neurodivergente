# 🏁 ORDEN DE DESPACHO #3: Infraestructura y DB
**DESTINATARIO**: BACKEND_AGENT (03)
**TAREA**: Configuración de PostgreSQL y Prisma
**PRIORIDAD**: 🔴 CRÍTICA

## 📋 CONTEXTO
Estamos migrando directamente a **PRODUCCIÓN (Dokploy)** en el VPS `77.83.232.203`. La base de datos PostgreSQL debe desplegarse como un servicio en Dokploy.

## 🎯 TAREAS REQUERIDAS
1. **Despliegue Dokploy**: Copiar el contenido de `docker-compose.yml` al stack de Dokploy y desplegar.
2. **Firewall**: Asegurar que el puerto `5432` esté abierto (o accesible vía red interna Docker) para las migraciones iniciales.
3. **Prisma Client**: Ejecutar `npx prisma generate` localmente.
4. **Database URL**: Configurar `DATABASE_URL` en `.env.local` apuntando al VPS.

## 🔒 RESTRICCIONES
- **Seguridad**: La base de datos NO debe ser accesible desde el exterior, solo desde la red interna del contenedor o vía túnel SSH.
- **Calidad**: Usar `cuid()` para IDs según el esquema definido.
- **Testing**: Crear un test de conexión (`tests/lib/prisma.test.js`) antes de proceder con la lógica.

## 🏁 CRITERIOS DE ÉXITO
- `npx prisma validate` devuelve éxito.
- Conexión establecida desde la app Next.js.
- Tablas creadas correctamente tras la primera migración.
