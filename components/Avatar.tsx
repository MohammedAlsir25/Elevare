import React from 'react';

interface AvatarProps {
    name: string;
    src?: string | null;
    className?: string;
}

// Simple hash function to get a color from a string
const stringToColor = (str: string): string => {
    if (!str) return '#cccccc';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const getInitials = (name: string): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length > 1 && names[names.length - 1]) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (name.length > 1) {
        return name.substring(0, 2).toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ name, src, className = 'h-10 w-10' }) => {
    if (src) {
        return (
            <img
                className={`${className} rounded-full object-cover`}
                src={src}
                alt={`${name}'s avatar`}
            />
        );
    }

    const initials = getInitials(name);
    const bgColor = stringToColor(name);

    return (
        <div
            className={`${className} rounded-full flex items-center justify-center font-bold text-white text-sm`}
            style={{ backgroundColor: bgColor }}
            aria-label={`${name}'s avatar`}
        >
            {initials}
        </div>
    );
};

export default Avatar;
