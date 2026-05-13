interface McpError {
  [key: string]: {
    code: string
    message: string
  }
}

export const MCP_ERRORS = {
  INVALID_ARGUMENT: {
    code: 'INVALID_ARGUMENT',
    message: 'The provided arguments are invalid or missing required fields.',
  },
  TOOL_NOT_FOUND: {
    code: 'TOOL_NOT_FOUND',
    message: 'The requested tool does not exist or is not registered.',
  },
  METHOD_NOT_ALLOWED: {
    code: 'METHOD_NOT_ALLOWED',
    message: 'The request method is not allowed. Please use the correct HTTP method.',
  },
} as const satisfies McpError
