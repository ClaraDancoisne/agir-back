import {
  Controller,
  Get,
  Headers,
  Res,
  HttpStatus,
  Request,
  Query,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { Response } from 'express';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { WinterListeSubAPI } from './types/winter/WinterListeSubAPI';
import { LinkyDataAPI, LinkyDataDetailAPI } from './types/service/linkyDataAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Linky')
export class LinkyController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
  }

  @Get('/utilisateurs/:utilisateurId/linky')
  @ApiOperation({
    summary: `renvoie les données linky de utilisateur`,
  })
  @ApiQuery({
    name: 'detail',
    enum: LinkyDataDetailAPI,
    required: false,
  })
  @ApiQuery({
    name: 'nombre',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'compare_annees',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'derniers_14_jours',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'end_date',
    type: Date,
    required: false,
  })
  @ApiOkResponse({ type: [LinkyDataAPI] })
  @UseGuards(AuthGuard)
  async getData(
    @Request() req,
    @Res() res: Response,
    @Param('utilisateurId') utilisateurId: string,
    @Query('detail') detail?: LinkyDataDetailAPI,
    @Query('nombre') nombre?: number,
    @Query('compare_annees') compare_annees?: string,
    @Query('end_date') end_date?: string,
    @Query('derniers_14_jours') derniers_14_jours?: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    const data = await this.linkyUsecase.getUserData(
      utilisateurId,
      detail,
      nombre,
      end_date,
      compare_annees === 'true',
      derniers_14_jours === 'true',
    );
    const result = LinkyDataAPI.map(data.data.serie, data.commentaires);

    res.status(HttpStatus.OK).json(result).send();
  }
}
