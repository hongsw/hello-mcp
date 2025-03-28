# Hello MCP 시작하기

![Hello MCP 로고](images/hello-mcp-logo.png)

안녕하세요! Hello MCP에 오신 것을 환영합니다. 이 가이드는 Model Context Protocol(MCP)을 통해 Claude Desktop을 외부 도구와 연결하는 방법을 단계별로 안내합니다.

## 목차

- [소개](#소개)
- [설치하기](#설치하기)
- [시작하기](#시작하기)
- [주요 기능](#주요-기능)
- [사용 사례](#사용-사례)
- [문제 해결](#문제-해결)
- [고급 사용법](#고급-사용법)
- [API 레퍼런스](#api-레퍼런스)

## 소개

Hello MCP는 Claude Desktop AI 어시스턴트가 외부 도구와 소통할 수 있게 도와주는 도구입니다. Model Context Protocol(MCP)을 통해 Claude가 더 다양한 작업을 수행할 수 있도록 확장해줍니다.

![MCP 개념도](images/mcp-concept-diagram.png)

### Model Context Protocol(MCP)이란?

MCP는 AI 모델이 외부 도구와 통신할 수 있게 해주는 프로토콜입니다. 이를 통해 AI 모델은 다음과 같은 작업을 수행할 수 있습니다:

- 이메일 보내기
- 웹 검색하기
- 계산 수행하기
- 외부 API와 통신하기
- 파일 시스템과 상호작용하기

Hello MCP는 이러한 기능을 쉽게 설정하고 사용할 수 있게 해주는 도구입니다.

## 설치하기

### 사전 요구사항

Hello MCP를 사용하기 전에 다음 사항이 필요합니다:

- Node.js 14 이상
- Claude Desktop 애플리케이션 ([여기서 다운로드](https://claude.ai/download))
- 인터넷 연결

### Node.js 설치

#### macOS/Linux 사용자

터미널에서 다음 명령어를 실행하세요:

```bash
# asdf 설치 (아직 설치되지 않은 경우)
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2
echo '. $HOME/.asdf/asdf.sh' >> ~/.bashrc
echo '. $HOME/.asdf/completions/asdf.bash' >> ~/.bashrc
# zsh 사용자의 경우
echo '. $HOME/.asdf/asdf.sh' >> ~/.zshrc

# Node.js 플러그인 설치
asdf plugin add nodejs
asdf install nodejs 18.12.0  # 또는 14 이상의 버전
asdf global nodejs 18.12.0
```

![Node.js 설치 터미널](images/nodejs-install-terminal.png)

#### Windows 사용자

1. [Node.js 공식 다운로드 페이지](https://nodejs.org/en/download/)를 방문합니다.
2. Windows Installer(.msi)를 다운로드합니다.
3. 설치 프로그램을 실행하고 설치 마법사의 안내를 따르세요.

![Node.js 설치 과정](images/nodejs-install-windows.png)

4. 설치가 완료되면 명령 프롬프트(CMD) 또는 PowerShell을 열고 다음 명령어를 입력하여 설치를 확인하세요:

```
node --version
```

### Claude Desktop 설치

1. [Claude Desktop 다운로드 페이지](https://claude.ai/download)에서 운영체제에 맞는 설치 파일을 다운로드합니다.
2. 설치 파일을 실행하고 안내에 따라 설치를 완료합니다.
3. 설치가 완료되면 Claude Desktop을 실행합니다.

![Claude Desktop 설치](images/claude-desktop-install.png)

## 시작하기

Hello MCP는 설치 없이 NPX를 통해 바로 실행할 수 있습니다.

### 설정 마법사 실행

터미널(또는 명령 프롬프트)에서 다음 명령어를 실행하세요:

```bash
npx hello-mcp
```

![설정 마법사 시작](images/setup-wizard-start.png)

이 명령어는 대화형 설정 마법사를 시작합니다. 다음과 같은 과정을 안내받게 됩니다:

1. Claude Desktop이 설치되어 있는지 확인
2. 이메일 주소 입력
3. 사용 목적 선택
4. API 키 생성
5. Claude Desktop MCP 설정
6. Claude Desktop 자동 재시작 (가능한 경우)

각 단계에서 화면의 안내를 따르세요.

### 이메일 주소 입력

설정 중 이메일 주소를 입력하라는 메시지가 표시됩니다. 이 이메일은 API 키 생성 및 중요 알림을 받는 데 사용됩니다.

![이메일 입력 화면](images/email-input-screen.png)

### API 키 생성

이메일 주소와 사용 목적을 입력하면 Hello MCP가 자동으로 API 키를 생성합니다. 이 키는 `~/.garakrc` 파일에 저장되며, Claude Desktop과 함께 사용하도록 자동으로 구성됩니다.

![API 키 생성](images/api-key-generation.png)

### 설정 완료

모든 설정이 완료되면 성공 메시지가 표시됩니다. 이제 Claude Desktop에서 MCP 기능을 사용할 수 있습니다.

![설정 완료](images/setup-complete.png)

## 주요 기능

Hello MCP는 세 가지 주요 모드로 작동합니다:

### 1. 설정 모드 (기본)

```bash
npx hello-mcp
# 또는
npx hello-mcp setup
```

설정 모드는 Claude Desktop에서 MCP를 사용하기 위한 모든 구성을 자동으로 설정합니다.

### 2. MCP 서버 모드

```bash
npx hello-mcp mcp-server
```

![MCP 서버 실행](images/mcp-server-running.png)

MCP 서버 모드는 Claude Desktop이 연결할 수 있는 서버를 시작합니다. 이 모드에서는 다음과 같은 기능을 제공합니다:

- 계산 도구: 간단한 수학 계산 수행
- 이메일 도구: Claude를 통해 이메일 전송
- 웹 검색 도구: 인터넷에서 정보 검색

### 3. CLI 모드

```bash
npx hello-mcp cli [명령어] [옵션]
```

CLI 모드에서는 명령줄에서 직접 Hello MCP의 기능을 사용할 수 있습니다.

#### 숫자 더하기

```bash
npx hello-mcp cli add 3 5
```

결과: `8`

![CLI 덧셈 예제](images/cli-add-example.png)

#### 이메일 보내기

```bash
npx hello-mcp cli send-email user@example.com "Hello from Hello-MCP CLI"
```

![이메일 전송 예제](images/email-sending-example.png)

## 사용 사례

Claude와 Hello MCP를 함께 사용할 수 있는 몇 가지 예를 살펴보겠습니다.

### 1. 간단한 계산

Claude에게 다음과 같이 물어보세요:

```
1 add 1
```

Claude는 Hello MCP의 계산 도구를 사용하여 결과를 반환합니다:

```
2
```

![계산 예제](images/calculation-example.png)

### 2. 이메일 전송

Claude에게 다음과 같이 요청하세요:

```
Send an email to [your-email] with the result of 1 add 1
```

Claude는 계산을 수행한 다음 결과를 이메일로 전송합니다.

![이메일 전송 결과](images/email-result-example.png)

### 3. 복합적인 작업

Hello MCP는 여러 도구를 연속해서 사용하는 복합적인 작업도 지원합니다. 예를 들어:

```
Search for the current weather in Seoul and send it to me via email
```

Claude는 웹 검색을 통해 서울의 현재 날씨를 찾고, 그 정보를 이메일로 전송합니다.

![복합 작업 예제](images/complex-task-example.png)

## 문제 해결

Hello MCP 사용 중 발생할 수 있는 일반적인 문제와 해결 방법입니다.

### Claude Desktop 서비스 중단 메시지

Claude Desktop에서 "Claude will return Soon, Claude AI is currently experiencing a temporary service disruption" 오류가 발생하는 경우:

1. Claude Desktop 앱을 완전히 종료하고 다시 시작해보세요.
2. 인터넷 연결 상태를 확인하세요.
3. [Anthropic 서비스 상태](https://status.anthropic.com/) 페이지를 확인하세요.
4. 문제가 지속되면 몇 시간 후에 다시 시도해보세요. 서비스 제공자의 일시적인 문제일 수 있습니다.

![서비스 중단 메시지](images/service-disruption-message.png)

### 웹사이트 접속 오류

웹사이트에 접속할 수 없는 경우:

1. 인터넷 연결 상태를 확인하세요.
2. 브라우저 캐시를 삭제한 후 다시 시도해보세요.
3. 다른 브라우저를 사용해보세요.
4. 직접 URL로 접속해보세요: https://garak.im/getting-started

### 이메일 전송 오류

이메일 전송 중 오류가 발생하는 경우:

1. 이메일 주소가 올바른지 확인하세요.
2. API 키가 유효한지 확인하세요. `npx hello-mcp` 명령어로 새 API 키를 발급받을 수 있습니다.
3. 메시지 본문이 너무 길면(200자 이상) 분할하여 전송해보세요.

![이메일 오류 예제](images/email-error-example.png)

### Windows에서 asdf 관련 오류

Windows에서는 asdf 대신 Node.js 공식 웹사이트에서 설치 파일을 다운로드하여 설치하세요:

1. [Node.js 공식 다운로드 페이지](https://nodejs.org/en/download/)를 방문합니다.
2. Windows Installer(.msi)를 다운로드합니다.
3. 설치 마법사를 따라 설치를 완료합니다.

## 고급 사용법

### 국제화 설정

Hello MCP는 여러 언어를 지원합니다. 언어를 변경하려면:

```bash
npx hello-mcp lang
```

![언어 선택 화면](images/language-selection.png)

또는 환경 변수를 사용하여 언어를 설정할 수 있습니다:

```bash
# 영어로 설정
LC_ALL=en npx hello-mcp

# 한국어로 설정
LC_ALL=ko npx hello-mcp
```

### 텔레메트리 설정

Hello MCP는 기본적으로 익명의 사용 데이터를 수집합니다. 이 기능을 비활성화하려면:

1. `~/.garakrc` 파일을 텍스트 편집기로 엽니다.
2. `"telemetry": false`로 설정합니다.

```json
{
  "apiKey": "your-api-key",
  "email": "your-email@example.com",
  "telemetry": false
}
```

### 사용자 정의 MCP 도구 추가

고급 사용자는 Hello MCP에 자신만의 MCP 도구를 추가할 수 있습니다. 이를 위해서는:

1. `./tools` 디렉토리에 새 JavaScript 파일을 생성합니다.
2. MCP 도구 인터페이스를 구현합니다.
3. 도구를 등록합니다.

예시:

```javascript
// ./tools/my-custom-tool.js
module.exports = {
  name: 'my-custom-tool',
  description: '사용자 정의 도구 예제',
  async execute(params) {
    // 도구 로직 구현
    return { result: 'Hello from my custom tool!' };
  }
};
```

![사용자 정의 도구 예제](images/custom-tool-example.png)

## API 레퍼런스

### 계산 API

```
/api/calculate
```

요청 예시:
```json
{
  "operation": "add",
  "a": 3,
  "b": 5
}
```

응답 예시:
```json
{
  "result": 8
}
```

지원하는 연산: `add`, `subtract`, `multiply`, `divide`

### 이메일 API

```
/api/send-email
```

요청 예시:
```json
{
  "to": "recipient@example.com",
  "subject": "Hello from API",
  "body": "This is a test email."
}
```

응답 예시:
```json
{
  "success": true,
  "messageId": "abcd1234"
}
```

### 웹 검색 API

```
/api/web-search
```

요청 예시:
```json
{
  "query": "weather in Seoul"
}
```

응답 예시:
```json
{
  "results": [
    {
      "title": "Seoul Weather - Current Conditions",
      "description": "Current weather in Seoul: 25°C, Partly Cloudy.",
      "url": "https://example.com/weather/seoul"
    },
    // 추가 결과...
  ]
}
```

## 다음 단계

Hello MCP를 성공적으로 설정하고 사용하는 방법을 배웠습니다. 다음으로 시도해볼 수 있는 것들:

1. Claude와 함께 다양한 도구 사용해 보기
2. MCP 서버 모드 탐색하기
3. CLI 모드로 스크립트 자동화하기
4. 사용자 정의 도구 개발하기

질문이나 제안이 있으시면 GitHub 이슈 트래커를 통해 문의해주세요: [Hello MCP GitHub Issues](https://github.com/hongsw/hello-mcp/issues)

![다음 단계](images/next-steps.png)

---

Hello MCP 문서는 지속적으로 업데이트됩니다. 최신 정보는 [GitHub 저장소](https://github.com/hongsw/hello-mcp)를 확인해주세요. 