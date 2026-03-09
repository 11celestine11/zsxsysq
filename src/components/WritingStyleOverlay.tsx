import React, { useState } from 'react';
import { Plus, Edit3, Save, X, Trash2 } from 'lucide-react';
import Overlay from './Overlay';
import { WritingStyle } from '../types';

interface WritingStyleOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  styles: WritingStyle[];
  setStyles: React.Dispatch<React.SetStateAction<WritingStyle[]>>;
  title?: string;
}

export default function WritingStyleOverlay({ isOpen, onClose, styles, setStyles, title }: WritingStyleOverlayProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleSave = () => {
    if (!formData.name || !formData.content) return;
    if (editingId) {
      setStyles(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      setStyles(prev => [{ id: Date.now().toString(), ...formData }, ...prev]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', content: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (style: WritingStyle) => {
    setFormData({ name: style.name, content: style.content });
    setEditingId(style.id);
    setIsAdding(true);
  };

  const deleteStyle = (id: string) => {
    setStyles(prev => prev.filter(s => s.id !== id));
  };

  return (
    <Overlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || "文风"}
      actions={
        <button onClick={() => setIsAdding(true)} className="text-primary">
          <Plus size={20} />
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {isAdding && (
          <div className="bg-bg-main p-4 rounded-xl border border-primary/20 flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="文风名称 (如: 忧郁、意识流)" 
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full p-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-primary"
            />
            <textarea 
              placeholder="文风描述 (具体的写作指令)" 
              value={formData.content}
              onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
              className="w-full p-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-primary min-h-[100px]"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Save size={14} /> 保存
              </button>
              <button onClick={resetForm} className="px-4 bg-card border border-border text-text-sub py-2 rounded-lg text-xs font-medium">
                取消
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {styles.map(style => (
            <div key={style.id} className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text-main">{style.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(style)} className="text-primary hover:bg-primary/5 p-1 rounded transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => deleteStyle(style.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-xs text-text-sub line-clamp-3 leading-relaxed">{style.content}</p>
            </div>
          ))}
          {styles.length === 0 && !isAdding && (
            <div className="text-center py-10 text-text-sub text-xs">暂无文风，点击右上角添加</div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
