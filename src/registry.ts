import { revisionNumber, templateName } from "./model.ts";
import type { Bindings, Message } from "./model.ts";
import { Template } from "./template.ts";

export class Registry {
  readonly #history = new Map<string, Template[]>();

  publish(name: string, messages: Iterable<Message>): number {
    templateName(name);
    const template = new Template(messages);
    const versions = this.#history.get(name) ?? [];
    versions.push(template);
    this.#history.set(name, versions);
    return versions.length;
  }

  latest(name: string): number {
    const versions = this.#history.get(templateName(name));
    if (!versions) throw new RangeError(`unknown template: ${name}`);
    return versions.length;
  }

  resolve(name: string, revision = this.latest(name)): Template {
    templateName(name);
    revisionNumber(revision);
    const template = this.#history.get(name)?.[revision - 1];
    if (!template) throw new RangeError(`unknown revision: ${name}@${revision}`);
    return template;
  }

  render(name: string, bindings: Bindings, revision?: number): Message[] {
    return this.resolve(name, revision).render(bindings);
  }
}
