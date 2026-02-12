# Sistema de Evaluación Formativa Docente - UNAL

Sistema web integral para la evaluación formativa de docentes de la Universidad Nacional de Colombia. Permite a estudiantes, docentes y directivos participar en un proceso de evaluación continua con el objetivo de mejorar la calidad educativa.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Roles y Funcionalidades](#roles-y-funcionalidades)
- [Base de Datos](#base-de-datos)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

## ✨ Características

- **Sistema de Autenticación**: Registro e inicio de sesión seguro con Clerk
- **Gestión de Roles**: Tres roles diferenciados (Estudiante, Docente, Directivo)
- **Autoevaluación Docente**: Los docentes pueden evaluar su propio desempeño
- **Evaluación Estudiantil**: Los estudiantes evalúan a sus docentes de forma anónima
- **Dashboard de Directivos**: Visualización de estadísticas y reportes generales
- **Planes de Mejora**: Los docentes pueden crear y seguir planes de mejora continua
- **Visualización de Datos**: Gráficas interactivas con Chart.js
- **Exportación de Reportes**: Descarga de resultados en formato CSV
- **Diseño Responsive**: Interfaz adaptable a diferentes dispositivos

## 🛠 Tecnologías Utilizadas

### Frontend
- **Vite** - Build tool y dev server
- **JavaScript ES6+** - Módulos nativos
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconografía
- **Chart.js** - Visualización de datos

### Backend
- **Vercel Serverless Functions** - API endpoints
- **MongoDB** - Base de datos NoSQL
- **Clerk** - Autenticación y gestión de usuarios

### Autenticación
- **Clerk.js** - Cliente de autenticación
- **@clerk/clerk-sdk-node** - SDK del servidor

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** (normalmente viene con Node.js)
- **MongoDB** (cuenta en MongoDB Atlas o instancia local)
- **Cuenta en Clerk** (para autenticación)
- **Git** (para control de versiones)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd formative-teaching-evaluation-system
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo `.env.example` a `.env` y completa las variables:
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXX

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/evaluation_formative?retryWrites=true&w=majority

# Environment
NODE_ENV=development
```

### Configuración de Clerk

1. Crea una cuenta en [Clerk.com](https://clerk.com)
2. Crea una nueva aplicación
3. Copia las claves públicas y secretas
4. Configura los métodos de autenticación (Email + Password)
5. Añade las URLs permitidas:
   - Development: `http://localhost:3000`
   - Production: Tu dominio de Vercel

### Configuración de MongoDB

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un nuevo cluster
3. Configura el acceso a la red (IP Whitelist)
4. Crea un usuario de base de datos
5. Obtén la cadena de conexión (connection string)
6. Crea la base de datos `evaluation_formative`

#### Colecciones Necesarias

El sistema requiere las siguientes colecciones en MongoDB:

- `teachers` - Información de docentes
- `teacherQuestions` - Preguntas para autoevaluación
- `studentQuestions` - Preguntas para evaluación estudiantil
- `evaluations` - Almacena todas las evaluaciones
- `improvementPlan` - Planes de mejora de docentes

#### Script de Inicialización (Opcional)

Puedes inicializar la base de datos con datos de ejemplo:

```javascript
// Ver archivo scripts/seed-database.js
npm run seed
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:3000`

### Modo Producción

1. **Build del proyecto**
   ```bash
   npm run build
   ```

2. **Preview del build**
   ```bash
   npm run preview
   ```

## 📁 Estructura del Proyecto

```
formative-teaching-evaluation-system/
│
├── api/                          # Serverless functions (Vercel)
│   ├── db.js                     # Conexión a MongoDB
│   ├── evaluations.js            # API de evaluaciones
│   ├── teachers.js               # API de docentes
│   ├── questions.js              # API de preguntas
│   ├── get-director-stats.js    # API de estadísticas
│   ├── improvement-plans.js      # API de planes de mejora
│   └── update-user-metadata.js   # Actualizar metadata de Clerk
│
├── css/                          # Estilos
│   └── styles.css                # Estilos principales
│
├── js/                           # JavaScript modules
│   ├── main.js                   # Punto de entrada principal
│   ├── clerk-config.js           # Configuración de Clerk
│   ├── components/              # Componentes del UI
│   │   ├── navbar.js            # Barra de navegación
│   │   ├── login.js             # Componente de login
│   │   ├── registration.js      # Componente de registro
│   │   ├── teacher.js           # Sección de docente
│   │   ├── student.js           # Sección de estudiante
│   │   └── director.js          # Sección de directivo
│   └── utils/                   # Utilidades (refactorizado)
│       ├── session.js           # Gestión de sesiones
│       ├── charts.js            # Configuración de gráficas
│       └── validation.js        # Validaciones
│
├── dist/                         # Build de producción (generado)
├── node_modules/                 # Dependencias (no versionado)
│
├── .env                          # Variables de entorno (no versionado)
├── .env.example                  # Ejemplo de variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── index.html                    # HTML principal
├── package.json                  # Configuración del proyecto
├── package-lock.json             # Lock de dependencias
├── README.md                     # Este archivo
├── vercel.json                   # Configuración de Vercel
└── vite.config.js                # Configuración de Vite
```

## 👥 Roles y Funcionalidades

### 🎓 Estudiante
- Evaluar a sus docentes de forma anónima
- Seleccionar docente de una lista
- Responder a un cuestionario de evaluación
- No puede evaluar al mismo docente más de una vez

### 👨‍🏫 Docente
- Realizar autoevaluación
- Ver resultados de su autoevaluación
- Ver comparativo con evaluaciones estudiantiles
- Crear planes de mejora
- Exportar sus resultados
- Visualizar gráficas de desempeño

### 👔 Directivo
- Ver estadísticas generales del sistema
- Acceder a ranking de docentes
- Visualizar distribución de evaluaciones
- Ver promedio por categorías
- Exportar reportes generales en CSV
- Acceder a tabla detallada de todos los docentes

## 🗄️ Base de Datos

### Esquema de Colecciones

#### `teachers`
```javascript
{
  _id: ObjectId,
  id: String,           // Email del docente (único)
  name: String,         // Nombre completo
  subject: String,      // Materia (opcional)
  createdAt: Date
}
```

#### `evaluations`
```javascript
{
  _id: ObjectId,
  teacherId: String,    // Email del docente evaluado
  userEmail: String,    // Email del evaluador
  userRole: String,     // 'teacher' o 'student'
  evaluationData: {
    scores: Object      // { questionId: score }
  },
  createdAt: Date
}
```

#### `teacherQuestions` / `studentQuestions`
```javascript
{
  _id: ObjectId,
  id: Number,           // ID de la pregunta
  question: String,     // Texto de la pregunta
  category: String      // Categoría (opcional)
}
```

#### `improvementPlan`
```javascript
{
  _id: ObjectId,
  teacherId: String,
  userEmail: String,
  goal: String,         // Meta principal
  actions: String,      // Acciones a implementar
  indicators: String,   // Indicadores de éxito
  deadline: Date,       // Fecha límite
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 Despliegue

### Despliegue en Vercel

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Iniciar sesión en Vercel**
   ```bash
   vercel login
   ```

3. **Desplegar**
   ```bash
   vercel
   ```

4. **Configurar variables de entorno en Vercel**
   - Ve a tu proyecto en el dashboard de Vercel
   - Settings → Environment Variables
   - Añade todas las variables del archivo `.env`

5. **Deploy a producción**
   ```bash
   vercel --prod
   ```

### Consideraciones de Producción

- Asegúrate de actualizar las URLs permitidas en Clerk
- Configura las IPs permitidas en MongoDB Atlas
- Verifica que todas las variables de entorno estén configuradas
- Realiza pruebas exhaustivas antes del despliegue final

## 🤝 Contribución

Para contribuir a este proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- Usa ES6+ syntax
- Mantén funciones pequeñas y con un solo propósito
- Comenta código complejo
- Usa nombres descriptivos para variables y funciones
- Sigue el estilo de código existente

## 📄 Licencia

Este proyecto fue desarrollado para la Universidad Nacional de Colombia.

## 👤 Autor

Proyecto desarrollado para el sistema de evaluación formativa de la Universidad Nacional de Colombia.

## 🐛 Reporte de Bugs

Si encuentras algún bug o tienes sugerencias, por favor crea un issue en el repositorio.

## 📞 Soporte

Para soporte o preguntas, contacta al equipo de desarrollo.

---

**Universidad Nacional de Colombia** - Sistema de Evaluación Formativa Docente © 2026
