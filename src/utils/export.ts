import { Conversation } from '../types';

export function exportConversationToMarkdown(conv: Conversation): string {
  let md = `# ${conv.title}\n\n*Created on: ${new Date(conv.createdAt).toLocaleString()}*\n*Model: ${conv.model}*\n\n---\n\n`;

  conv.messages.forEach((msg) => {
    const roleName = msg.role === 'user' ? '🧑 Vous' : '🤖 Kaydo GPT';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    md += `### ${roleName} *(${time})*\n\n`;
    if (msg.thought) {
      md += `> **Raisonnement:**\n> ${msg.thought.split('\n').join('\n> ')}\n\n`;
    }
    md += `${msg.content}\n\n---\n\n`;
  });

  return md;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportConversation(conv: Conversation, format: 'markdown' | 'json' | 'text'): void {
  const dateStr = new Date(conv.createdAt).toISOString().slice(0, 10);
  const cleanTitle = conv.title.toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 30);

  if (format === 'markdown') {
    const md = exportConversationToMarkdown(conv);
    downloadFile(`kaydo-gpt-${cleanTitle}-${dateStr}.md`, md, 'text/markdown;charset=utf-8');
  } else if (format === 'json') {
    const json = JSON.stringify(conv, null, 2);
    downloadFile(`kaydo-gpt-${cleanTitle}-${dateStr}.json`, json, 'application/json;charset=utf-8');
  } else {
    const text = conv.messages
      .map((m) => `[${m.role.toUpperCase()}] (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n\n`)
      .join('---\n');
    downloadFile(`kaydo-gpt-${cleanTitle}-${dateStr}.txt`, text, 'text/plain;charset=utf-8');
  }
}
