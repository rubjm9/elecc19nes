# 🔥 Configuración de Firebase para ELECC19NES

## 📋 Pasos para configurar Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombre del proyecto: `elecc19nes` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Selecciona tu cuenta de Analytics (opcional)

### 2. Configurar Firestore Database

1. En el panel lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para desarrollo)
4. Elige la ubicación más cercana a tus usuarios

### 3. Obtener configuración del proyecto

1. Ve a **"Configuración del proyecto"** (ícono de engranaje)
2. En la pestaña **"General"**, baja hasta **"Tus aplicaciones"**
3. Haz clic en **"Agregar aplicación"** y selecciona **"Web"**
4. Nombre de la aplicación: `elecc19nes-web`
5. **NO** marques "También configurar Firebase Hosting"
6. Haz clic en **"Registrar aplicación"**

### 4. Copiar configuración

Copia el objeto `firebaseConfig` que aparece en pantalla:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234"
};
```

### 5. Actualizar configuración en el código

1. Abre el archivo `src/firebase/config.ts`
2. Reemplaza el objeto `firebaseConfig` con tu configuración real
3. Guarda el archivo

### 6. Configurar reglas de Firestore (Opcional)

Para desarrollo, puedes usar estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a todos los documentos (SOLO PARA DESARROLLO)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **IMPORTANTE**: Para producción, debes configurar reglas de seguridad más estrictas.

### 7. Reglas de producción recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins - solo lectura (la escritura se hace desde el código de la app)
    match /admins/{adminId} {
      allow read: if true;
      allow write: if false; // Controlado por la aplicación
    }
    
    // Sesiones - lectura pública, escritura controlada
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if false; // Controlado por la aplicación
    }
    
    // Miembros - lectura pública, escritura controlada
    match /members/{memberId} {
      allow read: if true;
      allow write: if false; // Controlado por la aplicación
    }
    
    // Elecciones - lectura pública, escritura controlada
    match /elections/{electionId} {
      allow read: if true;
      allow write: if false; // Controlado por la aplicación
    }
    
    // Votos - lectura y escritura controlada
    match /votes/{voteId} {
      allow read, write: if true; // Los votos pueden ser modificados
    }
  }
}
```

## 🚀 Verificar la configuración

1. Guarda todos los archivos
2. Ejecuta `npm run dev`
3. Abre la aplicación en el navegador
4. Verifica que aparezca "Inicializando aplicación..." y luego la pantalla principal
5. Ve a la consola del navegador (F12) para verificar que no hay errores de Firebase

## 🔍 Estructura de datos en Firestore

La aplicación creará estas colecciones automáticamente:

- **`admins`**: Administradores del sistema
- **`sessions`**: Sesiones de votación
- **`members`**: Miembros de las sesiones
- **`elections`**: Elecciones dentro de las sesiones
- **`votes`**: Votos emitidos por los miembros

## ✅ Funcionalidades implementadas

- ✅ Autenticación de administradores con Firestore
- ✅ Creación de sesiones y miembros
- ✅ Gestión de elecciones
- ✅ Sistema de votación en tiempo real
- ✅ Estados de carga y manejo de errores
- ✅ Sincronización automática con Firebase

## 🔧 Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🆘 Solución de problemas

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que hayas copiado correctamente la `apiKey` en `src/firebase/config.ts`

### Error: "Missing or insufficient permissions"
- Revisa las reglas de Firestore en Firebase Console
- Para desarrollo, usa las reglas permisivas mostradas arriba

### La aplicación se queda en "Inicializando aplicación..."
- Abre la consola del navegador (F12) para ver errores específicos
- Verifica que el `projectId` sea correcto
- Asegúrate de que Firestore esté habilitado en tu proyecto

### Los datos no se guardan
- Verifica las reglas de Firestore
- Revisa la consola del navegador para errores de permisos

---

¿Necesitas ayuda con algún paso? ¡Pregúntame! 🚀
