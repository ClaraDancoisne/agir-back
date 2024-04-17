import { Controller, Param, Post, Request } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { CMSUsecase } from '../../../src/usecase/cms.usecase';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { GenericControler } from './genericControler';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';
import { ReferentielUsecase } from '../../../src/usecase/referentiel/referentiel.usecase';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';
import { ContactUsecase } from '../../usecase/contact.usecase';
import { UtilisateurUsecase } from '../../../src/usecase/utilisateur.usecase';

@Controller()
@ApiTags('Admin')
export class AdminController extends GenericControler {
  constructor(
    private migrationUsecase: MigrationUsecase,
    private utilisateurUsecase: UtilisateurUsecase,
    private serviceUsecase: ServiceUsecase,
    private linkyUsecase: LinkyUsecase,
    private cmsUsecase: CMSUsecase,
    private referentielUsecase: ReferentielUsecase,
    private todoUsecase: TodoUsecase,
    private contactUsecase: ContactUsecase,
  ) {
    super();
  }

  @Post('services/refresh_dynamic_data')
  @ApiOkResponse({ type: [String] })
  async refreshServiceDynamicData(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.serviceUsecase.refreshScheduledServices();
  }

  @Post('services/process_async_service')
  @ApiOkResponse({ type: [String] })
  async processAsyncService(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.serviceUsecase.processAsyncServices();
  }

  @Post('services/clean_linky_data')
  @ApiOkResponse({ type: Object })
  async cleanLinkyData(@Request() req): Promise<object> {
    this.checkCronAPIProtectedEndpoint(req);
    const result = await this.linkyUsecase.cleanLinkyData();

    return { result: `Cleaned ${result} PRMs` };
  }

  @Post('/admin/load_articles_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les articles publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSArticles(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadArticlesFromCMS();
  }
  @Post('/admin/load_defi_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les défis publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSDefis(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadDefisFromCMS();
  }

  @Post('/admin/load_quizzes_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les quizz publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSquizzes(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadQuizzFromCMS();
  }

  @Post('/admin/load_aides_from_cms')
  @ApiOperation({
    summary: 'Upsert toures les aides publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSaides(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadAidesFromCMS();
  }

  @Post('/admin/upsert_service_definitions')
  @ApiOperation({
    summary:
      'Upsert toutes les définitions de services à partir du fichier service_catalogue.ts',
  })
  async upsertAllServices(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.referentielUsecase.upsertServicesDefinitions();
  }

  @Post('/admin/migrate_users')
  @ApiOperation({
    summary: `monte la version de tous les utlisateurs éligibles à migration jusqu'à la version cible courante de l'application`,
  })
  @ApiOkResponse({ type: [UserMigrationReportAPI] })
  async migrateUsers(@Request() req): Promise<UserMigrationReportAPI[]> {
    this.checkCronAPIProtectedEndpoint(req);
    const result = await this.migrationUsecase.migrateUsers();
    return result.map((elem) => UserMigrationReportAPI.mapToAPI(elem));
  }
  @Post('/admin/lock_user_migration')
  @ApiOperation({
    summary: `Bloque la capacité de migrer des utilisateurs, pour des besoins de tests contrôlés`,
  })
  async lockUsers(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    await this.migrationUsecase.lockUserMigration();
  }
  @Post('/admin/unlock_user_migration')
  @ApiOperation({
    summary: `Active la capacité de migrer des utilisateurs`,
  })
  async unlockUsers(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    await this.migrationUsecase.unlockUserMigration();
  }

  @Post('/admin/unsubscribe_oprhan_prms')
  @ApiOperation({
    summary: `Dé inscrit les prms orphelins (suite à suppression de comptes)`,
  })
  async unsubscribe_oprhan_prms(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.linkyUsecase.unsubscribeOrphanPRMs();
  }

  @Post('/admin/upgrade_user_todo')
  @ApiOperation({
    summary: `enrichit la TODO des utilisateurs si besoin`,
  })
  @ApiOkResponse({ type: [String] })
  async upgrade_user_todo(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.todoUsecase.updateAllUsersTodo();
  }

  @Post('admin/contacts/synchronize')
  @ApiOperation({
    summary: "Synchronise les contacts de l'application avec ceux de Brevo ",
  })
  async SynchronizeContacts(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.batchUpdate();
  }

  @Post('admin/contacts/:utilisateurId/synchronize')
  @ApiOperation({
    summary: 'Synchronise un utilisateur unique',
  })
  async SynchronizeUser(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.update(utilisateurId);
  }

  @Post('/admin/compute_reco_tags')
  @ApiOperation({
    summary: `recalcule les valorisations de tags de reco pour tous les utilisateurs`,
  })
  async compute_reco_tags(@Request() req): Promise<void> {
    this.checkCronAPIProtectedEndpoint(req);
    await this.utilisateurUsecase.computeAllUsersRecoTags();
  }
}
