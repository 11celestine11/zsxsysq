import React, { useState, useEffect } from 'react';
import { Settings, Save, Trash2, RefreshCw, Check, Palette, Code, Edit2, Download } from 'lucide-react';
import Overlay from './Overlay';
import { ApiSettings, ApiPreset, CssPreset } from '../types';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  apiSettings: ApiSettings;
  setApiSettings: React.Dispatch<React.SetStateAction<ApiSettings>>;
  apiPresets: ApiPreset[];
  setApiPresets: React.Dispatch<React.SetStateAction<ApiPreset[]>>;
  cssPresets: CssPreset[];
  setCssPresets: React.Dispatch<React.SetStateAction<CssPreset[]>>;
  currentCss: string;
  setCurrentCss: React.Dispatch<React.SetStateAction<string>>;
  themeSettings: { primary: string; bg: string; body: string; card: string; text: string };
  setThemeSettings: React.Dispatch<React.SetStateAction<{ primary: string; bg: string; body: string; card: string; text: string }>>;
}

export default function SettingsOverlay({ 
  isOpen, 
  onClose, 
  apiSettings, 
  setApiSettings,
  apiPresets,
  setApiPresets,
  cssPresets,
  setCssPresets,
  currentCss,
  setCurrentCss,
  themeSettings,
  setThemeSettings
}: SettingsOverlayProps) {
  // Local state for editing before applying
  const [localApi, setLocalApi] = useState(apiSettings);
  const [localCss, setLocalCss] = useState(currentCss);
  const [savePresetName, setSavePresetName] = useState('');
  const [saveCssName, setSaveCssName] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Sync local state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setLocalApi(apiSettings);
      setLocalCss(currentCss);
    }
  }, [isOpen, apiSettings, currentCss]);

  const handleApply = () => {
    setApiSettings(localApi);
    setCurrentCss(localCss);
    onClose();
  };

  const fetchModels = async () => {
    if (!localApi.url || !localApi.key) {
      alert('请先填写 API URL 和 Key');
      return;
    }
    setIsFetchingModels(true);
    try {
      const url = localApi.url || '';
      const baseUrl = url.endsWith('/v1') ? url : url + '/v1';
      const requestKey = localApi.key.startsWith('Bearer ') ? localApi.key : 'Bearer ' + localApi.key;
      const response = await fetch(`${baseUrl}/models`, {
        headers: { 'Authorization': requestKey }
      });
      const data = await response.json();
      if (data.data) {
        setAvailableModels(data.data.map((m: any) => m.id));
      } else {
        alert('获取模型失败，请检查配置');
      }
    } catch (error) {
      console.error(error);
      alert('获取模型失败，请检查网络或配置');
    }
    setIsFetchingModels(false);
  };

  const handleSaveApiPreset = () => {
    if (!savePresetName) return;
    const newPreset: ApiPreset = {
      name: savePresetName,
      ...localApi
    };
    setApiPresets(prev => {
      const exists = prev.findIndex(p => p.name === savePresetName);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newPreset;
        return updated;
      }
      return [...prev, newPreset];
    });
    setSavePresetName('');
  };

  const handleSaveCssPreset = () => {
    if (!saveCssName) return;
    const newPreset: CssPreset = {
      name: saveCssName,
      code: localCss
    };
    setCssPresets(prev => {
      const exists = prev.findIndex(p => p.name === saveCssName);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newPreset;
        return updated;
      }
      return [...prev, newPreset];
    });
    setSaveCssName('');
  };

  return (
    <Overlay 
      isOpen={isOpen} 
      onClose={onClose} 
      title="设置"
      actions={
        <button 
          onClick={handleApply}
          className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg shadow-primary/20 flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Check size={14} /> 应用
        </button>
      }
    >
      <div className="flex flex-col gap-6 pb-10">
        {/* Offline Download */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
            <Download size={18} className="text-primary" /> 离线单文件版
          </h3>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-text-sub">
              点击下方按钮，将当前应用（包含你配置的 API Key 和所有代码）打包为一个独立的 HTML 文件。下载后，你可以直接在电脑或手机浏览器中双击打开使用，无需任何环境依赖。
            </p>
            <button 
              onClick={() => {
                window.location.href = '/api/download-offline';
              }}
              className="mt-2 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-medium active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Download size={16} /> 下载离线版 (HTML)
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
            <Settings size={18} className="text-primary" /> API 配置
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-sub font-medium">Base URL</label>
              <input 
                type="text" 
                value={localApi.url}
                onChange={e => setLocalApi(s => ({ ...s, url: e.target.value }))}
                placeholder="https://api.example.com/v1"
                className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-sub font-medium">API Key</label>
              <input 
                type="password" 
                value={localApi.key}
                onChange={e => setLocalApi(s => ({ ...s, key: e.target.value }))}
                placeholder="sk-..."
                className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-sub font-medium">模型选择</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={localApi.model}
                    onChange={e => setLocalApi(s => ({ ...s, model: e.target.value }))}
                    placeholder="选择或输入模型"
                    className="w-full p-3 bg-bg-main border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                    list="model-list"
                  />
                  <datalist id="model-list">
                    {availableModels.map(m => <option key={m} value={m} />)}
                  </datalist>
                </div>
                <button 
                  onClick={fetchModels}
                  disabled={isFetchingModels}
                  className="bg-bg-main border border-border text-text-sub px-3 rounded-xl hover:text-primary hover:border-primary transition-all disabled:opacity-50"
                  title="拉取模型列表"
                >
                  <RefreshCw size={18} className={isFetchingModels ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Presets */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
            <Save size={18} className="text-primary" /> API 预设
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="预设名称" 
              value={savePresetName}
              onChange={e => setSavePresetName(e.target.value)}
              className="flex-1 p-2.5 bg-bg-main border border-border rounded-xl text-xs outline-none focus:border-primary"
            />
            <button 
              onClick={handleSaveApiPreset}
              className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-medium active:scale-95 transition-transform shrink-0"
            >
              保存
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {apiPresets.map(preset => (
              <div key={preset.name} className="flex items-center justify-between p-3 bg-bg-main rounded-xl border border-border/50 group">
                <div className="flex flex-col">
                  <span className="text-xs text-text-main font-semibold">{preset.name}</span>
                  <span className="text-[10px] text-text-sub truncate max-w-[150px]">{preset.model}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setLocalApi({ url: preset.url, key: preset.key, model: preset.model })}
                    className="text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="加载"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      setSavePresetName(preset.name);
                      setLocalApi({ url: preset.url, key: preset.key, model: preset.model });
                    }}
                    className="text-text-sub p-2 hover:bg-bg-main rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setApiPresets(prev => prev.filter(p => p.name !== preset.name))}
                    className="text-red-300 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Theme Colors */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
            <Palette size={18} className="text-primary" /> 主题色与背景
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-sub font-medium">主色调 (Primary Color)</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['#5A5A40', '#8fa3b5', '#a3b59e', '#b59ea8', '#b5a89e', '#7c9473', '#9e8fb5', '#d4a373', '#ccd5ae', '#2c2c2c'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeSettings(prev => ({ ...prev, primary: color }))}
                    className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all active:scale-90 shrink-0 ${themeSettings.primary === color ? 'border-primary scale-110' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={themeSettings.primary}
                  onChange={e => setThemeSettings(prev => ({ ...prev, primary: e.target.value }))}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-sub font-medium">文字主色 (Text Color)</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['#2c2c2c', '#000000', '#1a1a1a', '#333333', '#4a4a4a', '#5a5a5a', '#ffffff', '#f5f2ed'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeSettings(prev => ({ ...prev, text: color }))}
                    className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all active:scale-90 shrink-0 ${themeSettings.text === color ? 'border-primary scale-110' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={themeSettings.text}
                  onChange={e => setThemeSettings(prev => ({ ...prev, text: e.target.value }))}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-sub font-medium">卡片背景 (Card Background)</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['#ffffff', '#f5f2ed', '#fcfaf7', '#f0f0f0', '#e8e8e8', '#dcdcdc'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeSettings(prev => ({ ...prev, card: color }))}
                    className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all active:scale-90 shrink-0 ${themeSettings.card === color ? 'border-primary scale-110' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={themeSettings.card}
                  onChange={e => setThemeSettings(prev => ({ ...prev, card: e.target.value }))}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-sub font-medium">区块背景 (Section Background)</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['#f5f2ed', '#ffffff', '#fcfaf7', '#f0f0f0', '#e8e8e8', '#dcdcdc'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeSettings(prev => ({ ...prev, bg: color }))}
                    className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all active:scale-90 shrink-0 ${themeSettings.bg === color ? 'border-primary scale-110' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={themeSettings.bg}
                  onChange={e => setThemeSettings(prev => ({ ...prev, bg: e.target.value }))}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-text-sub font-medium">页面底色 (Body Background)</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['#e8e6e1', '#f5f5f5', '#fafafa', '#e0e0e0', '#d0d0d0', '#c0c0c0'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setThemeSettings(prev => ({ ...prev, body: color }))}
                    className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all active:scale-90 shrink-0 ${themeSettings.body === color ? 'border-primary scale-110' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={themeSettings.body}
                  onChange={e => setThemeSettings(prev => ({ ...prev, body: e.target.value }))}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm shrink-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CSS Customization */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
            <Code size={18} className="text-primary" /> CSS 美化设置
          </h3>
          <div className="flex flex-col gap-4">
            <textarea 
              value={localCss}
              onChange={e => setLocalCss(e.target.value)}
              placeholder="/* 在这里输入自定义 CSS */"
              className="w-full p-4 bg-bg-main border border-border rounded-xl text-xs font-mono outline-none focus:border-primary transition-colors min-h-[150px]"
            />
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="美化预设名称" 
                value={saveCssName}
                onChange={e => setSaveCssName(e.target.value)}
                className="flex-1 p-2.5 bg-bg-main border border-border rounded-xl text-xs outline-none focus:border-primary"
              />
              <button 
                onClick={handleSaveCssPreset}
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-medium active:scale-95 transition-transform shrink-0"
              >
                保存
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {cssPresets.map(preset => (
                <div key={preset.name} className="flex items-center justify-between p-3 bg-bg-main rounded-xl border border-border/50 group">
                  <span className="text-xs text-text-main font-semibold">{preset.name}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setLocalCss(preset.code)}
                      className="text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="加载"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button 
                      onClick={() => {
                        setSaveCssName(preset.name);
                        setLocalCss(preset.code);
                      }}
                      className="text-text-sub p-2 hover:bg-bg-main rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => setCssPresets(prev => prev.filter(p => p.name !== preset.name))}
                      className="text-red-300 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
