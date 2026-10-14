const APP_VERSION = '1.3';
const dazn_stream_pattern = /^https:\/\/www\.dazn\.com\/[^/]+\/fixture\/.+$/;

const selectors = [
  // MLB
  '.scrubber-bar-wrapper',                          // seek bar
  '[class*="style__StyledTimeBar"]',                // time remaining
  '.ViewController.GamePanelStateViewController.live',  // side bar
  '.matchup.matchup-pitching-atbat',                // stats
  '.matchup.matchup-deck-hole',                     // stats
  '[class*="Playlist__Wrapper"]',                   // video playlist / recommendations (e.g. most popular)
  '[class*="Cardstyle__CardWrapper"]:has([data-mlb-test="teamSummaryMatchupWrapper"])', // gameday score and linescore card
  '[class*="Cardstyle__CardWrapper"]:has([class*="TeamSummaryMatchupstyle"])',           // gameday score card fallback
  '[data-mlb-test="teamSummaryMatchupWrapper"]',    // score summary fallback
  '[class*="Finalstyle__FinalLinescoreWrapper"]',   // linescore decisions fallback
  '[class*="Finalstyle__Col"]:has([class*="SidebarTabs"])',                              // gameday summary & insights sidebar column
  '[class*="Finalstyle__SidebarTabs"]',                                                 // sidebar tabs fallback
  '[class*="Finalstyle__SideTabContentWrapper"]',                                       // sidebar content fallback
  '[class*="HighlightsPlayliststyle__HighlightCardListWrapper"]',                       // gameday highlights playlist cards
  '[class*="HighlightsPlayliststyle__HeadlineDescriptionWrapper"]',                     // gameday highlights spoiler description
  '[class*="MiniScoreboardstyle__MiniScoreboardWrapper"]',                              // gameday top mini-scoreboard carousel
  '[class*="MiniScoreboard"]',                                                          // gameday mini-scoreboard elements
  '.p-mini-scoreboard',                                                                 // mlb global mini-scoreboard

  // DAZN NFL
  '[data-test-id="SCRUB_BAR"]',                     // seek bar
  '[data-test-id="BACKGROUND_IMAGE"]',              // images of games in grid
  '[class*="content-selection-menu__tile-image"]',  // image of game before playing it
  '[class*="main__player-aside"]',                  // side bar with scores
  '[data-portal-name="OPTIONS_MENU_2"]',            // stupid control which has an image
  '[data-test-id="DURATION"]',                      // total duration
  // Kan World Cup
  '.col-stats',
  '.sticky-sidebar-container',
  '.rgpl-progress-control',
  '.rgpl-controls-time-duration',

  // NBA
  '#progress-bar-container',                        // entire progress bar and time container
];

// Instantly inject CSS to prevent any flash of unstyled content
const styleEl = document.createElement('style');
styleEl.textContent = `
  ${selectors.join(',\n  ')} { 
      display: none !important; 
  }
  .news-card img { 
      opacity: 0 !important; 
  }
  .info-description { 
      display: none !important; 
  }
  video::-webkit-media-controls-timeline,
  video::-webkit-media-controls-time-remaining-display {
      display: none !important;
  }

  /* MLB Linescore - Non-Spoiler 9 Innings Jump Bar */
  .embedded_linescore_container {
      display: block !important;
      visibility: visible !important;
  }
  .embedded_linescore .status-row {
      display: none !important;
  }
  .embedded_linescore .scores,
  .embedded_linescore .runs-column-background-faker,
  .embedded_linescore .fixed:has(.scores) {
      display: none !important;
  }
  /* Always hide extra innings (innings >= 10) */
  .embedded_linescore th.inningHeader:nth-child(n+10),
  .embedded_linescore tr.away td.inning:nth-child(n+10),
  .embedded_linescore tr.home td.inning:nth-child(n+10) {
      display: none !important;
  }
  /* Hide runs, "x", and numbers while keeping cells clickable */
  .embedded_linescore td.inning {
      color: transparent !important;
      text-shadow: none !important;
      position: relative !important;
      cursor: pointer !important;
      user-select: none !important;
  }
  /* Neutral clickable indicators: ▲ for top (away), ▼ for bottom (home) */
  .embedded_linescore tr.away td.inning::after {
      content: '▲';
      font-size: 8px;
      color: rgba(255, 255, 255, 0.45);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
  }
  .embedded_linescore tr.home td.inning::after {
      content: '▼';
      font-size: 8px;
      color: rgba(255, 255, 255, 0.45);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
  }
  .embedded_linescore td.inning:hover::after {
      color: #ffffff !important;
      transform: translate(-50%, -50%) scale(1.3);
  }
  .embedded_linescore td.inning.active::after {
      color: #ffd700 !important;
  }
  .embedded_linescore .inning_button {
      display: none !important;
  }

  /* Custom Seek Controls (+60s / -60s) */
  .custom-seek-control {
      background: none !important;
      border: none !important;
      width: 32px !important;
      height: 30px !important;
      padding: 0 !important;
      margin: 0 !important;
      color: #c4c4c4 !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      vertical-align: middle !important;
      outline: none !important;
      transition: color 0.15s ease, transform 0.1s ease;
  }
  .custom-seek-control:hover {
      color: #ffffff !important;
  }
  .custom-seek-control:hover svg path,
  .custom-seek-control:hover svg text {
      fill: #ffffff !important;
  }
  .custom-seek-control:active {
      transform: scale(0.9);
  }
`;
document.documentElement.appendChild(styleEl);

function seekVideo(seconds) {
  const video = document.querySelector('video');
  if (!video) return;
  const current = video.currentTime;
  const duration = video.duration || Infinity;
  video.currentTime = Math.max(0, Math.min(duration, current + seconds));
}

const REWIND_60_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" tabindex="-1" focusable="false">
    <g fill="none" fill-rule="evenodd">
        <path fill="currentColor" d="M5.904 14.092a.9.9 0 0 1 .9.9c0 4.517 3.675 8.192 8.192 8.192s8.192-3.671 8.192-8.188c0-4.517-3.675-8.192-8.192-8.192a8.1 8.1 0 0 0-3.718.893 8.306 8.306 0 0 0-2.196 1.636h2.45a.9.9 0 0 1 0 1.8H7.204a.9.9 0 0 1-.9-.9V5.9a.9.9 0 0 1 1.8 0v1.867A9.957 9.957 0 0 1 14.996 5c5.51 0 9.996 4.485 9.996 9.996 0 5.51-4.485 9.996-9.996 9.996-5.51 0-9.996-4.485-9.996-9.996a.91.91 0 0 1 .904-.904z"/>
        <text x="15" y="17.5" fill="currentColor" font-size="8.5" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" text-anchor="middle">60</text>
    </g>
</svg>
`;

const FORWARD_60_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" tabindex="-1" focusable="false">
    <g fill="none" fill-rule="evenodd">
        <path fill="currentColor" transform="scale(-1,1) translate(-30,0)" d="M5.904 14.092a.9.9 0 0 1 .9.9c0 4.517 3.675 8.192 8.192 8.192s8.192-3.671 8.192-8.188c0-4.517-3.675-8.192-8.192-8.192a8.1 8.1 0 0 0-3.718.893 8.306 8.306 0 0 0-2.196 1.636h2.45a.9.9 0 0 1 0 1.8H7.204a.9.9 0 0 1-.9-.9V5.9a.9.9 0 0 1 1.8 0v1.867A9.957 9.957 0 0 1 14.996 5c5.51 0 9.996 4.485 9.996 9.996 0 5.51-4.485 9.996-9.996 9.996-5.51 0-9.996-4.485-9.996-9.996a.91.91 0 0 1 .904-.904z"/>
        <text x="15" y="17.5" fill="currentColor" font-size="8.5" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" text-anchor="middle">60</text>
    </g>
</svg>
`;

function createSeekButton(seconds, id, title, svgHtml) {
  const btn = document.createElement('button');
  btn.id = id;
  btn.type = 'button';
  btn.className = 'media-control custom-seek-control';
  btn.title = `${title} • v${APP_VERSION}`;
  btn.setAttribute('aria-label', title);
  btn.innerHTML = svgHtml.trim();
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    seekVideo(seconds);
  });
  return btn;
}

function findForward10Button(container, rewind10Btn) {
  // 1. Try finding by aria-label or forward classes across container or document
  const forwardCandidates = (container || document).querySelectorAll(
    'button[aria-label*="forward" i], button[aria-label*="Fast" i], .quick-forward-control, .fast-forward-control, [data-testid*="forward" i]'
  );
  for (const el of forwardCandidates) {
    if (el !== rewind10Btn && !el.id?.includes('custom-')) return el;
  }

  // 2. Check if multiple .quick-rewind-control exist
  const quickBtns = document.querySelectorAll('.quick-rewind-control');
  if (quickBtns.length > 1) {
    for (let i = 1; i < quickBtns.length; i++) {
      if (quickBtns[i] !== rewind10Btn && !quickBtns[i].id?.includes('custom-')) {
        return quickBtns[i];
      }
    }
  }

  if (container) {
    const children = Array.from(container.children).filter(el => 
      el.tagName === 'BUTTON' || el.classList.contains('media-control') || el.querySelector('svg')
    );

    // 3. Find Play/Pause button in container, then take the next sibling button
    const playPauseIdx = children.findIndex(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      const title = (b.getAttribute('title') || '').toLowerCase();
      const cls = (b.className || '').toLowerCase();
      return aria.includes('play') || aria.includes('pause') ||
             title.includes('play') || title.includes('pause') ||
             cls.includes('play') || cls.includes('pause');
    });

    if (playPauseIdx !== -1 && children[playPauseIdx + 1]) {
      const nextBtn = children[playPauseIdx + 1];
      const nextAria = (nextBtn.getAttribute('aria-label') || '').toLowerCase();
      const nextCls = (nextBtn.className || '').toLowerCase();
      if (!nextAria.includes('volume') && !nextAria.includes('mute') &&
          !nextCls.includes('volume') && !nextCls.includes('mute') &&
          !nextBtn.id?.includes('custom-')) {
        return nextBtn;
      }
    }

    // 4. Find button containing SVG with scale(-1,1) or translate(-30,0) (MLB forward icon transform)
    for (const btn of children) {
      if (btn === rewind10Btn || btn.id?.includes('custom-')) continue;
      const html = btn.innerHTML;
      if (html.includes('scale(-1') || html.includes('translate(-30')) {
        return btn;
      }
    }

    // 5. Positional fallback: [custom-rewind-60, rewind10, playPause, forward10, volume, ...]
    const nonCustom = children.filter(b => !b.id?.includes('custom-'));
    if (nonCustom.length >= 3 && nonCustom[0] === rewind10Btn) {
      return nonCustom[2];
    }
  }

  return null;
}

function injectMlbSeekButtons() {
  if (!window.location.hostname.includes('mlb.com')) return;

  const rewind10Btn = document.querySelector('.quick-rewind-control, button[aria-label*="Rewind" i]');
  if (!rewind10Btn || !rewind10Btn.parentNode) return;

  const container = rewind10Btn.parentNode;
  const forward10Btn = findForward10Button(container, rewind10Btn);

  // 1. Insert Rewind 60 before Rewind 10
  const existingRewind60 = document.getElementById('custom-rewind-60');
  if (!existingRewind60 || !container.contains(existingRewind60)) {
    if (existingRewind60) existingRewind60.remove();
    const rewind60 = createSeekButton(-60, 'custom-rewind-60', 'Rewind 60 seconds (Shift+Left)', REWIND_60_SVG);
    container.insertBefore(rewind60, rewind10Btn);
  }

  // 2. Insert Forward 60 after Forward 10
  if (forward10Btn && forward10Btn.parentNode) {
    const forwardContainer = forward10Btn.parentNode;
    const existingForward60 = document.getElementById('custom-forward-60');
    if (!existingForward60 || !forwardContainer.contains(existingForward60)) {
      if (existingForward60) existingForward60.remove();
      const forward60 = createSeekButton(60, 'custom-forward-60', 'Fast forward 60 seconds (Shift+Right)', FORWARD_60_SVG);
      forwardContainer.insertBefore(forward60, forward10Btn.nextSibling);
    }
  }
}

// Global keyboard shortcuts (Shift+Right for +60s, Shift+Left for -60s)
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
    return;
  }
  if (e.shiftKey && e.key === 'ArrowRight') {
    e.preventDefault();
    e.stopPropagation();
    seekVideo(60);
  } else if (e.shiftKey && e.key === 'ArrowLeft') {
    e.preventDefault();
    e.stopPropagation();
    seekVideo(-60);
  }
}, true);

function showOverlay(with_timer) {
    let overlayActive = true;

    const overlay = document.createElement('div');
    overlay.id = 'sport-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'white';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '4rem';
    overlay.style.fontWeight = 'bold';
    overlay.style.textAlign = 'center';
    overlay.style.color = 'black';
    overlay.style.opacity = '1';

    const titleEl = document.createElement('div');
    titleEl.innerText = "Waiting to avoid spoilers";
    overlay.appendChild(titleEl);

    const versionEl = document.createElement('div');
    versionEl.style.fontSize = '1.2rem';
    versionEl.style.fontWeight = 'normal';
    versionEl.style.color = '#888';
    versionEl.style.marginTop = '1.5rem';
    versionEl.innerText = `Sport Stream No Spoilers v${APP_VERSION}`;
    overlay.appendChild(versionEl);

    const appendOverlay = () => {
        const parent = document.body || document.documentElement;
        if (parent && !parent.contains(overlay)) {
            parent.appendChild(overlay);
        }
    };
    appendOverlay();

    const observer = new MutationObserver(() => {
        if (overlayActive) {
            appendOverlay();
        }

        if (!with_timer) {
          const timeEl = document.querySelector('[data-test-id="CURRENT_TIME"]');
          if (timeEl) {
              const currentTime = parseInt(timeEl.dataset.currentTime, 10);
              if (currentTime > 0) {
                  overlayActive = false;
                  setTimeout(() => {
                      overlay.remove();
                      observer.disconnect();
                  }, 1000);
              }
          }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (with_timer) {
      setTimeout(() => {
          overlayActive = false;
          overlay.remove();
          observer.disconnect();
      }, 10000);
    }
}

if (dazn_stream_pattern.test(window.location.href)) {
    showOverlay(true);
}

let lastUrl = window.location.href;

function main() {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (dazn_stream_pattern.test(currentUrl)) {
          showOverlay(false);
      }
  }

  // Inject custom seek controls on MLB.TV
  injectMlbSeekButtons();

  // Remove poster from video elements
  document.querySelectorAll('video').forEach(v => {
    if (v.hasAttribute('poster')) {
      v.removeAttribute('poster');
    }
  });
}

main();
const observer = new MutationObserver(main);
observer.observe(document.documentElement, { childList: true, subtree: true });
