# 🚀 Hello MCP(Model Context Protocol)
### "Claude Desktop MCP 설정 관리자를 위한 가이드 도구"

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/en/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 개요

Hello-MCP는 Claude Desktop이 Model Context Protocol(MCP)을 통해 외부 도구와 상호작용할 수 있게 해주는 유용한 유틸리티 도구입니다. 설정 과정을 간소화하고 Claude AI와 사용자 지정 도구 간의 원활한 통합을 제공합니다.

## 🛠️ 기능

- **간편한 설정**: Claude Desktop MCP 통합을 위한 간단한 원커맨드 설정
- **다양한 모드**: 설정 마법사, MCP 서버, CLI 도구로 실행 가능
- **내장 샘플 도구**: 이메일 전송 및 간단한 계산과 같은 미리 구성된 도구
- **확장성**: 자체 MCP 도구를 쉽게 추가 가능
- **다국어 지원**: 여러 언어 지원(한국어 및 영어)

## 📋 요구 사항

- Node.js 14 이상
- Claude Desktop 설치 ([여기서 다운로드](https://claude.ai/download))
- API 키 생성을 위한 인터넷 연결

## 🔧 설치

### Node.js 설치

#### macOS/Linux
`asdf`를 사용하여 Node.js 버전을 관리할 수 있습니다:
```bash
# asdf 설치 (아직 설치되지 않은 경우)
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2
echo '. $HOME/.asdf/asdf.sh' >> ~/.bashrc
echo '. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc
# 또는 zsh의 경우
echo '. $HOME/.asdf/asdf.sh' >> ~/.zshrc

# Node.js 플러그인 설치
asdf plugin add nodejs
asdf install nodejs 18.12.0  # 또는 14 이상의 버전
asdf global nodejs 18.12.0
```

#### Windows
공식 웹사이트에서 직접 Node.js를 다운로드하여 설치하세요:
1. [Node.js 공식 다운로드 페이지](https://nodejs.org/en/download/) 방문
2. Windows 설치 프로그램(.msi) 다운로드
3. 설치 프로그램을 실행하고 설치 마법사를 따르세요
4. 명령 프롬프트 또는 PowerShell을 열고 다음을 입력하여 설치를 확인하세요:
```
node --version
```

## 🚀 빠른 시작

npx를 사용하여 설치 없이 Hello-MCP를 실행할 수 있습니다:

```bash
npx hello-mcp
```

이렇게 하면 전체 구성 과정을 안내하는 설정 마법사가 시작됩니다.

## 🎮 사용법

Hello-MCP는 세 가지 다른 모드로 사용할 수 있습니다:

### 1️⃣ 설정 모드 (기본)

```bash
npx hello-mcp
# 또는
npx hello-mcp setup
```

이 대화형 모드는 다음을 수행합니다:
- Claude Desktop이 설치되어 있는지 확인
- 이메일과 용도 요청
- API 키 생성
- MCP용 Claude Desktop 구성
- 가능한 경우 Claude Desktop 자동 재시작

### 2️⃣ MCP 서버 모드

```bash
npx hello-mcp mcp-server
```

이 모드는 Hello-MCP를 Claude Desktop이 연결할 수 있는 MCP 서버로 시작합니다. 서버는 Claude가 작업을 수행하는 데 사용할 수 있는 도구를 제공합니다.

### 3️⃣ CLI 모드

```bash
npx hello-mcp cli [명령어] [옵션]
```

사용 가능한 명령어:
- `add`: 두 숫자 더하기
  ```bash
  npx hello-mcp cli add 3 5
  ```
- `send-email`: 이메일 보내기
  ```bash
  npx hello-mcp cli send-email user@example.com "Hello-MCP에서 보낸 안녕하세요"
  ```

## 🔑 API 키

API 키는 `~/.garakrc`에 저장되며 일일 요청 한도는 50개입니다. 키는 Claude Desktop과 함께 사용하도록 자동으로 구성됩니다.

## 🌐 국제화 (i18n)

Hello-MCP는 강력한 국제화 아키텍처를 통해 여러 언어를 지원합니다.

**주요 기능:**

- **언어 파일:** `locales/` 디렉토리에 각 언어별 별도의 JSON 파일(예: `ko.json`, `en.json`).
- **자동 언어 감지:**
    - 환경 변수(`LC_ALL`, `LANG`, `LANGUAGE`)를 기반으로 언어 감지.
    - 운영 체제 설정(macOS, Windows) 감지.
    - 사용자 구성 파일(`.garakrc`)에 저장된 언어 기본 설정 사용.
- **플레이스홀더 지원:** 플레이스홀더를 사용한 동적 텍스트 삽입(예: `{variable}`).
- **언어 전환:**
    - UI를 통해 언어를 선택하는 `npx hello-mcp lang` 명령어.
    - 환경 변수를 사용한 빠른 언어 전환(예: `LC_ALL=en node index.js`).

## 📊 원격 분석

Hello-MCP는 서비스 개선을 위해 익명의 사용 데이터를 수집합니다:
- 사용자 상호 작용 및 성능 지표
- 모든 데이터는 익명화됨
- 구성에서 원격 분석을 비활성화할 수 있음

## 🌟 Claude와 함께 사용하는 팁

설정 후 Claude에서 다음 프롬프트를 시도해 볼 수 있습니다:
1. "1 add 1" (간단한 계산)
2. "Send an email to [your-email] with the result of 1 add 1" ([이메일]로 1 add 1의 결과를 이메일로 보내기)

## 🤝 지원

문제가 발생하면 help@garak.ai로 문의하세요.

## 🔍 문제 해결 가이드

### 일반적인 문제

#### Claude Desktop 서비스 중단 메시지
Claude Desktop에서 "Claude will return Soon, Claude AI is currently experiencing a temporary service disruption" 오류가 발생하는 경우:
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

## 📚 문서

더 많은 예제와 팁은 가이드를 참조하세요:
[https://garak.ai/getting-started](https://garak.ai/getting-started)

## 🚧 할 일

- 문제가 발생하거나 제안 사항이 있으면 GitHub Issues에 이슈를 생성해 주세요. 문제에 대한 자세한 설명과 재현 단계를 제공해 주세요. https://github.com/hongsw/hello-mcp/issues
- Windows 지원은 현재 테스트 중입니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 LICENSE 파일을 참조하세요. 