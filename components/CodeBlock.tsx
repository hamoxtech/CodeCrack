import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Use the CJS import path for styles, as it's often more robust in local dev environments
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Function to extract language and code from markdown-style code block
const parseCodeBlock = (codeString: string) => {
    const match = codeString.match(/```(\w+)?\n([\s\S]+)```/);
    if (match) {
        return {
            language: match[1] || 'javascript',
            code: match[2].trim(),
        };
    }
    // If no markdown block found, assume the whole string is code
    return { language: 'javascript', code: codeString.trim() };
};


const CodeBlock: React.FC<CodeBlockProps> = ({ code: codeString }) => {
    const { language, code } = parseCodeBlock(codeString);

  return (
    <SyntaxHighlighter
      language={language}
      style={atomDark}
      customStyle={{
        borderRadius: '0.5rem',
        padding: '1rem',
        backgroundColor: '#1e293b', // slate-800
        fontSize: '0.9rem',
      }}
      codeTagProps={{
        style: {
          fontFamily: '"Fira Code", monospace',
        }
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
