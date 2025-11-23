// console.log("running ...")

const dazn_stream_pattern = /^https:\/\/www\.dazn\.com\/[^/]+\/fixture\/.+$/;
const selectors = [
  // MLB
  '.scrubber-bar-wrapper',                          // seek bar
  '[class*="style__StyledTimeBar"]',                // time remaining
  '.ViewController.GamePanelStateViewController.live',  // side bar
  '.matchup.matchup-pitching-atbat',                // stats
  '.matchup.matchup-deck-hole',                     // stats

  // DAZN NFL
  '[data-test-id="SCRUB_BAR"]',                     // seek bar
  '[data-test-id="BACKGROUND_IMAGE"]',              // images of games in grid
  '[class*="content-selection-menu__tile-image"]',  // image of game before playing it
  '[class*="main__player-aside"]',                  // side bar with scores
  '[data-portal-name="OPTIONS_MENU_2"]',            // stupid control which has an image
  '[data-test-id="DURATION"]',                      // total duration

];

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
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.fontSize = '4rem';
    overlay.style.fontWeight = 'bold';
    overlay.style.textAlign = 'center';
    overlay.innerText = "Waiting to avoid spoilers";
    overlay.style.color = 'black';
    overlay.style.opacity = '1';

    document.body.appendChild(overlay);

    const observer = new MutationObserver(() => {
        if (overlayActive && !document.body.contains(overlay)) {
            document.body.appendChild(overlay);
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

    observer.observe(document.body, { childList: true, subtree: true });

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

  selectors.forEach(s => {
    // console.log("s", s)
    document.querySelectorAll(s).forEach(e => {
      // console.log("e", e)
      // e.remove();
      e.style.display = 'none';
    });
  });

}

main();
const observer = new MutationObserver(main);
observer.observe(document.body, { childList: true, subtree: true });
