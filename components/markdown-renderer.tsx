"use client";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none text-[15.5px] leading-[1.75] text-foreground/90">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="mt-10 mb-4 text-3xl font-bold tracking-tight text-ink-deep first:mt-0"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="mt-9 mb-3 text-2xl font-bold tracking-tight text-ink-deep first:mt-0"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="mt-7 mb-2 text-xl font-semibold tracking-tight text-ink-deep first:mt-0"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="my-4 text-pretty first:mt-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-4 list-disc space-y-1 pl-6" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-4 list-decimal space-y-1 pl-6" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-[1.7]" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="font-medium text-brand underline decoration-brand/30 underline-offset-[3px] transition-colors hover:text-brand-hover hover:decoration-brand/60"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-6 border-l-2 border-brand/40 pl-5 italic text-foreground/75"
              {...props}
            />
          ),
          img: ({ node, src, alt, ...props }) => (
            <span className="my-7 block">
              <img
                src={src || "/placeholder.svg"}
                alt={alt || ""}
                className="w-full rounded-xl border border-border"
                {...props}
              />
              {alt && (
                <span className="mt-2 block text-center text-[12px] text-muted-foreground">
                  {alt}
                </span>
              )}
            </span>
          ),
          code: ({ node, ...props }) => (
            <code
              className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-ink-deep"
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              className="my-5 overflow-x-auto rounded-xl border border-border bg-muted p-4 font-mono text-[13px]"
              {...props}
            />
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
