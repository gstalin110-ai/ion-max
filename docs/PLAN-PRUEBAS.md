# 🧪 Plan de Pruebas Unitarias - IÓN MAX

## 📊 Objetivo

Alcanzar 70% de cobertura de código con pruebas unitarias usando Vitest.

## 🎯 Stack de Testing

- **Framework:** Vitest
- **Test Runner:** Vitest
- **Coverage:** @vitest/coverage-v8
- **Mocking:** vi (built-in)
- **Testing Library:** @testing-library/react (opcional para componentes)

## 📁 Estructura de Tests

```
ion-max/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── supabase.test.ts
│   │   │   └── utils.test.ts
│   │   ├── services/
│   │   │   ├── wallet.test.ts
│   │   │   ├── social.test.ts
│   │   │   └── marketplace.test.ts
│   │   └── helpers/
│   │       └── validation.test.ts
│   └── setup.ts
```

## 🧪 Tests Prioritarios

### 1. Helpers de Supabase (Alta Prioridad)
**Archivo:** `src/lib/supabase/client.ts`

```typescript
describe('Supabase Client', () => {
  it('debería crear cliente con URL correcta', () => {
    // Test de inicialización
  });
  
  it('debería manejar errores de conexión', () => {
    // Test de manejo de errores
  });
});
```

### 2. Servicios de Wallet (Alta Prioridad)
**Archivo:** `src/services/wallet.ts`

```typescript
describe('Wallet Service', () => {
  it('debería procesar depósito correctamente', () => {
    // Test de processDeposit
  });
  
  it('debería procesar retiro correctamente', () => {
    // Test de processWithdrawal
  });
  
  it('debería validar balance suficiente', () => {
    // Test de validación
  });
});
```

### 3. Servicios de Marketplace (Alta Prioridad)
**Archivo:** `src/services/marketplace.ts`

```typescript
describe('Marketplace Service', () => {
  it('debería crear listing correctamente', () => {
    // Test de createListing
  });
  
  it('debería buscar listings con filtros', () => {
    // Test de searchListings
  });
  
  it('debería validar datos de listing', () => {
    // Test de validación
  });
});
```

### 4. Servicios de Social (Media Prioridad)
**Archivo:** `src/services/social.ts`

```typescript
describe('Social Service', () => {
  it('debería crear post correctamente', () => {
    // Test de createPost
  });
  
  it('debería toggle follow correctamente', () => {
    // Test de toggleFollow
  });
  
  it('debería enviar mensaje correctamente', () => {
    // Test de sendMessage
  });
});
```

### 5. Helpers de Validación (Media Prioridad)
**Archivo:** `src/lib/validation.ts` (si existe)

```typescript
describe('Validation Helpers', () => {
  it('debería validar email correctamente', () => {
    // Test de email validation
  });
  
  it('debería validar password correctamente', () => {
    // Test de password validation
  });
});
```

## 📦 Instalación

### Paso 1: Instalar dependencias
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom
```

### Paso 2: Configurar Vitest
Crear `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Paso 3: Setup file
Crear `__tests__/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### Paso 4: Actualizar package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## 🎯 Cronograma de Implementación

### Semana 1: Setup y Tests Básicos
- Día 1: Instalación y configuración de Vitest
- Día 2: Tests de helpers de Supabase
- Día 3: Tests de servicios de Wallet
- Día 4: Tests de servicios de Marketplace
- Día 5: Configurar coverage y revisar resultados

### Semana 2: Tests Avanzados
- Día 1: Tests de servicios de Social
- Día 2: Tests de helpers de validación
- Día 3: Tests de componentes UI críticos
- Día 4: Integración con CI/CD
- Día 5: Revisión final y documentación

## 📊 Métricas de Éxito

### Cobertura Objetivo
- **Total:** 70%
- **Statements:** 70%
- **Branches:** 65%
- **Functions:** 75%
- **Lines:** 70%

### Tests por Categoría
- **Helpers:** 100% (críticos)
- **Services:** 80% (alta prioridad)
- **Components:** 60% (media prioridad)
- **Utils:** 90% (alta prioridad)

## 🔧 Mocking Strategy

### Supabase Client
```typescript
vi.mock('@/src/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));
```

### Environment Variables
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
```

## 🚨 Consideraciones

### Limitaciones Actuales
- Tests de Supabase requieren mocking complejo
- Tests de componentes requieren setup adicional
- Tests de API routes requieren entorno de Node.js

### Próximos Pasos
- Considerar Playwright para E2E tests
- Considerar MSW (Mock Service Worker) para API mocking
- Considerar Storybook para componentes UI

## 📚 Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [React Testing Library](https://testing-library.com/react)
