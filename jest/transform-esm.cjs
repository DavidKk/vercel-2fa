const ts = require('typescript')

/**
 * otplib 13's crypto and base32 plugins require ESM-only packages.
 * Jest 29 evaluates dependencies as CommonJS, so those packages are
 * downleveled at test time. Next's webpack build loads them as ESM.
 */
module.exports = {
  process(src, filename) {
    const output = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    })

    return { code: output.outputText }
  },
}
