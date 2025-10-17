// Path: src/components/ui/Checkbox.tsx
import React from 'react';

interface CheckboxProps {
    id: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label }) => {
    return (
        <div className="flex items-center">
            <input
                id={id}
                name={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500"
            />
            {label && <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{label}</label>}
        </div>
    );
};
