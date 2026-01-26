# /ship Command

Deployment checklist and verification.

## Pre-Deploy Checklist

### Local Verification
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] App works locally end-to-end
- [ ] Mobile view tested (dev tools)

### Environment Variables
Required for production:
- `DATABASE_URL` - Postgres connection string
- `APP_PASSWORD` - Single user password
- `NODE_ENV=production`

### Vercel Setup
- [ ] Project connected to repo
- [ ] Environment variables set
- [ ] Postgres database provisioned
- [ ] Build command: `prisma generate && next build`

### Post-Deploy Verification
- [ ] Site loads at production URL
- [ ] Login gate works
- [ ] Can create/read/update data
- [ ] Mobile nav works
- [ ] No console errors

### README Update
- [ ] Setup instructions current
- [ ] Env vars documented
- [ ] Development commands listed
