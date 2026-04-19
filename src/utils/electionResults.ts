import { getVoteText } from './index';

export type RankedEntry = [string, number];

export interface ElectionTally {
  sortedResults: RankedEntry[];
  maxVotes: number;
}

export interface TiebreakComputation {
  electedEntries: RankedEntry[];
  tiedCandidates: string[];
  tiebreakerPositions: number;
  tiedVoteCount: number;
}

/** Recuento por apariciones en papeletas (misma regla que la UI histórica). */
export function tallyElectionVotes(
  candidatesForResults: string[],
  electionVotes: string[][]
): ElectionTally {
  const results: { [name: string]: number } = {};
  candidatesForResults.forEach((name) => {
    results[name] = 0;
  });
  electionVotes.forEach((voteList) => {
    if (!Array.isArray(voteList)) return;
    voteList.forEach((name: string) => {
      if (Object.prototype.hasOwnProperty.call(results, name)) results[name]++;
    });
  });
  const sortedResults = Object.entries(results).sort(([, a], [, b]) => b - a) as RankedEntry[];
  const maxVotes = sortedResults.length > 0 ? sortedResults[0][1] : 0;
  return { sortedResults, maxVotes };
}

/** Corte en el puesto N y detección de empate en la última plaza a cubrir. */
export function computeTiebreakFromSorted(
  sortedResults: RankedEntry[],
  positionsToElect: number
): TiebreakComputation {
  const n = Math.max(1, Math.floor(Number(positionsToElect)) || 1);
  const empty: TiebreakComputation = {
    electedEntries: [],
    tiedCandidates: [],
    tiebreakerPositions: 0,
    tiedVoteCount: 0,
  };

  if (sortedResults.length === 0) return empty;

  if (sortedResults.length <= n) {
    return {
      electedEntries: sortedResults.map(([name, count]) => [name, count]),
      tiedCandidates: [],
      tiebreakerPositions: 0,
      tiedVoteCount: 0,
    };
  }

  const cutoffCount = sortedResults[n - 1][1];
  const clearWinners = sortedResults.filter(([, c]) => c > cutoffCount);
  const tiedAtCutoff = sortedResults.filter(([, c]) => c === cutoffCount);
  const positionsRemaining = n - clearWinners.length;
  const needTiebreaker = tiedAtCutoff.length > positionsRemaining;
  if (needTiebreaker) {
    return {
      electedEntries: clearWinners.map(([name, count]) => [name, count]),
      tiedCandidates: tiedAtCutoff.map(([name]) => name),
      tiebreakerPositions: positionsRemaining,
      tiedVoteCount: cutoffCount,
    };
  }
  return {
    electedEntries: sortedResults.slice(0, n).map(([name, count]) => [name, count]),
    tiedCandidates: [],
    tiebreakerPositions: 0,
    tiedVoteCount: 0,
  };
}

export function electedSummaryText(electedEntries: RankedEntry[]): string {
  return electedEntries.map(([name, count]) => `${name} (${getVoteText(count)})`).join(', ');
}

export function tiebreakerElectionName(parentElectionName: string): string {
  return `Desempate: ${parentElectionName}`;
}
