import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Interaction as DBInteraction } from '@prisma/client';
import { Interaction } from '../../domain/interaction/interaction';
import { InteractionType } from 'src/domain/interaction/interactionType';

@Injectable()
export class InteractionRepository {
  constructor(private prisma: PrismaService) {}

  async getInteractionById(interactionId): Promise<Interaction | null> {
    const result = await this.prisma.interaction.findUnique({
      where: { id: interactionId },
    });
    return result ? new Interaction(result) : null;
  }

  async listMaxEligibleInteractionsByUtilisateurIdAndType(
    utilisateurId: string,
    type?: InteractionType,
    maxNumber?: number,
    pinned?: boolean,
  ): Promise<Interaction[] | null> {
    return this.prisma.interaction.findMany({
      take: maxNumber,
      where: {
        utilisateurId,
        done: false,
        succeeded: false,
        type,
        pinned_at_position: pinned ? { not: null } : null,
      },
      orderBy: [
        {
          reco_score: 'asc',
        },
      ],
    }) as Promise<Interaction[] | null>;
  }
  async partialUpdateInteraction(
    interaction: Interaction,
  ): Promise<DBInteraction | null> {
    return this.prisma.interaction.update({
      where: {
        id: interaction.id,
      },
      data: {
        ...interaction,
        updated_at: undefined, // pour forcer la mise à jour auto
      },
    });
  }

  async resetAllInteractionStatus(date: Date) {
    const result = await this.prisma.interaction.updateMany({
      where: {
        scheduled_reset: {
          lt: date,
        },
      },
      data: {
        clicked: false,
        done: false,
        succeeded: false,
        clicked_at: null,
        done_at: null,
        succeeded_at: null,
        scheduled_reset: null,
      },
    });
    return result.count;
  }
}
