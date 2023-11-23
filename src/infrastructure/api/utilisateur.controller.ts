import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Response,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import {
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiOperation,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import { UtilisateurProfileAPI } from './types/utilisateur/utilisateurProfileAPI';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { HttpStatus } from '@nestjs/common';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { OubliMdpAPI } from './types/utilisateur/oubliMdpAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { ModifierMdpAPI } from './types/utilisateur/modifierMdpAPI';
import { BadgeAPI } from './types/gamification/badgeAPI';

@ApiExtraModels(CreateUtilisateurAPI, UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('Utilisateur')
export class UtilisateurController extends GenericControler {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {
    super();
  }

  @Get('utilisateurs')
  @ApiOperation({
    summary:
      "Liste l'ensemble des utilisateurs de la base, route temporaire pour debuggage - seul un admin peut y accéder",
  })
  @ApiQuery({
    name: 'nom',
    type: String,
    description: "Nom optionel de l'utilisateur",
    required: false,
  })
  @ApiOkResponse({ type: [UtilisateurAPI] })
  @UseGuards(AuthGuard)
  async listUtilisateurs(@Request() req): Promise<UtilisateurAPI[]> {
    this.checkCallerId(req, '1');
    return this.utilisateurUsecase.listUtilisateurs() as any;
  }

  @Delete('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary: "Suppression du compte d'un utilisateur d'id donnée",
  })
  @UseGuards(AuthGuard)
  async deleteUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.utilisateurUsecase.deleteUtilisateur(utilisateurId);
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary:
      "Infromation complètes concernant l'utilisateur d'id donné : profile, badges, niveaux de quizz, etc ",
  })
  @ApiOkResponse({ type: UtilisateurAPI })
  @UseGuards(AuthGuard)
  async getUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UtilisateurAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }

    return {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      code_postal: utilisateur.code_postal,
      commune: utilisateur.commune,
      revenu_fiscal: utilisateur.revenu_fiscal,
      points: utilisateur.points,
      quizzProfile: utilisateur.quizzProfile.getData(),
      created_at: utilisateur.created_at,
    };
  }
  @ApiOkResponse({ type: UtilisateurProfileAPI })
  @Get('utilisateurs/:utilisateurId/profile')
  @ApiOperation({
    summary:
      "Infromation de profile d'un utilisateur d'id donné (nom, prenom, code postal, ...)",
  })
  @UseGuards(AuthGuard)
  async getUtilisateurProfileById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UtilisateurProfileAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }
    return {
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      code_postal: utilisateur.code_postal,
      commune: utilisateur.commune,
      revenu_fiscal: utilisateur.revenu_fiscal,
    };
  }
  @Post('utilisateurs/login')
  @ApiOperation({
    summary:
      "Opération de login d'un utilisateur existant et actif, renvoi les info de l'utilisateur complètes ainsi qu'un token de sécurité pour navigation dans les APIs",
  })
  @ApiBody({
    type: LoginUtilisateurAPI,
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: "le token d'authentification" },
        utilisateur: { $ref: getSchemaPath(UtilisateurAPI) },
      },
    },
  })
  @ApiBadRequestResponse({ type: ApplicationError })
  async loginUtilisateur(
    @Body() body: LoginUtilisateurAPI,
    @Response() res,
  ): Promise<LoggedUtilisateurAPI> {
    try {
      const loggedUser = await this.utilisateurUsecase.loginUtilisateur(
        body.email,
        body.mot_de_passe,
      );
      const response: LoggedUtilisateurAPI = {
        utilisateur: {
          id: loggedUser.utilisateur.id,
          nom: loggedUser.utilisateur.nom,
          prenom: loggedUser.utilisateur.prenom,
          code_postal: loggedUser.utilisateur.code_postal,
          commune: loggedUser.utilisateur.commune,
          revenu_fiscal: loggedUser.utilisateur.revenu_fiscal,
          email: loggedUser.utilisateur.email,
          points: loggedUser.utilisateur.points,
          quizzProfile: loggedUser.utilisateur.quizzProfile.getData(),
          created_at: loggedUser.utilisateur.created_at,
          /* FIXME
          badges: loggedUser.utilisateur.badges
            ? loggedUser.utilisateur.badges.map((badge) =>
                BadgeAPI.mapBadgeToBadgeAPI(badge),
              )
            : null,        */
        },
        token: loggedUser.token,
      };
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
  }

  @Patch('utilisateurs/:utilisateurId/profile')
  @ApiOperation({
    summary:
      "Mise à jour des infos de profile (nom, prenom, code postal, ...) d'un utilisateur d'id donné",
  })
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: UtilisateurProfileAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    try {
      return await this.utilisateurUsecase.updateUtilisateurProfile(
        utilisateurId,
        body,
      );
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
  }

  @Post('utilisateurs/oubli_mot_de_passe')
  @ApiOperation({
    summary:
      "Déclenche une procédure d'oubli de mot de passe, envoi un code par mail à l'email, si le mail existe en base",
  })
  @ApiBody({
    type: OubliMdpAPI,
  })
  @ApiOkResponse({ type: RenvoyerCodeAPI })
  @ApiBadRequestResponse({ type: ApplicationError })
  async oubli_mdp(
    @Body() body: OubliMdpAPI,
    @Response() res,
  ): Promise<RenvoyerCodeAPI> {
    try {
      await this.utilisateurUsecase.oubli_mot_de_passe(body.email);
      return res.status(HttpStatus.OK).json({ email: body.email });
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
  }

  @Post('utilisateurs/modifier_mot_de_passe')
  @ApiOperation({
    summary:
      "Modifie le mod de passe d'un utilisateur en fournissant son email et le code reçu par email",
  })
  @ApiBody({
    type: ModifierMdpAPI,
  })
  @ApiBadRequestResponse({ type: ApplicationError })
  async modifier_mdp(
    @Body() body: ModifierMdpAPI,
    @Response() res,
  ): Promise<RenvoyerCodeAPI> {
    try {
      await this.utilisateurUsecase.modifier_mot_de_passe(
        body.email,
        body.code,
        body.mot_de_passe,
      );
      return res.status(HttpStatus.OK).json('OK');
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
  }
}
