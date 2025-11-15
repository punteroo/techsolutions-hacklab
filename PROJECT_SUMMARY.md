# TechSolutions S.A. - Resumen del Laboratorio de Seguridad

## Descripción General del Laboratorio

Este repositorio contiene un laboratorio de entrenamiento en seguridad completo y autónomo que simula un incidente real de ciberseguridad en una empresa ficticia llamada TechSolutions S.A.

## Qué Está Incluido

### 1. **Aplicación Web Vulnerable** (TypeScript + Express)
- Endpoint de login intencionalmente vulnerable (Inyección SQL)
- Almacenamiento inseguro de credenciales (contraseñas en texto plano)
- Panel de administración expuesto
- Autenticación JWT (con secretos débiles)
- Sistema completo de gestión de usuarios

### 2. **Base de Datos** (MySQL)
- 1,247 registros de clientes
- Cuentas de administrador comprometidas
- Cuenta de usuario backdoor
- Logging de consultas habilitado para forense

### 3. **Bucket S3 Simulado**
- Backups de base de datos con datos sensibles
- Exportación de PII de clientes
- Registros de pagos
- Credenciales hardcodeadas
- Claves de acceso AWS

### 4. **Artefactos de Ransomware**
- 4 archivos cifrados (extensión .locked)
- Nota de rescate (simulación LockBit 3.0)
- Información del dropper del malware
- IOCs (Indicadores de Compromiso)

### 5. **Logs Forenses**
- Logs de autenticación (intentos de inyección SQL)
- Logs de tráfico de red (exfiltración de datos)
- Logs de ejecución de ransomware
- Timeline completo del ataque

### 6. **Inteligencia de Web Oscura**
- Publicación simulada en foro
- Anuncio de datos filtrados
- Billetera Bitcoin para rescate
- Materiales de investigación OSINT

## Vulnerabilidades Implementadas

| # | Vulnerabilidad | OWASP Top 10 | Severidad | Ubicación |
|---|----------------|--------------|-----------|-----------|
| 1 | Inyección SQL | A03:2021 | Crítica | `/api/auth/login` |
| 2 | Almacenamiento Inseguro de Datos | A02:2021 | Crítica | Simulación bucket S3 |
| 3 | Autenticación Quebrada | A07:2021 | Alta | Credenciales comprometidas |
| 4 | Configuración de Seguridad Incorrecta | A05:2021 | Alta | Bucket S3 público |
| 5 | Logging Insuficiente | A09:2021 | Media | Detección retrasada |

## Objetivos de Aprendizaje

Después de completar este laboratorio, podrás:

1. Entender vulnerabilidades comunes en aplicaciones web
2. Realizar ataques de inyección SQL y explotación
3. Conducir investigación forense digital
4. Analizar comportamiento de ransomware e IOCs
5. Correlacionar eventos de múltiples fuentes de logs
6. Crear reportes comprensivos de respuesta a incidentes
7. Mapear ataques al framework MITRE ATT&CK
8. Practicar remediación y hardening de seguridad

## Inicio Rápido (5 Minutos)

```bash
# 1. Agregar a /etc/hosts
echo "127.0.0.1   techsolutions.com.test" | sudo tee -a /etc/hosts

# 2. Clonar y configurar
git clone <your-repo-url>
cd techsolutions
npm install

# 3. Iniciar el laboratorio
docker-compose up -d
sleep 15
npm run init-db
npm run generate-logs

# 4. Acceder al laboratorio (la app web ya está corriendo)
# Navegar a: http://techsolutions.com.test:3000
```

## Estructura de Documentación

- **README.md** - Documentación completa del laboratorio
- **QUICKSTART.md** - Guía de configuración rápida
- **FORENSIC_GUIDE.md** - Análisis forense paso a paso (350+ líneas)
- **ATTACK_TIMELINE.md** - Generado después de ejecutar `npm run generate-timeline`
- **LICENSE** - Licencia MIT con descargo de uso educacional

## 🔬 Forensic Analysis Tools

The lab includes several helper scripts:

```bash
npm run generate-timeline    # Create complete attack timeline
npm run check-leaks          # Match DB records with dark web leaks
npm run analyze-ransomware   # Examine ransomware artifacts
npm run correlate-timeline   # Correlate events across logs
npm run simulate-recovery    # Ransomware recovery simulation
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL 8.0
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Containerization**: Docker, Docker Compose
- **Logging**: Custom JSON-based logging system

## 📊 Attack Scenario Timeline

```
Day 1 (Oct 26)
├─ 18:30 - Reconnaissance (port scanning)
├─ 23:15 - S3 bucket discovered and downloaded (1.8 GB)

Day 2 (Oct 27)
├─ 01:30 - SQL injection attempts begin
├─ 02:47 - Database exfiltrated (347 MB)
├─ 03:00 - Phishing email opened (ransomware dropper)
├─ 03:14 - File encryption begins (847 files)
├─ 10:01 - Incident discovered

Day 3 (Oct 28)
└─ 15:00 - Data posted on dark web forum
```

## 🎯 Use Cases

### For Students
- Learn offensive security techniques
- Practice forensic analysis
- Understand attack methodologies
- Prepare for certifications (OSCP, CEH, GCIH)

### For Teachers
- Ready-to-use lab environment
- Comprehensive documentation
- Assessment scenarios
- Hands-on learning material

### For Security Professionals
- Incident response practice
- Forensic analysis training
- Tool development and testing
- Security awareness demonstrations

## ⚠️ Important Disclaimers

### Legal Warning
```
⚠️  LEGAL WARNING ⚠️

This lab contains intentionally vulnerable code and simulated malware.

DO NOT:
- Use in production environments
- Attack systems you don't own
- Deploy on public networks
- Share credentials from this lab

ONLY USE:
- For educational purposes
- In isolated lab environments
- With explicit permission
- For security research

Unauthorized computer access is illegal. The authors are not
responsible for any misuse of this software.
```

### Technical Limitations

- This is a **simulation** - not real malware
- Ransomware files are harmless text files
- No actual encryption algorithms used
- Network captures are synthetic
- S3 bucket is a local directory

## 🔧 Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Port Conflicts
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Web app
  - "3307:3306"  # MySQL
```

### DNS Resolution
```bash
# Verify /etc/hosts entry
cat /etc/hosts | grep techsolutions

# Test resolution
ping techsolutions.com.test
```

## 📚 Additional Resources

### Learning Materials
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [MITRE ATT&CK](https://attack.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [SANS Digital Forensics](https://www.sans.org/cyber-security-courses/)

### Tools to Practice With
- SQLMap - Automated SQL injection
- Burp Suite - Web security testing
- Wireshark - Network analysis
- Autopsy - Digital forensics

## 🤝 Contributing

Contributions welcome! Ideas for improvements:

- Additional vulnerability scenarios
- More realistic log data
- Additional forensic artifacts
- Automated testing scripts
- Docker Compose improvements

## 📝 License

MIT License - See LICENSE file for details.

Educational use only. Contains intentionally vulnerable code.

## 🎓 Credits

Created for cybersecurity education and training purposes.

**Inspired by:**
- DVWA (Damn Vulnerable Web Application)
- OWASP WebGoat
- HackTheBox
- TryHackMe

---

## 📈 Lab Statistics

- **Lines of Code**: 2,500+
- **Documentation**: 1,500+ lines
- **Log Entries**: 50+ forensic events
- **Vulnerabilities**: 5 major categories
- **Simulated Data**: 1,247 customer records
- **Total Files**: 60+ files
- **Setup Time**: 5 minutes
- **Learning Time**: 4-8 hours

---

## 🎯 Next Steps

1. Complete the QUICKSTART.md setup
2. Explore the vulnerable web application
3. Follow the FORENSIC_GUIDE.md step-by-step
4. Try exploitation scenarios from README.md
5. Generate your own attack timeline
6. Write a comprehensive incident report

---

**Ready to start? Follow QUICKSTART.md!** 🚀

Questions? Issues? Open an issue on GitHub!

Happy learning and stay secure! 🔒
