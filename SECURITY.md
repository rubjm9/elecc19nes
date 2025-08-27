# 🔒 Guía de Seguridad - Configuración de Firebase

## ⚠️ IMPORTANTE: Claves de API Expuestas

**GitHub ha detectado que las claves de Firebase están expuestas públicamente. Esto es un riesgo de seguridad.**

## 🚨 Acciones Inmediatas Requeridas

### 1. **Revocar la Clave API Actual**
- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Navega a "APIs & Services" > "Credentials"
- Encuentra la clave `AIzaSyAJvvgffjS_U3B1iBgohQQz75TbunlH0YM`
- **REVÓCALA INMEDIATAMENTE**

### 2. **Crear Nueva Clave API**
- En la misma sección, crea una nueva clave API
- **NO la subas a GitHub**
- Configura restricciones de dominio si es posible

### 3. **Configurar Variables de Entorno**

#### Opción A: Archivo .env (Recomendado para desarrollo)
```bash
# Crea un archivo .env en la raíz del proyecto
VITE_FIREBASE_API_KEY=tu_nueva_clave_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

#### Opción B: Variables de Entorno del Sistema
```bash
export VITE_FIREBASE_API_KEY="tu_nueva_clave_aqui"
export VITE_FIREBASE_AUTH_DOMAIN="tu_proyecto.firebaseapp.com"
# ... etc
```

#### Opción C: Variables de Entorno en Vercel
- Ve a tu proyecto en Vercel
- Settings > Environment Variables
- Agrega cada variable con su valor correspondiente

## 🔐 Configuración de Seguridad

### Reglas de Firestore Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo permitir lectura/escritura desde tu aplicación
    match /{document=**} {
      allow read, write: if request.auth != null || 
        request.origin.matches('https://tu-dominio.com');
    }
  }
}
```

### Restricciones de API Key
- Limita la clave a solo tu dominio
- Restringe a solo los servicios de Firebase que uses
- Configura cuotas de uso

## 📋 Checklist de Seguridad

- [ ] Clave API anterior revocada
- [ ] Nueva clave API creada
- [ ] Variables de entorno configuradas
- [ ] Archivo .env agregado a .gitignore
- [ ] Reglas de Firestore actualizadas
- [ ] Restricciones de API configuradas
- [ ] Alerta de GitHub cerrada

## 🆘 En Caso de Compromiso

1. **Revoca TODAS las claves API inmediatamente**
2. **Revisa logs de Firebase** para actividad sospechosa
3. **Cambia configuraciones** de seguridad
4. **Notifica a tu equipo** sobre el incidente
5. **Considera rotar** otras credenciales relacionadas

## 📞 Recursos de Ayuda

- [Firebase Security](https://firebase.google.com/docs/projects/api-keys)
- [Google Cloud Security](https://cloud.google.com/security)
- [GitHub Security](https://docs.github.com/en/code-security)

---

**Recuerda: Nunca subas claves de API a repositorios públicos.**
