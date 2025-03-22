'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Create a memoized MarkdownRenderer component to avoid unnecessary re-renders
export const MarkdownRenderer = memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        // Applying styles through components prop instead of className
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-slate-900 my-3" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-slate-900 my-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-slate-900 my-2" {...props} />,
        h4: ({ node, ...props }) => <h4 className="text-sm font-bold text-slate-900 my-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-sm leading-relaxed my-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="text-sm leading-relaxed my-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        table: ({ node, ...props }) => <table className="border-collapse border border-slate-300 my-4 w-full" {...props} />,
        tr: ({ node, ...props }) => <tr className="border-b border-slate-300" {...props} />,
        th: ({ node, ...props }) => <th className="border border-slate-300 p-2 bg-slate-100 font-bold text-left" {...props} />,
        td: ({ node, ...props }) => <td className="border border-slate-300 p-2" {...props} />,
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <code
              className="block bg-slate-100 p-2 rounded text-sm font-mono my-2 overflow-x-auto"
              {...props}
            >
              {children}
            </code>
          ) : (
            <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-300 pl-4 italic my-2" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-t border-slate-300" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer'; 