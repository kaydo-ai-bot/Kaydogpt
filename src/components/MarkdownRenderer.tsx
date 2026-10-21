import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Code2, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onOpenCanvas?: (code: string, language: string, title: string) => void;
}

interface CodeBlockProps {
  language: string;
  value: string;
  onOpenCanvas?: (code: string, language: string, title: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, onOpenCanvas }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const cleanLang = language || 'code';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#3e3e42] dark:border-[#383838] bg-[#1e1e1e] text-gray-200 text-sm shadow-md font-mono">
      {/* Code block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] dark:bg-[#181818] border-b border-[#383838] select-none text-xs text-gray-400">
        <span className="font-semibold lowercase tracking-wider text-gray-300 flex items-center gap-1.5">
          <Code2 size={13} className="text-emerald-400" />
          {cleanLang}
        </span>
        <div className="flex items-center gap-2">
          {onOpenCanvas && (cleanLang === 'typescript' || cleanLang === 'javascript' || cleanLang === 'html' || cleanLang === 'python' || cleanLang === 'react' || cleanLang === 'tsx' || cleanLang === 'jsx') && (
            <button
              onClick={() => onOpenCanvas(value, cleanLang, `${cleanLang.toUpperCase()} Snippet`)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-[#383838] transition-colors"
              title="Open in Canvas Editor"
            >
              <ExternalLink size={12} />
              <span>Canvas</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2 py-0.5 rounded hover:bg-[#383838] transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <pre className="p-4 overflow-x-auto text-[13.5px] leading-relaxed scrollbar-thin scrollbar-thumb-gray-600">
        <code>{value}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onOpenCanvas }) => {
  return (
    <div className="kaydo-markdown leading-relaxed text-[15px] space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeContent = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 font-mono text-[13.5px] text-pink-600 dark:text-pink-300 font-normal"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : ''}
                value={codeContent}
                onOpenCanvas={onOpenCanvas}
              />
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-[1.68]">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold mt-5 mb-2 text-inherit tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-semibold mt-4 mb-2 text-inherit tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold mt-3 mb-1 text-inherit">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-3 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-3 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-emerald-500 pl-4 my-3 text-gray-600 dark:text-gray-400 italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-gray-300 dark:border-gray-700">
                <table className="min-w-full text-left text-sm divide-y divide-gray-300 dark:divide-gray-700">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 bg-gray-100 dark:bg-[#262626] font-semibold text-gray-800 dark:text-gray-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 inline-flex items-center gap-0.5"
              >
                {children}
                <ExternalLink size={11} className="inline opacity-70" />
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <span className="block my-3.5">
                <img
                  src={src}
                  alt={alt || "Image générée"}
                  loading="lazy"
                  className="rounded-2xl max-w-full sm:max-w-md md:max-w-lg shadow-xl border border-zinc-200 dark:border-zinc-800 object-cover"
                />
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
