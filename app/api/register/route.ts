import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma, prismaDirect } from "@/lib/prisma"
// import { sendVerificationEmail } from "@/lib/email"

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

    // Проверка существующего email — быстрый запрос, можно через обычный prisma
    const existingUser = await prisma.user.findUnique({
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

    // ВАЖНО: сложная транзакция (user + user_roles + providerInfo)
    // идёт через prismaDirect (Session mode, порт 5432) — не обрывается пулером
    const user = await prismaDirect.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        emailVerificationToken,
        roles: {
          create: { role },
        },
        ...(role === "provider" && {
          providerInfo: {
            create: {
              phone,
              sportTypes: [],
              moderationStatus: "pending",
            },
          },
        }),
      },
      include: { roles: true },
    })

    // Отправка письма — временно закомментируем, если нет ключа Resend
    // await sendVerificationEmail(email, emailVerificationToken)

    return NextResponse.json(
      {
        success: true,
        message: "Регистрация успешна",
        userId: user.id,
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