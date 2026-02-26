# Scheduly API

Optimizador inteligente de horarios académicos para estudiantes universitarios. Utiliza un algoritmo de backtracking con un sistema de scoring basado en reglas para encontrar las mejores combinaciones de horarios según las preferencias del usuario.

## Tecnologías

- **Runtime**: Node.js 20.x
- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma 7.x
- **Autenticación**: JWT + Refresh Tokens (Cookies HttpOnly)
- **Documentación**: Swagger

## Requisitos previos

- Node.js 20.x
- PostgreSQL 14 o superior
- npm

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JhojanRop/scheduly-api.git
cd scheduly-api

# Instalar dependencias
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/scheduly_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
NODE_ENV="development"
PORT=3000
```

## Base de datos

```bash
# Crear y aplicar migraciones
npx prisma migrate dev

# Poblar datos iniciales (días de la semana)
npx prisma db seed
```

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000/api`.

## Documentación

Una vez levantado el servidor, accede a la documentación interactiva de Swagger en:

```
http://localhost:3000/docs
```

## Arquitectura

El proyecto sigue una arquitectura por capas:

```
src/
├── auth/              # Autenticación JWT
├── users/             # Gestión de usuarios
├── subjects/          # Materias
├── professors/        # Profesores
├── sections/          # Secciones/grupos con horarios
├── rules/             # Reglas de optimización del usuario
├── scheduling/        # Motor de optimización (backtracking + scoring)
│   ├── engine/        # Algoritmo de backtracking
│   ├── pruning/       # Fase 1: filtrado previo
│   └── rules/         # Estrategias de scoring (Strategy Pattern)
├── saved-schedules/   # Horarios guardados
├── prisma/            # Configuración de Prisma
└── types/             # Tipos compartidos
```

## Motor de optimización

El motor trabaja en dos fases:

1. **Pruning**: Elimina secciones que violan reglas absolutas (profesor no deseado, horario de almuerzo protegido)
2. **Backtracking + Scoring**: Explora combinaciones válidas sin conflictos de horario y calcula un score basado en las reglas del usuario ordenadas por prioridad

Devuelve las **3 mejores combinaciones** ordenadas por score.

## Reglas disponibles

| Tipo                    | Descripción                                    | Parámetros                                                       |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| `NO_GAPS`               | Evita huecos entre clases                      | Ninguno                                                          |
| `NO_EARLY_MORNINGS`     | Evita clases antes de las 8:00                 | Ninguno                                                          |
| `NO_LATE_EVENINGS`      | Evita clases que terminen después de las 18:00 | Ninguno                                                          |
| `PREFER_MORNING`        | Premia clases en horario diurno (6:00-14:00)   | Ninguno                                                          |
| `PREFER_AFTERNOON`      | Premia clases en horario tarde (14:00-22:00)   | Ninguno                                                          |
| `COMPACT_DAYS`          | Premia tener clases en menos días              | Ninguno                                                          |
| `BALANCED_LOAD`         | Premia distribución equilibrada de horas       | Ninguno                                                          |
| `MIN_FREE_DAY`          | Premia tener al menos un día libre             | `{ type: "daySelect", value: 1-7 }`                              |
| `MAX_CONSECUTIVE_HOURS` | Penaliza bloques muy largos sin descanso       | `{ type: "number", value: 1-8 }`                                 |
| `LUNCH_BREAK_PROTECTED` | Protege un rango horario para el almuerzo      | `{ type: "timeRange", value: { start: "HH:MM", end: "HH:MM" } }` |
| `AVOID_PROFESSOR`       | Excluye secciones de un profesor específico    | `{ type: "professorSelect", value: "uuid" }`                     |

## Flujo de uso

1. Registrarse o iniciar sesión
2. Crear materias y profesores
3. Crear secciones con horarios y días
4. Configurar reglas de optimización con sus prioridades
5. Llamar a `POST /api/scheduling/generate` con los IDs de las materias
6. Guardar el horario preferido con `POST /api/saved-schedules`

## Tests

```bash
# Correr todos los tests
npm run test

# Correr tests con cobertura
npm run test:cov
```

## Versionado

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) y [Release Please](https://github.com/googleapis/release-please) para el versionado automático.
