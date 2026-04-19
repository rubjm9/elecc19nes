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
