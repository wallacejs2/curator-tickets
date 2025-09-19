import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CuratorArticle, FeatureAnnouncement } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { StarIcon } from './icons/StarIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import Modal from './common/Modal.tsx';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon.tsx';
import SideView from './common/SideView.tsx';
import RichTextEditor from './common/RichTextEditor.tsx';
import { ShareIcon } from './icons/ShareIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'contact' | 'knowledge' | 'shopper' | 'curator' | 'quarter';


interface CuratorViewProps {
  articles: CuratorArticle[];
  onSave: (article: Omit<CuratorArticle, 'id'> | CuratorArticle) => void;
  onDelete: (articleId: string) => void;
  onToggleFavorite: (articleId: string) => void;
  allFeatures: FeatureAnnouncement[];
  onLink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
  onUnlink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const ArticleForm: React.FC<{ 
    onSave: (article: Omit<CuratorArticle, 'id'> | CuratorArticle) => void, 
    onClose: () => void, 
    articleToEdit?: CuratorArticle | null,
    // Linking props
    allFeatures: FeatureAnnouncement[];
    onLink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
    onUnlink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
    onSwitchView: (type: EntityType, id: string) => void;
}> = ({ onSave, onClose, articleToEdit, allFeatures, onLink, onUnlink, onSwitchView }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [navigation, setNavigation] = useState<{ title: string; url: string }[]>([]);
    const [newNavItem, setNewNavItem] = useState({ title: '', url: '' });
    const [supportingMaterialsUrl, setSupportingMaterialsUrl] = useState('');
    const isEditing = !!articleToEdit;

    const linkedFeatures = allFeatures.filter(f => articleToEdit?.featureIds?.includes(f.id));
    const availableFeatures = allFeatures.filter(f => !articleToEdit?.featureIds?.includes(f.id));

    useEffect(() => {
        if (articleToEdit) {
            setTitle(articleToEdit.title);
            setContent(articleToEdit.content);
            setSupportingMaterialsUrl(articleToEdit.supportingMaterialsUrl || '');
            setNavigation(articleToEdit.navigation || []);
            setCategory(articleToEdit.category || '');
        } else {
            setTitle('');
            setContent('');
            setSupportingMaterialsUrl('');
            setNavigation([]);
            setCategory('');
        }
    }, [articleToEdit]);

    const handleAddNavItem = () => {
        if (newNavItem.title.trim() && newNavItem.url.trim()) {
            if (!newNavItem.url.startsWith('http://') && !newNavItem.url.startsWith('https://')) {
                alert('Please enter a valid URL starting with http:// or https://');
                return;
            }
            if (!navigation.some(item => item.url === newNavItem.url.trim())) {
                setNavigation([...navigation, { title: newNavItem.title.trim(), url: newNavItem.url.trim() }]);
                setNewNavItem({ title: '', url: '' });
            } else {
                alert('A navigation item with this URL already exists.');
            }
        }
    };

    const handleDeleteNavItem = (url: string) => {
        setNavigation(navigation.filter(item => item.url !== url));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const articleData = {
            title,
            content,
            category,
            tags: [], // Tags are not in use in this form
            supportingMaterialsUrl: supportingMaterialsUrl.trim() || undefined,
            navigation,
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Category</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className={formElementClasses} />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Supporting Materials URL</label>
                <input type="url" value={supportingMaterialsUrl} onChange={e => setSupportingMaterialsUrl(e.target.value)} className={formElementClasses} placeholder="https://example.com/doc.pdf" />
            </div>

            <div>
                <label className={labelClasses}>Navigation Links</label>
                <div className="space-y-2 p-3 border rounded-md bg-gray-50 flex flex-col">
                    <div className="flex-grow space-y-2 overflow-y-auto max-h-48">
                        {navigation.map(item => (
                            <div key={item.url} className="bg-white p-2 rounded border">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">{item.title}</span>
                                    <button type="button" onClick={() => handleDeleteNavItem(item.url)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{item.url}</a>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 border-t mt-2">
                        <input 
                            type="text" 
                            value={newNavItem.title} 
                            onChange={e => setNewNavItem(prev => ({...prev, title: e.target.value}))} 
                            placeholder="Link Title" 
                            className="w-full bg-white text-sm p-2 border border-gray-300 rounded-md mb-2" 
                        />
                        <div className="flex items-center gap-2">
                            <input 
                                type="url" 
                                value={newNavItem.url} 
                                onChange={e => setNewNavItem(prev => ({...prev, url: e.target.value}))} 
                                placeholder="https://example.com" 
                                className="flex-grow bg-white text-sm p-2 border border-gray-300 rounded-md" 
                            />
                            <button type="button" onClick={handleAddNavItem} className="bg-blue-100 text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-200">Add</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <label className={labelClasses}>Content</label>
                <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your article..."/>
            </div>

            {isEditing && articleToEdit && (
                <LinkingSection
                    title="Link Features"
                    itemTypeLabel="feature"
                    linkedItems={linkedFeatures}
                    availableItems={availableFeatures}
                    onLink={(featureId) => onLink('curator', articleToEdit.id, 'feature', featureId)}
                    onUnlink={(featureId) => onUnlink('curator', articleToEdit.id, 'feature', featureId)}
                    onItemClick={(featureId) => onSwitchView('feature', featureId)}
                />
            )}

             <div className="flex justify-end pt-4 border-t">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">{isEditing ? 'Save Changes' : 'Create Article'}</button>
            </div>
        </form>
    );
};

const CuratorView: React.FC<CuratorViewProps> = ({ articles, onSave, onDelete, onToggleFavorite, allFeatures, onLink, onUnlink, onSwitchView }) => {
    const [selectedArticle, setSelectedArticle] = useState<CuratorArticle | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<CuratorArticle | null>(null);
    const [filters, setFilters] = useState<{ searchTerm: string; category: string }>({ searchTerm: '', category: 'all' });

    const allCategories = useMemo(() => ['all', ...Array.from(new Set(articles.map(a => a.category)))], [articles]);

    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchLower || a.title.toLowerCase().includes(searchLower) || a.content.toLowerCase().includes(searchLower);
            const matchesCategory = filters.category === 'all' || a.category === filters.category;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime());
    }, [articles, filters]);

    const handleSave = (articleData: Omit<CuratorArticle, 'id'> | CuratorArticle) => {
        onSave(articleData);
        setIsFormOpen(false);
        setEditingArticle(null);
        if (!('id' in articleData)) {
            setTimeout(() => {
                const newArticle = articles.find(a => a.title === articleData.title && a.content === articleData.content);
                if (newArticle) setSelectedArticle(newArticle);
            }, 100);
        } else {
             setSelectedArticle(articleData as CuratorArticle);
        }
    };
    
    const handleDelete = () => {
        if(selectedArticle && window.confirm(`Are you sure you want to delete "${selectedArticle.title}"?`)) {
            onDelete(selectedArticle.id);
            setSelectedArticle(null);
        }
    }

    const linkedFeatures = allFeatures.filter(f => selectedArticle?.featureIds?.includes(f.id));

    return (
        <div className="flex h-full">
            {isFormOpen && !editingArticle && (
                <Modal title="Create New Article" onClose={() => { setIsFormOpen(false); setEditingArticle(null); }}>
                    <ArticleForm 
                        onSave={handleSave} 
                        onClose={() => { setIsFormOpen(false); setEditingArticle(null); }} 
                        articleToEdit={null}
                        allFeatures={allFeatures}
                        onLink={onLink}
                        onUnlink={onUnlink}
                        onSwitchView={onSwitchView}
                    />
                </Modal>
            )}

            <SideView
                isOpen={isFormOpen && !!editingArticle}
                onClose={() => { setIsFormOpen(false); setEditingArticle(null); }}
                title="Edit Article"
            >
                {editingArticle && (
                    <ArticleForm
                        onSave={handleSave}
                        onClose={() => { setIsFormOpen(false); setEditingArticle(null); }}
                        articleToEdit={editingArticle}
                        allFeatures={allFeatures}
                        onLink={onLink}
                        onUnlink={onUnlink}
                        onSwitchView={onSwitchView}
                    />
                )}
            </SideView>

            <aside className="w-1/3 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-4">
                <div className="relative mb-4">
                    <input type="text" placeholder="Search articles..." value={filters.searchTerm} onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                 <div className="mb-4">
                    <select value={filters.category} onChange={e => setFilters(prev => ({...prev, category: e.target.value}))} className="text-sm p-2 bg-gray-100 border-gray-300 border rounded-md w-full">
                        {allCategories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
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
                        </div>
                    ))}
                </div>
            </aside>

            <main className="flex-1 p-6">
                {selectedArticle ? (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4 pb-4 border-b">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-sm text-gray-500">Last updated: {new Date(selectedArticle.lastModifiedDate).toLocaleString()}</p>
                                        {selectedArticle.category && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">{selectedArticle.category}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onToggleFavorite(selectedArticle.id)} className="p-2 text-gray-400 hover:text-yellow-500 rounded-full" title={selectedArticle.isFavorite ? 'Remove from favorites' : 'Add to favorites'}><StarIcon filled={!!selectedArticle.isFavorite} className={`w-5 h-5 ${selectedArticle.isFavorite ? 'text-yellow-500' : ''}`} /></button>
                                    <button onClick={() => { setEditingArticle(selectedArticle); setIsFormOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full" title="Edit Article"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-full" title="Delete Article"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                {selectedArticle.navigation && selectedArticle.navigation.length > 0 && (
                                    <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-3">Navigation</h3>
                                        <div className="space-y-2">
                                            {selectedArticle.navigation.map(item => (
                                                <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-md hover:bg-blue-100">
                                                    <ShareIcon className="w-4 h-4 flex-shrink-0"/>
                                                    <span className="truncate">{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedArticle.supportingMaterialsUrl && (
                                    <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold text-gray-800 mb-3">Supporting Materials</h3>
                                        <a href={selectedArticle.supportingMaterialsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-md hover:bg-blue-100">
                                            <ShareIcon className="w-4 h-4"/>
                                            <span>View Supporting Document</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            <div className="prose max-w-none rich-text-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />

                            <div className="pt-6 mt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-pink-500" />
                                    Related Features ({linkedFeatures.length})
                                </h3>
                                {linkedFeatures.length > 0 ? (
                                    <div className="space-y-3">
                                        {linkedFeatures.map(feature => (
                                            <div key={feature.id} onClick={() => onSwitchView('feature', feature.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200">
                                                <p className="font-medium text-sm text-blue-700">{feature.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">Status: {feature.status} | Launch: {new Date(feature.launchDate).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No features linked to this article.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed">
                        <BrainCircuitIcon className="w-16 h-16 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Welcome to Curator Documentation</h2>
                        <p className="mt-2 text-gray-500">Select an article from the left to view it, or create a new one to get started.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CuratorView;