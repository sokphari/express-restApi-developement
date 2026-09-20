const pool = require("../config/db");

const findUserByEmail = async (email) => {
    const result = await pool.query(
        "SELECT id, name, email, password_hash, role, login_at, created_at FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        "SELECT id, name, email, role, login_at, created_at FROM users WHERE id = $1",
        [id]
    );

    return result.rows[0];
};

const findUserByRefreshToken = async (refreshToken) => {
    const result = await pool.query(
        "SELECT id, name, email, role, login_at, created_at FROM users WHERE refresh_token = $1",
        [refreshToken]
    );

    return result.rows[0];
};

const createUser = async ({ name, email, passwordHash }) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash]
    );

    return result.rows[0];
};

const updateLoginAt = async (id) => {
    const result = await pool.query(
        `UPDATE users
         SET login_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, name, email, role, login_at, created_at`,
        [id]
    );

    return result.rows[0];
};

const updateRefreshToken = async (id, refreshToken) => {
    const result = await pool.query(
        `UPDATE users
         SET refresh_token = $1
         WHERE id = $2
         RETURNING id, name, email, role, login_at, created_at`,
        [refreshToken, id]
    );

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    findUserById,
    findUserByRefreshToken,
    createUser,
    updateLoginAt,
    updateRefreshToken,
};
