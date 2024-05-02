import db from "./db";



export default function CreateUser(email, passsword) {
    const result = db
        .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
        .run(email, passsword)
    return result.lastInsertRowid;
}

export function getUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}