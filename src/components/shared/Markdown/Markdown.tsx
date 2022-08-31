import ReactMarkdown from 'react-markdown';
import React from 'react';

interface MarkdownProps {
  content: string;
}

const Markdown = ({ content }: MarkdownProps) => {
  return <ReactMarkdown children={content} />;
};

export default React.memo(Markdown);
