type Stopper = () => void;
const stoppers = new Map<string, Stopper>();
export function registerAudio(owner: string, stop: Stopper) {
  stoppers.set(owner, stop);
  return () => {
    if (stoppers.get(owner) === stop) stoppers.delete(owner);
  };
}
export function claimAudio(owner: string) {
  for (const [key, stop] of [...stoppers]) if (key !== owner) stop();
}
export function stopAllAudio() {
  claimAudio("none");
}
