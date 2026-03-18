const { execFileSync } = require('child_process');

function tryClipboard(command, args, text) {
  execFileSync(command, args, { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
}

function copyTextToClipboard(text) {
  const attempts = [];

  if (process.platform === 'darwin') {
    attempts.push({ command: 'pbcopy', args: [], tool: 'pbcopy' });
  } else if (process.platform.startsWith('win')) {
    attempts.push({ command: 'cmd', args: ['/c', 'clip'], tool: 'clip' });
  } else {
    attempts.push({ command: 'wl-copy', args: [], tool: 'wl-copy' });
    attempts.push({ command: 'xclip', args: ['-selection', 'clipboard'], tool: 'xclip' });
  }

  for (const attempt of attempts) {
    try {
      tryClipboard(attempt.command, attempt.args, text);
      return { ok: true, tool: attempt.tool };
    } catch (_err) {
      // Continue trying the next clipboard utility.
    }
  }

  return { ok: false, tool: null };
}

module.exports = { copyTextToClipboard };
