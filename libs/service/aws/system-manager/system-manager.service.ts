import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { inject, injectable, InjectionToken } from 'tsyringe';

export const AWS_SYSTEM_MANAGER_CLIENT: InjectionToken<SSMClient> = Symbol.for(
  'AWS_SYSTEM_MANAGER_CLIENT',
);

@injectable()
export class SystemManagerService {
  constructor(@inject(AWS_SYSTEM_MANAGER_CLIENT) private client: SSMClient) {}

  async getParameter(name: string) {
    const response = await this.client.send(
      new GetParameterCommand({ Name: name, WithDecryption: true }),
    );

    if (!response.Parameter?.Value) {
      throw new Error(`Parameter not found: ${name}`);
    }

    return response.Parameter.Value;
  }
}
