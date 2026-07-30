export const OWNER_EMAIL = (
  process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "gstalin110@gmail.com"
).toLowerCase();

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ion-max.vercel.app"
);

export function isOwnerEmail(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === OWNER_EMAIL);
}
