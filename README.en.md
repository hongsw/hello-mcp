# 🚀 Hello MCP(Model Context Protocol)
### "Tour and Guide Tool for Setting Up Claude Desktop MCP Config Manager"

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/en/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Overview

Hello-MCP is a helpful utility tool that enables Claude Desktop to interact with external tools via the Model Context Protocol (MCP). It simplifies the setup process and provides a seamless integration between Claude AI and your custom tools.

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

Hello-MCP can be used in three different modes:

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

#### Claude Desktop Service Disruption Message
If you see "Claude will return Soon, Claude AI is currently experiencing a temporary service disruption" error in Claude Desktop:
1. Completely close the Claude Desktop app and restart it.
2. Check your internet connection.
3. Check the [Anthropic service status](https://status.anthropic.com/) page.
4. If the problem persists, try again in a few hours. It might be a temporary issue with the service provider.

#### Website Access Errors
If you cannot access the website:
1. Check your internet connection.
2. Clear your browser cache and try again.
3. Try using a different browser.
4. Try accessing the direct URL: https://garak.ai/getting-started

#### Email Sending Errors
If you encounter errors when sending emails:
1. Verify that the email address is correct.
2. Ensure your API key is valid. You can get a new API key with the `npx hello-mcp` command.
3. If your message body is too long (over 200 characters), try splitting it into smaller messages.

#### Windows asdf-related Errors
On Windows, instead of using asdf, download and install Node.js directly from the official website:
1. Visit the [Node.js official download page](https://nodejs.org/en/download/).
2. Download the Windows Installer (.msi).
3. Complete the installation by following the installation wizard.

## 📚 Documentation

For more examples and tips, visit our guide:
[https://garak.ai/getting-started](https://garak.ai/getting-started)

## 🚧 TODO

- If you encounter any problems or have suggestions, please create an issue on GitHub Issues. Provide a detailed description of the issue and steps to reproduce it. https://github.com/hongsw/hello-mcp/issues
- Windows support is currently under testing.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 