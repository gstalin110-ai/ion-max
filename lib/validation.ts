import { z } from "zod";

export const AdminFormSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  precio: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "El precio debe ser un número mayor a 0",
  }),
  imagen_url: z.string().url("Debe ser una URL válida"),
  enlace_externo: z.string().url("Debe ser una URL válida"),
  categoria: z.enum(["SHOP", "ACADEMY", "SERVICES"]),
  etiqueta: z.string().optional(),
  stock: z.string().optional().refine(
    (val) => !val || !isNaN(parseInt(val)),
    "El stock debe ser un número"
  ),
});

export const AuthSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type AdminFormSchemaType = z.infer<typeof AdminFormSchema>;
export type AuthSchemaType = z.infer<typeof AuthSchema>;
