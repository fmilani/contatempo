import { zeroPad } from "@/lib/helpers";

export default function TimeFormat({ time }) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = (time % 3600) % 60;
  return (
      <div className="">{`${zeroPad(h)}h ${zeroPad(m)}m ${zeroPad(s)}s`}</div>
  );
}

