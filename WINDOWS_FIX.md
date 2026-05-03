# WINDOWS_FIX.md

That EBUSY error is the classic "Windows Lock." It means a background process (usually a hidden node.exe or an active gemini session) is holding onto that folder, preventing the CLI from updating or deleting it.

Since the resource is locked, the CLI can't finish the installation, which is why it says "not found." Here is how to break the lock and get it installed.

## 1. Force Kill the "Locked" Processes
Windows won't let you touch that folder if any process is even glancing at it. Run this in your terminal:

```bash
# This stops all Node processes, including hidden Gemini bridge attempts
taskkill -F -IM node.exe
```

## 2. Manually Clear the Ghost Folder
Sometimes the "rmdir" fails because the folder is half-deleted. Let's force it out of existence manually so the installer has a clean slate:

```bash
# In Git Bash
rm -rf "/c/Users/Kojo Shaddy/.gemini/extensions/kojo-deploy-ai"
```

## 3. Clear the Temporary Cache
The Gemini CLI also keeps a "stuck" state in its internal MCP cache. Clear this to stop the "Initializing" loop:

```bash
rm -rf ~/.gemini/mcp/
rm -rf ~/.gemini/tmp/
```

## 4. Reinstall Fresh
Now that the path is clear and no processes are locking it, run the installation again. Make sure no other terminal is running gemini while you do this.

```bash
gemini extensions install https://github.com/KojoShaddy/kojo-deploy-ai
```

## Why this happened (and how to avoid it)
On Windows, if you run `gemini extensions install` while the gemini interactive prompt is already open in another window, the two processes fight over the `kojo-deploy-ai` folder.

**The Rule of Thumb:** Always exit the Gemini CLI (type `exit` or `Ctrl+C`) before running `install`, `update`, or `uninstall`.

## Final Verification
Once the install finishes successfully, run:

```bash
gemini extensions list
```

If you see `kojo-deploy-ai` in the list, you are ready to go. Launch gemini and it should finally hit that 🟢 Connected status!