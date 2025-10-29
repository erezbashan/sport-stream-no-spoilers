// console.log("running ...")

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

function main() {
  selectors.forEach(s => {
    // console.log("s", s)
    document.querySelectorAll(s).forEach(e => {
      console.log("e", e)
      // e.remove();
      e.style.display = 'none';
    });
  });
}

main();
const observer = new MutationObserver(main);
observer.observe(document.body, { childList: true, subtree: true });
