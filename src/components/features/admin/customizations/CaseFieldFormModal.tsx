// Path: src/components/features/admin/customizations/CaseFieldFormModal.tsx
import React, { useState, useEffect } from 'react';
import { CaseField, CaseFieldType } from '../../../../services/customizationService';
import { XIcon, PlusIcon, TrashIcon } from '../../../ui/Icons';
import { Checkbox } from '../../../ui/Checkbox';

interface CaseFieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldData: Omit<CaseField, 'id'> | CaseField) => Promise<void>;
  field: CaseField | null;
}

const getInitialState = (field: CaseField | null) => ({
  label: field?.label || '',
  description: field?.description || '',
  type: field?.type || 'String',
  isRequired: field?.isRequired || false,
  placeholder: field?.placeholder || '',
  defaultValueString: field?.defaultValueString || '',
  minLength: field?.minLength?.toString() ?? '0',
  defaultValueNumber: field?.defaultValueNumber?.toString() ?? '0',
  allowNegative: field?.allowNegative || false,
  defaultValueBoolean: field?.defaultValueBoolean || false,
  dateType: field?.dateType || 'DateOnly',
  dateFormat: field?.dateFormat || 'MM/DD/YYYY',
  defaultValueDate: field?.defaultValueDate || '',
  options: field?.options || ['Option 1', 'Option 2'],
});

const dateOnlyFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
const dateTimeFormats = ['MM/DD/YYYY HH:mm', 'DD/MM/YYYY HH:mm', 'YYYY-MM-DD HH:mm'];


const CaseFieldFormModal: React.FC<CaseFieldFormModalProps> = ({ isOpen, onClose, onSave, field }) => {
  const [formData, setFormData] = useState(getInitialState(field));
  const [previewData, setPreviewData] = useState<any>({});
  const [newOption, setNewOption] = useState('');
  const [errors, setErrors] = useState({ label: '' });

  useEffect(() => {
    if (isOpen) {
      const initialState = getInitialState(field);
      setFormData(initialState);
      setErrors({ label: '' });
      setNewOption('');
      // Initialize preview data based on form defaults
      setPreviewData({
        string: initialState.defaultValueString,
        number: initialState.defaultValueNumber,
        checkbox: initialState.defaultValueBoolean,
        date: initialState.defaultValueDate,
        dropdown: initialState.options[0] || '',
      });
    }
  }, [isOpen, field]);
  
  // Effect to manage date format consistency
  useEffect(() => {
      const currentFormats = formData.dateType === 'DateOnly' ? dateOnlyFormats : dateTimeFormats;
      if (!currentFormats.includes(formData.dateFormat)) {
          setFormData(prev => ({ ...prev, dateFormat: currentFormats[0] }));
      }
  }, [formData.dateType, formData.dateFormat]);

  // Reset preview when type changes
  useEffect(() => {
    setPreviewData({});
  }, [formData.type]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
  
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleAddOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({ ...prev, options: [...prev.options, newOption.trim()] }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== optionToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      setErrors({ label: 'Field Label is required.' });
      return;
    }
    setErrors({ label: '' });
    
    const payload = {
        ...formData,
        minLength: formData.minLength !== '' ? Number(formData.minLength) : undefined,
        defaultValueNumber: formData.defaultValueNumber !== '' ? Number(formData.defaultValueNumber) : undefined,
    };

    if (field) {
        onSave({ ...payload, id: field.id });
    } else {
        onSave(payload);
    }
  };

  if (!isOpen) return null;
  
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";
  const fieldTypes: CaseFieldType[] = ['String', 'Text', 'Number', 'Checkbox', 'Date', 'Dropdown', 'URL', 'User'];

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'String':
      case 'Text':
        return (
          <>
            <div>
              <label className="block text-sm font-medium">Placeholder</label>
              <input type="text" name="placeholder" value={formData.placeholder} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium">Default Value</label>
              <input type="text" name="defaultValueString" value={formData.defaultValueString} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium">Minimal Characters</label>
              <input type="number" name="minLength" value={formData.minLength} onChange={handleChange} className={inputStyle} min="0" />
            </div>
          </>
        );
      case 'Number':
        return (
          <>
            <div>
              <label className="block text-sm font-medium">Default Value</label>
              <input type="number" name="defaultValueNumber" value={formData.defaultValueNumber} onChange={handleChange} className={inputStyle} />
            </div>
            <Checkbox id="allowNegative" label="Allow negative values" checked={formData.allowNegative} onChange={handleChange} />
          </>
        );
      case 'Checkbox':
        return <Checkbox id="defaultValueBoolean" label="Checked by default" checked={formData.defaultValueBoolean} onChange={handleChange} />;
      case 'Date':
        const currentFormats = formData.dateType === 'DateOnly' ? dateOnlyFormats : dateTimeFormats;
        return (
          <>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input type="radio" id="dateOnly" name="dateType" value="DateOnly" checked={formData.dateType === 'DateOnly'} onChange={handleChange} />
                <label htmlFor="dateOnly" className="ml-2">Date only</label>
              </div>
              <div className="flex items-center">
                <input type="radio" id="dateTime" name="dateType" value="DateTime" checked={formData.dateType === 'DateTime'} onChange={handleChange} />
                <label htmlFor="dateTime" className="ml-2">Date & Time</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Format Date</label>
              <select name="dateFormat" value={formData.dateFormat} onChange={handleChange} className={inputStyle}>
                  {currentFormats.map(format => <option key={format}>{format}</option>)}
              </select>
            </div>
          </>
        );
      case 'Dropdown':
        return (
          <div>
            <label className="block text-sm font-medium">Options</label>
            <div className="mt-1 p-2 border dark:border-gray-600 rounded-md space-y-2 flex flex-col">
                <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
                    {formData.options.map(opt => (
                        <div key={opt} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <span>{opt}</span>
                            <button type="button" onClick={() => handleRemoveOption(opt)} className="text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-2 border-t dark:border-gray-600">
                    <input type="text" value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="Add new option" className={`${inputStyle} mt-0 flex-grow`} />
                    <button type="button" onClick={handleAddOption} className="px-3 bg-blue-600 text-white rounded-md"><PlusIcon /></button>
                </div>
            </div>
          </div>
        );
      case 'URL':
        return (
            <div>
              <label className="block text-sm font-medium">Default Value</label>
              <input type="text" name="defaultValueString" value={formData.defaultValueString} onChange={handleChange} className={inputStyle} placeholder="https://example.com" />
            </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    const label = formData.label || 'Field Label';
    let fieldPreview: React.ReactNode;

    switch(formData.type) {
        case 'String':
        case 'URL':
            fieldPreview = <input type="text" placeholder={formData.placeholder} value={previewData.string ?? formData.defaultValueString} onChange={e => setPreviewData(p => ({ ...p, string: e.target.value }))} className={inputStyle} />;
            break;
        case 'Text':
            fieldPreview = <textarea placeholder={formData.placeholder} value={previewData.string ?? formData.defaultValueString} onChange={e => setPreviewData(p => ({ ...p, string: e.target.value }))} className={`${inputStyle} h-20 resize-none`} />;
            break;
        case 'Number':
            fieldPreview = <input type="number" value={previewData.number ?? formData.defaultValueNumber} onChange={e => setPreviewData(p => ({ ...p, number: e.target.value }))} className={inputStyle} />;
            break;
        case 'Checkbox':
            fieldPreview = <div className="mt-1"><Checkbox id="preview-checkbox" label={label} checked={previewData.checkbox ?? formData.defaultValueBoolean} onChange={e => setPreviewData(p => ({ ...p, checkbox: e.target.checked }))} /></div>;
            return <div className="mt-4">{fieldPreview}</div>; // Special case for checkbox to avoid double label
        case 'Date':
            fieldPreview = <input type="text" placeholder={formData.dateFormat} value={previewData.date ?? ''} onChange={e => setPreviewData(p => ({...p, date: e.target.value}))} className={inputStyle} />;
            break;
        case 'Dropdown':
            fieldPreview = (
                <select value={previewData.dropdown ?? (formData.options.length > 0 ? formData.options[0] : '')} onChange={e => setPreviewData(p => ({...p, dropdown: e.target.value}))} className={inputStyle}>
                    {formData.options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
            );
            break;
        case 'User':
            fieldPreview = <select className={inputStyle}><option>Select a user...</option></select>
            break;
        default:
            fieldPreview = <div className={`${inputStyle} text-gray-400`}>Preview not available</div>;
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                {label}
                {formData.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formData.description}</p>
            {fieldPreview}
        </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{field ? 'Edit Case Field' : 'Add Case Field'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-6 overflow-hidden flex-grow">
            {/* Left Column: Form */}
            <form id="field-form" onSubmit={handleSubmit} className="p-5 flex flex-col text-gray-700 dark:text-gray-300 border-r dark:border-gray-700 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Details</h3>
              <div className="mb-4">
                <label htmlFor="label" className="block text-sm font-medium">Field Label</label>
                <input type="text" id="label" name="label" value={formData.label} onChange={handleChange} className={`${inputStyle} ${errors.label ? 'border-red-500' : ''}`} />
                {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={`${inputStyle} h-20 resize-none`} />
              </div>

              <div className="mb-4">
                <label htmlFor="type" className="block text-sm font-medium">Type</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputStyle}>
                  {fieldTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              
              <div className="space-y-4 min-h-[200px]">
                {renderTypeSpecificFields()}
              </div>

              <div className="pt-2 mt-auto">
                <Checkbox id="isRequired" label="This field is a required field" checked={formData.isRequired} onChange={handleChange} />
              </div>
            </form>
            
            {/* Right Column: Preview */}
            <div className="p-5 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Preview</h3>
                 <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-md">
                    {renderPreview()}
                 </div>
            </div>
        </div>

        <div className="p-5 flex justify-end space-x-3 border-t dark:border-gray-700 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" form="field-form" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
            {field ? 'Save Changes' : 'Add Case Field'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseFieldFormModal;