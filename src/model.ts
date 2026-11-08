export type Role = "system" | "user" | "assistant";

export interface Message {
  readonly role: Role;
  readonly content: string;
}

export type Bindings = Readonly<Record<string, string>>;

export function templateName(value: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError("expected a nonempty template name");
  }
  return value;
}

export function revisionNumber(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError("expected a positive revision");
  }
  return value;
}

export function validateMessage(message: Message): void {
  if (!message || typeof message.content !== "string") {
    throw new TypeError("expected string message content");
  }
  if (!["system", "user", "assistant"].includes(message.role)) {
    throw new TypeError("unknown message role");
  }
}
