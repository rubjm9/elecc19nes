import { getElectionsOrdered } from './electionOrdering';
import {
  tallyElectionVotes,
  computeTiebreakFromSorted,
  tiebreakerElectionName,
} from './electionResults';

/** Miembro mínimo para recuento y papeleta. */
export interface MemberForElectionTally {
  key: string;
  name: string;
  status: string;
  isEligible: boolean;
}

/** Elección mínima para exclusiones y recuento. */
export interface ElectionForExclusion {
  id?: string;
  name: string;
  status: 'Abierta' | 'Cerrada' | 'Prevista';
  candidates?: string[];
  positionsToElect: number;
}

export type SessionVotesMap = { [voterKey: string]: { [electionId: string]: string[] } };

/**
 * Nombres candidatos para recuento / exclusiones, alineado con la papeleta:
 * lista explícita o miembros Presente con isEligible.
 */
export function getCandidateNamesForElectionTally(
  election: Pick<ElectionForExclusion, 'candidates'>,
  members: MemberForElectionTally[]
): string[] {
  if (election.candidates && election.candidates.length > 0) {
    return [...election.candidates];
  }
  return members
    .filter((m) => m.status === 'Presente' && m.isEligible)
    .map((m) => m.name);
}

/** Misma base de miembros que la papeleta (sin filtrar por ya elegidos). */
export function getBallotBaseMembers<T extends MemberForElectionTally>(
  members: T[],
  election: Pick<ElectionForExclusion, 'candidates'>
): T[] {
  if (election.candidates && election.candidates.length > 0) {
    return members.filter((m) => election.candidates!.includes(m.name));
  }
  return members.filter((m) => m.status === 'Presente' && m.isEligible);
}

/** Papeletas de una elección emitidas por claves de miembros de la sesión. */
export function getElectionVoteArrays(
  electionId: string | undefined,
  votes: SessionVotesMap,
  sessionMembers: Pick<MemberForElectionTally, 'key'>[]
): string[][] {
  if (!electionId) return [];
  const keySet = new Set(sessionMembers.map((m) => m.key));
  return Object.entries(votes)
    .filter(([k]) => keySet.has(k))
    .map(([, uv]) => uv[electionId])
    .filter((v): v is string[] => Array.isArray(v));
}

/**
 * Nombres elegidos en una elección ya cerrada (incluye desempate cerrado si aplica).
 * Si hay empate sin desempate cerrado, solo cuenta ganadores claros del padre.
 */
export function getElectedNamesForClosedElection(
  election: ElectionForExclusion,
  votes: SessionVotesMap,
  sessionMembers: MemberForElectionTally[],
  allElections: ElectionForExclusion[]
): string[] {
  if (election.status !== 'Cerrada' || !election.id) return [];

  const candidateNames = getCandidateNamesForElectionTally(election, sessionMembers);
  const electionVotes = getElectionVoteArrays(election.id, votes, sessionMembers);
  const { sortedResults } = tallyElectionVotes(candidateNames, electionVotes);
  const { electedEntries, tiedCandidates } = computeTiebreakFromSorted(
    sortedResults,
    election.positionsToElect
  );

  const names = electedEntries.map(([n]) => n);

  if (tiedCandidates.length > 0) {
    const tbName = tiebreakerElectionName(election.name);
    const tb = allElections.find((e) => e.name === tbName);
    if (tb && tb.status === 'Cerrada') {
      names.push(...getElectedNamesForClosedElection(tb, votes, sessionMembers, allElections));
    }
  }

  return names;
}

/**
 * Nombres ya elegidos en elecciones anteriores (orden session) y cerradas,
 * respecto a la elección actual (no incluye la propia elección).
 */
export function getExcludedNamesForElection(
  session: {
    id?: string;
    elections: { [id: string]: ElectionForExclusion };
    members: MemberForElectionTally[];
    electionOrder?: string[] | null;
  },
  currentElectionId: string,
  votes: SessionVotesMap
): Set<string> {
  const ordered = getElectionsOrdered(session.elections, session.electionOrder);
  const allElections = Object.values(session.elections);
  const idx = ordered.findIndex((e) => e.id === currentElectionId);
  const excluded = new Set<string>();
  // #region agent log
  fetch('http://127.0.0.1:7762/ingest/79eb99af-09cb-4da2-85b2-df73f449f503',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f1785'},body:JSON.stringify({sessionId:'7f1785',runId:'run1',hypothesisId:'H1',location:'src/utils/sessionElectedExclusions.ts:getExcludedNamesForElection:init',message:'Computed election order and index',data:{currentElectionId,idx,electionOrder:session.electionOrder??null,ordered:ordered.map((e)=>({id:e.id,name:e.name,status:e.status,positionsToElect:e.positionsToElect,candidatesCount:Array.isArray(e.candidates)?e.candidates.length:null}))},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (idx <= 0) return excluded;

  for (let i = 0; i < idx; i++) {
    const el = ordered[i];
    if (el.status === 'Cerrada') {
      for (const n of getElectedNamesForClosedElection(el, votes, session.members, allElections)) {
        excluded.add(n);
      }
    }
  }
  // #region agent log
  fetch('http://127.0.0.1:7762/ingest/79eb99af-09cb-4da2-85b2-df73f449f503',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f1785'},body:JSON.stringify({sessionId:'7f1785',runId:'run1',hypothesisId:'H2',location:'src/utils/sessionElectedExclusions.ts:getExcludedNamesForElection:result',message:'Final excluded names set',data:{currentElectionId,excluded:[...excluded]},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return excluded;
}

export function voteSelectionsConflictWithExcluded(
  selections: string[],
  excluded: Set<string>
): boolean {
  return selections.some((s) => s !== '' && excluded.has(s));
}

/** True si alguna selección coincide con un nombre ya elegido en elecciones anteriores de la sesión. */
export function voteSelectionsConflictWithPriorSessionElected(
  session: Parameters<typeof getExcludedNamesForElection>[0],
  currentElectionId: string,
  votes: SessionVotesMap,
  selections: string[]
): boolean {
  const excluded = getExcludedNamesForElection(session, currentElectionId, votes);
  return voteSelectionsConflictWithExcluded(selections, excluded);
}
