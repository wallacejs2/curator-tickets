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
    const [tags, setTags] = useState('');
    const [navigation, setNavigation] = useState('');
    const isEditing = !!articleToEdit;

    const linkedFeatures = allFeatures.filter(f => articleToEdit?.featureIds?.includes(f.id));
    const availableFeatures = allFeatures.filter(f => !articleToEdit?.featureIds?.includes(f.id));

    useEffect(() => {
        if (articleToEdit) {
            setTitle(articleToEdit.title);
            setContent(articleToEdit.content);
            setNavigation((articleToEdit.navigation || []).join(', '));
            setCategory(articleToEdit.category || '');
            setTags((articleToEdit.tags || []).join(', '));
        } else {
            setTitle('');
            setContent('');
            setNavigation('');
            setCategory('');
            setTags('');
        }
    }, [articleToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const articleData = {
            title,
            content,
            category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            navigation: navigation.split(',').map(t => t.trim()).filter(Boolean),
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
            <div>
                <label className={labelClasses}>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={formElementClasses} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Category</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Tags (comma-separated)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={formElementClasses} placeholder="e.g., getting-started, overview" />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Navigation (comma-separated)</label>
                <input type="text" value={navigation} onChange={e => setNavigation(e.target.value)} className={formElementClasses} placeholder="e.g., Introduction, Core Features"/>
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
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
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
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-semibold text-gray-600">Tags:</span>
                            {selectedArticle.tags && selectedArticle.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedArticle.tags.map(tag => <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tag}</span>)}
                                </div>
                            ) : <span className="text-sm text-gray-500 italic">No tags</span>}
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-sm font-semibold text-gray-600">Navigation:</span>
                            {selectedArticle.navigation && selectedArticle.navigation.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedArticle.navigation.map(navItem => <span key={navItem} className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">{navItem}</span>)}
                                </div>
                            ) : <span className="text-sm text-gray-500 italic">No navigation items</span>}
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