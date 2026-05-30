---
mode: agent
description: Scaffold a new Next.js API route handler with input validation, auth, error handling, and types for SevilleTours
---

# New API Route

## Context
You are creating a new API route handler for the SevilleTours project.
This project uses Next.js 14+ App Router route handlers, Supabase for auth and data, and Zod for input validation.

## Inputs
- Route path: ${input:routePath}
- HTTP method: ${input:method}
- Purpose: ${input:purpose}
- Auth required: ${input:authRequired}
- Admin only: ${input:adminOnly}

## Requirements

### Route handler file
- Create `route.ts` at `app/api/${input:routePath}/route.ts`.
- Export an async function named after the HTTP method (GET, POST, PATCH, DELETE).
- Keep the handler thin: validate input, check auth, call service/domain logic, return response.

### Input validation
- Define a Zod schema for request body or query params.
- Parse and validate input at the start of the handler.
- Return 400 with clear error message on validation failure.
- Never trust client-submitted money values, booking states, or role claims.

### Auth and authorization
- If auth required: verify Supabase session from request.
- If admin only: verify user role from profiles table.
- Return 401 for unauthenticated requests.
- Return 403 for unauthorized requests.
- Never bypass auth for convenience.

### Response shape
- Return consistent JSON shapes.
- Success: `{ data: ... }` with appropriate status code.
- Error: `{ error: { message: string, code?: string } }` with appropriate status code.
- Use explicit HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 500.

### Error handling
- Wrap handler body in try/catch.
- Log errors server-side with enough context for debugging.
- Do not expose internal error details to the client.
- Return 500 for unexpected errors with a safe generic message.

### Types
- Create or update a types file if the route introduces new request/response shapes.
- Keep types aligned with the domain model.

### Test file
- Create `route.test.ts` alongside the route.
- Test at least:
  - successful request with valid input,
  - validation failure with invalid input,
  - auth failure when unauthenticated (if auth required),
  - authorization failure for wrong role (if admin only).
- Mock Supabase client and any external services at boundaries.

### Output
Produce:
1. `app/api/${input:routePath}/route.ts`
2. `app/api/${input:routePath}/route.test.ts`
3. Types file update if needed.

### Stop conditions
- Do not embed UI rendering in route handlers.
- Do not call Stripe directly from the route without going through a payment service layer.
- Do not bypass validation or auth.
- Do not return raw database errors to the client.
