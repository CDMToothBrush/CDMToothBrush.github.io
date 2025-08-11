import React from 'react';

interface CoverItemProps {
    title: string;
    imageUrl: string;
    link: string;
}

const CoverItem: React.FC<CoverItemProps> = ({ title, imageUrl, link }) => {
    return (
        <div className="cover-item">
            <a href={link} target="_blank" rel="noopener noreferrer">
                <img src={imageUrl} alt={title} className="cover-image" />
                <h3 className="cover-title">{title}</h3>
            </a>
        </div>
    );
};

export default CoverItem;