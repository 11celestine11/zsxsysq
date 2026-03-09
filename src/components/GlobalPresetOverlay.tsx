import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, ShieldAlert } from 'lucide-react';
import Overlay from './Overlay';
import { GlobalPreset } from '../types';

interface GlobalPresetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  presets: GlobalPreset[];
  setPresets: React.Dispatch<React.SetStateAction<GlobalPreset[]>>;
  title?: string;
}

export default function GlobalPresetOverlay({ isOpen, onClose, presets, setPresets, title }: GlobalPresetOverlayProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleSave = () => {
    if (!formData.name || !formData.content) return;
    if (editingId) {
      setPresets(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
    } else {
      setPresets(prev => [{ id: Date.now().toString(), ...formData }, ...prev]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', content: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (preset: GlobalPreset) => {
    setFormData({ name: preset.name, content: preset.content });
    setEditingId(preset.id);
    setIsAdding(true);
  };

  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Overlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || "预设"}
      actions={
        <button onClick={() => setIsAdding(true)} className="text-primary">
          <Plus size={20} />
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2 border border-red-100">
          <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-600 leading-relaxed">
            此处可设置全局限制、破限指令或禁止词。这些内容将作为所有生成的强制前提条件。
          </p>
        </div>

        {isAdding && (
          <div className="bg-bg-main p-4 rounded-xl border border-primary/20 flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="预设名称 (如: 破限指令、禁止色情)" 
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full p-2 bg-card border border-border rounded-lg text-sm outline-none focus:border-primary"
            />
            <textarea 
              placeholder="预设内容 (具体的限制或指令)" 
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
          {presets.map(preset => (
            <div key={preset.id} className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text-main">{preset.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(preset)} className="text-text-sub hover:text-primary"><Edit3 size={16} /></button>
                  <button onClick={() => deletePreset(preset.id)} className="text-text-sub hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-xs text-text-sub line-clamp-3 leading-relaxed">{preset.content}</p>
            </div>
          ))}
          {presets.length === 0 && !isAdding && (
            <div className="text-center py-10 text-text-sub text-xs">暂无全局预设，点击右上角添加</div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
