import { ApiProperty } from '@nestjs/swagger';

export class Phrase {
  @ApiProperty({ type: 'integer' })
  pourcent: number;
  @ApiProperty({ type: 'string' })
  phrase: string;
}
export class OnboardingDataImpactAPI {
  @ApiProperty({ type: 'integer' })
  transports: number;
  @ApiProperty({ type: 'integer' })
  consommation: number;
  @ApiProperty({ type: 'integer' })
  logement: number;
  @ApiProperty({ type: 'integer' })
  alimentation: number;

  @ApiProperty({ required: false, type: Phrase })
  phrase_1?: Phrase;
  @ApiProperty({ required: false, type: Phrase })
  phrase_2?: Phrase;
  @ApiProperty({ required: false, type: Phrase })
  phrase_3?: Phrase;
}
