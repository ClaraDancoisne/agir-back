import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ScheduledServiceManager } from '../ScheduledServiceManager';

const ACCESS_TOKEN_URL = 'https://digital.iservices.rte-france.com/token/oauth';
const ECOWATT_URL =
  'https://digital.iservices.rte-france.com/open_api/ecowatt/v5/signals';

export enum EcoWattLevel {
  vert = 1,
  orange = 2,
  rouge = 3,
}

export class SignalEcoWatt {
  label: string;
  isInError: boolean;
  niveau?: EcoWattLevel;
  message?: string;
}

@Injectable()
export class EcoWattServiceManager implements ScheduledServiceManager {
  private access_token: string;

  async computeScheduledDynamicData(): Promise<SignalEcoWatt> {
    if (process.env.SERVICE_APIS_ENABLED == 'true') {
      return await this.getEcoWattSignal();
    }
    return {
      label: '🚫 EcoWatt désactivé',
      isInError: true,
    };
  }

  async getEcoWattSignal(): Promise<SignalEcoWatt> {
    let signal;
    try {
      signal = await this.callEcoWattAPI();
    } catch (error) {
      if (error.message === '401') {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          return {
            label: '🚫 EcoWatt indispo',
            isInError: true,
          };
        }
      }
      // RETRY
      try {
        signal = await this.callEcoWattAPI();
      } catch {
        return {
          label: '🚫 EcoWatt indispo',
          isInError: true,
        };
      }
    }
    return {
      label: [`🟢 Pas d'alerte`, `🟠 Tendu`, `🔴 Attention coupures !!`][
        signal.data.signals[0].dvalue - 1
      ],
      message: signal.data.signals[0].message,
      niveau: signal.data.signals[0].dvalue,
      isInError: false,
    };
  }

  private async refreshAccessToken(): Promise<void> {
    let response = null;
    try {
      response = await axios.post(ACCESS_TOKEN_URL, '', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${process.env.ECOWATT_CLIENT_ID_SECRET}`,
        },
      });
    } catch (error) {
      console.log('Erreur à la récupération du token ecowatt');
      console.log(error.message);
      throw error;
    }
    this.access_token = response.data.access_token;
  }

  private async callEcoWattAPI() {
    let response = null;
    try {
      response = await axios.get(ECOWATT_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.access_token}`,
        },
      });
    } catch (error) {
      if (error.response.status != 401) {
        console.log(error.message);
      }
      throw new Error(error.response.status);
    }
    return response;
  }
}
