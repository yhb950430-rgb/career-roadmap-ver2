# 커리어 로드맵 ver2 (Vite + React)

## 1) 설치(최초 1회)
- Node.js LTS(18+), Git 설치
- 터미널에서:
```bash
npm i
```

## 2) 로컬 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`

## 3) GitHub Pages 배포 (gh-pages 브랜치)
1) `vite.config.js`의 base를 '/<repo>/'로 변경
2) GitHub 리포 연결 후:
```bash
git add -A
git commit -m "init"
git push -u origin main
npm run deploy
```
3) GitHub 저장소 → Settings → Pages → Branch: `gh-pages` 선택

## 4) 자주 막히는 부분
- 화면이 하얗게 나오면: base 경로 확인
- 새로고침 404: dist/404.html이 생성되도록 scripts/copy-404.js 포함
- 회사망에서 Padlet 차단: 새 창 링크로 열기
