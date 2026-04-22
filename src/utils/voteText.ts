/** Texto de recuento de votos (UI y resúmenes). */
export const getVoteText = (count: number): string => {
  return count === 1 ? '1 voto' : `${count} votos`;
};
