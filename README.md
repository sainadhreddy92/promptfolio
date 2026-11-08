# Promptfolio

Promptfolio lets chat applications publish named prompt templates and render a specific revision into role-tagged messages. It runs locally and does not require a model provider, network access, or credentials.

## Quick start

Use Node.js 24 or newer. From the checkout, run `npm test`.

```ts
import { Registry } from "./src/index.ts";

const prompts = new Registry();
const revision = prompts.publish("ticket-summary", [
  { role: "system", content: "Summarize the support ticket in one sentence." },
  { role: "user", content: "Ticket {{ ticket }}: {{issue}}" },
]);

const messages = prompts.render("ticket-summary", {
  ticket: "T-184",
  issue: "Audio drops after ten minutes",
}, revision);
console.log(messages[1].content);
// Ticket T-184: Audio drops after ten minutes
```

## Revisions

Revisions start at one for each template. Publishing adds a revision to the in-memory registry. Omit the revision when rendering to select the latest publication, or pin a revision for reproducible results. A rejected publication leaves the history intact. New registry instances start empty.

## Substitution

Placeholders use ASCII identifiers between double braces. Spaces inside the braces are optional. Bindings must supply own string properties for all referenced identifiers. An empty string is a valid binding. Supplied text is inserted literally, including braces or dollar signs. Message roles and order are preserved, and each render returns new message objects.

## Development

Start with `src/registry.ts` for publication and revision lookup, and `src/template.ts` for placeholder compilation and rendering. The tests use Node's built-in test runner.
