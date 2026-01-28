# SafeBite App �️🍏

**SafeBite** es una aplicación móvil diseñada para ayudar a las personas con alergias e intolerancias alimentarias a tomar decisiones seguras al comprar comida. Escaneando el código de barras de un producto, la aplicación analiza sus ingredientes y advierte sobre posibles alérgenos basándose en el perfil personalizado del usuario.

## 🚀 Características Principales

### 🔍 Escaneo y Análisis Inteligente
- **Escáner de Códigos de Barras**: Utiliza la cámara del dispositivo para escanear códigos EAN/UPC de productos alimenticios al instante.
- **Integración con OpenFoodFacts**: Acceder a una base de datos global de productos alimenticios.
- **Detección de Alérgenos Personalizada**: Compara los ingredientes del producto con el perfil de alérgenos configurado por el usuario.
- **Indicadores de Seguridad Claros**:
  - 🟢 **Seguro**: No se detectaron alérgenos configurados.
  - 🔴 **Peligro**: Se detectaron ingredientes conflictivos para el usuario.
  - 🟡 **Advertencia/Desconocido**: Faltan datos o ingredientes no verificados (especialmente para invitados).

### 👤 Gestión de Usuarios
- **Perfiles Personalizados**: Los usuarios pueden seleccionar sus alergias específicas (Gluten, Lactosa, Frutos Secos, etc.) para un análisis a medida.
- **Modo Invitado**: Permite probar la aplicación sin necesidad de registrarse, con funcionalidad básica de escaneo.
- **Historial de Escaneos**: Guarda un registro de todos los productos escaneados, indicando si fueron seguros o no en ese momento.

### 💾 Arquitectura Híbrida de Datos
- **Catálogo Global en Caché (Firestore)**:
  - Los productos consultados se guardan en una colección global `products` para reducir llamadas a la API externa y mejorar la velocidad.
  - Contribución comunitaria: El primer usuario que escanea un producto lo añade al catálogo global.
- **Sincronización Offline/Online**:
  - Preferencias e historial se guardan localmente (`AsyncStorage`) para acceso rápido.
  - Se sincronizan con la nube (Firebase) cuando hay conexión y el usuario está autenticado.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con un stack moderno basado en **React Native** y **Expo**.

### Frontend
- **Framework**: [React Native](https://reactnative.dev/) (v0.81) con [Expo SDK 54](https://expo.dev/).
- **Lenguaje**: TypeScript.
- **Navegación**: [Expo Router](https://docs.expo.dev/router/introduction/) (Navegación basada en archivos).
- **Estilos**: StyleSheet nativo y `expo-google-fonts`.
- **Cámara**: `expo-camera` para el escaneo de códigos de barras.

### Backend & Servicios
- **BaaS (Backend as a Service)**: [Firebase](https://firebase.google.com/).
  - **Authentication**: Gestión de usuarios (Email/Password, Anónimo).
  - **Firestore**: Base de datos NoSQL para perfiles de usuario, historial y catálogo de productos.
- **API Externa**: [OpenFoodFacts JSON API](https://world.openfoodfacts.org/) para obtener datos de ingredientes y valor nutricional.

---

## 📂 Estructura del Proyecto

```
SafeBiteApp/
├── app/                  # Pantallas y Rutas (Expo Router)
│   ├── (auth)/           # Pantallas de autenticación (Login, Registro)
│   ├── (tabs)/           # Navegación principal (Home, Perfil, Historial)
│   ├── scan_screen.tsx   # Pantalla principal de escaneo
│   └── ...
├── components/           # Componentes UI Reutilizables
├── config/               # Configuración de Firebase y constantes globales
├── contexts/             # Estado Global (React Context)
│   ├── auth.tsx          # Sesión de usuario
│   ├── productHistory.tsx# Lógica de escaneo e historial
│   └── userPreferences.tsx # Gestión de alérgenos
├── services/             # Lógica de Negocio y APIs
│   ├── productService.ts # Interacción con OpenFoodFacts y Catálogo Firestore
│   └── userService.ts    # Gestión de datos de usuario en Firestore
├── types/                # Definiciones de tipos TypeScript
└── utils/                # Utilidades (Detección de alérgenos, parseo)
```

---

## 🔧 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (LTS recomendado)
- npm o yarn
- Dispositivo físico o Emulador (Android Studio / Xcode) con Expo Go.

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/SafeBiteApp.git
   cd SafeBiteApp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configuración de Firebase**
   - Asegúrate de tener el archivo `google-services.json` (Android) o `GoogleService-Info.plist` (iOS) si compilas nativamente.
   - Para Expo Go, verifica que `config/firebase.ts` tenga las credenciales web de tu proyecto Firebase:
     ```typescript
     const firebaseConfig = {
       apiKey: "TU_API_KEY",
       authDomain: "tu-proyecto.firebaseapp.com",
       projectId: "tu-proyecto",
       // ...
     };
     ```

4. **Ejecutar el proyecto**
   ```bash
   npx expo start
   ```
   - Escanea el código QR con la app **Expo Go** (Android/iOS) o presiona `a` para abrir en emulador Android / `i` para simulador iOS.

