import React from 'react';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

export const metadata = {
  title: 'Albatroz Sentinel | Documentation',
  description: 'Technical documentation and integration guide',
};

export default async function DocsPage() {
  const docsPath = path.join(process.cwd(), 'docs', 'docs.md');
  let content = '';
  
  try {
    content = fs.readFileSync(docsPath, 'utf8');
  } catch (error) {
    content = '# Documentation Not Found\n\nPlease check back later.';
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00FF00] selection:text-black flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto py-12 px-6">
        <div className="mb-8 border-b border-[#333333] pb-4">
            <h1 className="text-3xl font-bold text-[#00FF00] mb-2">SYSTEM_DOCUMENTATION</h1>
            <p className="text-gray-500 font-mono text-sm">Reference Manual v2.0</p>
        </div>
        
        <article className="prose prose-invert prose-green max-w-none">
            {/* We'll render the markdown content here. 
                Note: In a real app, we'd use a proper markdown renderer. 
                For simplicity, we'll just display it in a pre tag if we can't render it nicely, 
                or use a basic renderer if available. 
                Since I can't easily install new packages, I'll just display it as pre-formatted text 
                styled to look like a terminal or code view if I can't use react-markdown.
                Wait, I can't assume react-markdown is installed. 
                I'll check package.json first.
            */}
            <div className="whitespace-pre-wrap font-mono text-sm text-gray-300 bg-[#111] p-6 border border-[#333333] rounded-sm">
                {content}
            </div>
        </article>
      </main>
    </div>
  );
}
