import { container } from 'tsyringe';
import { SystemManagerService } from '../../service/aws/system-manager/system-manager.service';
import { INVERTER_SERIAL_NUMBER } from '../../service/givenergy/givenergy.service';

export const GivenergyProvider = async () => {
  container.register(INVERTER_SERIAL_NUMBER, {
    useValue: await container
      .resolve(SystemManagerService)
      .getParameter('/GIVENERGY/INVERTER_SERIAL_NUMBER'),
  });
};
