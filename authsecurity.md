# Auth Security Notes

## Register

The register API creates a new user account.

Endpoint:

```txt
POST /auth/register
```

Full local URL:

```txt
http://localhost:3000/auth/register
```

Example request body:

```json
{
  "name": "sokphary",
  "email": "sokphary@gmail.com",
  "password": "password"
}
```

## How Register Works

Simple flow:

```txt
User sends name, email, password
↓
Server checks that all fields exist
↓
Server checks password length
↓
Server checks if email already exists
↓
Server hashes password with bcrypt
↓
Server saves user to PostgreSQL
↓
Server returns user data without password
```

## Files

Route file:

```txt
src/routes/auth.routes.js
```

This file defines the URL:

```js
router.post("/register", authController.register);
```

Controller file:

```txt
src/controllers/auth.controller.js
```

This file handles the register logic:

```txt
validate request body
check duplicate email
hash password
create user
send response
```

Model file:

```txt
src/models/user.model.js
```

This file talks to PostgreSQL:

```txt
find user by email
create new user
```

Database schema:

```txt
src/database/schema.sql
```

This file creates the `users` table.

## Why We Hash Passwords

We never save the real password in the database.

Bad:

```txt
password
```

Good:

```txt
$2b$10$hashed_password_value_here
```

`bcrypt` changes the password into a secure hash. When the user logs in later, we compare the login password with the hash.

## Register Responses

Success:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "sokphary",
    "email": "sokphary@gmail.com",
    "role": "user",
    "created_at": "2026-09-20T..."
  }
}
```

Missing fields:

```json
{
  "message": "Name, email, and password are required"
}
```

Short password:

```json
{
  "message": "Password must be at least 6 characters"
}
```

Duplicate email:

```json
{
  "message": "Email already registered"
}
```

Server error:

```json
{
  "message": "Server error"
}
```

## Important Notes

The register API does not create JWT yet.

JWT will come in the login step later.

The register API only does this:

```txt
create user
hash password
save to database
return safe user data
```

## Login

The login API checks if a user can access the system.

Endpoint:

```txt
POST /auth/login
```

Full local URL:

```txt
http://localhost:3000/auth/login
```

Example request body:

```json
{
  "email": "sokphary@gmail.com",
  "password": "password"
}
```

## How Login Works

Simple flow:

```txt
User sends email and password
↓
Server checks that both fields exist
↓
Server finds the user by email
↓
Server compares password with bcrypt
↓
If password is correct, server updates login_at
↓
Server creates JWT access token
↓
Server returns safe user data
```

## What login_at Means

`login_at` stores the latest successful login time.

Before the user logs in:

```txt
login_at = null
```

After successful login:

```txt
login_at = current database time
```

This helps us know when the user last accessed the system.

## Login Responses

Success:

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "sokphary",
    "email": "sokphary@gmail.com",
    "role": "user",
    "login_at": "2026-09-20T...",
    "created_at": "2026-09-20T..."
  }
}
```

Missing fields:

```json
{
  "message": "Email and password are required"
}
```

Wrong email or password:

```json
{
  "message": "Invalid email or password"
}
```

The login API does not create JWT yet.

## JWT Creation

JWT means JSON Web Token.

After login success, the server creates an access token.

Simple meaning:

```txt
The token proves this user already logged in.
```

The token includes safe user data:

```txt
id
email
role
```

The token does not include the password.

Login success response now includes `accessToken`:

```json
{
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "sokphary",
    "email": "sokphary@gmail.com",
    "role": "user",
    "login_at": "2026-09-20T...",
    "created_at": "2026-09-20T..."
  }
}
```

The JWT helper file is:

```txt
src/utils/jwt.js
```

The login controller calls:

```js
const accessToken = createAccessToken(loggedInUser);
```

## JWT Secret

JWT needs a secret key.

In development, the code has a fallback secret.

For real production, add this to `.env`:

```env
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=1h
```

Never share `JWT_SECRET`.

Next step after JWT creation:

```txt
JWT middleware
```

## JWT Middleware

JWT middleware protects routes.

Simple meaning:

```txt
No token = no access
Wrong token = no access
Expired token = no access
Valid token = access allowed
```

The middleware file is:

```txt
src/middlewares/auth.middleware.js
```

It reads this header:

```txt
Authorization: Bearer your_access_token_here
```

Then it verifies the token.

If the token is valid, it stores the token data here:

```js
req.user
```

That means protected routes can know:

```txt
req.user.id
req.user.email
req.user.role
```

## Protected Profile Test

Test route:

```txt
GET /profile
```

Full local URL:

```txt
http://localhost:3000/profile
```

In Postman, add this header:

```txt
Authorization: Bearer your_access_token_here
```

Success response:

```json
{
  "message": "Protected profile access granted",
  "user": {
    "id": 1,
    "email": "sokphary@gmail.com",
    "role": "user",
    "iat": 1789910000,
    "exp": 1789913600
  }
}
```

Missing token response:

```json
{
  "message": "Access token is required"
}
```

Invalid token response:

```json
{
  "message": "Invalid or expired token"
}
```

## Protected Routes

Protected routes need a valid JWT before the user can access them.

Real protected auth route:

```txt
GET /auth/me
```

Full local URL:

```txt
http://localhost:3000/auth/me
```

This route returns the current logged-in user.

Simple flow:

```txt
User sends accessToken in Authorization header
↓
JWT middleware checks token
↓
Controller reads req.user.id
↓
Model finds user in database
↓
Server returns current user data
```

In Postman, add this header:

```txt
Authorization: Bearer your_access_token_here
```

Success response:

```json
{
  "message": "Current user fetched successfully",
  "user": {
    "id": 1,
    "name": "sokphary",
    "email": "sokphary@gmail.com",
    "role": "user",
    "login_at": "2026-09-20T...",
    "created_at": "2026-09-20T..."
  }
}
```

This is different from `/profile`.

`/profile` shows the decoded token data.

`/auth/me` gets fresh user data from PostgreSQL.

Next step:

```txt
Role-based authorization
```

## Role-Based Authorization

Role-based authorization checks what type of user can access a route.

This project uses 3 roles:

```txt
user
manager
admin
```

Simple meaning:

```txt
user = normal account
manager = can access manager routes
admin = can access everything we allow for admin
```

The role middleware file is:

```txt
src/middlewares/role.middleware.js
```

It works after JWT middleware.

Simple flow:

```txt
JWT middleware checks token
↓
JWT middleware creates req.user
↓
Role middleware checks req.user.role
↓
If role is allowed, continue
↓
If role is not allowed, block access
```

Admin-only route:

```txt
GET /admin/dashboard
```

Allowed:

```txt
admin
```

Manager route:

```txt
GET /manager/dashboard
```

Allowed:

```txt
manager
admin
```

Postman header:

```txt
Authorization: Bearer your_access_token_here
```

No permission response:

```json
{
  "message": "You do not have permission"
}
```

Example code:

```js
authorizeRoles("admin")
```

```js
authorizeRoles("manager", "admin")
```

To test admin or manager, change the user's role in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'sokphary@gmail.com';
```

or:

```sql
UPDATE users SET role = 'manager' WHERE email = 'sokphary@gmail.com';
```

After changing role, login again to get a new token with the new role.

Next step:

```txt
Refresh tokens
```

## Refresh Tokens

Refresh tokens help the user get a new access token without logging in again.

Simple meaning:

```txt
accessToken = short life, used to access protected routes
refreshToken = longer life, used to create a new accessToken
```

This project stores one refresh token per user in PostgreSQL.

Database field:

```txt
users.refresh_token
```

## Login With Refresh Token

After login success, the response includes both tokens:

```json
{
  "message": "Login successful",
  "accessToken": "short_token_here",
  "refreshToken": "long_token_here",
  "user": {
    "id": 1,
    "name": "sokphary",
    "email": "sokphary@gmail.com",
    "role": "user"
  }
}
```

Simple flow:

```txt
User logs in
↓
Server creates accessToken
↓
Server creates refreshToken
↓
Server saves refreshToken in database
↓
Server returns both tokens
```

## Refresh Access Token

Endpoint:

```txt
POST /auth/refresh
```

Full local URL:

```txt
http://localhost:3000/auth/refresh
```

Request body:

```json
{
  "refreshToken": "your_refresh_token_here"
}
```

Success response:

```json
{
  "message": "Access token refreshed successfully",
  "accessToken": "new_access_token_here"
}
```

Simple flow:

```txt
User sends refreshToken
↓
Server verifies refreshToken
↓
Server checks refreshToken exists in database
↓
Server creates new accessToken
```

## Logout

Endpoint:

```txt
POST /auth/logout
```

Full local URL:

```txt
http://localhost:3000/auth/logout
```

Postman header:

```txt
Authorization: Bearer your_access_token_here
```

Success response:

```json
{
  "message": "Logout successful"
}
```

Simple flow:

```txt
User sends accessToken
↓
JWT middleware checks token
↓
Server removes refreshToken from database
↓
Old refreshToken cannot create new accessToken
```

## Refresh Token Environment

For real production, add this to `.env`:

```env
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
```

Never share `JWT_REFRESH_SECRET`.

Next step:

```txt
Secure cookies / production hardening
```
