

// Generar clave única de 5 caracteres
export const generateKey = (): string => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

// Generar ID único para elementos
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}${Date.now()}`;
};

// Formatear texto para mostrar
export const formatDisplayText = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Validar formato de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Limpiar y validar lista de miembros
export const parseMembersList = (membersList: string): { memberData: Array<{ name: string; email: string | null }>; duplicates: string[] } => {
  const names = new Set<string>();
  let duplicates: string[] = [];
  
  const memberData = membersList
    .split('\n')
    .filter((line: string) => line.trim() !== '')
    .map((line: string) => {
      const parts = line.split(',').map((p: string) => p.trim());
      const name = parts[0];
      
      if (names.has(name.toLowerCase())) {
        duplicates.push(name);
        return null;
      }
      
      names.add(name.toLowerCase());
      return { 
        name, 
        email: parts.length > 1 ? parts[1] : null
      };
    })
    .filter(Boolean) as Array<{ name: string; email: string | null }>;
  
  return { memberData, duplicates };
};

// Calcular progreso de votación
export const calculateVoteProgress = (votesCount: number, totalVoters: number): number => {
  if (totalVoters === 0) return 0;
  return Math.round((votesCount / totalVoters) * 100);
};

// Obtener texto de voto
export const getVoteText = (count: number): string => {
  return count === 1 ? '1 voto' : `${count} votos`;
};

// Obtener color de estado
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Abierta':
      return 'bg-green-100 text-green-800';
    case 'Cerrada':
      return 'bg-red-100 text-red-800';
    case 'Prevista':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

/** Ordenar elecciones: por electionOrder si existe, sino por createdAt (cronológico). */
export const getElectionsOrdered = <T extends { id?: string; createdAt?: { toMillis?: () => number } }>(
  elections: { [key: string]: T },
  electionOrder?: string[] | null
): T[] => {
  const list = Object.values(elections);
  if (!list.length) return [];
  if (electionOrder && electionOrder.length > 0) {
    const orderSet = new Set(electionOrder);
    const byOrder: T[] = [];
    electionOrder.forEach((id) => {
      if (elections[id]) byOrder.push(elections[id]);
    });
    const rest = list.filter((e) => !orderSet.has(e.id || ''));
    const byCreated = rest.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return ta - tb;
    });
    return [...byOrder, ...byCreated];
  }
  return list.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return ta - tb;
  });
};

// Validar selecciones de voto
export const validateVoteSelections = (selections: string[]): { isValid: boolean; error?: string } => {
  if (selections.some((s: string) => s === '')) {
    return { 
      isValid: false, 
      error: 'Debes seleccionar un candidato para cada puesto.' 
    };
  }
  
  const uniqueSelections = new Set(selections.filter((s: string) => s !== ''));
  if (uniqueSelections.size !== selections.filter((s: string) => s !== '').length) {
    return { 
      isValid: false, 
      error: 'No puedes votar por la misma persona más de una vez.' 
    };
  }
  
  return { isValid: true };
};
