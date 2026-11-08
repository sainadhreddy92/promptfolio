import { validateMessage } from "./model.ts";
import type { Bindings, Message, Role } from "./model.ts";

type Segment = { literal: string } | { variable: string };
interface CompiledMessage {
  role: Role;
  segments: Segment[];
}

function tokenize(source: string): Segment[] {
  const result: Segment[] = [];
  let offset = 0;
  for (const match of source.matchAll(/\{\{\s*([A-Za-z_][A-Za-z_0-9]*)\s*\}\}/g)) {
    if (match.index > offset) result.push({ literal: source.slice(offset, match.index) });
    result.push({ variable: match[1] });
    offset = match.index + match[0].length;
  }
  if (offset < source.length) result.push({ literal: source.slice(offset) });
  return result;
}

function substitute(segments: readonly Segment[], bindings: Bindings): string {
  const chunks: string[] = [];
  for (const segment of segments) {
    if ("literal" in segment) {
      chunks.push(segment.literal);
      continue;
    }
    const key = segment.variable;
    if (!Object.hasOwn(bindings, key) || typeof bindings[key] !== "string") {
      throw new TypeError(`missing string binding: ${key}`);
    }
    chunks.push(bindings[key]);
  }
  return chunks.join("");
}

export class Template {
  readonly #messages: CompiledMessage[];

  constructor(messages: Iterable<Message>) {
    this.#messages = Array.from(messages, message => {
      validateMessage(message);
      return { role: message.role, segments: tokenize(message.content) };
    });
    if (!this.#messages.length) throw new RangeError("empty template");
  }

  render(bindings: Bindings): Message[] {
    return this.#messages.map(({ role, segments }) => ({
      role, content: substitute(segments, bindings),
    }));
  }
}
