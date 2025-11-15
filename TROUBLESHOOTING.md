# Guía de Solución de Problemas - Laboratorio de Seguridad TechSolutions

## Problemas Comunes y Soluciones

---

### SOLUCIONADO: Fallo en Compilación de Docker - Error de Configuración TypeScript

**Problema:**
```
error TS6059: File '/app/scripts/simulate-recovery.ts' is not under 'rootDir' '/app/src'. 
'rootDir' is expected to contain all source files.
```

**Causa:**
El `tsconfig.json` tenía configuraciones conflictivas:
- `rootDir` estaba configurado en `./src` (solo compilar código fuente)
- El patrón `include` incluía tanto `src/**/*` Y `scripts/**/*` (tratando de compilar scripts auxiliares también)

**Solución:**
Modificado `tsconfig.json` para excluir scripts de la compilación:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "scripts"]
}
```

**Por qué funciona:**
- El directorio `scripts/` contiene **scripts auxiliares independientes** para análisis forense
- Estos scripts se ejecutan vía `ts-node` (no se compilan)
- El contenedor Docker solo necesita la **aplicación web** compilada (directorio `src/`)
- Los scripts auxiliares se ejecutan fuera del contenedor usando comandos `npm run`

**Verificación:**
```bash
# Probar compilación local
npm run build

# Probar compilación Docker
docker-compose build web

# Ambos deberían funcionar ahora
```

---

### Problema: Puerto 3000 Ya Está en Uso

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluciones:**

**Opción 1: Encontrar y terminar el proceso**
```bash
# En Linux/Mac - Encontrar proceso usando puerto 3000
lsof -i :3000

# En Windows - Encontrar proceso usando puerto 3000
netstat -ano | findstr :3000

# Terminarlo (reemplazar PID con ID del proceso actual)
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

**Opción 2: Cambiar el puerto**
```bash
# Editar archivo .env
PORT=3001

# Reiniciar aplicación
npm run dev
```

**Opción 3: Usar Docker en su lugar**
```bash
# Docker mapea puertos de forma diferente
docker-compose up -d
```

---

### Problema: Conexión a Base de Datos Rechazada

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```

**Soluciones:**

**Verificación 1: ¿Está ejecutándose MySQL?**
```bash
# Verificar contenedores Docker
docker-compose ps

# Debería mostrar techsolutions-db como "Up"
```

**Verificación 2: Esperar a que MySQL se inicialice**
```bash
# MySQL toma 15-20 segundos en iniciarse completamente
docker-compose up -d db
sleep 20
npm run init-db
```

**Verificación 3: Verificar credenciales**
```bash
# Verificar que el archivo .env coincida con docker-compose.yml
cat .env | grep DB_
cat docker-compose.yml | grep MYSQL_
```

**Verificación 4: Resetear base de datos**
```bash
# Detener y remover contenedores
docker-compose down -v

# Iniciar desde cero
docker-compose up -d db
sleep 20
npm run init-db
```

---

### Problema: DNS No Resuelve (techsolutions.com.test)

**Síntomas:**
```
curl: (6) Could not resolve host: techsolutions.com.test
```

**Soluciones:**

**Linux/Mac:**
```bash
# Agregar entrada a /etc/hosts
echo "127.0.0.1   techsolutions.com.test" | sudo tee -a /etc/hosts

# Verificar
cat /etc/hosts | grep techsolutions

# Limpiar cache DNS (Mac)
sudo dscacheutil -flushcache

# Limpiar cache DNS (Linux)
sudo systemd-resolve --flush-caches
```

**Windows:**
```powershell
# Ejecutar PowerShell como Administrador
Add-Content C:\Windows\System32\drivers\etc\hosts "127.0.0.1   techsolutions.com.test"

# Limpiar DNS
ipconfig /flushdns
```

**Alternativa: Usar localhost**
```bash
# Acceder vía IP en su lugar
curl http://localhost:3000
```

---

### Problema: npm install Falla

**Síntomas:**
```
npm ERR! code EINTEGRITY
npm ERR! Verification failed while extracting
```

**Soluciones:**

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar lock file y node_modules
rm -rf node_modules package-lock.json  # Linux/Mac
Remove-Item -Recurse -Force node_modules, package-lock.json  # Windows PowerShell

# Reinstalar
npm install
```

**Si aún falla:**
```bash
# Update npm itself
npm install -g npm@latest

# Use different registry
npm install --registry https://registry.npmjs.org/
```

---

### Issue: TypeScript Compilation Errors

**Symptoms:**
```
error TS2307: Cannot find module 'express' or its corresponding type declarations
```

**Solutions:**

```bash
# Ensure all dependencies installed
npm install

# Check TypeScript version
npx tsc --version

# Clean build
rm -rf dist/
npm run build
```

**If module not found:**
```bash
# Install missing types
npm install --save-dev @types/express @types/node @types/cors @types/morgan
```

---

### Issue: SQL Injection Not Working

**Symptoms:**
- Login fails with SQL injection payload
- No authentication bypass occurs

**Check 1: Using correct endpoint**
```bash
# Vulnerable endpoint is /api/auth/login
curl -X POST http://techsolutions.com.test:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

**Check 2: Database initialized**
```bash
# Must run init-db first
npm run init-db
```

**Check 3: Test with simple payload**
```bash
# Try this payload in browser
Username: admin' OR '1'='1
Password: anything
```

---

### Issue: Forensic Scripts Not Running

**Symptoms:**
```
Error: Cannot find module './src/config/database'
```

**Solutions:**

**Scripts use ts-node, not compiled code:**
```bash
# Run scripts via npm commands (uses ts-node)
npm run generate-logs
npm run generate-timeline
npm run check-leaks

# Don't run them directly
# ❌ ts-node scripts/generate-logs.ts  (may fail)
# ✅ npm run generate-logs              (works)
```

**Ensure ts-node is installed:**
```bash
# Should be in devDependencies
npm install --save-dev ts-node ts-node-dev
```

---

### Issue: Docker Container Exits Immediately

**Symptoms:**
```
docker ps  # Shows no containers running
docker ps -a  # Shows exited containers
```

**Solutions:**

**Check logs:**
```bash
docker logs techsolutions-web
docker logs techsolutions-db
```

**Common causes:**

1. **Database not ready**
```bash
# Start DB first, wait, then start web
docker-compose up -d db
sleep 20
docker-compose up -d web
```

2. **Build failed**
```bash
# Check build output
docker-compose build web
```

3. **Environment variables missing**
```bash
# Ensure .env file exists
cp .env.example .env
```

---

### Issue: Logs Directory Empty

**Symptoms:**
```bash
ls logs/  # Shows no files
```

**Solutions:**

```bash
# Generate logs manually
npm run generate-logs

# Or create placeholder logs
mkdir -p logs
touch logs/AUTH_2025-10-27T10:01:32.log
touch logs/NET_2025-10-27T03:14:55.log
touch logs/RANSOM_2025-10-27T03-14-55.log
```

**Note:** Logs are generated by scripts, not by the running application.

---

### Issue: S3 Bucket Files Not Found

**Symptoms:**
```bash
curl http://localhost:3000/s3-bucket/backups/credentials.txt
# 404 Not Found
```

**Solutions:**

**S3 files are static, accessed via filesystem:**
```bash
# Access files directly
cat s3-bucket/backups/credentials.txt

# Not served via web app (by design)
# They simulate a publicly accessible S3 bucket
```

**Verify files exist:**
```bash
ls -R s3-bucket/
# Should show backups/ and breaches/ directories
```

---

### Issue: JWT Token Invalid

**Symptoms:**
```
{"error": "Invalid token"}
```

**Solutions:**

**Check 1: Token expired**
```bash
# Tokens expire after 24 hours
# Login again to get new token
```

**Check 2: Wrong endpoint**
```bash
# Some endpoints require authentication
# Include token in Authorization header
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/admin/users
```

**Check 3: JWT secret mismatch**
```bash
# Ensure .env has JWT_SECRET
cat .env | grep JWT_SECRET
```

---

### Issue: Ransomware Files Missing

**Symptoms:**
```bash
ls ransomware/encrypted/
# Empty or doesn't exist
```

**Solutions:**

```bash
# Files should be created during initial setup
# If missing, check git:
git status

# Or manually verify structure
find ransomware/ -type f
```

**Expected files:**
- `ransomware/README_DECRYPT.txt`
- `ransomware/encrypted/*.locked`
- `ransomware/dropper/Invoice_Q3_2025.pdf.exe.txt`

---

## Performance Issues

### Issue: Slow Docker Build

**Solutions:**

```bash
# Use build cache
docker-compose build --no-cache web  # Only if absolutely necessary

# Optimize .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore
echo "dist" >> .dockerignore
```

### Issue: High Memory Usage

**Solutions:**

```bash
# Limit container memory (docker-compose.yml)
services:
  web:
    mem_limit: 512m
  db:
    mem_limit: 1g
```

---

## Reset Everything

If all else fails, complete reset:

```bash
# 1. Stop and remove containers
docker-compose down -v

# 2. Remove images
docker rmi techsolutions-web mysql:8.0

# 3. Clean Node.js
rm -rf node_modules package-lock.json dist/

# 4. Fresh install
npm install

# 5. Rebuild Docker
docker-compose build

# 6. Start fresh
docker-compose up -d db
sleep 20
npm run init-db
npm run generate-logs
npm run dev
```

---

## Getting Help

### Enable Debug Logging

```bash
# Edit .env
LOG_LEVEL=debug

# Restart
npm run dev
```

### Check All Logs

```bash
# Application logs
tail -f logs/*.log

# Docker logs
docker-compose logs -f

# Database logs
docker logs techsolutions-db --tail 100
```

### Verify Full Setup

```bash
# Run health checks
curl http://localhost:3000/health

# Test database
docker exec techsolutions-db mysql -u root -pvulnerable123 -e "SHOW DATABASES;"

# Check all services
docker-compose ps
npm run dev &
sleep 5
curl http://localhost:3000
```

---

## Still Having Issues?

1. Check all files exist: `find . -type f | grep -v node_modules | grep -v .git`
2. Verify prerequisites: `node --version && npm --version && docker --version`
3. Read error messages carefully
4. Check GitHub Issues: https://github.com/yourusername/techsolutions-lab/issues
5. Open a new issue with:
   - OS and versions
   - Full error message
   - Steps to reproduce
   - Output of `docker-compose ps` and `npm run dev`

---

**Last Updated:** November 14, 2025
**Lab Version:** 1.0.0
