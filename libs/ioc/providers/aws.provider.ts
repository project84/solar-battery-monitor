import { SSMClient } from '@aws-sdk/client-ssm';
import { container } from 'tsyringe';
import { AWS_SYSTEM_MANAGER_CLIENT } from '../../service/aws/system-manager/system-manager.service';

export const AwsSystemManagerProvider = async () => {
  container.register(AWS_SYSTEM_MANAGER_CLIENT, {
    useFactory: () => new SSMClient(),
  });
};
