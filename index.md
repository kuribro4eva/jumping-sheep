# Directory Index

## Files

- **[HANDOFF.md](./HANDOFF.md)** - Project handoff, architecture, and migration guide
- **[game.jsx](./game.jsx)** - Single-file React game implementation

## Subdirectories

### __vite_seed__/

- **[README.md](./__vite_seed__/README.md)** - Vite React starter usage notes
- **[eslint.config.js](./__vite_seed__/eslint.config.js)** - ESLint flat config for React files
- **[index.html](./__vite_seed__/index.html)** - HTML entrypoint mounting Vite app
- **[package.json](./__vite_seed__/package.json)** - Project scripts and dependency manifest
- **[vite.config.js](./__vite_seed__/vite.config.js)** - Vite config with React plugin

### __vite_seed__/public/

- **[vite.svg](./__vite_seed__/public/vite.svg)** - Vite logo asset for template

### __vite_seed__/src/

- **[App.css](./__vite_seed__/src/App.css)** - Starter app component styles
- **[App.jsx](./__vite_seed__/src/App.jsx)** - Counter demo React component
- **[index.css](./__vite_seed__/src/index.css)** - Global starter theme and base styles
- **[main.jsx](./__vite_seed__/src/main.jsx)** - React root bootstrap and render

### __vite_seed__/src/assets/

- **[react.svg](./__vite_seed__/src/assets/react.svg)** - React logo asset for template

### _bmad/_config/

- **[agent-manifest.csv](./_bmad/_config/agent-manifest.csv)** - Registered BMAD agents and personas
- **[bmad-help.csv](./_bmad/_config/bmad-help.csv)** - Help routing catalog and workflow metadata
- **[files-manifest.csv](./_bmad/_config/files-manifest.csv)** - Installed file inventory with hashes
- **[manifest.yaml](./_bmad/_config/manifest.yaml)** - BMAD installation versions and modules
- **[task-manifest.csv](./_bmad/_config/task-manifest.csv)** - Available standalone task definitions list
- **[tool-manifest.csv](./_bmad/_config/tool-manifest.csv)** - Tool manifest placeholder table
- **[workflow-manifest.csv](./_bmad/_config/workflow-manifest.csv)** - Available workflow definitions list

### _bmad/_config/agents/

- **[core-bmad-master.customize.yaml](./_bmad/_config/agents/core-bmad-master.customize.yaml)** - Overrides for BMad Master persona/menu

### _bmad/_config/ides/

- **[claude-code.yaml](./_bmad/_config/ides/claude-code.yaml)** - Claude Code IDE integration marker
- **[codex.yaml](./_bmad/_config/ides/codex.yaml)** - Codex IDE integration marker

### _bmad/core/

- **[config.yaml](./_bmad/core/config.yaml)** - Core module runtime settings
- **[module-help.csv](./_bmad/core/module-help.csv)** - Module workflow guidance catalog

### _bmad/core/agents/

- **[bmad-master.md](./_bmad/core/agents/bmad-master.md)** - Master agent persona and command menu

### _bmad/core/tasks/

- **[editorial-review-prose.xml](./_bmad/core/tasks/editorial-review-prose.xml)** - Prose clarity review task workflow
- **[editorial-review-structure.xml](./_bmad/core/tasks/editorial-review-structure.xml)** - Structural editing recommendation workflow
- **[help.md](./_bmad/core/tasks/help.md)** - BMAD next-step recommendation instructions
- **[index-docs.xml](./_bmad/core/tasks/index-docs.xml)** - Directory indexing workflow instructions
- **[review-adversarial-general.xml](./_bmad/core/tasks/review-adversarial-general.xml)** - Cynical review task and findings protocol
- **[shard-doc.xml](./_bmad/core/tasks/shard-doc.xml)** - Markdown sharding workflow and prompts
- **[workflow.xml](./_bmad/core/tasks/workflow.xml)** - Generic BMAD workflow execution engine

### _bmad/core/workflows/advanced-elicitation/

- **[methods.csv](./_bmad/core/workflows/advanced-elicitation/methods.csv)** - Elicitation techniques catalog and patterns
- **[workflow.xml](./_bmad/core/workflows/advanced-elicitation/workflow.xml)** - Advanced elicitation interaction workflow

### _bmad/core/workflows/brainstorming/

- **[brain-methods.csv](./_bmad/core/workflows/brainstorming/brain-methods.csv)** - Brainstorm method library and descriptions
- **[template.md](./_bmad/core/workflows/brainstorming/template.md)** - Brainstorm session output template
- **[workflow.md](./_bmad/core/workflows/brainstorming/workflow.md)** - Brainstorm facilitation orchestration guide

### _bmad/core/workflows/brainstorming/steps/

- **[step-01-session-setup.md](./_bmad/core/workflows/brainstorming/steps/step-01-session-setup.md)** - Initialize session and gather context
- **[step-01b-continue.md](./_bmad/core/workflows/brainstorming/steps/step-01b-continue.md)** - Resume existing brainstorming session flow
- **[step-02a-user-selected.md](./_bmad/core/workflows/brainstorming/steps/step-02a-user-selected.md)** - User-driven technique browsing and selection
- **[step-02b-ai-recommended.md](./_bmad/core/workflows/brainstorming/steps/step-02b-ai-recommended.md)** - AI-selected techniques based on goals
- **[step-02c-random-selection.md](./_bmad/core/workflows/brainstorming/steps/step-02c-random-selection.md)** - Random technique selection facilitation
- **[step-02d-progressive-flow.md](./_bmad/core/workflows/brainstorming/steps/step-02d-progressive-flow.md)** - Phased technique journey planning
- **[step-03-technique-execution.md](./_bmad/core/workflows/brainstorming/steps/step-03-technique-execution.md)** - Interactive technique execution coaching
- **[step-04-idea-organization.md](./_bmad/core/workflows/brainstorming/steps/step-04-idea-organization.md)** - Organize ideas and define actions

### _bmad/core/workflows/party-mode/

- **[workflow.md](./_bmad/core/workflows/party-mode/workflow.md)** - Multi-agent party mode orchestration guide

### _bmad/core/workflows/party-mode/steps/

- **[step-01-agent-loading.md](./_bmad/core/workflows/party-mode/steps/step-01-agent-loading.md)** - Load roster and initialize party mode
- **[step-02-discussion-orchestration.md](./_bmad/core/workflows/party-mode/steps/step-02-discussion-orchestration.md)** - Select agents and run discussion rounds
- **[step-03-graceful-exit.md](./_bmad/core/workflows/party-mode/steps/step-03-graceful-exit.md)** - Close party mode with farewells
