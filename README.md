# 🚀 Hello MCP(Model Context Protocol)
### "Tour and Guide Tool for Setting Up Claude Desktop MCP Config Manager"

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/en/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Overview

Hello-MCP is a helpful utility tool that enables Claude Desktop to interact with external tools via the Model Context Protocol (MCP). It simplifies the setup process and provides a seamless integration between Claude AI and your custom tools.

(English) Hello, Welcome!
(Korean) 안녕하세요, 환영합니다!

## 🛠️ Features

- **Easy Setup**: Simple one-command setup for Claude Desktop MCP integration
- **Multiple Modes**: Run as a setup wizard, MCP server, or CLI tool
- **Built-in Sample Tools**: Pre-configured tools like email sending and simple calculations
- **Extensible**: Easily add your own MCP tools
- **Internationalization**: Supports multiple languages (Korean and English)

## 📋 Requirements

- Node.js 14+
- Claude Desktop installed ([Download here](https://claude.ai/download))
- Internet connection for API key generation

## 🔧 Installation

### Node.js Installation

#### macOS/Linux
You can use `asdf` to manage Node.js versions:
```bash
# Install asdf (if not already installed)
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2
echo '. $HOME/.asdf/asdf.sh' >> ~/.bashrc
echo '. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc
# or for zsh
echo '. $HOME/.asdf/asdf.sh' >> ~/.zshrc

# Install Node.js plugin
asdf plugin add nodejs
asdf install nodejs 18.12.0  # or any version >= 14
asdf global nodejs 18.12.0
```

#### Windows
Download and install Node.js directly from the official website:
1. Visit [Node.js official download page](https://nodejs.org/en/download/)
2. Download the Windows Installer (.msi)
3. Run the installer and follow the installation wizard
4. Verify installation by opening Command Prompt or PowerShell and typing:
```
node --version
```

## 🚀 Quick Start

You can run Hello-MCP without installation using npx:

```bash
npx hello-mcp
```

This will start the setup wizard that guides you through the entire configuration process.

## 🎮 Usage

Hi-Garak can be used in three different modes:

### 1️⃣ Setup Mode (Default)

```bash
npx hello-mcp
# or
npx hello-mcp setup
```

This interactive mode will:
- Check if Claude Desktop is installed
- Ask for your email and purpose
- Generate an API key
- Configure Claude Desktop for MCP
- Restart Claude Desktop automatically (when possible)

### 2️⃣ MCP Server Mode

```bash
npx hello-mcp mcp-server
```

This starts Hello-MCP as an MCP server that Claude Desktop can connect to. The server provides tools that Claude can use to perform actions.

### 3️⃣ CLI Mode

```bash
npx hello-mcp cli [command] [options]
```

Available commands:
- `add`: Add two numbers
  ```bash
  npx hello-mcp cli add 3 5
  ```
- `send-email`: Send an email
  ```bash
  npx hello-mcp cli send-email user@example.com "Hello from Hello-MCP"
  ```

## 🔑 API Keys

Your API key is stored in `~/.garakrc` and has a daily limit of 50 requests. The key is automatically configured for use with Claude Desktop.

## 🌐 Internationalization (i18n)

Hello-MCP supports multiple languages through a robust internationalization architecture.

**Key Features:**

- **Language Files:** Separate JSON files for each language (e.g., `ko.json`, `en.json`) in the `locales/` directory.
- **Automatic Language Detection:**
    - Detects language based on environment variables (`LC_ALL`, `LANG`, `LANGUAGE`).
    - Detects operating system settings (macOS, Windows).
    - Uses language preference stored in the user configuration file (`.garakrc`).
- **Placeholder Support:** Dynamic text insertion using placeholders (e.g., `{variable}`).
- **Language Switching:**
    - `npx hello-mcp lang` command to select language via a UI.
    -  Quick language switching using environment variables (e.g., `LC_ALL=en node index.js`).

## 📊 Telemetry

Hello-MCP collects anonymous usage data to improve the service:
- User interactions and performance metrics
- All data is anonymized
- You can disable telemetry in the configuration

## 🌟 Tips for Using with Claude

After setup, you can try these prompts with Claude:
1. "1 add 1" (Simple calculation)
2. "Send an email to [your-email] with the result of 1 add 1"

## 🤝 Support

If you encounter any issues, please contact us at help@garak.ai

## 🔍 Troubleshooting Guide

### Common Issues

#### Claude Desktop 서비스 중단 메시지
Claude Desktop에서 "Claude will return Soon, Claude ai is currently experiencing a temporary service disruption" 오류가 발생하는 경우:
1. Claude Desktop 앱을 완전히 종료한 후 다시 시작해보세요.
2. 인터넷 연결 상태를 확인하세요.
3. [Anthropic 서비스 상태](https://status.anthropic.com/) 페이지를 확인하세요.
4. 문제가 지속되면 몇 시간 후에 다시 시도해보세요. 서비스 제공자의 일시적인 문제일 수 있습니다.

#### 웹사이트 접속 오류
웹사이트에 접속할 수 없는 경우:
1. 인터넷 연결 상태를 확인하세요.
2. 브라우저 캐시를 삭제한 후 다시 시도해보세요.
3. 다른 브라우저를 사용해보세요.
4. 아래 주소로 직접 접속해보세요: https://garak.ai/getting-started

#### 이메일 전송 오류
이메일 전송 중 오류가 발생하는 경우:
1. 이메일 주소가 올바른지 확인하세요.
2. API 키가 유효한지 확인하세요. `npx hello-mcp` 명령어로 새 API 키를 발급받을 수 있습니다.
3. 메시지 본문이 너무 길면(200자 이상) 분할하여 전송해보세요.

#### Windows에서 asdf 관련 오류
Windows에서는 asdf 대신 Node.js 공식 웹사이트에서 설치 파일을 다운로드하여 설치하세요:
1. [Node.js 공식 다운로드 페이지](https://nodejs.org/en/download/)를 방문합니다.
2. Windows Installer(.msi)를 다운로드합니다.
3. 설치 마법사를 따라 설치를 완료합니다.

## 📚 Documentation

For more examples and tips, visit our guide:
[https://garak.ai/getting-started](https://garak.ai/getting-started)

## 🚧 TODO

- If you encounter any problems or have suggestions, please create an issue on a suitable issue tracking system (e.g., GitHub Issues). Provide a detailed description of the issue and steps to reproduce it. https://github.com/hongsw/hello-mcp/issues
- Windows support is currently under testing.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
