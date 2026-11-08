import type { Bindings, Message } from "./model.ts";
import type { Registry } from "./registry.ts";

export interface Fixture {
  readonly id: string;
  readonly bindings: Bindings;
}
export interface Outcome {
  readonly id: string;
  readonly score: number;
}
export type Scorer = (messages: readonly Message[]) => Promise<number>;

/** Evaluate one revision against an ordered dataset. */
export async function evaluate(
  registry: Registry, name: string, fixtures: readonly Fixture[],
  scorer: Scorer, workers = 4,
): Promise<Outcome[]> {
  if (!Number.isSafeInteger(workers) || workers <= 0) {
    throw new RangeError("workers must be positive");
  }
  const outcomes: Outcome[] = [];
  const revision = registry.latest(name);
  let index = 0;
  async function run(): Promise<void> {
    while (index < fixtures.length) {
      const current = index++;
      const fixture = fixtures[current];
      const messages = registry.render(name, fixture.bindings, revision);
      const score = await scorer(messages);
      if (!Number.isFinite(score)) throw new TypeError("nonfinite evaluation score");
      outcomes.push({ id: fixture.id, score });
    }
  }
  await Promise.all(Array.from({length: Math.min(workers, fixtures.length)}, run));
  return outcomes;
}
