import { Citoyen } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import {CitoyenRepository} from '../infrastructure/repository/citoyen.repository'

@Injectable()
export class CitoyenUsecase {
  constructor(private citoyenRespoitory: CitoyenRepository) {}

  async getCitoyen(id): Promise<Citoyen> {
    return this.citoyenRespoitory.findCitoyen(id);
  }
  async createCitoyen(name): Promise<Citoyen> {
    return this.citoyenRespoitory.createCitoyen(name);
  }
}
