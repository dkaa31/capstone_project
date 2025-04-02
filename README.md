## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Package Resource
- @nestjs/commong
- @nestjs/config
- @nestjs/core
- @nestjs/jwt
- @nestjs/passport
- @nestjs/platform-express
- @nestjs/throttler
- @nestjs/client
- @nestjs/jsonwebtoken
- bcrypt
- class-transformer
- class-validator
- hbs
- jsonwebtoken
- multer
- passport
- passport-jwt
- postmark
- 

# User Spec

- id String (auto increment)
- name String
- phoneNumber String (unique)
- password String (encrypted bcrypt)
- email String (unique)
- picture String (default: default.jpeg image on server)
- status Enum (PENDING | ACTIVE | SUSPENDED) after register otp send via email
- createdAt DateTime


## Register

### Endpoint: POST <u>/users/register</u>

#### Request Body:

```json
{
    "name": "ApiiwDev",
    "email": "admin@apiiwdev.my.id",
    "phoneNumber": "085864702154",
    "password": "ApiiwDev"
}
```

#### Response (Success)

```json
{
    "data": {
        "message": "Akun berhasil dibuat, mohon masukan OTP yang sudah dikirimkan ke email Anda.",
        "statusCode": 201
    }
}
```


#### Response (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---

## Login

### Endpoint: POST <u>/users/login</u>

#### Request Body:

```json
{
    "phoneNumber": "085864702154",
    "password": "ApiiwDev"
}
```

#### Response (Success)

```json
{
    "data": {
        "message": "Login berhasil.",
        "user": {
            "userId": "3f45a2ee-5269-4176-b99e-3e24514a198f",
            "phoneNumber": "085864702154",
            "name": "Afii"
        },
        "token": "..."
    }
}
```

#### Response (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---

## Verify Account

### Endpoint: POST <u>/users/verify</u>

#### Request Body:

```json
{
    "email": "admin@apiiwdev.my.id",
    "otp": "..."
}
```

#### Response (Success)

```json
{
    "data": {
        "message": "OTP Valid.",
        "statusCode": 200
    }
}
```

#### Response (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---

## Forgot Password

### Endpoint: POST <u>/users/forgot-password</u>

#### Request Body:

```json
{
    "email": "admin@apiiwdev.my.id"
}
```

### Response (Success)

```json
{
    "data": {
        "message": "Mohon cek email: admin@apiiwdev.my.id, kode OTP berlaku 15 menit."
        "statusCode": 201
    }
}
```

### Reponse (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---

## Verify OTP (Forgot Password)

### Endpoint: POST <u>/users/upload-image-profile</u>

#### Request Body:

```json
{
    "email": "admin@apiiwdev.my.id",
    "otp": "...",
    "password": "ApiiwDevs"
}
```

### Response (Success)

```json
{
    "data": {
        "message": "Password berhasil diubah."
        "statusCode": 200
    }
}
```

### Reponse (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---


## Upload Photo Profile

### Endpoint: POST <u>/users/upload-image-profile</u>

#### Request Body:

```json
const formData = new FormData();
formData.append('file', file);
{
    "file": formdata,
    "userId": "3f45a2ee-5269-4176-b99e-3e24514a198f"
}

"headers": {
    "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` 
}
```

#### Response (Success)

```json
{
    "data": {
        "message": "Foto profil berhasil diunggah",
        "imageUrl": `/${uploadPath}`,
        "statusCode": 201,
    }
}
```

#### Reponse (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---

## Update User

### Endpoint: POST <u>/users/update-user</u>

#### Request Body:

```json
{
    "userId": "3f45a2ee-5269-4176-b99e-3e24514a198f"
}

"headers": {
    "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` 
}
```

#### Response (Success)

```json
{
    "": {
        "": "Mohon cek email: admin@apiiwdev.my.id, kode OTP Berlaku 15 Menit.",
        "statusCode": 201
    }
}
```

#### Response (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}

```

---

## Verify Update User

### Endpoint: POST <u>/users/verify-update-user</u>

#### Request Body:

```json
{
    "userId": "3f45a2ee-5269-4176-b99e-3e24514a198f",
    "otp": "...",
    "data": ".."
}

"headers": {
    "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` 
}
```

#### Response (Success)

```json
{
    "data": {
        "message": "Data berhasil diubah.",
        "statusCode": 200
    }
}
```

#### Response (Failed)

```json
{
    "error": {
        "message": "...",
        "statusCode": 400 | 500
    }
}
```

---