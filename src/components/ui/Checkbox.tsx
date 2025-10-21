// Path: src/components/ui/Checkbox.tsx
import React, { useRef, useEffect } from 'react';

// FIX: Added a `disabled` prop to allow the component to be used in a disabled state.
interface CheckboxProps {
    id: string;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    indeterminate?: boolean;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, indeterminate = false, onClick, disabled = false }) => {
    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !checked && indeterminate;
        }
    }, [ref, indeterminate, checked]);

    return (
        <div className="flex items-center">
            <input
                ref={ref}
                id={id}
                name={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                onClick={onClick}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            />
            {label && <label htmlFor={id} className={`ml-2 block text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-300'}`}>{label}</label>}
        </div>
    );
};
