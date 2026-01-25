# 🏁 ORDEN DE DESPACHO #5: SaaS Ready - Pagos e Incentivos
**DESTINATARIO**: BACKEND_AGENT (03) / FRONTEND_AGENT (04)
**TAREA**: Integración Stripe y Sistema de Bonos "Early Adopter"
**PRIORIDAD**: 🟡 ALTA

## 📋 CONTEXTO
Necesitamos profesionalizar la app para inversores permitiendo cobros por subscripción y premiando a los primeros 100 usuarios.

## 🎯 TAREAS REQUERIDAS
1. **Stripe setup**: Configurar Stripe SDK y definir los productos/precios en el dashboard de Stripe.
2. **Checkout Flow**: Implementar el flujo de pago para `Company` y `Therapist`.
3. **Sistema de Bonos**: 
    - Lógica para detectar si el usuario está entre los primeros 100.
    - Aplicar descuento/plan gratuito mediante cupones de Stripe de forma automática.
4. **Webhooks**: Implementar el handler de webhooks para actualizar el `subscriptionStatus` en la base de datos.

## 🔒 RESTRICCIONES
- **Seguridad**: Validación de firmas de Stripe obligatoria.
- **UX**: El proceso de pago debe ser fluido y con feedback visual claro.
- **TDD**: Tests de integración para el webhook simulando eventos de Stripe.

## 🏁 CRITERIOS DE ÉXITO
- Botón de "Upgrade" funcional en el dashboard de empresa.
- Suscripción activada automáticamente tras pago exitoso.
- Aplicación de bono visible en el resumen de factura.
