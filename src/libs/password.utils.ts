export async function hashPassword(password: string) {
    return await Bun.password.hash(password)
}

export async function verifyPassword(password:string, confirmPassword: string) {
    return await Bun.password.verify(password, confirmPassword)
}