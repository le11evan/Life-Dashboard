// Thin backwards-compat re-exports. New code should import from lib/session.
export {
  createSession,
  destroySession,
  getCurrentUser,
  requireUser,
  requireAdmin,
} from "./session";

export { verifyPassword, hashPassword } from "./passwords";
