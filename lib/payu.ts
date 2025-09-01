import crypto from "crypto"

export interface PayUOrderData {
  key: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  phone?: string
  surl: string
  furl: string
  hash: string
}

export function generatePayUHash(
  key: string,
  txnid: string,
  amount: string,
  productinfo: string,
  firstname: string,
  email: string,
  salt: string,
): string {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`
  return crypto.createHash("sha512").update(hashString).digest("hex")
}

export function verifyPayUResponse(
  status: string,
  key: string,
  txnid: string,
  amount: string,
  productinfo: string,
  firstname: string,
  email: string,
  salt: string,
  receivedHash: string,
): boolean {
  const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`
  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex")
  return calculatedHash === receivedHash
}

export function generateTransactionId(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
