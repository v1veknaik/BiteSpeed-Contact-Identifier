# BiteSpeed Contact Identifier

This is a backend service built for BiteSpeed to identify and link customer contacts based on their email and/or phone number. The system ensures a single customer identity is maintained across multiple purchases, even when different identifiers are used.

---

## Features

- Identify customers using email and/or phoneNumber.
- Link new contact info to existing identities.
- Automatically manage primary and secondary relationships.
- Built with Node.js, Express, TypeScript, Prisma, and MySQL.

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **ORM:** Prisma
- **Database:** MySQL
- **Deployment:** Render (free hosting)

---

## API Endpoint

### POST `/identify`

Identifies or creates customer contacts based on input.

#### Request Body

```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
