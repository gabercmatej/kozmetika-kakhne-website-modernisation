/**
 * Prepares the brand-story background clip.
 *
 * The source is a 720p turntable shot of a real product. It plays as a texture
 * behind the brand story, never as a hero or as product truth, so it is muted,
 * softened a touch and compressed hard.
 *
 * It is deliberately NOT cropped. An earlier revision cut a 52%×46% window out
 * of the frame, which the section then scaled with `object-cover` — the result
 * was a magnified fragment whose rectangle was visible against the flat violet
 * ground. The whole frame is kept and the section contains it instead; the
 * edge softening now lives in the mask on `components/ui/ambient-video.tsx`.
 *
 * Run: npm run data:video
 */
import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const log = (...a) => console.log("[video]", ...a);

const SRC = fileURLToPath(new URL("../assets-raw/brand-story-source.mp4", import.meta.url));
const OUT = fileURLToPath(new URL("../public/video/", import.meta.url));

// Full frame, scaled down and softened just enough to keep compression noise
// out of the flat background. It reads as movement, not as a product shot.
const FILTER = "scale=1100:-2,gblur=sigma=0.5";

/*
 * Seamless loop.
 *
 * The turntable does not complete a full revolution, so the last frame and the
 * first do not line up and a plain `loop` jumps every time round. The clip is
 * rebuilt so its tail dissolves into its own head:
 *
 *   out = source[X .. D-X]  then  crossfade(source[D-X .. D], source[0 .. X])
 *
 * which ends on exactly the frame it starts on. Reversing the clip instead
 * (a palindrome) would also be seamless, but it visibly un-rotates the product
 * halfway through; a dissolve keeps the rotation going one way, and at the
 * opacity this plays at the dissolve itself is invisible.
 *
 * The dissolve cannot be moved off the front of the tube. The shot opens and
 * closes front-on, so the only two frames in the source that share a rotation
 * angle are the first and the last, and the dissolve has to join those or the
 * product visibly jumps round. Where it *can* be moved is in time, and that is
 * the same thing as choosing which frame the loop starts on.
 *
 * What the length costs is the front itself. The dissolve consumes X seconds
 * from each end of the source, and the front-facing arc is only ~1.9s of the
 * 6.6s: at the 1.2s this used to run, every frame in which the label faced the
 * camera was inside the crossfade, so the label was never once seen clean — the
 * rotation appeared to accelerate through the front and come out already turning
 * away. At 0.35s the whole front arc plays clean on both sides of the joint.
 *
 * Shorter is not simply better, and the measurement and the eye disagree about
 * which way. Against a 0.74/255 mean step between ordinary frames, the worst
 * step through the joint is 1.68 at 0.5s, 1.93 at 0.35s, 1.83 at the 1.2s this
 * used to run, and 4.39 at 0.2s, where the joint stops being a fade and becomes
 * a cut. By that number alone a longer dissolve wins.
 *
 * It loses on screen. The camera also dollies in across the shot, so the two
 * sides of the joint differ in scale as well as angle, and the longer the blend
 * the longer the eye has to resolve them as two bottles rather than one: at
 * 0.7s the label is legibly doubled. 0.35s is where the double image stops
 * being readable while the joint is still gradual — and it happens to hold the
 * loop's endpoints closest together too (seam 1.14, against 1.35 at 1.2s).
 */
const XFADE = 0.35;
const loopFilter = (duration) =>
  [
    `[0:v]${FILTER},split=3[body0][tail0][head0]`,
    `[body0]trim=${XFADE}:${duration - XFADE},setpts=PTS-STARTPTS[body]`,
    `[tail0]trim=${duration - XFADE}:${duration},setpts=PTS-STARTPTS[tail]`,
    `[head0]trim=0:${XFADE},setpts=PTS-STARTPTS[head]`,
    `[tail][head]xfade=transition=fade:duration=${XFADE}:offset=0[joint]`,
    `[body][joint]concat=n=2:v=1:a=0[out]`,
  ].join(";");

async function probeDuration(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= XFADE * 2) {
    throw new Error(`source is ${duration}s, too short for a ${XFADE}s crossfade loop`);
  }
  return duration;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const duration = await probeDuration(SRC);
  const filter = loopFilter(duration);
  log(`source ${duration.toFixed(2)}s -> loop ${(duration - XFADE).toFixed(2)}s`);

  log("encoding mp4");
  await run("ffmpeg", [
    "-y", "-i", SRC,
    "-an",
    "-filter_complex", filter, "-map", "[out]",
    "-c:v", "libx264", "-profile:v", "high", "-crf", "30", "-preset", "slow",
    "-movflags", "+faststart", "-pix_fmt", "yuv420p",
    `${OUT}/brand-story.mp4`,
  ]);

  log("encoding webm");
  await run("ffmpeg", [
    "-y", "-i", SRC,
    "-an",
    "-filter_complex", filter, "-map", "[out]",
    "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1",
    `${OUT}/brand-story.webm`,
  ]);

  /* The poster must be the loop's own first frame, not the source's, or the
     video visibly jumps the moment it starts playing over the poster. That
     frame is source[XFADE], which the shorter crossfade also improves: at 1.2s
     the loop opened on the tube already turning away, at 0.35s it opens
     front-on. */
  log("extracting poster");
  await run("ffmpeg", [
    "-y", "-i", `${OUT}/brand-story.mp4`,
    "-frames:v", "1", "-q:v", "5",
    `${OUT}/brand-story-poster.jpg`,
  ]);

  for (const f of ["brand-story.mp4", "brand-story.webm", "brand-story-poster.jpg"]) {
    const { size } = await stat(`${OUT}/${f}`);
    log(`  ${f}: ${(size / 1024).toFixed(0)} KB`);
  }
}

main().catch((e) => {
  console.error(e.stderr?.toString?.() || e);
  process.exit(1);
});
