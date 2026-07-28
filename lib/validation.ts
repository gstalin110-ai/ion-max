import { z } from "zod";

export const ListingFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El precio debe ser un número mayor a 0",
  }),
  category_id: z.string().min(1, "Debes seleccionar una categoría"),
  location: z.string().optional(),
  tags: z.string().optional(),
  images: z.array(z.string().url("Debe ser una URL válida")).min(1, "Debes agregar al menos una imagen"),
});

export const AuthSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type ListingFormSchemaType = z.infer<typeof ListingFormSchema>;
export type AuthSchemaType = z.infer<typeof AuthSchema>;
export type RegisterSchemaType = z.infer<typeof RegisterSchema>;
