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
      path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Claude', 'Claude.exe'),
      path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Claude', 'Claude.exe')
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