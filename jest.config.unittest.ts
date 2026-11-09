import type { Config } from '@jest/types'
import fs from 'fs'
import JSON5 from 'json5'
import path from 'path'
import { pathsToModuleNameMapper } from 'ts-jest'
import type { CompilerOptions } from 'typescript'

const tsconfigFile = path.join(__dirname, './tsconfig.json')
const tsconfigContent = fs.readFileSync(tsconfigFile, 'utf-8')
const { compilerOptions } = JSON5.parse<{ compilerOptions: CompilerOptions }>(tsconfigContent)
const tsconfigPaths = compilerOptions.paths!

const esmDependency = String.raw`(?:\.pnpm[/\\](?:@scure\+base|@noble\+hashes)@|@scure[/\\]base[/\\]|@noble[/\\]hashes[/\\])`

export default (): Config.InitialOptions => ({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts', '<rootDir>/__unitests__/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    [`node_modules[/\\\\]${esmDependency}.+\\.js$`]: '<rootDir>/jest/transform-esm.cjs',
  },
  transformIgnorePatterns: [`node_modules/(?!${esmDependency})`],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfigPaths, {
      prefix: '<rootDir>',
    }),
  },
})
