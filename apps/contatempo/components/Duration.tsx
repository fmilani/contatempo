import { zeroPad } from "@/lib/helpers";
import intervalToDuration from "date-fns/intervalToDuration";

export default function Duration({ records }) {
  const duration = records.reduce(
    (acc, record) => {
      if (!record.end) {
        return acc;
      }
      const duration = intervalToDuration({
        start: new Date(record.begin),
        end: new Date(record.end),
      });
      const seconds = (acc.seconds + duration.seconds) % 60;
      const minutes =
        (acc.minutes +
          duration.minutes +
          Math.floor((acc.seconds + duration.seconds) / 60)) %
        60;
      const hours =
        acc.hours +
        duration.hours +
        Math.floor((acc.minutes + duration.minutes) / 60);
      return {
        hours,
        minutes,
        seconds,
      };
    },
    { hours: 0, minutes: 0, seconds: 0 }
  );
  return (
    <span>
      {zeroPad(duration.hours)}:{zeroPad(duration.minutes)}
      <span className="text-sm text-gray-400">
        :{zeroPad(duration.seconds)}
      </span>
    </span>
  );
}
