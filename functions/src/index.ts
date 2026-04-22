/**
 * Tras escribir un voto, comprueba exclusiones por elegidos en elecciones anteriores de la sesión.
 * Si el voto incumple la regla, elimina el documento (compensación; el cliente ya debía validar).
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import {
  voteSelectionsConflictWithPriorSessionElected,
} from '../../src/utils/sessionElectedExclusions';
import type {
  ElectionForExclusion,
  MemberForElectionTally,
  SessionVotesMap,
} from '../../src/utils/sessionElectedExclusions';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

function toMillis(createdAt: unknown): number {
  if (createdAt instanceof Timestamp) return createdAt.toMillis();
  if (
    createdAt &&
    typeof createdAt === 'object' &&
    'toMillis' in createdAt &&
    typeof (createdAt as { toMillis: () => number }).toMillis === 'function'
  ) {
    return (createdAt as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export const enforceSessionElectedVoteExclusions = onDocumentWritten(
  { document: 'votes/{voteId}', region: 'europe-west1' },
  async (event) => {
    const afterSnap = event.data?.after;
    if (!afterSnap?.exists) return;

    const vote = afterSnap.data() as {
      voterKey?: string;
      electionId?: string;
      sessionId?: string;
      selections?: string[];
    };

    const { electionId, sessionId, selections } = vote;
    if (!electionId || !sessionId || !Array.isArray(selections)) {
      logger.warn('Voto sin electionId, sessionId o selections; no se valida exclusión.', {
        voteId: afterSnap.id,
      });
      return;
    }

    try {
      const [sessionSnap, electionsSnap, membersSnap, votesSnap] = await Promise.all([
        db.collection('sessions').doc(sessionId).get(),
        db.collection('elections').where('sessionId', '==', sessionId).get(),
        db.collection('members').where('sessionId', '==', sessionId).get(),
        db.collection('votes').where('sessionId', '==', sessionId).get(),
      ]);

      const sessionData = sessionSnap.exists ? sessionSnap.data() : {};
      const electionOrder = (sessionData?.electionOrder as string[] | undefined) ?? null;

      const elections: { [id: string]: ElectionForExclusion } = {};
      electionsSnap.forEach((doc) => {
        const d = doc.data() as {
          name: string;
          status: ElectionForExclusion['status'];
          candidates?: string[];
          positionsToElect: number;
          createdAt?: unknown;
        };
        elections[doc.id] = {
          id: doc.id,
          name: d.name,
          status: d.status,
          candidates: d.candidates,
          positionsToElect: d.positionsToElect,
          createdAt: { toMillis: () => toMillis(d.createdAt) },
        };
      });

      const members: MemberForElectionTally[] = [];
      membersSnap.forEach((doc) => {
        const m = doc.data() as {
          key: string;
          name: string;
          status: string;
          isEligible: boolean;
        };
        members.push({
          key: m.key,
          name: m.name,
          status: m.status,
          isEligible: Boolean(m.isEligible),
        });
      });

      const votes: SessionVotesMap = {};
      votesSnap.forEach((doc) => {
        const v = doc.data() as {
          voterKey: string;
          electionId: string;
          selections: string[];
        };
        if (!votes[v.voterKey]) votes[v.voterKey] = {};
        votes[v.voterKey][v.electionId] = v.selections;
      });

      const conflict = voteSelectionsConflictWithPriorSessionElected(
        {
          id: sessionId,
          elections,
          members,
          electionOrder,
        },
        electionId,
        votes,
        selections
      );

      if (conflict) {
        await afterSnap.ref.delete();
        logger.warn('Voto eliminado: selección incluye persona ya elegida en la sesión.', {
          voteId: afterSnap.id,
          sessionId,
          electionId,
        });
      }
    } catch (err) {
      logger.error('Error validando exclusiones de voto', err, { voteId: afterSnap.id });
    }
  }
);
