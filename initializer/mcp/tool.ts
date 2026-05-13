export type JsonSchema = Record<string, any>

export interface ToolInit {
  name: string
  description: string
  parameters: JsonSchema
  handler: (params: any) => Promise<any> | any
}

export class Tool {
  protected _name: string
  protected _description: string
  protected _parameters: JsonSchema
  protected _handler: (params: any) => Promise<any> | any

  public get name() {
    return this._name
  }

  public get description() {
    return this._description
  }

  public get manifest() {
    return {
      name: this.name,
      description: this.description,
      parameters: this._parameters,
    }
  }

  constructor({ name, description, parameters, handler }: ToolInit) {
    this._name = name
    this._description = description
    this._parameters = parameters
    this._handler = handler
  }

  public validateParameters(params: any) {
    if (!params || typeof params !== 'object') {
      params = {}
    }
    const required = Array.isArray(this._parameters.required) ? this._parameters.required : []
    for (const key of required) {
      if (!(key in params)) {
        return `Missing required parameter: ${key}`
      }
    }
    return true
  }

  public call(params: any) {
    return this._handler(params || {})
  }
}

export function tool(name: string, description: string, parameters: JsonSchema, handler: (params: any) => Promise<any> | any) {
  return new Tool({ name, description, parameters, handler })
}
