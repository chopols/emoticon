# 이모티콘 사이트 재배포 스크립트
# 1) 로컬에서 next build 실행 -> out/ 생성
# 2) out/ 내용을 서버로 업로드
#
# 사용법:  ./deploy.ps1    (선택: -NoBuild 를 붙이면 빌드 생략, -SkipGit 도 가능)
#
# 요구사항:
#   - 로컬 SSH 키 ~/.ssh/emoticon_server 가 서버에 등록되어 있어야 함
#   - 서버 접속 계정: chopols@ubuntu.ibzsoft.com

param(
    [switch]$NoBuild,
    [string]$Server = "chopols@ubuntu.ibzsoft.com",
    [string]$Key = "$HOME\.ssh\emoticon_server",
    [string]$RemoteDir = "/home/chopols/html/emoticon"
)

$ErrorActionPreference = "Stop"

# 1) 빌드
if (-not $NoBuild) {
    Write-Host "`n[1/3] 로컬 빌드 시작 (npm run build)..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "빌드 실패. 중단합니다."
    }
    Write-Host "빌드 완료 -> out/" -ForegroundColor Green
} else {
    Write-Host "`n[1/3] 빌드 생략(-NoBuild) - 기존 out/ 사용" -ForegroundColor Yellow
}

# 2) 서버 기존 파일 정리
Write-Host "`n[2/3] 서버 기존 파일 정리..." -ForegroundColor Cyan
ssh -i "$Key" -o BatchMode=yes $Server "rm -rf $RemoteDir/*"
if ($LASTEXITCODE -ne 0) {
    Write-Error "서버 정리 실패."
}

# 3) 업로드
Write-Host "`n[3/3] 업로드 중..." -ForegroundColor Cyan
scp -r -i "$Key" -o BatchMode=yes out/* "${Server}:${RemoteDir}/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "업로드 실패."
}

Write-Host "`n배포 완료!" -ForegroundColor Green
Write-Host "확인: http://ubuntu.ibzsoft.com/emoticon/ (캐시 방지: Ctrl+Shift+R)" -ForegroundColor Green
