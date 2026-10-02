export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3, S3_BUCKET, getPublicUrl } from "@/lib/s3"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Только изображения разрешены" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл больше 5 МБ" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const key = `${folder}/${session.userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const url = getPublicUrl(key)

    return NextResponse.json({ url, key }, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Не удалось загрузить файл" },
      { status: 500 }
    )
  }
}