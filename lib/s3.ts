import { S3Client } from "@aws-sdk/client-s3"

const endpoint = process.env.YANDEX_S3_ENDPOINT!
const region = process.env.YANDEX_S3_REGION!
const accessKeyId = process.env.YANDEX_S3_ACCESS_KEY_ID!
const secretAccessKey = process.env.YANDEX_S3_SECRET_ACCESS_KEY!

if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing Yandex S3 env vars")
}

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

export const S3_BUCKET = process.env.YANDEX_S3_BUCKET!

export function getPublicUrl(key: string) {
  return `${endpoint}/${S3_BUCKET}/${key}`
}