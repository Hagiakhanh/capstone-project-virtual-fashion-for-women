import { Plus, X } from "lucide-react";
import { Tag, TagDto } from "@/models/RequestUpdateProduct";
import { useState } from "react";

interface UpdateTagsSectionProps {
    availableTags: Tag[];
    selectedTags: TagDto[];
    onUpdateTags: (tags: TagDto[]) => void;
}

export default function UpdateTagsSection({
    availableTags,
    selectedTags,
    onUpdateTags,
}: UpdateTagsSectionProps) {
    const [newTagInput, setNewTagInput] = useState("");
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const handleAddExistingTag = (tag: Tag) => {
        // Kiểm tra tag đã được chọn chưa
        const isAlreadySelected = selectedTags.some(
            (t) => t.tagId === tag.tagId || t.tagName.toLowerCase() === tag.tagName.toLowerCase()
        );
        
        if (!isAlreadySelected) {
            onUpdateTags([
                ...selectedTags,
                { tagId: tag.tagId, tagName: tag.tagName }
            ]);
        }
    };

    const handleAddNewTag = () => {
        const trimmedTag = newTagInput.trim();
        if (trimmedTag) {
            // Kiểm tra tag đã tồn tại trong danh sách chưa
            const isDuplicate = selectedTags.some(
                (t) => t.tagName.toLowerCase() === trimmedTag.toLowerCase()
            );
            
            if (!isDuplicate) {
                onUpdateTags([
                    ...selectedTags,
                    { tagName: trimmedTag } // Không có tagId = tag mới
                ]);
            }
            setNewTagInput("");
        }
    };

    const handleRemoveTag = (index: number) => {
        onUpdateTags(selectedTags.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddNewTag();
        }
    };

    // Tags có sẵn chưa được chọn
    const unselectedTags = availableTags.filter(
        (tag) => !selectedTags.some((t) => t.tagId === tag.tagId)
    );

    return (
        <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Tags</h2>
            
            {/* Selected tags */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags hiện tại
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map((tag, index) => (
                        <span
                            key={index}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                tag.tagId !== undefined && tag.tagId !== null
                                    ? "bg-blue-100 text-blue-700"  // Tag có sẵn
                                    : "bg-green-100 text-green-700" // Tag mới
                            }`}
                        >
                            {tag.tagName}
                            {tag.tagId !== undefined && tag.tagId !== null && (
                                <span className="text-xs opacity-75">#{tag.tagId}</span>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="hover:opacity-80"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                    {selectedTags.length === 0 && (
                        <span className="text-sm text-gray-400">Chưa có tag nào</span>
                    )}
                </div>

                {/* Dropdown to select existing tags */}
                <div className="relative">
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
                                <>
                                    <div className="max-h-60 overflow-y-auto">
                                        {unselectedTags.map((tag) => (
                                            <button
                                                key={tag.tagId}
                                                type="button"
                                                onClick={() => handleAddExistingTag(tag)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                            >
                                                {tag.tagName}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t p-2 bg-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => setShowTagDropdown(false)}
                                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                        >
                                            Xong
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4">
                                    <p className="text-sm text-gray-500">Không còn tag nào để chọn</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add new tag */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thêm tag mới
                </label>
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
                        onClick={handleAddNewTag}
                        disabled={!newTagInput.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        Thêm
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Nhấn Enter hoặc click "Thêm" để tạo tag mới. Tag mới sẽ có màu xanh lá.
                </p>
            </div>
        </div>
    );
}