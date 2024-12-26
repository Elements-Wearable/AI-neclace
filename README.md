# AI Necklace

Smart necklace project combining IoT firmware, mobile app, and cloud services.

## 🛠 Tech Stack

- **Firmware**: Zephyr RTOS (nRF52840)
- **Frontend**: Expo (React Native)
- **Backend**: Python (Poetry) & Node.js
- **Documentation**: MkDocs with Material theme

## 🚀 Quick Start

### Prerequisites

- Docker & VS Code with Remote Containers extension
- Node.js 18+
- Python 3.9+
- Zephyr SDK
- Poetry

### Development Setup

1. Clone and open in VS Code:

   ```bash
   git clone https://github.com/yourusername/Elements-AI-neclace
   code Elements-AI-neclace
   ```

2. Start development container:
   - `Ctrl/Cmd + Shift + P` → "Remote-Containers: Open in Container"

3. Start services:
   - Mobile App: `npm run start` in `mobile_app/`
   - Backend: `poetry run python src/main.py` in `backend/`
   - Firmware: `west build` in `firmware/`
   - Documentation: `mkdocs serve` in `docs/`

## 📁 Project Structure

```plaintext
project-root/
├── frontend/ # Expo mobile/web app
├── backend/ # Python & Node.js services
├── firmware/ # Zephyr RTOS firmware
├── docs/ # Project documentation
└── .devcontainer/ # Development environment
```

## 📚 Documentation

- Local: `cd docs && mkdocs serve`
- Online: [Project Documentation](https://yourusername.github.io/Elements-AI-neclace)

## 🧪 Development

- VS Code workspace settings preconfigured
- Formatting rules enforced via Prettier & Black
- CI/CD via GitHub Actions
- DevContainers for consistent development

## 🔧 Available Tasks

- `Start Frontend Dev`: Launch Expo development server
- `Start Python Backend`: Run Python service
- `Start Node Backend`: Run Node.js service
- `Build Firmware`: Compile Zephyr firmware
- `Serve Documentation`: Start local documentation server
- `Build Documentation`: Build documentation site
- `Deploy Documentation`: Deploy docs to GitHub Pages

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request
