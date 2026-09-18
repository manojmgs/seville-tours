---
mode: agent
description: Scaffold a new React component with TypeScript, Tailwind, accessibility, and test file for SevilleTours
---

# New Component

## Context
You are creating a new React component for the SevilleTours project.
This project uses Next.js 14+ App Router, TypeScript strict mode, and Tailwind CSS.
The UI is mobile-first. The admin is primarily used on a phone.

## Inputs
- Component name: ${input:componentName}
- Purpose: ${input:purpose}
- Server or Client component: ${input:serverOrClient}
- Location: ${input:directory}

## Requirements

### Component file
- Create `${input:componentName}.tsx` in the specified directory.
- Use TypeScript with explicit props interface named `${input:componentName}Props`.
- Export the component as a named export.
- If Server Component: do not include `'use client'` directive.
- If Client Component: add `'use client'` at the top and justify why in a brief comment.
- Use Tailwind for all styling. Mobile-first.
- Use semantic HTML elements.
- Ensure all interactive elements have minimum 44x44px tap targets.
- Include proper aria attributes where needed.
- Include keyboard support for any interactive behavior.
- Keep the component focused on a single responsibility.
- Do not embed business logic, data fetching, or payment handling directly in the component.

### Props
- Define a clear TypeScript interface for props.
- Use domain-driven names aligned with SevilleTours concepts.
- Make optional props explicit with `?` and sensible defaults where appropriate.
- Avoid `any` in prop types.

### Test file
- Create `${input:componentName}.test.tsx` alongside the component.
- Import from `@testing-library/react`.
- Write at least:
  - one test that renders without crashing,
  - one test that verifies the primary visible output,
  - one test for the main interactive behavior if the component is interactive,
  - one accessibility check (label, role, or keyboard interaction).
- Use descriptive test names that explain what is being verified.
- Do not use snapshot tests unless explicitly requested.

### Output
Produce two files:
1. `${input:directory}/${input:componentName}.tsx`
2. `${input:directory}/${input:componentName}.test.tsx`

### Stop conditions
- Do not create a global state store.
- Do not add new dependencies unless absolutely necessary.
- Do not mix data fetching or payment logic into the component.
- Do not create a barrel export file unless one already exists in the directory.
