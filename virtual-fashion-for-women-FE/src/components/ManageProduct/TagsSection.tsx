// src/app/admin/product/create/components/TagsSection.tsx
import { Plus, X } from "lucide-react";
import { Tag } from "@/models/RequestCreateProduct";
import { useState } from "react";

interface TagsSectionProps {
    availableTags: Tag[];
    selectedTagIds: number[];
    newTags: string[];
    onSelectTag: (tagId: number) => void;
    onRemoveTag: (tagId: number) => void;
    onAddNewTag: (tagName: string) => void;
    onRemoveNewTag: (index: number) => void;
}

export default function TagsSection({
    availableTags,
    selectedTagIds,
    newTags,
    onSelectTag,
    onRemoveTag,
    onAddNewTag,
    onRemoveNewTag,
}: TagsSectionProps) {
    const [newTagInput, setNewTagInput] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const handleAddNewTagClick = () => {
        const trimmedTag = newTagInput.trim();
        if (trimmedTag) {
        if (!newTags.includes(trimmedTag)) {
            onAddNewTag(trimmedTag);
        }
        setNewTagInput("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddNewTagClick();
        }
    };

    const unselectedTags = availableTags.filter(
        (tag) => !selectedTagIds.includes(tag.tagId)
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Tags</h2>

            {/* Selected existing tags */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags đã chọn
                </label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                    {selectedTagIds.map((tagId) => {
                        const tag = availableTags.find((t) => t.tagId === tagId);
                        return tag ? (
                            <span
                                key={tagId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                                {tag.tagName}
                                <button
                                type="button"
                                onClick={() => onRemoveTag(tagId)}
                                className="hover:text-blue-900"
                                >
                                <X size={14} />
                                </button>
                            </span>
                        ) : null;
                    })}
                    {selectedTagIds.length === 0 && (
                        <span className="text-sm text-gray-400 italic">Chưa chọn tag nào</span>
                    )}
                </div>
            </div>

            {/* Dropdown to select existing tags */}
            <div className="relative mb-4">
                <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                    Chọn tag có sẵn
                </button>

                {showTagDropdown && (
                    <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {unselectedTags.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto">
                                {unselectedTags.map((tag) => (
                                    <button
                                        key={tag.tagId}
                                        type="button"
                                        onClick={() => onSelectTag(tag.tagId)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                    >
                                        {tag.tagName}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <span className="block text-sm text-gray-400 p-4">Không còn tag nào</span>
                        )}
                        <div className="border-t p-2 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setShowTagDropdown(false)}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            >
                                Xong
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* New tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags mới
                </label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                    {newTags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemoveNewTag(index)}
                                className="hover:text-green-900"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    {newTags.length === 0 && (
                        <span className="text-sm text-gray-400 italic">Chưa có tag mới</span>
                    )}
                </div>

                {/* Input for new tag */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tên tag mới..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={handleAddNewTagClick}
                        disabled={!newTagInput.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        Thêm
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Nhấn Enter hoặc click "Thêm" để tạo tag mới
                </p>
            </div>
        </div>
    );
}