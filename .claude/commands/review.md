# /review Command

Comprehensive review of current codebase.

## Review Checklist

### Security
- [ ] Password gate working on all protected routes
- [ ] Cookie is httpOnly, secure in prod, sameSite=lax
- [ ] No secrets in client code
- [ ] Server actions validate input with Zod
- [ ] No SQL injection risks (Prisma parameterized)

### Mobile UX
- [ ] All features work at 390px width
- [ ] Bottom nav accessible with thumb
- [ ] FAB positioned correctly
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Bottom sheets don't overflow

### Animation Quality
- [ ] prefers-reduced-motion respected
- [ ] Animations feel snappy (not slow)
- [ ] No janky/stuttering animations
- [ ] Page transitions smooth
- [ ] List add/remove animated

### Schema Sanity
- [ ] No unnecessary tables
- [ ] JSON fields used appropriately
- [ ] Indexes on frequently queried fields
- [ ] Relationships make sense
- [ ] Migration runs cleanly
