// 用户凭证接口，注册成功后需要持久化存储
export interface UserCredentials {
  /** 凭证 ID，需要存储到服务器数据库 */
  credentialID: string
  /** 公钥数据，需要存储到服务器数据库 */
  publicKey: Uint8Array
}

export interface StoreCredentials extends UserCredentials {
  rpId: string
  username: string
}
