import { zeroPad } from "@/lib/helpers";

export default function TimeFormat({ time }) {
  const duration = {
    hours: Math.floor(time / 3600),
    minutes: Math.floor((time % 3600) / 60),
    seconds: (time % 3600) % 60,
  };
  return (
    <span>
      {zeroPad(duration.hours)}:{zeroPad(duration.minutes)}
      <span className="text-sm text-gray-400">
        :{zeroPad(duration.seconds)}
      </span>
    </span>
  );
}

