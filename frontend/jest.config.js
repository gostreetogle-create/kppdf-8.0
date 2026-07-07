/**
 * Jest configuration for Paper & Ink UI kit (TZ-NEW).
 *
 * Stack:
 *   - jest@^29
 *   - jest-preset-angular@^14 (Angular 20 + standalone components + signals)
 *   - @testing-library/angular@^17 (DOM-centric queries + auto CD)
 *   - jest-environment-jsdom (browser-like DOM for component rendering)
 *
 * Notes:
 *   - `setupFilesAfterEnv` runs once per test file, after the test
 *     framework is installed. `setup-jest.ts` initializes zone.js
 *     and registers Angular testing utilities (TestBed init).
 *   - The `^@/(.*)$` alias mirrors `tsconfig.json` `paths` so tests
 *     can import from `@/shared/ui/...` etc. if desired.
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/app/shared/ui/$1',
    '^@/lib/(.*)$': '<rootDir>/src/app/core/$1',
    '^@/pages/(.*)$': '<rootDir>/src/app/pages/$1',
    '^@/layout/(.*)$': '<rootDir>/src/app/layout/$1',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};
