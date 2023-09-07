import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class InteractionAPI {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() titre: string;
  @ApiProperty() soustitre: string;
  @ApiProperty() categorie: string;
  @ApiProperty() tags: string[];
  @ApiProperty() duree: string;
  @ApiProperty() frequence: string;
  @ApiProperty() image_url: string;
  @ApiProperty() url: string;
  @ApiProperty() seen: number;
  @ApiProperty() seen_at: Date;
  @ApiProperty() clicked: boolean;
  @ApiProperty() clicked_at: Date;
  @ApiProperty() done: boolean;
  @ApiProperty() done_at: Date;
  @ApiProperty() difficulty: number;
  @ApiProperty() points: number;
  @ApiProperty() score: Decimal;

  @ApiProperty() quizz_score: number;
  @ApiProperty() locked: boolean;
  @ApiProperty() pinned_at_position: number;
  @ApiProperty() raison_lock: string;
  @ApiProperty() scheduled_reset: Date;
  @ApiProperty() day_period: number;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
