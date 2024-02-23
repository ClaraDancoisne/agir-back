import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkyData } from '../../../src/domain/linky/linkyData';

@Injectable()
export class LinkyRepository {
  constructor(private prisma: PrismaService) {}

  async upsertData(linky_data: LinkyData): Promise<void> {
    await this.prisma.linky.upsert({
      where: {
        prm: linky_data.prm,
      },
      create: {
        prm: linky_data.prm,
        data: linky_data.serie as any,
        utilisateurId: linky_data.utilisateurId,
      },
      update: {
        data: linky_data.serie as any,
      },
    });
  }
  async getAllPRMs(): Promise<string[]> {
    const result = await this.prisma.linky.findMany({
      select: {
        prm: true,
      },
    });
    return result.map((entry) => entry['prm']);
  }

  async getByPRM(prm: string): Promise<LinkyData> {
    const result = await this.prisma.linky.findUnique({
      where: {
        prm: prm,
      },
    });
    if (result === null) {
      return null;
    }
    return new LinkyData({
      prm: result.prm,
      serie: result.data as any,
      utilisateurId: result.utilisateurId,
    });
  }
  async isPRMDataEmptyOrMissing(prm: string): Promise<boolean> {
    if (!prm) return true;

    const prm_count = await this.prisma.linky.count({
      where: {
        prm: prm,
      },
    });
    if (prm_count === 1) {
      const prm_empty = await this.prisma.linky.count({
        where: {
          prm: prm,
          data: {
            equals: [],
          },
        },
      });
      return prm_empty === 1;
    } else {
      return true;
    }
  }

  async delete(prm: string): Promise<void> {
    await this.prisma.linky.deleteMany({
      where: {
        prm: prm,
      },
    });
  }
  async deleteOfUtilisateur(utilisateurId: string): Promise<void> {
    await this.prisma.linky.deleteMany({
      where: {
        utilisateurId: utilisateurId,
      },
    });
  }

  async findWinterPKsOrphanEntries(): Promise<
    { utilisateurId: string; winter_pk: string; prm: string }[]
  > {
    const query = `
    SELECT
      "utilisateurId",
      "winter_pk",
      "prm"
    FROM
      "Linky" l
    WHERE NOT EXISTS (
      SELECT "id"
      FROM
        "Utilisateur"
      WHERE
        "id" = l."utilisateurId"
    )
    AND
      "utilisateurId" IS NOT NULL
    AND
      "winter_pk" IS NOT NULL
    ;
    `;
    const result: { utilisateurId: string; winter_pk: string; prm: string }[] =
      await this.prisma.$queryRawUnsafe(query);
    return result;
  }
}
