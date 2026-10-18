export function validateUserId(userId: string): string | null {
  if (userId.length === 0 || userId.length > 120) {
    return "O userId deve ter entre 1 e 120 caracteres.";
  }
  return null;
}

export function validateUserName(
  name: string,
  required = false,
): string | null {
  if (required && name.length === 0) {
    return "O nome deve ter entre 1 e 120 caracteres.";
  }
  if (name.length > 120) {
    return "O nome deve ter no máximo 120 caracteres.";
  }
  return null;
}
// Regras pequenas e iguais para validar userId e nome em várias rotas.
