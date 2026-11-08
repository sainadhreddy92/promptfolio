import type { Bindings, Message } from "./model.ts";
import { templateName } from "./model.ts";
import type { Registry } from "./registry.ts";
import type { Template } from "./template.ts";

interface Release {
  readonly name: string;
  readonly revision?: number;
}

/** Application-facing names for pinned or continuously published prompts. */
export class Channels {
  readonly #registry: Registry;
  readonly #releases = new Map<string, Release>();
  readonly #compiled = new Map<string, Template>();

  constructor(registry: Registry) {
    this.#registry = registry;
  }

  point(channel: string, name: string, revision?: number): void {
    templateName(channel);
    this.#registry.resolve(name, revision);
    this.#releases.set(channel, { name, revision });
    this.#compiled.delete(channel);
  }

  render(channel: string, bindings: Bindings): Message[] {
    const release = this.#releases.get(channel);
    if (!release) throw new RangeError(`unknown release channel: ${channel}`);
    let template = this.#compiled.get(channel);
    if (!template) {
      template = this.#registry.resolve(release.name, release.revision);
      this.#compiled.set(channel, template);
    }
    return template.render(bindings);
  }
}
