import React from 'react';

interface SortBarProps {
    onSortChange: (sortType: 'name' | 'date') => void;
}

const SortBar: React.FC<SortBarProps> = ({ onSortChange }) => {
    return (
        <div className="sort-bar">
            <label htmlFor="sort-select">排序依據:</label>
            <select id="sort-select" onChange={(e) => onSortChange(e.target.value as 'name' | 'date')}>
                <option value="name">名稱</option>
                <option value="date">更新日期</option>
            </select>
        </div>
    );
};

export default SortBar;