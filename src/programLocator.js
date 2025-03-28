import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

/**
 * Windows에서 프로그램 설치 여부 및 위치 확인
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkWindowsProgram(programName) {
  if (os.platform() !== 'win32') {
    throw new Error('이 메서드는 Windows에서만 동작합니다');
  }

  const result = {
    installed: false,
    location: null,
    version: null
  };

  // Claude의 일반적인 설치 경로 확인
  if (programName === 'Claude') {
    const possiblePaths = [
      path.join(os.homedir(), 'AppData', 'Local', 'AnthropicClaude', 'claude.exe')
    ];

    for (const claudePath of possiblePaths) {
      if (fs.existsSync(claudePath)) {
        result.installed = true;
        result.location = claudePath;
        try {
          // Windows에서 파일 버전 정보 추출
          const versionCommand = `powershell -command "(Get-Item '${claudePath}').VersionInfo.FileVersion"`;
          result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        return result;
      }
    }
  }

  try {
    // 레지스트리를 통해 프로그램 확인 (32비트 및 64비트)
    const registryPaths = [
      'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    ];

    for (const regPath of registryPaths) {
      try {
        const command = `reg query "${regPath}" /s /f "${programName}"`;
        const output = execSync(command, { encoding: 'utf-8' });
        
        if (output.includes(programName)) {
          result.installed = true;
          
          // 설치 경로 추출 시도
          const locationMatch = output.match(/InstallLocation\s+REG_SZ\s+(.+)/);
          if (locationMatch) {
            result.location = locationMatch[1].trim();
          }
          
          // 버전 정보 추출 시도
          const versionMatch = output.match(/DisplayVersion\s+REG_SZ\s+(.+)/);
          if (versionMatch) {
            result.version = versionMatch[1].trim();
          }
          
          break;
        }
      } catch (error) {
        // 레지스트리 검색 실패는 무시하고 계속 진행
        continue;
      }
    }

    return result;
  } catch (error) {
    // 모든 검색 방법이 실패한 경우
    return result;
  }
}

/**
 * macOS에서 프로그램 설치 여부 및 위치 확인
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkMacProgram(programName) {
  if (os.platform() !== 'darwin') {
    throw new Error('이 메서드는 macOS에서만 동작합니다');
  }

  const result = {
    installed: false,
    location: null,
    version: null
  };

  // Claude의 일반적인 설치 경로 확인
  if (programName === 'Claude') {
    const possiblePaths = [
      '/Applications/Claude.app',
      path.join(os.homedir(), 'Applications', 'Claude.app')
    ];

    for (const claudePath of possiblePaths) {
      if (fs.existsSync(claudePath)) {
        result.installed = true;
        result.location = claudePath;
        
        // 버전 정보 추출 시도
        try {
          const infoPlistPath = path.join(claudePath, 'Contents/Info.plist');
          if (fs.existsSync(infoPlistPath)) {
            const versionCommand = `/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "${infoPlistPath}"`;
            result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
          }
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        
        return result;
      }
    }
  }

  try {
    // Spotlight를 사용하여 앱 검색
    const mdfindCommand = `mdfind "kMDItemKind == 'Application'" -name "${programName}"`;
    const mdfindOutput = execSync(mdfindCommand, { encoding: 'utf-8' });
    
    if (mdfindOutput.trim()) {
      const locations = mdfindOutput.split('\n').filter(Boolean);
      if (locations.length > 0) {
        result.installed = true;
        result.location = locations[0]; // 첫 번째 발견된 위치 사용
        
        // 버전 정보 추출 시도
        try {
          const infoPlistPath = path.join(result.location, 'Contents/Info.plist');
          if (fs.existsSync(infoPlistPath)) {
            const versionCommand = `/usr/libexec/PlistBuddy -c "Print CFBundleShortVersionString" "${infoPlistPath}"`;
            result.version = execSync(versionCommand, { encoding: 'utf-8' }).trim();
          }
        } catch (error) {
          // 버전 정보 추출 실패는 무시
        }
        
        return result;
      }
    }

    return result;
  } catch (error) {
    return result;
  }
}

/**
 * 운영체제에 맞는 프로그램 설치 확인 함수 호출
 * @param {string} programName - 찾을 프로그램 이름
 * @returns {object} - 설치 여부와 위치 정보
 */
export function checkProgramInstallation(programName) {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      return checkWindowsProgram(programName);
    } else if (platform === 'darwin') {
      return checkMacProgram(programName);
    } else {
      throw new Error('지원되지 않는 운영체제입니다');
    }
  } catch (error) {
    return {
      installed: false,
      location: null,
      version: null,
      error: error.message
    };
  }
}

/**
 * 현재 실행 환경의 쉘 정보를 감지
 * @returns {object} - 쉘 환경 정보
 */
export function detectShellEnvironment() {
  const result = {
    platform: os.platform(),
    shell: process.env.SHELL || 'unknown',
    type: 'unknown',
    debug: {
      env: {
        SHELL: process.env.SHELL,
        TERM: process.env.TERM,
        MSYSTEM: process.env.MSYSTEM,
        ComSpec: process.env.ComSpec,
        PSModulePath: process.env.PSModulePath
      },
      path: process.env.PATH,
      cwd: process.cwd(),
      home: os.homedir()
    }
  };

  try {
    if (result.platform === 'win32') {
      // Windows 환경 감지
      if (process.env.MSYSTEM) {
        // MINGW (Git Bash) 환경
        result.type = 'mingw';
        result.debug.msystem = process.env.MSYSTEM;
        console.log('MINGW(Git Bash) 환경이 감지되었습니다.');
      } else {
        // PowerShell 또는 CMD 감지
        try {
          execSync('powershell $PSVersionTable', { stdio: 'pipe' });
          result.type = 'powershell';
          console.log('PowerShell 환경이 감지되었습니다.');
        } catch (error) {
          if (process.env.ComSpec && process.env.ComSpec.toLowerCase().includes('cmd.exe')) {
            result.type = 'cmd';
            console.log('CMD 환경이 감지되었습니다.');
          } else {
            console.log('알 수 없는 Windows 환경입니다.');
          }
        }
      }
    } else if (result.platform === 'darwin') {
      // macOS 쉘 환경 감지
      const shell = process.env.SHELL || '';
      if (shell.includes('bash')) {
        result.type = 'bash';
        console.log('Bash 환경이 감지되었습니다.');
      } else if (shell.includes('zsh')) {
        result.type = 'zsh';
        console.log('Zsh 환경이 감지되었습니다.');
      } else {
        result.type = 'unix';
        console.log('기타 Unix 쉘 환경이 감지되었습니다.');
      }
    }

    // 추가 환경 정보 수집
    try {
      if (result.platform === 'win32') {
        if (result.type === 'powershell') {
          result.debug.shellVersion = execSync('powershell $PSVersionTable.PSVersion', { stdio: 'pipe' }).toString();
        } else if (result.type === 'cmd') {
          result.debug.shellVersion = execSync('cmd /c ver', { stdio: 'pipe' }).toString();
        }
      } else {
        result.debug.shellVersion = execSync('echo $SHELL_VERSION', { stdio: 'pipe' }).toString();
      }
    } catch (error) {
      result.debug.shellVersionError = error.message;
    }

  } catch (error) {
    result.error = error.message;
    console.error('쉘 환경 감지 중 오류 발생:', error);
  }

  // console.log('감지된 쉘 환경:', result);
  return result;
}

/**
 * 쉘 환경에 따른 명령어 매핑
 */
const SHELL_COMMANDS = {
  windows: {
    mingw: {
      kill: (processName) => `winpty powershell.exe -Command \"Stop-Process -Name "${processName}" -Force -ErrorAction SilentlyContinue\"`,
      start: (exePath) => `start C:/Users/${os.userInfo().username}/AppData/Local/AnthropicClaude/claude.exe`,
      list: 'tasklist | grep -i "claude"'
    },
    powershell: {
      kill: (processName) => `Stop-Process -Name "${processName}" -Force -ErrorAction SilentlyContinue`,
      start: (exePath) => `Start-Process "C:/Users/${os.userInfo().username}/AppData/Local/AnthropicClaude/claude.exe"`,
      list: 'Get-Process | Where-Object { $_.Name -like "*claude*" } | Select-Object Name, Id'
    },
    cmd: {
      kill: (processName) => `taskkill /F /IM "${processName}" 2>nul`,
      start: (exePath) => `start C:/Users/${os.userInfo().username}/AppData/Local/AnthropicClaude/claude.exe`,
      list: 'tasklist | findstr /i "claude"'
    }
  },
  darwin: {
    all: {
      kill: (bundleId) => `pkill -f "${bundleId}"`,
      start: (appPath) => `open "${appPath}"`,
      list: 'ps aux | grep -i "Claude.app"'
    }
  }
};

/**
 * 초기화 및 환경 설정
 * @returns {object} - 초기화 결과
 */
export async function initialize() {
  const result = {
    success: false,
    shellEnvironment: null,
    claudeInfo: null
  };

  try {
    // 1. 쉘 환경 감지
    console.log('쉘 환경 감지 중...');
    result.shellEnvironment = detectShellEnvironment();
    
    // 2. Claude 설치 확인
    console.log('Claude Desktop 설치 확인 중...');
    result.claudeInfo = checkProgramInstallation('Claude');
    
    if (!result.claudeInfo.installed) {
      result.message = 'Claude Desktop이 설치되어 있지 않습니다.';
      return result;
    }

    // 3. 명령어 세트 설정
    const platform = os.platform();
    if (platform === 'win32') {
      result.commands = SHELL_COMMANDS.windows[result.shellEnvironment.type] || SHELL_COMMANDS.windows.cmd;
    } else if (platform === 'darwin') {
      result.commands = SHELL_COMMANDS.darwin.all;
    } else {
      throw new Error('지원되지 않는 운영체제입니다.');
    }

    result.success = true;
    result.message = '초기화가 완료되었습니다.';
    
  } catch (error) {
    result.success = false;
    result.message = `초기화 중 오류가 발생했습니다: ${error.message}`;
    result.error = {
      message: error.message,
      stack: error.stack
    };
  }

  // console.log('초기화 결과:', result);
  return result;
}

/**
 * Claude Desktop 프로그램 재시작
 * @returns {object} - 재시작 성공 여부와 메시지
 */
export async function restartClaudeDesktop() {
  const result = {
    success: false,
    platform: os.platform()
  };

  try {
    // 초기화 및 환경 설정
    const initResult = await initialize();
    if (!initResult.success) {
      return {
        ...result,
        message: initResult.message,
        error: initResult.error
      };
    }

    result.shellEnvironment = initResult.shellEnvironment;
    result.claudeInfo = initResult.claudeInfo;
    result.commands = initResult.commands;

    console.log('재시작 시작 - 환경:', result.shellEnvironment);

    if (result.platform === 'win32') {
      // Windows에서 프로세스 종료
      try {
        const killCmd = result.commands.kill('claude.exe');
        console.log('프로세스 종료 시도:', killCmd);
        execSync(killCmd, { stdio: 'pipe' });
      } catch (error) {
        console.log('프로세스 종료 중 오류 (무시됨):', error.message);
      }

      // 잠시 대기
      console.log('2초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 프로세스 시작
      try {
        const startCmd = result.commands.start(result.claudeInfo.location);
        console.log('프로세스 시작 시도:', startCmd);
        execSync(startCmd, { stdio: 'pipe' });
        result.success = true;
        result.message = 'Claude Desktop이 성공적으로 재시작되었습니다.';
      } catch (error) {
        throw new Error(`프로세스 시작 실패: ${error.message}`);
      }

    } else if (result.platform === 'darwin') {
      // macOS 처리
      // ... existing macOS code ...
    }

  } catch (error) {
    result.success = false;
    result.message = `재시작 중 오류가 발생했습니다: ${error.message}`;
    result.error = {
      message: error.message,
      stack: error.stack
    };
  }

  console.log('최종 재시작 결과:', result);
  return result;
} 