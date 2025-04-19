"use client"
import ReactMarkdown from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          img: ({ node, src, alt, ...props }) => (
            <div className="my-6 relative">
              <img src={src || "/placeholder.svg"} alt={alt || ""} className="rounded-lg max-w-full" {...props} />
            </div>
          ),
          code: ({ node, ...props }) => <code className="bg-muted px-1 py-0.5 rounded" {...props} />,
          pre: ({ node, ...props }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
