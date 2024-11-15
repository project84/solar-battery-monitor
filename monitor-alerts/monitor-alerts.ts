import { compareAsc, sub } from 'date-fns';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { AwsSystemManagerProvider } from '../libs/ioc/providers/aws.provider';
import { GivenergyProvider } from '../libs/ioc/providers/givenergy.provider';
import { GivenergyNotificationPlatform } from '../libs/service/givenergy/givenergy.models';
import { GivenergyService } from '../libs/service/givenergy/givenergy.service';

export const handler = async () => {
  const referenceDateTime = sub(new Date(), { minutes: 30 });

  await AwsSystemManagerProvider();
  await GivenergyProvider();

  const givenergyService = container.resolve(GivenergyService);

  const events = await givenergyService.listEvents();

  console.log(`Found ${events.length} inverter events`);

  const recentEvents = events.filter(
    ({ start_time }) => compareAsc(new Date(start_time), referenceDateTime) + 1,
  );

  console.log(`${recentEvents.length} events were within the last 30 min`);

  const relevantEvents = Object.entries(
    recentEvents.reduce<Record<string, { active: boolean }>>(
      (dict, { event: eventName, end_time }) => ({
        ...dict,
        [eventName]: {
          active: dict[eventName]?.active || !end_time,
        },
      }),
      {},
    ),
  );

  if (relevantEvents.length) {
    const isPlural = relevantEvents.length > 1;
    const suffix = isPlural ? 's' : '';

    await givenergyService.sendNotification(
      `New inverter event${suffix}`,
      [
        `${relevantEvents.length} new event${suffix} ${isPlural ? 'have' : 'has'} been reported by the inverter:`,
        ...relevantEvents.map(
          ([eventName, { active }]) =>
            `${eventName}${active ? ' (active)' : ''}`,
        ),
      ].join(`\n`),
      {
        platforms: [
          GivenergyNotificationPlatform.Push,
          GivenergyNotificationPlatform.Persist,
        ],
      },
    );
  }
};
