import { inject, injectable, InjectionToken } from 'tsyringe';
import { SystemManagerService } from '../aws/system-manager/system-manager.service';
import { HttpService } from '../http/http.service';
import {
  GivenergyAccessToken,
  GivenergyNotificationIcon,
  GivenergyNotificationPlatform,
  IGivenergyInverterEvent,
  IGivenergyInverterEventsResponse,
  ISendGivenergyNotificationResponse,
} from './givenergy.models';

export const INVERTER_SERIAL_NUMBER: InjectionToken<string> = Symbol.for(
  'INVERTER_SERIAL_NUMBER',
);

@injectable()
export class GivenergyService {
  private accessTokens: Partial<Record<GivenergyAccessToken, string>> = {};

  constructor(
    @inject(HttpService) private http: HttpService,
    @inject(SystemManagerService) private systemManager: SystemManagerService,
    @inject(INVERTER_SERIAL_NUMBER) private inverterSerialNumber: string,
  ) {}

  async listEvents(
    nextUrl?: string,
    previousEvents: IGivenergyInverterEvent[] = [],
  ): Promise<IGivenergyInverterEvent[]> {
    const response = await this.http.get<IGivenergyInverterEventsResponse>(
      nextUrl || `${this.inverterBaseUrl}/events`,
      {
        headers: await this.getAuthorizationHeader(
          GivenergyAccessToken.ReadEvents,
        ),
      },
    );

    const events = [...previousEvents, ...response.data];

    if (response.links.next) {
      return this.listEvents(response.links.next, events);
    }

    return events;
  }

  async sendNotification(
    title: string,
    body: string,
    {
      platforms = [GivenergyNotificationPlatform.Push],
      icon = GivenergyNotificationIcon.Alert,
    }: {
      platforms: GivenergyNotificationPlatform[];
      icon: GivenergyNotificationIcon;
    },
  ) {
    await this.http.post<ISendGivenergyNotificationResponse>(
      this.baseUrl,
      {
        title,
        body,
        platforms,
        icon,
      },
      {
        headers: await this.getAuthorizationHeader(
          GivenergyAccessToken.ReadEvents,
        ),
      },
    );
  }

  private get baseUrl() {
    return 'https://api.givenergy.cloud/v1';
  }

  private get inverterBaseUrl() {
    return `${this.baseUrl}/inverter/${this.inverterSerialNumber}`;
  }

  private async getAuthorizationHeader(accessToken: GivenergyAccessToken) {
    this.accessTokens[accessToken] ??= await this.systemManager.getParameter(
      `/GIVENERGY/${accessToken}`,
    );

    return {
      Authorization: `Bearer ${this.accessTokens[accessToken]}`,
    };
  }
}
