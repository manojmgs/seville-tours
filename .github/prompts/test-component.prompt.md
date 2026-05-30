---
mode: agent
description: Generate meaningful tests for an existing React component in SevilleTours
---

# Test Component

## Context
You are writing tests for an existing React component in the SevilleTours project.
Use React Testing Library. Focus on behavior-based testing, not implementation details.

## Inputs
- Component file: ${input:componentPath}
- What the component does: ${input:purpose}
- Key interactive behaviors: ${input:interactions}

## Requirements

### Test structure
- Create or update the test file alongside the component.
- Use `describe` blocks organized by behavior group.
- Use clear test names that explain what is being verified.

### Required test categories

#### Rendering
- Renders without crashing.
- Displays expected content based on props.
- Shows correct state for default props.

#### Interaction (if interactive)
- User actions produce expected visible changes.
- Form submissions trigger expected behavior.
- Disabled/loading states prevent interaction.
- Error states display appropriate messages.

#### Edge states
- Empty data.
- Maximum/minimum values.
- Missing optional props.
- Error conditions.

#### Accessibility
- Form inputs have associated labels.
- Buttons and links are accessible by role and name.
- Error messages are surfaced accessibly.
- Keyboard interaction works for key controls.

### Mocking rules
- Mock external services at boundaries (Stripe, Supabase, email, push).
- Do not mock the component's own internal logic.
- Use realistic test data with domain-meaningful names.

### Test data
- Use clear fixture names: `confirmedBooking`, `pendingRefundReview`, `luxuryTourSlot`.
- Make dates, amounts, and statuses explicit for easy debugging.

### Output
Produce the complete test file.

### Stop conditions
- Do not use snapshot tests unless explicitly requested.
- Do not test implementation details like internal state variable names.
- Do not mock away the behavior being tested.
- Do not write tests that always pass regardless of implementation.
