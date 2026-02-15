import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Timer, Gauge, Heart, Mountain, FileText } from "lucide-react";

type TrackPoint = {
  lat: number;
  lon: number;
  ele?: number;
  time?: Date;
  hr?: number;
};

type WorkoutSummary = {
  fileName: string;
  points: TrackPoint[];
  distanceKm: number;
  durationMin: number;
  paceMinPerKm?: number;
  avgHeartRate?: number;
  ascentM: number;
};

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceMeters(a: TrackPoint, b: TrackPoint): number {
  const r = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * r * Math.asin(Math.sqrt(h));
}

function parsePointTime(text?: string | null): Date | undefined {
  if (!text) return undefined;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseGpx(doc: Document): TrackPoint[] {
  const points = Array.from(doc.getElementsByTagName("trkpt"));
  const parsed: TrackPoint[] = [];

  for (const pt of points) {
      const lat = Number(pt.getAttribute("lat"));
      const lon = Number(pt.getAttribute("lon"));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const ele = Number(pt.getElementsByTagName("ele")[0]?.textContent ?? NaN);
      const timeText = pt.getElementsByTagName("time")[0]?.textContent;
      const hrText = pt.getElementsByTagNameNS("*", "hr")[0]?.textContent;
      const hr = Number(hrText ?? NaN);

      parsed.push({
        lat,
        lon,
        ele: Number.isFinite(ele) ? ele : undefined,
        time: parsePointTime(timeText),
        hr: Number.isFinite(hr) ? hr : undefined,
      });
  }

  return parsed;
}

function parseTcx(doc: Document): TrackPoint[] {
  const points = Array.from(doc.getElementsByTagNameNS("*", "Trackpoint"));
  const parsed: TrackPoint[] = [];

  for (const pt of points) {
      const pos = pt.getElementsByTagNameNS("*", "Position")[0];
      const lat = Number(pos?.getElementsByTagNameNS("*", "LatitudeDegrees")[0]?.textContent ?? NaN);
      const lon = Number(pos?.getElementsByTagNameNS("*", "LongitudeDegrees")[0]?.textContent ?? NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const ele = Number(pt.getElementsByTagNameNS("*", "AltitudeMeters")[0]?.textContent ?? NaN);
      const timeText = pt.getElementsByTagNameNS("*", "Time")[0]?.textContent;
      const hr = Number(pt.getElementsByTagNameNS("*", "HeartRateBpm")[0]?.textContent ?? NaN);

      parsed.push({
        lat,
        lon,
        ele: Number.isFinite(ele) ? ele : undefined,
        time: parsePointTime(timeText),
        hr: Number.isFinite(hr) ? hr : undefined,
      });
  }

  return parsed;
}

function summarize(points: TrackPoint[], fileName: string): WorkoutSummary {
  let distance = 0;
  let ascent = 0;

  for (let i = 1; i < points.length; i += 1) {
    distance += distanceMeters(points[i - 1], points[i]);

    const prevEle = points[i - 1].ele;
    const nextEle = points[i].ele;
    if (prevEle !== undefined && nextEle !== undefined && nextEle > prevEle) {
      ascent += nextEle - prevEle;
    }
  }

  const timestamps = points.map((point) => point.time).filter((value): value is Date => Boolean(value));
  const durationMs =
    timestamps.length >= 2
      ? timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()
      : 0;

  const heartRates = points.map((point) => point.hr).filter((value): value is number => value !== undefined);

  const distanceKm = distance / 1000;
  const durationMin = durationMs / 1000 / 60;

  return {
    fileName,
    points,
    distanceKm,
    durationMin,
    paceMinPerKm: distanceKm > 0 && durationMin > 0 ? durationMin / distanceKm : undefined,
    avgHeartRate:
      heartRates.length > 0
        ? heartRates.reduce((sum, value) => sum + value, 0) / heartRates.length
        : undefined,
    ascentM: ascent,
  };
}

function formatPace(pace?: number): string {
  if (!pace || pace <= 0) return "—";
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${String(sec).padStart(2, "0")} мин/км`;
}

export default function HealthTrackerPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const totalDistance = useMemo(
    () => workouts.reduce((sum, workout) => sum + workout.distanceKm, 0),
    [workouts]
  );
  const totalDuration = useMemo(
    () => workouts.reduce((sum, workout) => sum + workout.durationMin, 0),
    [workouts]
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const parsed: WorkoutSummary[] = [];
    for (const file of Array.from(files)) {
      try {
        const content = await file.text();
        const doc = new DOMParser().parseFromString(content, "text/xml");

        const extension = file.name.toLowerCase().split(".").pop();
        const points = extension === "tcx" ? parseTcx(doc) : parseGpx(doc);

        if (points.length < 2) {
          throw new Error(`Файл ${file.name} не содержит достаточно трек-точек.`);
        }

        parsed.push(summarize(points, file.name));
      } catch (fileError) {
        setError((fileError as Error).message);
      }
    }

    if (parsed.length > 0) {
      setWorkouts((current) => [...parsed, ...current]);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="space-y-6">
          <Card id="upload-zone" className="rounded-3xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold">Импорт тренировок</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Выберите один или несколько файлов формата GPX или TCX. Данные не отправляются на
              сервер — разбор происходит локально в браузере.
            </p>

            <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-sm font-medium hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              Загрузить файлы
              <input
                className="hidden"
                type="file"
                accept=".gpx,.tcx,application/xml,text/xml"
                multiple
                onChange={(event) => {
                  void handleFiles(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card className="rounded-2xl p-4">
                <p className="text-sm text-muted-foreground">Общая дистанция</p>
                <p className="mt-1 text-2xl font-semibold">{totalDistance.toFixed(2)} км</p>
              </Card>
              <Card className="rounded-2xl p-4">
                <p className="text-sm text-muted-foreground">Общее время</p>
                <p className="mt-1 text-2xl font-semibold">{Math.round(totalDuration)} мин</p>
              </Card>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Ошибка импорта</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Card>

          <Card className="rounded-3xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Что дальше добавить</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>зоны пульса и оценку тренировочной нагрузки;</li>
              <li>календарь активностей и недельные цели;</li>
              <li>поддержку импорта из Garmin/Strava API.</li>
            </ul>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Последние тренировки</h2>
            {workouts.length > 0 && (
              <Button variant="secondary" onClick={() => setWorkouts([])}>
                Очистить
              </Button>
            )}
          </div>

          {workouts.length === 0 ? (
            <Card className="rounded-3xl p-10 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8" />
              <p className="mt-3">Пока нет загруженных тренировок.</p>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={`${workout.fileName}-${workout.points.length}`} className="rounded-3xl p-5 shadow-soft">
                <p className="text-sm text-muted-foreground">{workout.fileName}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Metric icon={Gauge} label="Дистанция" value={`${workout.distanceKm.toFixed(2)} км`} />
                  <Metric icon={Timer} label="Длительность" value={`${Math.round(workout.durationMin)} мин`} />
                  <Metric icon={Mountain} label="Набор высоты" value={`${Math.round(workout.ascentM)} м`} />
                  <Metric icon={Heart} label="Средний пульс" value={workout.avgHeartRate ? `${Math.round(workout.avgHeartRate)} bpm` : "—"} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Средний темп: {formatPace(workout.paceMinPerKm)}</p>
              </Card>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}

type MetricProps = {
  icon: typeof Gauge;
  label: string;
  value: string;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-3">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
