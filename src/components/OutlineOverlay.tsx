import React, { useState } from 'react';
import { Plus, X, Check, Edit2, Trash2 } from 'lucide-react';
import Overlay from './Overlay';
import { Outline } from '../types';

interface OutlineOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  outlines: Outline[];
  setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>;
  title?: string;
}

export default function OutlineOverlay({ isOpen, onClose, outlines, setOutlines, title }: OutlineOverlayProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    if (newTitle && newContent) {
      if (editingId) {
        setOutlines(prev => prev.map(o => o.id === editingId ? { ...o, title: newTitle, content: newContent } : o));
      } else {
        setOutlines(prev => [...prev, { id: Date.now().toString(), title: newTitle, content: newContent }]);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (item: Outline) => {
    setNewTitle(item.title);
    setNewContent(item.content);
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setOutlines(prev => prev.filter(o => o.id !== id));
  };

  return (
    <Overlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || "大纲"}
      actions={
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className={`transition-colors ${isAdding ? 'text-text-sub' : 'text-primary'}`}
        >
          {isAdding ? <X size={24} /> : <Plus size={24} />}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
            {isAdding && (
              <div className="bg-card rounded-xl p-4 shadow-md border border-primary/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="设定标题 (如：破镜重圆、校园暗恋)" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-bg-main border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
                <textarea 
                  placeholder="设定内容 (具体的大纲或核心冲突)" 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full p-2 bg-bg-main border border-border rounded-lg text-sm outline-none focus:border-primary min-h-[80px]"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleAdd}
                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> {editingId ? '保存修改' : '确认添加'}
                  </button>
                  {editingId && (
                    <button 
                      onClick={resetForm}
                      className="px-4 bg-card border border-border text-text-sub py-2 rounded-lg text-xs font-medium"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>
            )}

        <div className="flex flex-col gap-3">
          {outlines.map(item => (
            <div key={item.id} className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex justify-between items-start group">
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium text-text-main mb-1 truncate">{item.title}</h3>
                <p className="text-xs text-text-sub leading-relaxed line-clamp-2">{item.content}</p>
              </div>
              <div className="flex items-center gap-1 transition-opacity ml-2">
                <button 
                  onClick={() => startEdit(item)}
                  className="p-1 text-primary hover:bg-primary/5 rounded transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {outlines.length === 0 && !isAdding && (
            <div className="text-center py-10 text-text-sub text-sm">
              暂无设定，点击右上角添加
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
