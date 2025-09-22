import prisma from '../data/prisma/prismaInit.js';

export class TournamentService {
  public async createUser(name: string, email: string) {
    return prisma.user.create({ data: { name, email } });
  }

  public async createTournament(name: string, startAt: Date) {
    return prisma.tournament.create({ data: { name, startAt } });
  }

  public async addUserToTournament(userId: number, tournamentId: number) {
    return prisma.tournamentParticipant.create({
      data: { userId, tournamentId },
    });
  }

  public async generateMatches(tournamentId: number) {
    const participants = await prisma.tournamentParticipant.findMany({ where: { tournamentId } });
    const matches = [];

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const match = await prisma.match.create({
          data: {
            tournamentId,
            //@ts-ignore
            player1Id: participants[i].userId,
            //@ts-ignore
            player2Id: participants[j].userId,
          },
        });
        matches.push(match);
      }
    }
    return matches;
  }

  public async playMatch(matchId: number) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    const winnerId = Math.random() < 0.5 ? match.player1Id : match.player2Id;
    const score1 = winnerId === match.player1Id ? 1 : 0;
    const score2 = winnerId === match.player2Id ? 1 : 0;

    await prisma.matchResult.create({
      data: { matchId, winnerId, score1, score2 },
    });

    await prisma.tournamentParticipant.update({
      where: { userId_tournamentId: { userId: winnerId, tournamentId: match.tournamentId } },
      data: { score: { increment: 1 } },
    });

    return { winnerId, score1, score2 };
  }

  public async getLeaderboard(tournamentId: number) {
    return prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      orderBy: { score: 'desc' },
      include: { user: true },
    });
  }
}
