# 🧠 Log10 - Agentic LLM-Powered Log Intelligence Platform

> **From simple logging to intelligent observability co-pilot**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)](https://chrome.google.com/webstore/detail/log10)
[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/items?itemName=log10.log10)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Vision

**Log10** is evolving from a logging utility to a **smart, agentic LLM-powered log intelligence platform** that intelligently manages, explains, and acts on logs collected from browsers, apps, and systems.

Think of it as: *"A smart observability co-pilot that watches logs, understands intent, predicts issues, and auto-suggests or triggers fixes."*

## 🚀 Current Status: Phase 1 Complete ✅

| Component | Status | Description |
|-----------|--------|-------------|
| **Chrome Extension** | ✅ Complete | Collects logs from websites |
| **VS Code Extension** | ✅ Complete | View logs in dev tools |
| **Central Backend** | ✅ Complete | Receive/store logs from many sources |

**Output:** Structured logs stored in backend with basic collection pipeline

## 🧭 Roadmap to Full Agentic System

### ⚙️ Phase 1: Logging Infrastructure ✅
- [x] Chrome extension for website log collection
- [x] VS Code extension for developer tooling
- [x] Central backend for log storage and management

### 🧪 Phase 2: Enhanced Developer Tooling 🟩
- [ ] Web dashboard for log visualization
- [ ] Advanced tagging and severity levels
- [ ] Trace linking and session management
- [ ] Enhanced metadata (user, location, device)

### 🤖 Phase 3: LLM Integration 🟩
- [ ] GPT-based log summarization
- [ ] Natural language log queries ("What went wrong?")
- [ ] Pattern recognition for frequent errors
- [ ] Intelligent log categorization

### 🦾 Phase 4: Agentic Actions & Suggestions 🟩
- [ ] Error handler agent with code fix suggestions
- [ ] DevOps agent for team notifications
- [ ] Training agent for junior developer education
- [ ] VS Code chat integration with fix recommendations

### ☁️ Phase 5: Multi-Agent System 🟩
- [ ] Distributed agents per app/team/log type
- [ ] LLM message bus for agent coordination
- [ ] Predictive logging suggestions
- [ ] Feedback loop for continuous improvement

### 🔐 Phase 6: SaaS + Developer Platform 🟩
- [ ] Plugin SDK for third-party integrations
- [ ] Usage-based billing system
- [ ] Team dashboards and permissions
- [ ] Comprehensive documentation and onboarding

## 🏗️ Target Architecture

```
User Devices → Chrome/VSC Extensions
                    ↓
              Central Backend (API + DB)
                    ↓
        ┌───────────┴────────────┐
        │      Log Indexer       │
        │  (Metadata + Sessions) │
        └───────────┬────────────┘
                    ↓
              LLM Intelligence Core
        ┌────────────┬──────────────┐
        │ Summarizer │   FixAgent   │
        │   QA Bot   │   DevTutor   │
        └────────────┴──────────────┘
                    ↓
             VS Code / Web UI
           Slack / Email / GitHub
```

## 🔥 What Makes It "Agentic"?

- ✅ **Goal-seeking behavior** - Agents work toward specific objectives
- ✅ **Memory** - Remembers past logs, actions, and outcomes
- ✅ **Intelligence** - Asks and answers questions about logs
- ✅ **Proactivity** - Suggests or executes fixes automatically
- ✅ **Context awareness** - Works across apps and contexts

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Chrome browser (for extension)
- VS Code (for extension)

### Installation

1. **Chrome Extension**
   ```bash
   # Clone and build
   git clone https://github.com/yourusername/log10.git
   cd log10/chrome-extension
   npm install
   npm run build
   
   # Load unpacked extension in Chrome
   ```

2. **VS Code Extension**
   ```bash
   # Install from marketplace
   # Search for "Log10" in VS Code extensions
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## 📊 Current Features

- **Real-time log collection** from Chrome browser
- **VS Code integration** for developer workflow
- **Centralized log storage** with API access
- **Session-based log grouping**
- **Basic filtering and search**

## 🎯 Upcoming Features (Phase 2)

- **Web Dashboard** - Beautiful UI for log exploration
- **Advanced Filtering** - By severity, source, time range
- **Log Analytics** - Patterns and insights
- **Team Collaboration** - Share logs and insights

## 🤖 LLM Integration Preview (Phase 3)

```typescript
// Example: Natural language log query
const query = "What went wrong in the last hour?"
const response = await log10.ask(query)
// Returns: "Found 3 errors: 2 authentication failures, 1 database timeout"
```

## 🦾 Agentic Actions Preview (Phase 4)

```typescript
// Example: Auto-fix suggestion
const error = await log10.analyzeError(logId)
if (error.suggestedFix) {
  await log10.applyFix(error.suggestedFix)
  // Automatically applies the suggested code fix
}
```

## 🚀 Development

### Project Structure
```
log10/
├── chrome-extension/     # Browser extension
├── vscode-extension/     # VS Code extension
├── backend/              # Central API and database
├── web-dashboard/        # Future web UI
└── docs/                 # Documentation
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📈 Timeline to MVP

| Phase | Duration | Status |
|-------|----------|---------|
| Phase 1-2 | Complete | ✅ 60-70% done |
| Phase 3 | 1-2 weeks | 🟩 LLM integration |
| Phase 4 | 2-4 weeks | 🟩 Agentic actions |
| Phase 5 | 3-6 weeks | 🟩 Multi-agent system |
| Phase 6 | 4-8 weeks | 🟩 SaaS platform |

**Total estimated time to full agentic system: 2-3 months**

## 💡 Smart Names for the Full System

| Name | Why It's Good |
|------|---------------|
| **Logphoria AI** | Evolves current name with LLM focus |
| **Fixlogix** | Suggests logs → fixes transformation |
| **Tracenet** | Network of intelligent log tracing |
| **AgentLog** | Clear, descriptive purpose |
| **Logwise** | Logs + intelligence |
| **Errornaut** | Explorer of errors |
| **Logbotic** | Robot + logs, fun and short |

## 🤝 Community

- **Discord**: [Join our community](https://discord.gg/log10)
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/log10/discussions)
- **Twitter**: [@log10_ai](https://twitter.com/log10_ai)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Log10 team
- Inspired by the need for intelligent observability
- Powered by modern LLM technology

---

**Ready to build the future of intelligent logging?** 🚀

*"From logs to intelligence, from debugging to autonomous fixing"* 