import {
  ForbiddenException,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
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
    if (!this.isCallerAdmin(req)) {
      throw new ForbiddenException({
        code: '002',
        message: 'Vous ne pouvez pas accéder à cette API',
      });
    }
  }
  isCallerAdmin(req: Request) {
    return process.env.ADMIN_IDS.includes(req['tokenUtilisateurId']);
  }

  checkCronAPIProtectedEndpoint(request: Request) {
    const authorization = request.headers['authorization'] as string;
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
  }
}
