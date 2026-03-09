/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Heart, 
  User, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Star, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Settings, 
  BookOpen, 
  Globe, 
  Users,
  Camera,
  Check,
  X,
  MinusCircle,
  PlusCircle,
  Link as LinkIcon,
  Download,
  Upload,
  FileText,
  Shield,
  Book,
  Minus,
  Link2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottomSheet from './components/BottomSheet';
import Overlay from './components/Overlay';

interface MultiSelectDropdownProps {
  label: string;
  icon: React.ReactNode;
  options: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  noneLabel?: string;
}

const MultiSelectDropdown = ({ label, icon, options, selectedIds, onChange, noneLabel = "默认/全部" }: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (id === 'none') {
      onChange([]);
    } else {
      const newIds = selectedIds.includes(id)
        ? selectedIds.filter(i => i !== id)
        : [...selectedIds, id];
      onChange(newIds);
    }
  };

  const selectedNames = options
    .filter(o => selectedIds.includes(o.id))
    .map(o => o.name);

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-bold">{label}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary transition-all text-left"
        >
          <span className={`truncate pr-4 ${selectedIds.length === 0 ? 'text-text-sub' : 'text-text-main'}`}>
            {selectedIds.length === 0 ? noneLabel : selectedNames.join(', ')}
          </span>
          <ChevronDown size={14} className={`text-text-sub transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[100] w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto p-1"
            >
              <button
                onClick={() => { toggleOption('none'); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs transition-colors ${selectedIds.length === 0 ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-bg-main text-text-sub'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.length === 0 ? 'bg-primary border-primary' : 'border-border'}`}>
                  {selectedIds.length === 0 && <Check size={10} className="text-white" />}
                </div>
                {noneLabel}
              </button>
              {options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-xs transition-colors ${selectedIds.includes(opt.id) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-bg-main text-text-sub'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.includes(opt.id) ? 'bg-primary border-primary' : 'border-border'}`}>
                    {selectedIds.includes(opt.id) && <Check size={10} className="text-white" />}
                  </div>
                  {opt.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
import CharacterOverlay from './components/CharacterOverlay';
import OutlineOverlay from './components/OutlineOverlay';
import WorldbookOverlay from './components/WorldbookOverlay';
import SettingsOverlay from './components/SettingsOverlay';
import WritingStyleOverlay from './components/WritingStyleOverlay';
import GlobalPresetOverlay from './components/GlobalPresetOverlay';
import { isNative, pickImage, saveFile } from './services/capacitorService';
import { 
  Story, 
  Chapter,
  Character, 
  Worldbook, 
  Outline, 
  ApiSettings, 
  Profile, 
  ApiPreset, 
  CssPreset,
  WritingStyle,
  GlobalPreset,
  RelationshipPreset
} from './types';

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'discover' | 'follow' | 'mine'>('discover');
  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('novel_stories') || '[]');
      // Migration: Ensure all stories have chapters
      return saved.map((s: any) => {
        if (!s.chapters || s.chapters.length === 0) {
          return {
            ...s,
            chapters: [{
              id: 'initial-' + s.id,
              title: '第一章',
              content: s.content,
              timestamp: s.timestamp
            }]
          };
        }
        return s;
      });
    } catch {
      return [];
    }
  });
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novel_characters') || '[]');
    } catch {
      return [];
    }
  });
  const [worldbooks, setWorldbooks] = useState<Worldbook[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novel_worldbooks') || '[]');
    } catch {
      return [];
    }
  });
  const [outlines, setOutlines] = useState<Outline[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novel_outlines') || '[]');
    } catch {
      return [];
    }
  });
  const [writingStyles, setWritingStyles] = useState<WritingStyle[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novel_writing_styles') || '[]');
    } catch {
      return [];
    }
  });
  const [globalPresets, setGlobalPresets] = useState<GlobalPreset[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novel_global_presets') || '[]');
    } catch {
      return [];
    }
  });
  const [relationshipPresets, setRelationshipPresets] = useState<RelationshipPreset[]>(() => {
    try {
      const saved = localStorage.getItem('novel_relationship_presets');
      if (saved) return JSON.parse(saved);
      return [
        { id: '1', title: '青梅竹马', desc: '从小一起长大，互相暗恋' },
        { id: '2', title: '宿敌', desc: '命中注定的对手，互相竞争' },
        { id: '3', title: '师徒', desc: '传道受业解惑，亦师亦友' }
      ];
    } catch {
      return [];
    }
  });
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('novel_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '用户',
      desc: '点击此处修改个人资料',
      avatar: '',
      bg: ''
    };
  });
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => ({
    url: localStorage.getItem('novel_api_url') || '',
    key: localStorage.getItem('novel_api_key') || '',
    model: localStorage.getItem('novel_api_model') || ''
  }));
  const [apiPresets, setApiPresets] = useState<ApiPreset[]>(() => JSON.parse(localStorage.getItem('novel_api_presets') || '[]'));
  const [cssPresets, setCssPresets] = useState<CssPreset[]>(() => {
    const saved = localStorage.getItem('novel_css_presets');
    if (saved) return JSON.parse(saved);
    return [{ 
      name: '默认美化', 
      code: '/* 示例：修改卡片圆角和主色调 */\n.bg-card {\n  border-radius: 24px !important;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;\n}\n.text-primary {\n  letter-spacing: 0.05em;\n}' 
    }];
  });
  const [currentCss, setCurrentCss] = useState(() => localStorage.getItem('novel_current_css') || '');
  
  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMode, setGenMode] = useState<'new' | 'continue'>('new');
  const [isGenSheetOpen, setIsGenSheetOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [isAiEditing, setIsAiEditing] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [selection, setSelection] = useState<{ text: string, start: number, end: number } | null>(null);
  const [selectionMenuPos, setSelectionMenuPos] = useState<{ x: number, y: number } | null>(null);
  
  // Generation Sheet Temporary States
  const [tempOutline, setTempOutline] = useState('');
  const [saveToOutlines, setSaveToOutlines] = useState(false);
  
  // Overlays
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  
  const [themeSettings, setThemeSettings] = useState(() => {
    const saved = localStorage.getItem('novel_theme_settings');
    return saved ? JSON.parse(saved) : { primary: '#5A5A40', bg: '#f5f2ed', body: '#e8e6e1', card: '#ffffff', text: '#2c2c2c' };
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', themeSettings.primary);
    document.documentElement.style.setProperty('--color-bg-main', themeSettings.bg);
    document.documentElement.style.setProperty('--color-bg-body', themeSettings.body);
    document.documentElement.style.setProperty('--color-card', themeSettings.card);
    document.documentElement.style.setProperty('--color-text-main', themeSettings.text);
    localStorage.setItem('novel_theme_settings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  // Gen Params
  const [genParams, setGenParams] = useState({
    charIds: [] as string[],
    allowUnknown: true,
    wbIds: [] as string[],
    outlineId: 'none',
    styleIds: [] as string[],
    presetIds: [] as string[],
    length: 'short' as 'short' | 'long',
    count: 1
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('novel_stories', JSON.stringify(stories)); }, [stories]);
  useEffect(() => { localStorage.setItem('novel_characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('novel_worldbooks', JSON.stringify(worldbooks)); }, [worldbooks]);
  useEffect(() => { localStorage.setItem('novel_outlines', JSON.stringify(outlines)); }, [outlines]);
  useEffect(() => { localStorage.setItem('novel_writing_styles', JSON.stringify(writingStyles)); }, [writingStyles]);
  useEffect(() => { localStorage.setItem('novel_global_presets', JSON.stringify(globalPresets)); }, [globalPresets]);
  useEffect(() => { localStorage.setItem('novel_relationship_presets', JSON.stringify(relationshipPresets)); }, [relationshipPresets]);
  useEffect(() => { 
    try {
      localStorage.setItem('novel_profile', JSON.stringify(profile)); 
    } catch (e) {
      console.error('Profile save error:', e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        alert('存储空间已满，无法保存个人资料。请尝试删除一些旧故事或减小图片大小。');
      }
    }
  }, [profile]);
  useEffect(() => { localStorage.setItem('novel_css_presets', JSON.stringify(cssPresets)); }, [cssPresets]);
  useEffect(() => { 
    localStorage.setItem('novel_current_css', currentCss);
    let styleTag = document.getElementById('custom-app-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-app-css';
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = currentCss;
  }, [currentCss]);
  useEffect(() => {
    localStorage.setItem('novel_api_url', apiSettings.url);
    localStorage.setItem('novel_api_key', apiSettings.key);
    localStorage.setItem('novel_api_model', apiSettings.model);
  }, [apiSettings]);

  // --- API Logic ---
  const executeGeneration = async () => {
    if (!apiSettings.url || !apiSettings.key) {
      alert("请先在'我的-设置'中配置并应用完整的API链接和密钥");
      setActiveTab('mine');
      return;
    }

    setIsGenerating(true);
    setIsGenSheetOpen(false);

    const charContext = genParams.charIds.length === 0 
      ? `出场人物：${characters.map(c => {
          const rels = (c.relationships || []).map(r => {
            const target = characters.find(tc => tc.id === r.targetId);
            return `${r.title}(与${target?.name || '未知'}): ${r.desc}`;
          }).join(', ');
          return `${c.name}(${c.desc})${rels ? ` [关系网：${rels}]` : ''}`;
        }).join('; ')}`
      : (() => {
          const selectedChars = characters.filter(char => genParams.charIds.includes(char.id));
          if (selectedChars.length === 0) return "";
          return `出场人物：${selectedChars.map(c => {
            const rels = (c.relationships || []).map(r => {
              const target = characters.find(tc => tc.id === r.targetId);
              return `${r.title}(与${target?.name || '未知'}): ${r.desc}`;
            }).join(', ');
            return `${c.name}(${c.desc})${rels ? ` [关系网：${rels}]` : ''}`;
          }).join('; ')}`;
        })();
    
    const selectedWbs = worldbooks.filter(w => genParams.wbIds.includes(w.id));
    const wbContext = selectedWbs.length > 0 
      ? `世界观背景设定：\n${selectedWbs.map(w => `- ${w.title}: ${w.content}`).join('\n')}`
      : "背景：无特定限制。";
    
    const styleContext = genParams.styleIds.length > 0
      ? `写作风格要求：${writingStyles.filter(s => genParams.styleIds.includes(s.id)).map(s => s.content).join('; ')}`
      : "";

    const presetContext = genParams.presetIds.length > 0
      ? `全局预设与限制：${globalPresets.filter(p => genParams.presetIds.includes(p.id)).map(p => p.content).join('; ')}`
      : "";

    const settingContext = tempOutline 
      ? `故事核心设定：${tempOutline}`
      : (genParams.outlineId !== 'none'
        ? `故事核心设定：${outlines.find(o => o.id === genParams.outlineId)?.title} - ${outlines.find(o => o.id === genParams.outlineId)?.content}`
        : "核心大纲：无特定限制，自由发挥。");

    // Handle saving temp outline if requested
    if (saveToOutlines && tempOutline) {
      const newOutline: Outline = {
        id: Date.now().toString(),
        title: `临时大纲 ${new Date().toLocaleDateString()}`,
        content: tempOutline
      };
      setOutlines(prev => [newOutline, ...prev]);
      setSaveToOutlines(false);
    }
    
    const lengthContext = genParams.length === 'short' 
      ? "要求是一发完结的短篇故事，结构完整。" 
      : "要求是一篇长篇小说的精彩开篇章节，留下悬念。";

    const systemPrompt = `你是一个优秀的同人文作家。请根据以下条件创作：\n${charContext}\n${genParams.allowUnknown ? "允许新角色。" : "严禁编造角色。"}\n${wbContext}\n${styleContext}\n${presetContext}\n${settingContext}\n${lengthContext}\n直接输出故事正文，首行加《标题》。末行以"标签：标签1, 标签2"格式提供3-5个标签。`;

    const requestUrl = apiSettings.url.endsWith('/v1') ? apiSettings.url + '/chat/completions' : apiSettings.url;
    const requestKey = apiSettings.key.startsWith('Bearer ') ? apiSettings.key : 'Bearer ' + apiSettings.key;

    const newStories: Story[] = [];
    for (let i = 0; i < genParams.count; i++) {
      try {
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': requestKey },
          body: JSON.stringify({
            model: apiSettings.model || 'gpt-3.5-turbo',
            messages: [{ role: "system", content: "你是一个专业的同人文作家，只输出正文和标签。" }, { role: "user", content: systemPrompt }],
            temperature: 0.7
          })
        });
        const data = await response.json();
        if (data.choices && data.choices[0].message) {
          const text = data.choices[0].message.content.trim();
          const lines = text.split('\n');
          const title = lines[0].replace(/《|》/g, '').trim();
          
          // Parse tags from the last line
          let content = lines.slice(1).join('\n').trim();
          let tags: string[] = [];
          const lastLine = lines[lines.length - 1];
          if (lastLine.startsWith('标签：') || lastLine.startsWith('标签:')) {
            tags = lastLine.replace(/标签：|标签:/, '').split(/,|，/).map(t => t.trim()).filter(t => t);
            content = lines.slice(1, -1).join('\n').trim();
          }

          newStories.push({
            id: Date.now().toString() + i,
            title: title || "无题",
            content: content || text,
            chapters: [{
              id: Date.now().toString() + i + '-c1',
              title: '第一章',
              content: content || text,
              timestamp: Date.now()
            }],
            isCollected: false,
            timestamp: Date.now(),
            tags: tags
          });
        }
      } catch (error) {
        console.error(error);
        alert(`第 ${i + 1} 篇文章生成失败，请检查网络或API设置。`);
        break;
      }
    }

    setStories(prev => {
      const collected = prev.filter(s => s.isCollected);
      const uncollected = prev.filter(s => !s.isCollected);
      // Combine new stories with existing uncollected ones, then keep only the latest 10
      const combinedUncollected = [...newStories, ...uncollected].slice(0, 10);
      return [...combinedUncollected, ...collected];
    });
    setIsGenerating(false);
  };

  const handleAiEdit = async () => {
    if (!currentStory || !aiEditPrompt || !apiSettings.url || !apiSettings.key) return;
    setIsAiEditing(true);

    const currentChapter = currentStory.chapters[currentChapterIndex];
    if (!currentChapter) {
      setIsAiEditing(false);
      return;
    }

    const targetText = selection ? selection.text : currentChapter.content;
    const requestUrl = apiSettings.url.endsWith('/v1') ? apiSettings.url + '/chat/completions' : apiSettings.url;
    const requestKey = apiSettings.key.startsWith('Bearer ') ? apiSettings.key : 'Bearer ' + apiSettings.key;
    
    const prompt = `你是一个专业的文学编辑。请根据指令修改。
指令：${aiEditPrompt}
${selection ? '仅修改选中的文字并返回。' : '修改全文并返回。'}
${selection ? '选中文字：' : '原文：'}
${targetText}

直接输出修改后的内容，不含解释。`;

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': requestKey },
        body: JSON.stringify({
          model: apiSettings.model || 'gpt-3.5-turbo',
          messages: [{ role: "system", content: "你是一个专业的文学编辑，只输出修改后的正文。" }, { role: "user", content: prompt }],
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0].message) {
        const editedContent = data.choices[0].message.content.trim();
        let newChapterContent = currentChapter.content;
        
        if (selection) {
          newChapterContent = currentChapter.content.replace(selection.text, editedContent);
          setSelection(null);
          setSelectionMenuPos(null);
        } else {
          newChapterContent = editedContent;
        }

        const updatedChapters = currentStory.chapters.map((c, idx) => 
          idx === currentChapterIndex ? { ...c, content: newChapterContent } : c
        );

        const updatedStory = { ...currentStory, chapters: updatedChapters };
        setCurrentStory(updatedStory);
        setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
        setAiEditPrompt('');
      }
    } catch (error) {
      console.error(error);
      alert("AI 修改失败，请检查网络。");
    }
    setIsAiEditing(false);
  };

  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({ 
        text: sel.toString(), 
        start: 0, 
        end: 0 
      });
      setSelectionMenuPos({ 
        x: rect.left + rect.width / 2, 
        y: rect.top - 40
      });
    } else {
      // Don't clear immediately to allow clicking the button
    }
  };

  const triggerMoreChapter = () => {
    setGenMode('continue');
    setIsGenSheetOpen(true);
    setIsActionMenuOpen(false);
  };

  const executeMoreChapter = async () => {
    if (!currentStory || !apiSettings.url || !apiSettings.key) return;
    setIsGenerating(true);
    setIsGenSheetOpen(false);

    const requestUrl = apiSettings.url.endsWith('/v1') ? apiSettings.url + '/chat/completions' : apiSettings.url;
    const requestKey = apiSettings.key.startsWith('Bearer ') ? apiSettings.key : 'Bearer ' + apiSettings.key;
    
    const styleContext = genParams.styleIds.length > 0 ? `写作风格：${writingStyles.filter(s => genParams.styleIds.includes(s.id)).map(s => s.content).join('; ')}` : "";
    const presetContext = genParams.presetIds.length > 0 ? `全局限制：${globalPresets.filter(p => genParams.presetIds.includes(p.id)).map(p => p.content).join('; ')}` : "";
    const outlineContext = tempOutline 
      ? `后续大纲指引：${tempOutline}`
      : (genParams.outlineId !== 'none' ? `后续大纲指引：${outlines.find(o => o.id === genParams.outlineId)?.content || ''}` : "");

    // Handle saving temp outline if requested
    if (saveToOutlines && tempOutline) {
      const newOutline: Outline = {
        id: Date.now().toString(),
        title: `续写大纲 ${new Date().toLocaleDateString()}`,
        content: tempOutline
      };
      setOutlines(prev => [newOutline, ...prev]);
      setSaveToOutlines(false);
    }

    const contextChapters = currentStory.chapters.slice(0, currentChapterIndex + 1);
    const accumulatedContext = contextChapters.map(c => c.content).join('\n\n');
    let workingChapters = [...currentStory.chapters];

    console.log("Starting continuation...", { model: apiSettings.model, count: genParams.count, fromChapter: currentChapterIndex + 1 });

    for (let i = 0; i < genParams.count; i++) {
      const prompt = `你是一个优秀的同人文作家。${styleContext} ${presetContext} ${outlineContext} 请紧接下文续写新的一章。保持连贯，直接输出新章正文：\n\n` + accumulatedContext.substring(Math.max(0, accumulatedContext.length - 2000));

      try {
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': requestKey 
          },
          body: JSON.stringify({
            model: apiSettings.model || 'gpt-3.5-turbo',
            messages: [
              { role: "system", content: "你是一个专业的续写助手，只输出故事正文。" },
              { role: "user", content: prompt }
            ],
            temperature: 0.8
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices[0].message) {
          const newChapterContent = data.choices[0].message.content.trim();
          
          const newChapter: Chapter = {
            id: Date.now().toString() + '-' + i,
            title: `新章节`, // Will be re-indexed
            content: newChapterContent,
            timestamp: Date.now()
          };

          // Insert after the current working index
          workingChapters.splice(currentChapterIndex + 1 + i, 0, newChapter);
          
          // Re-index titles
          const finalChapters = workingChapters.map((c, idx) => ({
            ...c,
            title: `第${idx + 1}章`
          }));

          const finalStory = { 
            ...currentStory, 
            chapters: finalChapters,
            content: finalChapters[finalChapters.length - 1].content 
          };
          
          setCurrentStory(finalStory);
          setStories(prev => prev.map(s => s.id === finalStory.id ? finalStory : s));
        }
      } catch (error) {
        console.error("Continuation error:", error);
        alert(`第 ${i + 1} 章续写失败: ${error instanceof Error ? error.message : '未知错误'}`);
        break;
      }
    }
    setIsGenerating(false);
  };

  // --- Handlers ---
  const openStory = (story: Story) => {
    setCurrentStory(story);
    setCurrentChapterIndex(story.chapters.length - 1);
    setIsDetailOpen(true);
  };

  const toggleCollect = (storyId: string) => {
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, isCollected: !s.isCollected } : s));
    if (currentStory?.id === storyId) {
      setCurrentStory(prev => prev ? { ...prev, isCollected: !prev.isCollected } : null);
    }
  };

  const deleteStory = (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
    setIsDetailOpen(false);
    setIsActionMenuOpen(false);
  };

  const saveEditedStory = () => {
    if (currentStory) {
      setStories(prev => prev.map(s => s.id === currentStory.id ? currentStory : s));
      setIsEditing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | null, type: 'avatar' | 'bg') => {
    try {
      if (isNative()) {
        const base64 = await pickImage();
        if (base64) {
          setProfile(prev => ({ ...prev, [type]: base64 }));
        }
        return;
      }

      if (!e) return;
      const file = e.target.files?.[0];
      if (!file) return;

      // 限制图片大小为 1MB 以防 localStorage 溢出 (5MB 总限制)
      if (file.size > 1024 * 1024) {
        alert('图片文件过大 (超过 1MB)，请选择较小的图片以确保能成功保存。');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!base64String) {
          alert('图片处理失败，请重试。');
          return;
        }
        setProfile(prev => ({ ...prev, [type]: base64String }));
        // 清空 input 允许重复选择同一张图
        e.target.value = '';
      };
      reader.onerror = () => {
        alert('图片读取失败，请重试。');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('图片上传失败，请重试');
    }
  };

  const handleExportData = async () => {
    const data = {
      stories,
      characters,
      worldbooks,
      outlines,
      writingStyles,
      globalPresets,
      profile
    };
    const success = await saveFile(`novel_data_${Date.now()}.json`, JSON.stringify(data, null, 2));
    if (success && !isNative()) {
      alert('数据已导出并下载');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.stories) setStories(data.stories);
        if (data.characters) setCharacters(data.characters);
        if (data.worldbooks) setWorldbooks(data.worldbooks);
        if (data.outlines) setOutlines(data.outlines);
        if (data.writingStyles) setWritingStyles(data.writingStyles);
        if (data.globalPresets) setGlobalPresets(data.globalPresets);
        if (data.profile) setProfile(data.profile);
        alert('数据导入成功');
      } catch (err) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- Sub-Components ---
  const TabIcon = ({ type, active }: { type: string, active: boolean }) => {
    const color = active ? 'text-primary' : 'text-text-sub';
    switch (type) {
      case 'discover': return <Compass className={color} size={24} />;
      case 'follow': return <Heart className={color} size={24} />;
      case 'mine': return <User className={color} size={24} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-dvh bg-bg-main relative overflow-hidden flex flex-col font-sans sm:max-w-[414px] sm:h-[852px] sm:max-h-[95vh] sm:rounded-[3.5rem] sm:border-[12px] sm:border-black sm:shadow-2xl sm:mx-auto sm:my-auto">
      {/* Desktop Notch Simulation */}
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-[100]" />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 z-[300] flex flex-col items-center justify-center text-primary"
          >
            <RefreshCw className="animate-spin mb-4" size={32} />
            <span className="text-sm font-medium">正在处理中...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Generation Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full z-[400] flex items-center gap-2 shadow-lg text-xs font-medium"
          >
            <RefreshCw className="animate-spin" size={14} />
            <span>正在执笔创作中，您可以继续浏览...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      {activeTab !== 'mine' && (
        <div className="h-[50px] bg-card flex items-center justify-between px-4 border-b border-border shrink-0 z-10">
          <h1 className="text-lg font-medium text-text-main absolute left-1/2 -translate-x-1/2">
            {activeTab === 'discover' ? '发现' : '关注'}
          </h1>
          <div className="flex gap-4 ml-auto">
            {activeTab === 'discover' && (
              <>
                <button onClick={() => setIsGenSheetOpen(true)} className="text-primary hover:text-primary/80 transition-colors" title="配置生成参数">
                  <Search size={22} />
                </button>
                <button onClick={() => { setGenMode('new'); setIsGenSheetOpen(true); }} className="text-primary hover:text-primary/80 transition-colors" title="直接开始生成">
                  <Plus size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto p-3 ${activeTab === 'mine' ? 'mt-0' : 'mt-0'}`}>
        {activeTab === 'discover' && (
          <div className="waterfall-container">
            {stories.filter(s => !s.isCollected).map(story => (
              <motion.div
                key={story.id}
                layout
                onClick={() => openStory(story)}
                className="bg-card rounded-xl p-3 mb-3 shadow-sm cursor-pointer break-inside-avoid card-hover border border-border/50 flex flex-col gap-2"
              >
                <h3 className="text-sm font-bold text-text-main line-clamp-2 leading-snug">{story.title}</h3>
                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {story.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[9px] text-text-sub bg-bg-main px-1 py-0.5 rounded-sm border border-border/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-sub line-clamp-4 leading-relaxed opacity-80">{story.content}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'follow' && (
          <div className="flex flex-col gap-4">
            {/* AO3 Style Filter Bar */}
            <div className="bg-card rounded-2xl p-3 border border-border/50 shadow-sm flex items-center gap-2">
              <Search size={16} className="text-text-sub" />
              <input 
                type="text" 
                placeholder="搜索标题或标签 (如: 甜文, 虐心)..." 
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-text-main"
              />
              {tagFilter && (
                <button onClick={() => setTagFilter('')} className="text-text-sub hover:text-primary">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {stories
                .filter(s => s.isCollected)
                .filter(s => !tagFilter || s.tags?.some(t => t.includes(tagFilter)) || s.title.toLowerCase().includes(tagFilter.toLowerCase()))
                .map(story => (
                <motion.div
                  key={story.id}
                  layout
                  className="bg-card rounded-xl p-5 shadow-sm flex flex-col gap-3 transition-all border border-border/50 group relative overflow-hidden"
                >
                  {/* AO3 Style Header */}
                  <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-primary group-hover:underline decoration-2 underline-offset-4 transition-all">{story.title}</h3>
                      <div className="text-[10px] text-text-sub font-mono mt-1">
                        {new Date(story.timestamp).toLocaleDateString()} • {story.chapters?.length || 1} 章节
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                        Collected
                      </div>
                      <ChevronDown size={18} className={`text-text-sub transition-transform ${expandedStoryId === story.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* AO3 Style Tags */}
                  {story.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {story.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); setTagFilter(tag); }}
                          className="text-[11px] text-text-sub hover:text-primary transition-colors bg-bg-main px-2 py-0.5 rounded-sm border border-border/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Chapters List (Expandable) */}
                  <AnimatePresence>
                    {expandedStoryId === story.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden flex flex-col gap-2 mt-2 pt-4 border-t border-border/30"
                      >
                        {story.chapters?.map((chapter, idx) => (
                          <button 
                            key={chapter.id}
                            onClick={() => {
                              setCurrentStory(story);
                              setCurrentChapterIndex(idx);
                              setIsDetailOpen(true);
                            }}
                            className="flex items-center justify-between p-3 bg-bg-main/50 hover:bg-primary/5 rounded-lg border border-border/20 transition-all text-left group/item"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-text-main group-hover/item:text-primary transition-colors">{chapter.title}</span>
                              <span className="text-[10px] text-text-sub">{chapter.content.length} 字</span>
                            </div>
                            <ChevronRight size={14} className="text-text-sub group-hover/item:translate-x-1 transition-transform" />
                          </button>
                        ))}
                        <button 
                          onClick={() => {
                            setCurrentStory(story);
                            setCurrentChapterIndex(story.chapters.length - 1);
                            setGenMode('continue');
                            setIsGenSheetOpen(true);
                          }}
                          className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border/50 rounded-lg text-xs text-text-sub hover:border-primary/30 hover:text-primary transition-all mt-2"
                        >
                          <Plus size={14} /> 续写新章节
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-end items-center gap-4 text-[11px] text-text-sub pt-2 border-t border-border/30">
                    <span>总计 {story.chapters?.reduce((acc, c) => acc + c.content.length, 0) || story.content.length} 字</span>
                  </div>
                </motion.div>
              ))}
              {stories.filter(s => s.isCollected).length === 0 && (
                <div className="text-center py-20 text-text-sub flex flex-col items-center gap-3">
                  <Heart size={40} className="opacity-20" />
                  <p className="text-sm">您的收藏夹空空如也</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'mine' && (
          <div className="flex flex-col gap-8 pb-10">
            {/* Profile Section - Refined Editorial Style */}
            <div className="relative pt-16 pb-10 px-6 flex flex-col items-center">
              {profile.bg && (
                <div className="absolute inset-0 z-0">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${profile.bg})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-bg-main" />
                  <div className="absolute inset-0 backdrop-blur-[1px]" />
                </div>
              )}
              
              {/* Background Actions */}
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                {profile.bg && (
                  <button 
                    onClick={() => setProfile(p => ({ ...p, bg: '' }))}
                    className="p-2 bg-black/20 backdrop-blur-xl rounded-full text-white/80 hover:text-white hover:bg-red-500/40 transition-all active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button 
                  onClick={() => isNative() ? handleImageUpload(null, 'bg') : bgInputRef.current?.click()}
                  className="p-2 bg-black/20 backdrop-blur-xl rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-90"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bg')} />

              <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                {/* Avatar */}
                <div className="relative mb-6">
                  <button 
                    onClick={() => isNative() ? handleImageUpload(null, 'avatar') : avatarInputRef.current?.click()}
                    className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border-[6px] border-white/20 shadow-2xl overflow-hidden flex items-center justify-center cursor-pointer relative group/avatar transition-all active:scale-95 hover:border-primary/30"
                    style={profile.avatar ? { backgroundImage: `url(${profile.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!profile.avatar && <User size={48} className="text-white/30" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                </div>

                {/* Info */}
                <div className="text-center w-full px-4">
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={`text-2xl font-bold mb-2 text-center bg-transparent border-none outline-none w-full focus:ring-0 transition-all ${profile.bg ? 'text-white drop-shadow-lg' : 'text-text-main'}`}
                    placeholder="点击输入昵称"
                  />
                  <textarea 
                    value={profile.desc}
                    onChange={e => setProfile(p => ({ ...p, desc: e.target.value }))}
                    className={`text-sm text-center bg-transparent border-none outline-none w-full resize-none h-auto focus:ring-0 transition-all ${profile.bg ? 'text-white/80 drop-shadow-md' : 'text-text-sub'}`}
                    placeholder="点击输入个性签名"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Menu Section - Clean & Minimal */}
            <div className="px-6 flex flex-col gap-2">
              <h4 className="text-[11px] font-bold text-text-sub uppercase tracking-widest mb-2 px-2">设置与管理</h4>
              <div className="bg-card rounded-3xl overflow-hidden border border-border/40 shadow-sm">
                {[
                  { id: 'settings', label: '设置', icon: <Settings size={18} /> },
                  { id: 'outlines', label: '大纲', icon: <BookOpen size={18} /> },
                  { id: 'worldbooks', label: '世界', icon: <Globe size={18} /> },
                  { id: 'characters', label: '角色', icon: <Users size={18} /> },
                  { id: 'writingStyles', label: '文风', icon: <Sparkles size={18} /> },
                  { id: 'globalPresets', label: '预设', icon: <Check size={18} /> },
                ].map((item, idx, arr) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveOverlay(item.id)}
                    className={`w-full p-4 flex items-center justify-between hover:bg-bg-main transition-all group ${idx !== arr.length - 1 ? 'border-bottom border-border/30' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-primary/60 group-hover:text-primary transition-colors">{item.icon}</span>
                      <span className="text-sm font-medium text-text-main">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-text-sub/40 group-hover:text-primary transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Data Management */}
            <div className="px-6 flex flex-col gap-2">
              <h4 className="text-[11px] font-bold text-text-sub uppercase tracking-widest mb-2 px-2">数据备份</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 bg-card border border-border/40 p-4 rounded-3xl text-text-main text-sm font-medium hover:bg-bg-main transition-all active:scale-95 shadow-sm"
                >
                  <Download size={18} className="text-primary/70" /> 导出
                </button>
                <label className="flex items-center justify-center gap-2 bg-card border border-border/40 p-4 rounded-3xl text-text-main text-sm font-medium hover:bg-bg-main transition-all active:scale-95 shadow-sm cursor-pointer">
                  <Upload size={18} className="text-primary/70" /> 导入
                  <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </label>
              </div>
            </div>

            {/* Offline Version */}
            <div className="px-6 flex flex-col gap-2">
              <h4 className="text-[11px] font-bold text-text-sub uppercase tracking-widest mb-2 px-2">离线单文件版</h4>
              <button 
                onClick={() => {
                  window.location.href = '/api/download-offline';
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white p-4 rounded-3xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                <Download size={18} /> 下载离线版 (HTML)
              </button>
              <p className="text-[10px] text-text-sub text-center mt-1 px-4">
                下载后无需网络环境，双击即可在任意设备上打开使用。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="h-[60px] bg-card border-t border-border flex justify-around items-center shrink-0 z-10">
        {(['discover', 'follow', 'mine'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center gap-1 transition-all"
          >
            <TabIcon type={tab} active={activeTab === tab} />
            <span className={`text-[10px] font-medium ${activeTab === tab ? 'text-primary' : 'text-text-sub'}`}>
              {tab === 'discover' ? '发现' : tab === 'follow' ? '关注' : '我的'}
            </span>
          </button>
        ))}
      </div>

      {/* --- Overlays & Sheets --- */}

      {/* Gen Config Sheet */}
      <BottomSheet 
        isOpen={isGenSheetOpen} 
        onClose={() => setIsGenSheetOpen(false)} 
        title="创作配置"
      >
        <div className="flex flex-col gap-6 pb-6">
          {/* Section: Characters */}
          <MultiSelectDropdown 
            label="角色设定 (多选)"
            icon={<Users size={16} />}
            options={characters.map(c => ({ id: c.id, name: c.name }))}
            selectedIds={genParams.charIds}
            onChange={ids => setGenParams(p => ({ ...p, charIds: ids }))}
            noneLabel="随机全部"
          />
          <div className="flex items-center justify-between px-1 -mt-3">
            <span className="text-xs text-text-sub">允许AI编造新角色</span>
            <button 
              onClick={() => setGenParams(p => ({ ...p, allowUnknown: !p.allowUnknown }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${genParams.allowUnknown ? 'bg-primary' : 'bg-border'}`}
            >
              <motion.div 
                animate={{ x: genParams.allowUnknown ? 22 : 2 }}
                className="w-4 h-4 bg-white rounded-full absolute top-0.5"
              />
            </button>
          </div>

          {/* Section: World & Style */}
          <MultiSelectDropdown 
            label="文风选择 (多选)"
            icon={<Book size={14} />}
            options={writingStyles.map(s => ({ id: s.id, name: s.name }))}
            selectedIds={genParams.styleIds}
            onChange={ids => setGenParams(p => ({ ...p, styleIds: ids }))}
            noneLabel="默认"
          />

          <MultiSelectDropdown 
            label="预设选择 (多选)"
            icon={<Shield size={14} />}
            options={globalPresets.map(p => ({ id: p.id, name: p.name }))}
            selectedIds={genParams.presetIds}
            onChange={ids => setGenParams(p => ({ ...p, presetIds: ids }))}
            noneLabel="无"
          />

          <MultiSelectDropdown 
            label="关联世界书 (多选)"
            icon={<Globe size={14} />}
            options={worldbooks.map(w => ({ id: w.id, name: w.title }))}
            selectedIds={genParams.wbIds}
            onChange={ids => setGenParams(p => ({ ...p, wbIds: ids }))}
            noneLabel="无特定背景"
          />

          {/* Section: Outline (Direct Edit) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <FileText size={16} />
                <span className="text-sm font-bold">大纲设定</span>
              </div>
              <select 
                value={genParams.outlineId}
                onChange={e => {
                  const id = e.target.value;
                  setGenParams(p => ({ ...p, outlineId: id }));
                  if (id !== 'none') {
                    setTempOutline(outlines.find(o => o.id === id)?.content || '');
                  } else {
                    setTempOutline('');
                  }
                }}
                className="text-xs bg-transparent border-none outline-none text-primary font-medium"
              >
                <option value="none">自由发挥</option>
                {outlines.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
            </div>
            <div className="relative">
              <textarea 
                placeholder="在此输入或修改本次创作的大纲要求..."
                value={tempOutline}
                onChange={e => setTempOutline(e.target.value)}
                className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary min-h-[100px] resize-none leading-relaxed"
              />
              {tempOutline && (
                <div className="mt-2 flex items-center gap-2">
                  <button 
                    onClick={() => setSaveToOutlines(!saveToOutlines)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] transition-all ${saveToOutlines ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-sub border border-transparent'}`}
                  >
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${saveToOutlines ? 'bg-primary border-primary' : 'border-border'}`}>
                      {saveToOutlines && <Check size={8} className="text-white" />}
                    </div>
                    保存到大纲库
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Length & Count */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-sub">篇幅</span>
              <div className="flex bg-bg-main p-1 rounded-xl border border-border">
                {(['short', 'long'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setGenParams(p => ({ ...p, length: l }))}
                    className={`flex-1 py-1.5 text-[10px] rounded-lg transition-all ${genParams.length === l ? 'bg-card text-primary shadow-sm font-bold' : 'text-text-sub'}`}
                  >
                    {l === 'short' ? '短篇' : '长篇'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-sub">生成数量</span>
              <div className="flex items-center justify-between bg-bg-main px-3 py-1.5 rounded-xl border border-border">
                <button onClick={() => setGenParams(p => ({ ...p, count: Math.max(1, p.count - 1) }))} className="text-text-sub hover:text-primary">
                  <Minus size={14} />
                </button>
                <span className="text-xs font-bold text-text-main">{genParams.count}</span>
                <button onClick={() => setGenParams(p => ({ ...p, count: Math.min(5, p.count + 1) }))} className="text-text-sub hover:text-primary">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={() => genMode === 'new' ? executeGeneration() : executeMoreChapter()}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles size={18} />
            {genMode === 'new' ? '开始创作' : '开始生成下一章'}
          </button>
        </div>
      </BottomSheet>

      {/* Story Detail Overlay */}
      <Overlay 
        isOpen={isDetailOpen} 
        onClose={() => { setIsDetailOpen(false); setIsEditing(false); setAiEditPrompt(''); }} 
        title={isEditing ? "编辑文章" : currentStory?.title || "文章详情"}
        actions={
          <div className="flex gap-3">
            {isEditing ? (
              <button onClick={saveEditedStory} className="bg-primary text-white px-3 py-1 rounded text-sm font-medium">完成</button>
            ) : (
              <>
                <button onClick={() => toggleCollect(currentStory?.id || '')} className="text-text-main hover:text-primary transition-colors">
                  <Star size={20} fill={currentStory?.isCollected ? "currentColor" : "none"} className={currentStory?.isCollected ? "text-primary" : ""} />
                </button>
                <button onClick={() => setIsActionMenuOpen(true)} className="text-text-main hover:text-primary transition-colors">
                  <MoreVertical size={20} />
                </button>
              </>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              {/* AI Assistant Bar */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} /> AI 辅助修改
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={aiEditPrompt}
                    onChange={e => setAiEditPrompt(e.target.value)}
                    placeholder={selection ? `修改选中文字: "${selection.text.substring(0, 10)}..."` : "输入修改指令..."}
                    className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                    onKeyDown={e => e.key === 'Enter' && handleAiEdit()}
                  />
                  <button 
                    onClick={handleAiEdit}
                    disabled={isAiEditing || !aiEditPrompt}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                  >
                    {isAiEditing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                    执行
                  </button>
                </div>
                {selection && (
                  <div className="flex items-center justify-between text-[10px] text-text-sub">
                    <span>已选中 {selection.text.length} 字</span>
                    <button onClick={() => setSelection(null)} className="text-primary hover:underline">取消选中</button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-sub uppercase ml-1">文章标题</label>
                <input 
                  type="text" 
                  value={currentStory?.title || ''} 
                  onChange={e => setCurrentStory(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary font-bold"
                />
              </div>
              
              {/* Tag Editor */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-sub uppercase ml-1">标签 (逗号分隔)</label>
                <input 
                  type="text" 
                  value={currentStory?.tags?.join(', ') || ''} 
                  onChange={e => setCurrentStory(prev => prev ? { ...prev, tags: e.target.value.split(/,|，/).map(t => t.trim()).filter(t => t) } : null)}
                  className="w-full p-2 bg-bg-main border border-border rounded-lg text-sm outline-none focus:border-primary"
                  placeholder="添加标签..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-sub uppercase ml-1">
                  当前章节: {currentStory?.chapters[currentChapterIndex]?.title}
                </label>
                <textarea 
                  value={currentStory?.chapters[currentChapterIndex]?.content || ''} 
                  onChange={e => {
                    const newContent = e.target.value;
                    const updatedChapters = currentStory?.chapters.map((c, idx) => 
                      idx === currentChapterIndex ? { ...c, content: newContent } : c
                    ) || [];
                    setCurrentStory(prev => prev ? { ...prev, chapters: updatedChapters } : null);
                  }}
                  className="w-full h-[400px] bg-card border border-border rounded-xl px-4 py-4 text-sm outline-none focus:border-primary leading-relaxed resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Chapter Navigation */}
              <div className="flex items-center justify-between mb-6 bg-bg-main p-1.5 rounded-2xl border border-border/50 shadow-inner">
                <button 
                  disabled={currentChapterIndex === 0}
                  onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                  className="p-2.5 text-text-sub hover:text-primary disabled:opacity-20 disabled:hover:text-text-sub transition-all active:scale-90"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-text-sub uppercase tracking-widest mb-0.5">
                    CHAPTER {currentChapterIndex + 1} / {currentStory?.chapters.length}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {currentStory?.chapters[currentChapterIndex]?.title}
                  </span>
                </div>
                <button 
                  disabled={currentChapterIndex === (currentStory?.chapters.length || 0) - 1}
                  onClick={() => setCurrentChapterIndex(prev => prev + 1)}
                  className="p-2.5 text-text-sub hover:text-primary disabled:opacity-20 disabled:hover:text-text-sub transition-all active:scale-90"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="relative">
                <div 
                  onMouseUp={handleTextSelection}
                  className="story-content text-[15px] text-text-main whitespace-pre-wrap leading-[1.8] tracking-wide select-text"
                >
                  {currentStory?.chapters[currentChapterIndex]?.content}
                </div>
                
                {/* Floating Selection Menu */}
                <AnimatePresence>
                  {selectionMenuPos && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      style={{ left: selectionMenuPos.x, top: selectionMenuPos.y }}
                      className="fixed z-[500] -translate-x-1/2 bg-card shadow-2xl border border-border rounded-full p-1 flex items-center gap-1"
                    >
                      <button 
                        onClick={() => {
                          setIsEditing(true);
                          setAiEditPrompt('');
                          setSelectionMenuPos(null);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Sparkles size={14} /> AI 修改选中
                      </button>
                      <button 
                        onClick={() => {
                          setSelection(null);
                          setSelectionMenuPos(null);
                          window.getSelection()?.removeAllRanges();
                        }}
                        className="p-1.5 text-text-sub hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags in Detail View */}
              {currentStory?.tags && currentStory.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-2">
                  {currentStory.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-text-sub bg-bg-main px-2 py-1 rounded border border-border/30">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Actions at bottom of chapter */}
              <div className="mt-10 pt-6 border-t border-border/30 flex justify-between gap-4">
                <button 
                  disabled={currentChapterIndex === 0}
                  onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-bg-main text-text-main rounded-2xl font-bold text-sm border border-border/50 disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft size={16} /> 上一章
                </button>
                <button 
                  disabled={currentChapterIndex === (currentStory?.chapters.length || 0) - 1}
                  onClick={() => setCurrentChapterIndex(prev => prev + 1)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-30 transition-all active:scale-95"
                >
                  下一章 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </Overlay>

      {/* Action Menu Sheet */}
      <BottomSheet 
        isOpen={isActionMenuOpen} 
        onClose={() => setIsActionMenuOpen(false)} 
        title="文章操作"
      >
        <div className="flex flex-col divide-y divide-border">
          <button onClick={() => { setIsActionMenuOpen(false); setIsEditing(true); }} className="py-4 flex items-center gap-3 text-text-main hover:bg-bg-main transition-colors">
            <Edit3 size={18} /> <span>修改</span>
          </button>
          <button onClick={triggerMoreChapter} className="py-4 flex items-center gap-3 text-primary hover:bg-bg-main transition-colors">
            <RefreshCw size={18} /> <span>下一章</span>
          </button>
          <button onClick={() => deleteStory(currentStory?.id || '')} className="py-4 flex items-center gap-3 text-red-400 hover:bg-bg-main transition-colors">
            <Trash2 size={18} /> <span>删除此文章</span>
          </button>
        </div>
      </BottomSheet>

      {/* --- Management Overlays --- */}

      <SettingsOverlay 
        isOpen={activeOverlay === 'settings'} 
        onClose={() => setActiveOverlay(null)}
        apiSettings={apiSettings}
        setApiSettings={setApiSettings}
        apiPresets={apiPresets}
        setApiPresets={setApiPresets}
        cssPresets={cssPresets}
        setCssPresets={setCssPresets}
        currentCss={currentCss}
        setCurrentCss={setCurrentCss}
        themeSettings={themeSettings}
        setThemeSettings={setThemeSettings}
      />

      <CharacterOverlay 
        isOpen={activeOverlay === 'characters'} 
        onClose={() => setActiveOverlay(null)}
        characters={characters}
        setCharacters={setCharacters}
        relationshipPresets={relationshipPresets}
        setRelationshipPresets={setRelationshipPresets}
        title="角色"
      />

      <OutlineOverlay 
        isOpen={activeOverlay === 'outlines'} 
        onClose={() => setActiveOverlay(null)}
        outlines={outlines}
        setOutlines={setOutlines}
        title="大纲"
      />

      <WorldbookOverlay 
        isOpen={activeOverlay === 'worldbooks'} 
        onClose={() => setActiveOverlay(null)}
        worldbooks={worldbooks}
        setWorldbooks={setWorldbooks}
        title="世界"
      />

      <WritingStyleOverlay
        isOpen={activeOverlay === 'writingStyles'}
        onClose={() => setActiveOverlay(null)}
        styles={writingStyles}
        setStyles={setWritingStyles}
        title="文风"
      />

      <GlobalPresetOverlay
        isOpen={activeOverlay === 'globalPresets'}
        onClose={() => setActiveOverlay(null)}
        presets={globalPresets}
        setPresets={setGlobalPresets}
        title="预设"
      />
    </div>
  );
}
