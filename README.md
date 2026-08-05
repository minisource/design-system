# MiniSource Design System

A shared component library for MiniSource admin panels.

## Packages

| Package | Description |
|---------|-------------|
| `@minisource/tokens` | Design tokens (CSS variables, Tailwind config) |
| `@minisource/ui` | Core UI primitives (28 components) |
| `@minisource/auth-ui` | Auth presentation components (12 components) |
| `@minisource/rhf` | React Hook Form integration layer |
| `@minisource/app-shell` | Shared admin panel shell layout (6 components) |

## Architecture

```
@minisource/tokens          ← Design tokens (no deps)
    ↓
@minisource/ui              ← Core primitives (depends on tokens)
    ↓              ↓
@minisource/auth-ui    @minisource/app-shell    ← Feature packages
    ↓
@minisource/rhf             ← Form integration (depends on ui)
```

### Key Principle

**Design System = Presentation Only.** All business logic stays in consuming apps:

| Belongs in Design System | Belongs in App |
|--------------------------|----------------|
| Button, Card, Layout | API calls, mutations |
| Form field layout | Session, auth, tokens |
| Loading/Empty/Error states | Permission checks |
| Table structure | Route guards |
| Theme, RTL support | Tenant switching |

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Typecheck all packages
pnpm typecheck
```

### Local Development with auth/front

```bash
# Build design system
pnpm --dir C:\ActiveProjects\MiniSource\design-system build

# Link packages into auth/front
cd C:\ActiveProjects\MiniSource\auth\front
pnpm link C:\ActiveProjects\MiniSource\design-system\packages\tokens
pnpm link C:\ActiveProjects\MiniSource\design-system\packages\ui
pnpm link C:\ActiveProjects\MiniSource\design-system\packages\auth-ui
pnpm link C:\ActiveProjects\MiniSource\design-system\packages\rhf
pnpm link C:\ActiveProjects\MiniSource\design-system\packages\app-shell

# Watch mode (auto-rebuild on changes)
pnpm --dir C:\ActiveProjects\MiniSource\design-system --filter @minisource/ui dev
```

### Avoiding Duplicate React

If you see two copies of React, ensure both the design system and consuming app use the same React version. Use `pnpm.overrides` in the consuming app if needed:

```json
{
  "pnpm": {
    "overrides": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}
```

### Unlinking Packages

```bash
cd C:\ActiveProjects\MiniSource\auth\front
pnpm unlink C:\ActiveProjects\MiniSource\design-system\packages\ui
pnpm install
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @minisource/ui test

# Watch mode
pnpm --filter @minisource/ui test:watch
```

## Versioning & Releases

Uses [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Create a changeset (describes your changes)
pnpm changeset

# Version packages (update changelogs and versions)
pnpm version-packages

# Publish to registry
pnpm release

# Dry-run publish
pnpm release:dry
```

## Adding a New Package

1. Create `packages/my-package/` with `package.json`, `tsconfig.json`, `tsup.config.ts`
2. Add to `pnpm-workspace.yaml` (already uses `packages/*`)
3. Add `@minisource/ui` as dependency if needed
4. Add test script: `"test": "vitest run"`
5. Create `vitest.config.ts` and `vitest.setup.ts`
6. Add README.md

## Project Structure

```
design-system/
├── .changeset/           # Changeset config
├── packages/
│   ├── tokens/           # Design tokens
│   ├── ui/               # Core components
│   ├── auth-ui/          # Auth components
│   ├── rhf/              # React Hook Form integration
│   └── app-shell/        # Admin panel shell
├── package.json          # Root scripts
├── pnpm-workspace.yaml   # Workspace config
├── tsconfig.base.json    # Shared TS config
└── vitest.config.ts      # Shared test config
```