# Google Drive Sync Rule

Whenever any changes are made to the extension/plugin files (such as `main.js`, `manifest.json`, etc.):
ALWAYS copy the updated extension files to the Google Drive deployment directory:
`/Users/erezbashan/Library/CloudStorage/GoogleDrive-erez.bashan@gmail.com/My Drive/Erez/sport-stream-no-spoilers/`

### Command to execute after any code change:
```bash
cp -p main.js manifest.json "/Users/erezbashan/Library/CloudStorage/GoogleDrive-erez.bashan@gmail.com/My Drive/Erez/sport-stream-no-spoilers/"
```
Ensure this copy is run immediately after making changes and before committing / completing your turn so that the user's browser-loaded extension in Google Drive is always up to date.
