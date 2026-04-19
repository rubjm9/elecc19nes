import { describe, it, expect } from 'vitest';
import { tiebreakerElectionName } from './electionResults';
import {
  getExcludedNamesForElection,
  getElectedNamesForClosedElection,
  getCandidateNamesForElectionTally,
} from './sessionElectedExclusions';
import type { ElectionForExclusion, MemberForElectionTally, SessionVotesMap } from './sessionElectedExclusions';

function member(partial: Partial<MemberForElectionTally> & Pick<MemberForElectionTally, 'key' | 'name'>): MemberForElectionTally {
  return {
    status: 'Presente',
    isEligible: true,
    ...partial,
  };
}

describe('getCandidateNamesForElectionTally', () => {
  it('usa lista explícita si existe', () => {
    const m = [member({ key: '1', name: 'Ana' }), member({ key: '2', name: 'Bea' })];
    const e: ElectionForExclusion = {
      id: 'x',
      name: 'E',
      status: 'Abierta',
      positionsToElect: 1,
      candidates: ['Ana'],
    };
    expect(getCandidateNamesForElectionTally(e, m)).toEqual(['Ana']);
  });

  it('sin lista explícita usa Presente e isEligible', () => {
    const m = [
      member({ key: '1', name: 'Ana' }),
      member({ key: '2', name: 'Bea', isEligible: false }),
      member({ key: '3', name: 'Cid', status: 'Invitado' }),
    ];
    const e: ElectionForExclusion = { id: 'x', name: 'E', status: 'Abierta', positionsToElect: 1 };
    expect(getCandidateNamesForElectionTally(e, m)).toEqual(['Ana']);
  });
});

describe('getExcludedNamesForElection', () => {
  it('excluye ganadores de elecciones anteriores cerradas en el orden de sesión', () => {
    const members = [
      member({ key: 'k1', name: 'Candidato 3' }),
      member({ key: 'k2', name: 'Candidato 8' }),
      member({ key: 'k3', name: 'Otro' }),
    ];
    const e1: ElectionForExclusion = {
      id: 'elec1',
      name: 'Primera',
      status: 'Cerrada',
      positionsToElect: 1,
    };
    const e2: ElectionForExclusion = {
      id: 'elec2',
      name: 'Segunda',
      status: 'Abierta',
      positionsToElect: 1,
    };
    const session = {
      elections: { elec1: e1, elec2: e2 } as { [id: string]: ElectionForExclusion },
      members,
      electionOrder: ['elec1', 'elec2'],
    };
    const votes: SessionVotesMap = {
      k1: { elec1: ['Candidato 3'] },
      k2: { elec1: ['Candidato 3'] },
      k3: { elec1: ['Candidato 3'] },
    };
    const ex = getExcludedNamesForElection(session, 'elec2', votes);
    expect(ex.has('Candidato 3')).toBe(true);
    expect(ex.has('Candidato 8')).toBe(false);
  });

  it('acumula varias elecciones cerradas anteriores', () => {
    const members = [
      member({ key: 'a', name: 'Uno' }),
      member({ key: 'b', name: 'Dos' }),
      member({ key: 'c', name: 'Tres' }),
    ];
    const e1: ElectionForExclusion = { id: 'e1', name: 'A', status: 'Cerrada', positionsToElect: 1 };
    const e2: ElectionForExclusion = { id: 'e2', name: 'B', status: 'Cerrada', positionsToElect: 1 };
    const e3: ElectionForExclusion = { id: 'e3', name: 'C', status: 'Abierta', positionsToElect: 1 };
    const session = {
      elections: { e1, e2, e3 },
      members,
      electionOrder: ['e1', 'e2', 'e3'],
    };
    const votes: SessionVotesMap = {
      a: { e1: ['Uno'], e2: ['Dos'] },
      b: { e1: ['Uno'], e2: ['Dos'] },
      c: { e1: ['Uno'], e2: ['Dos'] },
    };
    const ex = getExcludedNamesForElection(session, 'e3', votes);
    expect([...ex].sort()).toEqual(['Dos', 'Uno']);
  });

  it('respeta electionOrder: una elección posterior en el orden no excluye a la anterior', () => {
    const members = [member({ key: 'x', name: 'Solo' })];
    const e1: ElectionForExclusion = { id: 'e1', name: 'Primera', status: 'Cerrada', positionsToElect: 1 };
    const e2: ElectionForExclusion = { id: 'e2', name: 'Segunda', status: 'Cerrada', positionsToElect: 1 };
    const session = {
      elections: { e1, e2 },
      members,
      electionOrder: ['e2', 'e1'],
    };
    const votes: SessionVotesMap = {
      x: { e1: ['Solo'], e2: ['Solo'] },
    };
    const exForE1 = getExcludedNamesForElection(session, 'e1', votes);
    expect(exForE1.has('Solo')).toBe(true);
    const exForE2 = getExcludedNamesForElection(session, 'e2', votes);
    expect(exForE2.size).toBe(0);
  });
});

describe('getElectedNamesForClosedElection con desempate', () => {
  it('incluye al ganador del desempate cuando el padre quedó en empate', () => {
    const parentName = 'Elección principal';
    const tbName = tiebreakerElectionName(parentName);
    const members = [
      member({ key: '1', name: 'A' }),
      member({ key: '2', name: 'B' }),
    ];
    const parent: ElectionForExclusion = {
      id: 'parent',
      name: parentName,
      status: 'Cerrada',
      positionsToElect: 1,
    };
    const tb: ElectionForExclusion = {
      id: 'tb',
      name: tbName,
      status: 'Cerrada',
      positionsToElect: 1,
      candidates: ['A', 'B'],
    };
    const allElections = [parent, tb];
    const votes: SessionVotesMap = {
      '1': { parent: ['A'], tb: ['B'] },
      '2': { parent: ['B'], tb: ['B'] },
    };
    const names = getElectedNamesForClosedElection(parent, votes, members, allElections);
    expect(names).toContain('B');
  });
});
