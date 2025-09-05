
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KnowledgeArticle, KnowledgeBaseFilterState } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { StarIcon } from './icons/StarIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import Modal from './common/Modal.tsx';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon.tsx';

interface KnowledgeBaseViewProps {
  articles: KnowledgeArticle[];
  onSave: (article: Omit<KnowledgeArticle, 'id'> | KnowledgeArticle) => void;
  onDelete: (articleId: string) => void;
  onToggleFavorite: (articleId: string) => void;
}

const RichTextEditor: React.FC<{ value: string, onChange: (value: string) => void, placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            setIsPlaceholderVisible(!editorRef.current.textContent?.trim());
        }
    };
    
    const handleFormat = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput();
    };

    useEffect(() => {
        if(editorRef.current) {
            editorRef.current.innerHTML = value;
            setIsPlaceholderVisible(!editorRef.current.textContent?.trim());
        }
    }, [value]);

    return (
        <div className="relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center" aria-label="Bold">B</button>
                <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center" aria-label="Italic">I</button>
                <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Bulleted List">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                </button>
                <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Numbered List">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/><path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M3.652 7.332v-.474H4c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/><path d="M2.24 3.862v.428h.832v-.428h.633V5.1h-.633v.569h-.832v-.569H1.41V3.862z"/></svg>
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="w-full text-sm p-3 min-h-[250px] focus:outline-none rich-text-content text-gray-900"
            />
            {isPlaceholderVisible && (
                <div className="absolute top-[49px] left-3 text-sm text-gray-500 pointer-events-none select-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
};


const ArticleForm: React.FC<{ onSave: (article: Omit<KnowledgeArticle, 'id'> | KnowledgeArticle) => void, onClose: () => void, articleToEdit?: KnowledgeArticle | null }> = ({ onSave, onClose, articleToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const isEditing = !!articleToEdit;

    useEffect(() => {
        if (articleToEdit) {
            setTitle(articleToEdit.title);
            setContent(articleToEdit.content);
            setCategory(articleToEdit.category);
            setTags((articleToEdit.tags || []).join(', '));
        }
    }, [articleToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const articleData = {
            title,
            content,
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        };

        if (isEditing) {
            onSave({
                ...articleToEdit,
                ...articleData,
                lastModifiedDate: new Date().toISOString(),
            });
        } else {
            onSave({
                ...articleData,
                createdDate: new Date().toISOString(),
                lastModifiedDate: new Date().toISOString(),
            });
        }
    };

    const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={formElementClasses} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Category</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Tags (comma-separated)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={formElementClasses} />
                </div>
            </div>
            <div>
                <label className={labelClasses}>Content</label>
                <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your article..."/>
            </div>
             <div className="flex justify-end pt-4 border-t">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">{isEditing ? 'Save Changes' : 'Create Article'}</button>
            </div>
        </form>
    );
};

const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ articles, onSave, onDelete, onToggleFavorite }) => {
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
    const [filters, setFilters] = useState<KnowledgeBaseFilterState>({ searchTerm: '', category: 'all', tag: 'all' });

    const allCategories = useMemo(() => ['all', ...Array.from(new Set(articles.map(a => a.category)))], [articles]);
    const allTags = useMemo(() => ['all', ...Array.from(new Set(articles.flatMap(a => a.tags)))], [articles]);

    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchLower || a.title.toLowerCase().includes(searchLower) || a.content.toLowerCase().includes(searchLower);
            const matchesCategory = filters.category === 'all' || a.category === filters.category;
            const matchesTag = filters.tag === 'all' || a.tags.includes(filters.tag);
            return matchesSearch && matchesCategory && matchesTag;
        }).sort((a, b) => new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime());
    }, [articles, filters]);

    const handleSave = (articleData: Omit<KnowledgeArticle, 'id'> | KnowledgeArticle) => {
        onSave(articleData);
        setIsFormOpen(false);
        setEditingArticle(null);
        // If it was a new article, find and select it.
        if (!('id' in articleData)) {
            // This is a bit of a hack. Ideally onSave would return the new article.
            setTimeout(() => {
                const newArticle = articles.find(a => a.title === articleData.title && a.content === articleData.content);
                if (newArticle) setSelectedArticle(newArticle);
            }, 100);
        } else {
             setSelectedArticle(articleData as KnowledgeArticle);
        }
    };
    
    const handleDelete = () => {
        if(selectedArticle && window.confirm(`Are you sure you want to delete "${selectedArticle.title}"?`)) {
            onDelete(selectedArticle.id);
            setSelectedArticle(null);
        }
    }

    return (
        <div className="flex h-full">
             {isFormOpen && (
                <Modal title={editingArticle ? 'Edit Article' : 'Create New Article'} onClose={() => { setIsFormOpen(false); setEditingArticle(null); }}>
                    <ArticleForm onSave={handleSave} onClose={() => { setIsFormOpen(false); setEditingArticle(null); }} articleToEdit={editingArticle} />
                </Modal>
            )}
            {/* Sidebar */}
            <aside className="w-1/3 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-4">
                <div className="relative mb-4">
                    <input type="text" placeholder="Search articles..." value={filters.searchTerm} onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <select value={filters.category} onChange={e => setFilters(prev => ({...prev, category: e.target.value}))} className="text-sm p-2 bg-gray-100 border-gray-300 border rounded-md">
                        {allCategories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                    </select>
                    <select value={filters.tag} onChange={e => setFilters(prev => ({...prev, tag: e.target.value}))} className="text-sm p-2 bg-gray-100 border-gray-300 border rounded-md">
                        {allTags.map(t => <option key={t} value={t}>{t === 'all' ? 'All Tags' : t}</option>)}
                    </select>
                </div>
                <button onClick={() => { setEditingArticle(null); setIsFormOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm mb-4">
                    <PlusIcon className="w-5 h-5" /> New Article
                </button>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                    {filteredArticles.map(article => (
                        <div key={article.id} onClick={() => setSelectedArticle(article)} className={`p-3 rounded-md cursor-pointer border ${selectedArticle?.id === article.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50 border-transparent'}`}>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-800 text-sm flex-grow">{article.title}</p>
                                {article.isFavorite && <StarIcon filled={true} className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{article.category}</p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {selectedArticle ? (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">Last updated: {new Date(selectedArticle.lastModifiedDate).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onToggleFavorite(selectedArticle.id)} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full" title={selectedArticle.isFavorite ? 'Remove from favorites' : 'Add to favorites'}><StarIcon filled={!!selectedArticle.isFavorite} className={`w-5 h-5 ${selectedArticle.isFavorite ? 'text-yellow-500' : ''}`} /></button>
                                <button onClick={() => { setEditingArticle(selectedArticle); setIsFormOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full" title="Edit Article"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-full" title="Delete Article"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-semibold">Category:</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">{selectedArticle.category}</span>
                        </div>
                         <div className="flex items-center gap-2 mb-6">
                            <span className="text-sm font-semibold">Tags:</span>
                            {selectedArticle.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tag}</span>)}
                        </div>
                        <div className="prose max-w-none rich-text-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed">
                        <BrainCircuitIcon className="w-16 h-16 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Welcome to your Knowledge Base</h2>
                        <p className="mt-2 text-gray-500">Select an article from the left to view it, or create a new one to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default KnowledgeBaseView;
