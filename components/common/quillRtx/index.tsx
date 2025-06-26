import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import React, { useEffect, useRef } from 'react';
import './quillRtx.css';

interface QuillEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter content...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffectStrictMode(() => {
    if (editorRef.current && !quillInstance.current) {
      // 初始化 Quill 实例
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'], // image
            ['clean'],
          ],
        },
        placeholder,
      });

      // 设置初始值
      quillInstance.current.root.innerHTML = value;

      // 监听内容变化
      quillInstance.current.on('text-change', () => {
        if (onChange) {
          const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
          onChange(html);
        }
      });
    }

    return () => {
      // 清理
      if (quillInstance.current) {
        quillInstance.current = null;
      }
    };
  }, []);

  // 处理外部 value 变化
  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return (
    <div style={{ height: '400px' }}>
      <div ref={editorRef} style={{ height: '300px', padding: '16px' }} />
    </div>
  );
};

export default QuillEditor;
