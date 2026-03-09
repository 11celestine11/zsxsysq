import React, { useState } from 'react';
import { Plus, Trash2, X, Check, Link2, Settings2, Edit2, ChevronRight, ChevronDown, Users } from 'lucide-react';
import Overlay from './Overlay';
import { Character, Relationship, RelationshipPreset } from '../types';

interface CharacterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  relationshipPresets: RelationshipPreset[];
  setRelationshipPresets: React.Dispatch<React.SetStateAction<RelationshipPreset[]>>;
  title?: string;
}

export default function CharacterOverlay({ 
  isOpen, 
  onClose, 
  characters, 
  setCharacters,
  relationshipPresets,
  setRelationshipPresets,
  title
}: CharacterOverlayProps) {
  const [view, setView] = useState<'list' | 'presets'>('list');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [isAddingRel, setIsAddingRel] = useState(false);
  const [editingRelTargetId, setEditingRelTargetId] = useState<string | null>(null);
  const [newRelTargetId, setNewRelTargetId] = useState('');
  const [newRelTitle, setNewRelTitle] = useState('');
  const [newRelDesc, setNewRelDesc] = useState('');

  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  const handleAdd = () => {
    if (newName && newDesc) {
      if (editingId) {
        setCharacters(prev => prev.map(c => c.id === editingId ? { ...c, name: newName, desc: newDesc } : c));
      } else {
        setCharacters(prev => [...prev, { id: Date.now().toString(), name: newName, desc: newDesc, relationships: [] }]);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewDesc('');
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (char: Character) => {
    setNewName(char.name);
    setNewDesc(char.desc);
    setEditingId(char.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const handleAddRelationship = (charId: string) => {
    if (newRelTargetId && newRelTitle) {
      setCharacters(prev => prev.map(c => {
        if (c.id === charId) {
          const rels = c.relationships || [];
          if (editingRelTargetId) {
            return { 
              ...c, 
              relationships: rels.map(r => r.targetId === editingRelTargetId ? { targetId: newRelTargetId, title: newRelTitle, desc: newRelDesc } : r) 
            };
          }
          return { ...c, relationships: [...rels, { targetId: newRelTargetId, title: newRelTitle, desc: newRelDesc }] };
        }
        return c;
      }));
      setNewRelTargetId('');
      setNewRelTitle('');
      setNewRelDesc('');
      setIsAddingRel(false);
      setEditingRelTargetId(null);
    }
  };

  const startEditRelationship = (rel: Relationship) => {
    setNewRelTargetId(rel.targetId);
    setNewRelTitle(rel.title);
    setNewRelDesc(rel.desc);
    setEditingRelTargetId(rel.targetId);
    setIsAddingRel(true);
  };

  const handleDeleteRelationship = (charId: string, targetId: string) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === charId) {
        return { ...c, relationships: (c.relationships || []).filter(r => r.targetId !== targetId) };
      }
      return c;
    }));
  };

  const handleAddPreset = () => {
    if (newPresetTitle) {
      setRelationshipPresets(prev => [...prev, { id: Date.now().toString(), title: newPresetTitle, desc: newPresetDesc }]);
      setNewPresetTitle('');
      setNewPresetDesc('');
      setIsAddingPreset(false);
    }
  };

  const handleDeletePreset = (id: string) => {
    setRelationshipPresets(prev => prev.filter(p => p.id !== id));
  };

  const applyPreset = (preset: RelationshipPreset) => {
    setNewRelTitle(preset.title);
    setNewRelDesc(preset.desc);
  };

  return (
    <Overlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || (view === 'list' ? "角色" : "关系预设")}
      actions={
        <div className="flex gap-3">
          <button 
            onClick={() => setView(view === 'list' ? 'presets' : 'list')}
            className="text-text-sub hover:text-primary transition-colors"
            title={view === 'list' ? "管理关系预设" : "返回角色列表"}
          >
            {view === 'list' ? <Settings2 size={22} /> : <Users size={22} />}
          </button>
          <button 
            onClick={() => {
              if (view === 'list') setIsAdding(!isAdding);
              else setIsAddingPreset(!isAddingPreset);
            }} 
            className={`transition-colors ${(view === 'list' ? isAdding : isAddingPreset) ? 'text-text-sub' : 'text-primary'}`}
          >
            {(view === 'list' ? isAdding : isAddingPreset) ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {view === 'presets' ? (
          <div className="flex flex-col gap-4">
            {isAddingPreset && (
              <div className="bg-card rounded-2xl p-5 shadow-lg border border-primary/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="预设关系名称 (如：宿敌)" 
                  value={newPresetTitle}
                  onChange={e => setNewPresetTitle(e.target.value)}
                  className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary"
                />
                <textarea 
                  placeholder="预设关系描述" 
                  value={newPresetDesc}
                  onChange={e => setNewPresetDesc(e.target.value)}
                  className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary min-h-[80px]"
                />
                <button 
                  onClick={handleAddPreset}
                  className="w-full bg-primary text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                >
                  <Check size={16} /> 确认添加预设
                </button>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {relationshipPresets.map(preset => (
                <div key={preset.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex justify-between items-center group">
                  <div>
                    <h4 className="font-semibold text-text-main text-sm">{preset.title}</h4>
                    <p className="text-xs text-text-sub mt-1">{preset.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleDeletePreset(preset.id)}
                    className="text-red-500 transition-all p-2 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {isAdding && (
              <div className="bg-card rounded-2xl p-5 shadow-lg border border-primary/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="角色姓名" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary"
                />
                <textarea 
                  placeholder="角色设定 (性格、外貌等)" 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary min-h-[80px]"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleAdd}
                    className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    <Check size={16} /> {editingId ? '保存修改' : '确认添加角色'}
                  </button>
                  {editingId && (
                    <button 
                      onClick={resetForm}
                      className="px-6 bg-card border border-border text-text-sub py-3 rounded-xl text-sm font-medium"
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {characters.map(char => (
                <div key={char.id} className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                  <div className="p-4 flex justify-between items-start group">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-text-main mb-1 flex items-center gap-2">
                        {char.name}
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                          {(char.relationships || []).length} 个关系
                        </span>
                      </h3>
                      <p className="text-xs text-text-sub leading-relaxed line-clamp-2">{char.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 transition-opacity">
                      <button 
                        onClick={() => startEdit(char)}
                        className="p-2 text-text-sub hover:text-primary hover:bg-bg-main rounded-full transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingCharId(editingCharId === char.id ? null : char.id)}
                        className={`p-2 rounded-full transition-colors ${editingCharId === char.id ? 'bg-primary text-white' : 'hover:bg-bg-main text-text-sub'}`}
                      >
                        <Link2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(char.id)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {editingCharId === char.id && (
                    <div className="bg-bg-main/50 border-t border-border/30 p-4 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
                          <Link2 size={14} /> 关系链
                        </h4>
                        <button 
                          onClick={() => setIsAddingRel(!isAddingRel)}
                          className="text-[10px] bg-card border border-border px-2 py-1 rounded-lg hover:border-primary hover:text-primary transition-all flex items-center gap-1"
                        >
                          {isAddingRel ? <X size={12} /> : <Plus size={12} />} {isAddingRel ? '取消' : '建立新关系'}
                        </button>
                      </div>

                      {isAddingRel && (
                        <div className="bg-card rounded-xl p-4 border border-primary/10 mb-4 flex flex-col gap-3 shadow-sm">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub uppercase ml-1">关联对象</label>
                            <select 
                              value={newRelTargetId}
                              onChange={e => setNewRelTargetId(e.target.value)}
                              className="w-full p-2.5 bg-bg-main border border-border rounded-lg text-xs outline-none focus:border-primary"
                            >
                              <option value="">选择一个角色...</option>
                              {characters.filter(c => c.id !== char.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub uppercase ml-1">关系预设 (可选)</label>
                            <div className="flex flex-wrap gap-2">
                              {relationshipPresets.map(p => (
                                <button 
                                  key={p.id}
                                  onClick={() => applyPreset(p)}
                                  className="text-[10px] bg-bg-main border border-border px-2 py-1 rounded-md hover:border-primary hover:text-primary transition-all"
                                >
                                  {p.title}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub uppercase ml-1">关系标题</label>
                            <input 
                              type="text" 
                              placeholder="如：青梅竹马、宿敌..." 
                              value={newRelTitle}
                              onChange={e => setNewRelTitle(e.target.value)}
                              className="w-full p-2.5 bg-bg-main border border-border rounded-lg text-xs outline-none focus:border-primary"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-sub uppercase ml-1">关系简介</label>
                            <textarea 
                              placeholder="描述这段关系的细节..." 
                              value={newRelDesc}
                              onChange={e => setNewRelDesc(e.target.value)}
                              className="w-full p-2.5 bg-bg-main border border-border rounded-lg text-xs outline-none focus:border-primary min-h-[60px]"
                            />
                          </div>

                          <button 
                            onClick={() => handleAddRelationship(char.id)}
                            className="w-full bg-primary text-white py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2"
                          >
                            <Check size={14} /> 确认关联
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        {(char.relationships || []).map((rel, idx) => {
                          const target = characters.find(c => c.id === rel.targetId);
                          return (
                            <div key={idx} className="bg-card p-3 rounded-xl border border-border/40 flex justify-between items-center group/rel">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                  <Link2 size={14} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-main">{target?.name || '未知角色'}</span>
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{rel.title}</span>
                                  </div>
                                  <p className="text-[10px] text-text-sub mt-0.5">{rel.desc}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => startEditRelationship(rel)}
                                  className="text-primary transition-all p-1.5 hover:bg-primary/5 rounded-full"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRelationship(char.id, rel.targetId)}
                                  className="text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-full"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {(char.relationships || []).length === 0 && !isAddingRel && (
                          <div className="text-center py-4 text-[10px] text-text-sub italic">
                            暂无关联关系，默认状态为“陌生人”
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {characters.length === 0 && !isAdding && (
                <div className="text-center py-16 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center text-text-sub/30">
                    <Users size={32} />
                  </div>
                  <p className="text-sm text-text-sub">暂无角色，点击右上角添加您的第一位角色</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}
