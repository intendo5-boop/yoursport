export const runtime = "nodejs"

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prismaDirect } from "@/lib/prisma"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, phone, role } = body

    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 8 символов" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Пароли не совпадают" },
        { status: 400 }
      )
    }

    if (role !== "player" && role !== "provider") {
      return NextResponse.json(
        { error: "Некорректная роль" },
        { status: 400 }
      )
    }

    const existingUser = await prismaDirect.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже зарегистрирован" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const emailVerificationToken = crypto.randomBytes(32).toString("hex")

    // Создаём пользователя — сначала user
    const user = await prismaDirect.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        emailVerificationToken,
      },
    })

    // Создаём роль — отдельным запросом
    await prismaDirect.userRole.create({
      data: {
        userId: user.id,
        role,
      },
    })

    // Если провайдер — создаём providers_info
    if (role === "provider") {
      await prismaDirect.providerInfo.create({
        data: {
          userId: user.id,
          phone,
          sportTypes: [],
          moderationStatus: "pending",
        },
      })
    }

    // Автоматически логиним — создаём JWT-сессию
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: [role],
    })

    return NextResponse.json(
      {
        success: true,
        message: "Регистрация успешна",
        userId: user.id,
        role,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера. Попробуйте позже." },
      { status: 500 }
    )
  }
}