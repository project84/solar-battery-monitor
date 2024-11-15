export enum GivenergyAccessToken {
  ReadEvents = 'READ_EVENTS_ACCESS_TOKEN',
  SendNotification = 'SEND_NOTIFICATION_ACCESS_TOKEN',
}

interface IGivenergyPaginatedResponseBase {
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    path: string;
    per_page: number;
    to: 15;
    total: 79;
  };
}

export interface IGivenergyInverterEvent {
  event: string;
  /* ISO timestamp (UTC) */
  start_time: string;
  /* ISO timestamp (UTC) */
  end_time: string;
}

export interface IGivenergyInverterEventsResponse
  extends IGivenergyPaginatedResponseBase {
  data: IGivenergyInverterEvent[];
}

export enum GivenergyNotificationPlatform {
  Push = 'push',
  Persist = 'persist',
}

export enum GivenergyNotificationIcon {
  Alert = 'mdi-alert-circle-outline',
}

export interface ISendGivenergyNotification {
  platforms: GivenergyNotificationPlatform[];
  title: string;
  body: string;
  icon: GivenergyNotificationIcon;
}

export interface ISendGivenergyNotificationResponse {
  success: boolean;
}
