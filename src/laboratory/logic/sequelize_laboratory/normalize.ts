import { IBenchmark, ICandidate, ISuite, IRunRequest } from '../interfaces';

// Goals:
//   Suitable blob and file paths (eliminate most special characters)
//   Suitable for Azure table names (start with alpha, all lowercase)
//   Suiteable for bash command parameters (eliminate most special characters)
//   Eliminate risk of injection attack
//   Eliminate risk of aliasing attack
// Alpha-numeric + [.-_]
// Starts with alpha.
// Length limited
// Azure Tables: ^[A-Za-z][A-Za-z0-9]{2,62}$
export function normalizeName(name: string): string {
  const s = name.toLowerCase();
  if (!s.match(/^[a-z][a-z0-9]{2,62}$/)) {
    const message = `Invalid name format "${name}".`;
    throw new TypeError(message);
  }
  return s;
}
