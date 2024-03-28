import { ApiProperty } from '@nestjs/swagger';
import { CMSTagAPI } from './CMSTagAPI';
import { CMSThematiqueAPI } from './CMSThematiqueAPI';
import { CMSWebhookImageURLAPI } from './CMSWebhookImageURLAPI';

export class CMSWebhookRubriqueAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
}
export class CMSWebhookPartenaireAPI {
  @ApiProperty() id: number;
  @ApiProperty() nom: string;
}
export class CMSWebhookEntryAPI {
  @ApiProperty() id: number;
  @ApiProperty() titre: string;
  @ApiProperty() sousTitre: string;
  @ApiProperty() description: string;
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique_gamification: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSThematiqueAPI] })
  thematiques: CMSThematiqueAPI[];
  @ApiProperty({ type: CMSThematiqueAPI })
  thematique: CMSThematiqueAPI;
  @ApiProperty({ type: [CMSTagAPI] })
  tags: CMSTagAPI[];
  @ApiProperty({ type: [CMSWebhookRubriqueAPI] })
  rubriques: CMSWebhookRubriqueAPI[];
  @ApiProperty({ type: CMSWebhookPartenaireAPI })
  partenaire: CMSWebhookPartenaireAPI;
  @ApiProperty() duree: string;
  @ApiProperty() astuces: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty() source: string;
  @ApiProperty() frequence: string;
  @ApiProperty({ type: CMSWebhookImageURLAPI }) imageUrl: CMSWebhookImageURLAPI;
  @ApiProperty() difficulty: number;
  @ApiProperty() points?: number;
  @ApiProperty() codes_postaux?: string;
  @ApiProperty() publishedAt: Date;
  @ApiProperty() url_detail_front: string;
  @ApiProperty() is_simulation: boolean;
  @ApiProperty() montantMaximum: string;
}
export type CMSWebhookPopulateAPI = {
  id: number;
  attributes: {
    titre: string;
    sousTitre: string;
    astuces: string;
    pourquoi: string;
    description: string;
    source: string;
    codes_postaux: string;
    duree: string;
    frequence: string;
    points: number;
    difficulty: number;
    publishedAt: string;
    is_simulation: boolean;
    montantMaximum: string;
    url_detail_front: string;
    thematiques: {
      data: [
        {
          id: number;
        },
      ];
    };
    tags: {
      data: [
        {
          code: string;
        },
      ];
    };
    thematique_gamification: {
      data: {
        id: number;
      };
    };
    thematique: {
      data: {
        id: number;
      };
    };

    imageUrl: {
      data: {
        attributes: {
          formats: {
            thumbnail: {
              url: string;
            };
          };
        };
      };
    };
    partenaire: {
      data: {
        attributes: {
          nom: string;
        };
      };
    };
    rubriques: {
      data: [
        {
          id: string;
          attributes: {
            titre: string;
          };
        },
      ];
    };
  };
};
