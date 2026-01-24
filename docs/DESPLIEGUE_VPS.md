# 🚀 Despliegue VPS - Ollama + Gemma 2B para Diversia

**Fecha**: 24 de enero de 2026  
**Servidor**: VPS Hostinger (París, Francia)  
**IP**: 77.83.232.203  
**Tecnologías**: Dokploy, Docker, Ollama, Gemma 2B

---

## 📊 Especificaciones del VPS

| Característica | Valor |
|----------------|-------|
| **Proveedor** | Hostinger |
| **CPU** | 2 cores |
| **RAM** | 8 GB |
| **Disco** | 100 GB SSD |
| **OS** | Ubuntu 24.04 LTS |
| **Panel** | Dokploy (pre-instalado) |
| **Ubicación** | París, Francia 🇫🇷 |

---

## ✅ Proceso de Despliegue (Paso a Paso)

### **PASO 1: Acceso a Dokploy**

1. **Abrir panel de Hostinger**:
   - URL: `https://hpanel.hostinger.com/vps/1929568/overview`

2. **Navegar a "OS & Panel"** en el menú lateral

3. **Hacer clic en "Manage panel"** (arriba a la derecha)
   - Esto abre Dokploy en nueva pestaña
   - URL típica: `http://77.83.232.203:3000`

4. **Iniciar sesión en Dokploy** con credenciales de Hostinger

---

### **PASO 2: Crear Proyecto en Dokploy**

1. **En Dokploy Dashboard**, ir a **"Projects"** (menú lateral)

2. **Hacer clic en el botón "+"** para crear nuevo proyecto

3. **Rellenar formulario**:
   - **Project Name**: `Diversia`
   - **Description**: `Impulso del talento neurodivergente`
   - **Application ID**: `diversia-acef0q` (auto-generado)

4. **Hacer clic en "Create"**

5. **Acceder al proyecto** haciendo clic sobre el nombre "Diversia"

---

### **PASO 3: Crear Compose para Ollama**

1. **Dentro del proyecto Diversia**, buscar panel de pestañas superior:
   - General
   - Environment
   - Domains
   - **Deployments** ← Aquí encontrarás opciones

2. **En la sección "Deploy Settings"**, hacer clic en **"Compose"** (botón arriba a la derecha)

3. **En "Provider"**, seleccionar **"Raw"** (último botón)
   - Ignorar GitHub, GitLab, Bitbucket

4. **Pegar el siguiente `docker-compose.yml`**:

```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    container_name: diversia-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_ORIGINS=*
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  ollama-data:
    driver: local
```

5. **Hacer clic en "Save"** o "Create"

6. **Hacer clic en "Deploy"**

7. **Esperar 1-2 minutos** mientras descarga la imagen Docker de Ollama

---

### **PASO 4: Acceder al Terminal del Contenedor**

1. **En Dokploy**, dentro del proyecto "Diversia", buscar la lista de servicios

2. **Localizar el servicio** `diversia-ollama` con estado **"running"** (verde)

3. **Hacer clic en el botón de menú** (tres puntitos) del servicio

4. **Seleccionar "Docker Terminal"** o "Open Terminal"

5. **Se abrirá una terminal web** mostrando:
   ```
   root@2e1c5d75c3f4:/#
   ```

---

### **PASO 5: Descargar Modelo Gemma 2B**

1. **En la terminal del contenedor**, ejecutar:

```bash
ollama pull gemma:2b
```

2. **Esperar la descarga** (~1.5 GB, tarda 2-5 minutos):
   ```
   pulling manifest
   pulling 4b2ac8... 100% ▕████████▏ 1.5 GB
   success
   ```

3. **Verificar que se descargó**:

```bash
ollama list
```

**Salida esperada**:
```
NAME           ID          SIZE      MODIFIED
gemma:2b       a1b2c3d4    1.5 GB    2 minutes ago
```

---

### **PASO 6: Probar el Modelo**

1. **En la misma terminal**, ejecutar test:

```bash
ollama run gemma:2b "Analiza esta oferta de trabajo: Software Engineer for young and dynamic team"
```

2. **Esperar respuesta** (10-15 segundos primera vez):
   - El modelo analizará y retornará texto

3. **Si ves texto de análisis** → ✅ **Funcionando correctamente**

4. **Salir del test**:
   - Presionar `Ctrl+D` o escribir `/bye`

5. **Salir del contenedor**:

```bash
exit
```

---

### **PASO 7: Configurar Variables de Entorno en Next.js**

1. **En tu PC**, abrir el archivo `.env.local` del proyecto

2. **Añadir al FINAL del archivo**:

```bash
# ============================================================================
# OLLAMA - LLM LOCAL PARA ANÁLISIS DE INCLUSIVIDAD
# ============================================================================
# URL del servidor Ollama en VPS Hostinger
OLLAMA_HOST=http://77.83.232.203:11434
OLLAMA_MODEL=gemma:2b
```

3. **Guardar el archivo** (`Ctrl+S`)

4. **Reiniciar el servidor Next.js**:
   - Detener: `Ctrl+C` en la terminal donde corre `npm run dev`
   - Iniciar: `npm run dev`

---

## 🔍 Verificación del Despliegue

### **Test desde tu app local**

Crear archivo temporal `test-ollama.js`:

```javascript
// test-ollama.js
const OLLAMA_HOST = 'http://77.83.232.203:11434'

async function testOllama() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: 'Say hello in one sentence',
        stream: false
      })
    })
    
    const data = await response.json()
    console.log('✅ Ollama responde:', data.response)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testOllama()
```

**Ejecutar**:
```bash
node test-ollama.js
```

**Salida esperada**:
```
✅ Ollama responde: Hello! How can I help you today?
```

---

## 📊 Arquitectura Final

```
Internet
    ↓
Next.js App (Local/Vercel)
    ↓ HTTP Request
VPS Hostinger (77.83.232.203:11434)
    ↓
Dokploy
    ↓
Docker Container (diversia-ollama)
    ↓
Ollama Service
    ↓
Gemma 2B Model (1.5 GB en RAM)
    ↓
JSON Response ← Análisis
```

---

## 🔒 Seguridad

### **Puertos Expuestos**
- **11434**: Ollama API (público, sin autenticación)

⚠️ **Recomendación**: En producción, configurar firewall para permitir solo:
- IP de Vercel (si despliegas ahí)
- Tu IP local (para desarrollo)

### **Datos Sensibles**
- ✅ Ollama corre en tu VPS (no envías datos a terceros)
- ✅ 100% GDPR compliant (datos no salen de tu infraestructura)
- ✅ No hay API keys externas

---

## 🛠️ Mantenimiento

### **Actualizar el modelo**

```bash
# Acceder al contenedor
docker exec -it diversia-ollama bash

# Actualizar modelo
ollama pull gemma:2b

# Salir
exit
```

### **Ver logs del contenedor**

En Dokploy:
1. Ir a proyecto "Diversia"
2. Hacer clic en servicio `diversia-ollama`
3. Pestaña "Logs"

### **Reiniciar servicio**

En Dokploy:
1. Servicio `diversia-ollama`
2. Botón "Restart"

---

## 📊 Consumo de Recursos

### **RAM Utilizada**

| Servicio | RAM |
|----------|-----|
| Supabase (otro proyecto) | ~2.5 GB |
| Ollama + Gemma 2B | ~2 GB |
| Sistema Ubuntu | ~0.5 GB |
| Docker overhead | ~0.3 GB |
| **Total** | **~5.3 GB de 8 GB** |

**Margen disponible**: ~2.7 GB ✅

### **Disco**

| Item | Espacio |
|------|---------|
| Imagen Ollama | ~800 MB |
| Modelo Gemma 2B | ~1.5 GB |
| Volumen `ollama-data` | ~50 MB |
| **Total** | **~2.4 GB de 100 GB** |

---

## ⚠️ Limitaciones Conocidas

1. **CPU (2 cores)**:
   - Latencia de respuesta: **3-5 segundos** por análisis
   - Solo 1 request simultánea recomendada

2. **RAM (8 GB)**:
   - **Modelo Phi-3 Mini (3.8B)**: No cabe con Supabase corriendo
   - **Gemma 2B**: Funciona OK pero ajustado

3. **Sin GPU**:
   - Respuestas más lentas que con GPU (10x más lento)
   - Suficiente para análisis batch de jobs

---

## 🚀 Próximos Pasos

1. ✅ Infraestructura desplegada
2. ✅ Modelo funcionando
3. ⏳ Integración con Next.js (`app/lib/llm.js`)
4. ⏳ Implementar `analyzeJobInclusivity()`
5. ⏳ Tests y validación

---

## 📞 Troubleshooting

### Problema: "Connection refused" al puerto 11434

**Solución**:
1. Verificar que contenedor esté corriendo:
   ```bash
   docker ps | grep ollama
   ```
2. Verificar en Dokploy que servicio está "running" (verde)
3. Reiniciar contenedor si está stopped

### Problema: Modelo responde muy lento (>30s)

**Solución**:
- Es normal en CPU sin GPU
- Si es crítico, migrar a Modal.com o RunPod con GPU

### Problema: "Out of memory"

**Solución**:
1. Detener Supabase temporalmente:
   ```bash
   docker stop <supabase-container-name>
   ```
2. Usar modelo más pequeño (Gemma 2B ya es el mínimo)

---

**Documentación creada**: 24 de enero de 2026  
**Última actualización**: 24 de enero de 2026  
**Autor**: GACE + TECH_STACK_AGENT
