import { ForbiddenException, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { ControllerExceptionFilter } from './controllerException.filter';

@UseFilters(new ControllerExceptionFilter())
export class GenericControler {
  checkCallerId(req: Request, utilisateurId: string) {
    if (req['tokenUtilisateurId'] !== utilisateurId) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à ces données',
      });
    }
  }
  checkCallerIsAdmin(req: Request) {
    if (!process.env.ADMIN_IDS.includes(req['tokenUtilisateurId'])) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à cette API',
      });
    }
  }
}
