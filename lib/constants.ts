export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "gstalin@gmail.com"
).toLowerCase();

export function isOwnerEmail(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === OWNER_EMAIL);
}
