/**
 * Sistema de IDs Humanizados
 * Converte UUIDs para IDs legíveis como: N1, N2, D1, D2, M1, etc.
 *
 * Prefixos por categoria:
 * - N: Notebook
 * - D: Desktop
 * - M: Monitor
 * - I: Impressora
 * - S: Servidor
 * - O: Outros
 */

export const categoryPrefixes: Record<string, string> = {
  notebook: 'N',
  desktop: 'D',
  monitor: 'M',
  impressora: 'I',
  servidor: 'S',
  outros: 'O',
};

// Mapa global para armazenar UUID -> ID humanizado
const uuidToHumanizedMap = new Map<string, string>();
const categoryCounters = new Map<string, number>();

/**
 * Gera um ID humanizado para um ativo
 * @param uuid - ID único do ativo
 * @param categoria - Categoria do ativo
 * @returns ID humanizado (ex: N1, D2)
 */
export function generateHumanizedId(uuid: string, categoria: string): string {
  // Se já existe, retorna o ID existente
  if (uuidToHumanizedMap.has(uuid)) {
    return uuidToHumanizedMap.get(uuid)!;
  }

  const prefix = categoryPrefixes[categoria] || 'O';
  const counter = (categoryCounters.get(prefix) || 0) + 1;
  categoryCounters.set(prefix, counter);

  const humanizedId = `${prefix}${counter}`;
  uuidToHumanizedMap.set(uuid, humanizedId);

  // Persistir no localStorage para manter entre sessões
  saveHumanizedIdMapping();

  return humanizedId;
}

/**
 * Recupera o ID humanizado de um UUID
 * @param uuid - ID único do ativo
 * @returns ID humanizado ou undefined
 */
export function getHumanizedId(uuid: string): string | undefined {
  return uuidToHumanizedMap.get(uuid);
}

/**
 * Converte UUID para ID humanizado
 * Se não existir, gera um novo
 */
export function toHumanizedId(uuid: string, categoria: string = 'outros'): string {
  const existing = getHumanizedId(uuid);
  return existing || generateHumanizedId(uuid, categoria);
}

/**
 * Converte ID humanizado para UUID
 * @param humanizedId - ID humanizado (ex: N1)
 * @returns UUID ou undefined
 */
export function toUUID(humanizedId: string): string | undefined {
  for (const [uuid, id] of uuidToHumanizedMap.entries()) {
    if (id === humanizedId) {
      return uuid;
    }
  }
  return undefined;
}

/**
 * Carrega o mapa de IDs do localStorage
 */
export function loadHumanizedIdMapping(): void {
  try {
    const stored = localStorage.getItem('humanized_ids_mapping');
    const stored_counters = localStorage.getItem('humanized_ids_counters');

    if (stored) {
      const map = JSON.parse(stored);
      uuidToHumanizedMap.clear();
      Object.entries(map).forEach(([uuid, id]) => {
        uuidToHumanizedMap.set(uuid, id as string);
      });
    }

    if (stored_counters) {
      const counters = JSON.parse(stored_counters);
      categoryCounters.clear();
      Object.entries(counters).forEach(([prefix, count]) => {
        categoryCounters.set(prefix, count as number);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar IDs humanizados:', error);
  }
}

/**
 * Salva o mapa de IDs no localStorage
 */
export function saveHumanizedIdMapping(): void {
  try {
    const mapObj = Object.fromEntries(uuidToHumanizedMap);
    const countersObj = Object.fromEntries(categoryCounters);

    localStorage.setItem('humanized_ids_mapping', JSON.stringify(mapObj));
    localStorage.setItem('humanized_ids_counters', JSON.stringify(countersObj));
  } catch (error) {
    console.error('Erro ao salvar IDs humanizados:', error);
  }
}

/**
 * Recupera todos os IDs humanizados
 */
export function getAllHumanizedIds(): Record<string, string> {
  return Object.fromEntries(uuidToHumanizedMap);
}

/**
 * Limpa todos os IDs humanizados (use com cuidado!)
 */
export function clearHumanizedIds(): void {
  uuidToHumanizedMap.clear();
  categoryCounters.clear();
  localStorage.removeItem('humanized_ids_mapping');
  localStorage.removeItem('humanized_ids_counters');
}
