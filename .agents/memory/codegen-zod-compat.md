---
name: Codegen post-processing — zod.int()
description: Orval v8 generates Zod v4 syntax (zod.int()) but the workspace locks Zod at v3. Must post-process after every codegen run.
---

# Codegen post-processing — zod.int()

## The rule
After running `pnpm --filter @workspace/api-spec run codegen`, always run:
```bash
sed -i 's/zod\.int()/zod.number().int()/g' lib/api-zod/src/generated/api.ts
```
Then rebuild lib declarations: `pnpm run typecheck:libs`.

**Why:** Orval v8 generates Zod v4 syntax (`zod.int()`, `zod.email()`) but the workspace pins Zod at v3, which doesn't have these methods. Also remove `format: email` and `type: integer` from the OpenAPI spec (use `type: number` instead) to prevent Orval from emitting unsupported validators.

**How to apply:** Any time the OpenAPI spec changes and codegen is re-run.
