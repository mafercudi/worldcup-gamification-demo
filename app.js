:root {
  --brand-bg: #002f2b;
  --brand-primary: #003c35;
  --brand-secondary: #24d6e9;
  --brand-accent: #f23b55;

  --green-dark: #002f2b;
  --green-card: #003c35;
  --cyan: #24d6e9;
  --red: #f23b55;
  --yellow: #f5cf4c;
  --white: #ffffff;
  --black: #050505;
  --muted: rgba(255, 255, 255, 0.72);
  --line: rgba(255, 255, 255, 0.16);
  --paper: #f7f7f3;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

/* GAME */

.game-body {
  min-height: 100vh;
  background: var(--brand-bg);
  color: var(--white);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.game-app {
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: start center;
  padding: 10px 10px 24px;
  background:
    radial-gradient(circle at 92% 8%, rgba(255, 255, 255, 0.08), transparent 26%),
    linear-gradient(180deg, var(--brand-bg), #001f1c);
}

.game-card {
  width: min(100%, 430px);
  min-height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
}

.brand-row img {
  width: 112px;
  max-height: 38px;
  object-fit: contain;
  background: white;
  border-radius: 10px;
  padding: 5px;
}

.admin-link {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.intro {
  text-align: center;
  padding: 2px 0 4px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--yellow);
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.16em;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 11vw, 48px);
  line-height: 0.88;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  font-weight: 950;
}

.intro p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
}

.team-block {
  display: grid;
  gap: 7px;
}

.team-block label {
  font-size: 13px;
  font-weight: 900;
}

#team-search {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 13px;
  padding: 12px 13px;
  font-size: 15px;
  outline: none;
}

#team-search::placeholder {
  color: rgba(255, 255, 255, 0.48);
}

.team-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 1px 7px;
  scrollbar-width: none;
}

.team-selector::-webkit-scrollbar {
  display: none;
}

.team-btn {
  flex: 0 0 auto;
  border: 1px solid var(--line);
  border-radius: 999px;
  min-height: 40px;
  min-width: 96px;
  padding: 9px 13px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
  cursor: pointer;
}

.team-btn.active {
  background: var(--brand-secondary);
  color: var(--black);
  border-color: var(--brand-secondary);
}

.score-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.score-row div {
  min-height: 54px;
  padding: 9px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
}

.score-row strong {
  display: block;
  font-size: 18px;
  line-height: 1.1;
  font-weight: 950;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.score-row span {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
}

.wheel-card {
  position: relative;
  display: grid;
  place-items: center;
  padding: 12px;
  border-radius: 26px;
  background: var(--brand-primary);
  border: 1px solid var(--line);
}

.wheel-container {
  width: min(88vw, 390px);
  height: min(88vw, 390px);
}

.pointer {
  position: absolute;
  top: 6px;
  z-index: 5;
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 32px solid var(--brand-accent);
  filter: drop-shadow(0 8px 8px rgba(0, 0, 0, 0.35));
}

.primary-btn,
.secondary-btn,
.danger-btn {
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 14px 18px;
  font-size: 15px;
  font-weight: 950;
  cursor: pointer;
}

.primary-btn {
  background: var(--brand-secondary);
  color: var(--black);
}

.primary-btn:disabled {
  opacity: 0.48;
  cursor: not-allowed;
}

.secondary-btn {
  background: var(--yellow);
  color: var(--black);
}

.danger-btn {
  background: #ef4444;
  color: white;
}

.result-card {
  padding: 15px;
  border-radius: 20px;
  background: white;
  color: var(--black);
}

.result-label {
  margin: 0 0 5px;
  color: var(--brand-accent);
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.result-card h2 {
  margin: 0 0 6px;
  font-size: 24px;
  line-height: 1;
  text-transform: uppercase;
}

.result-card p {
  margin: 0 0 10px;
  color: #4b5563;
  font-size: 14px;
}

.hidden {
  display: none;
}

/* ADMIN */

.admin-body {
  min-height: 100vh;
  background: var(--paper);
  color: var(--black);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.admin-app {
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 16px;
}

.admin-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  padding: 18px;
}

.admin-card h1 {
  color: var(--black);
  font-size: 40px;
}

.admin-card h2 {
  margin: 18px 0 10px;
  font-size: 20px;
  text-transform: uppercase;
}

.admin-card p {
  color: #4b5563;
}

.admin-preview {
  margin: 14px 0;
  display: flex;
  justify-content: center;
}

.admin-preview img {
  width: 160px;
  max-height: 72px;
  object-fit: contain;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 8px;
}

.admin-card label {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
  font-size: 14px;
  font-weight: 800;
  color: #374151;
}

.admin-card input,
.admin-card textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 13px;
  font-size: 14px;
  background: white;
  color: var(--black);
  outline: none;
}

.admin-card input[type="color"] {
  height: 46px;
  padding: 4px;
}

.color-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 10px;
}

.checkbox-label input {
  width: auto;
}

#payload-editor {
  min-height: 180px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

#generated-url {
  margin: 0;
  padding: 14px;
  border-radius: 14px;
  background: #111827;
  color: #d1fae5;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}

@media (min-width: 720px) {
  .game-app {
    place-items: center;
  }

  .game-card {
    min-height: auto;
  }
}
