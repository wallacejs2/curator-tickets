import React, { useState, useEffect } from 'react';
import { QuarterPlan } from '../types.ts';

interface QuarterFormProps {
  onSave: (quarterData: Omit<QuarterPlan, 'id'> | QuarterPlan) => void;
  onClose: () => void;
  quarterToEdit?: QuarterPlan | null;
  existingQuarters: QuarterPlan[];
}

const QuarterForm: React.FC<QuarterFormProps> = ({ onSave, onClose, quarterToEdit, existingQuarters }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState('');

  const isEditing = !!quarterToEdit;

  useEffect(() => {
    if (quarterToEdit) {
      setYear(quarterToEdit.year);
      setQuarter(quarterToEdit.quarter);
    }
  }, [quarterToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isDuplicate = existingQuarters.some(
      q => q.year === year && q.quarter === quarter && q.id !== quarterToEdit?.id
    );

    if (isDuplicate) {
      setError(`A plan for Q${quarter} ${year} already exists.`);
      return;
    }

    const quarterData = {
      ...quarterToEdit,
      year,
      quarter,
      name: `Q${quarter} ${year}`,
      salesPlan: quarterToEdit?.salesPlan || '',
      supportPlan: quarterToEdit?.supportPlan || '',
      developmentPlan: quarterToEdit?.developmentPlan || '',
      productPlan: quarterToEdit?.productPlan || '',
    };
    
    onSave(quarterData as QuarterPlan);
    onClose();
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Year</label>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value, 10))} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Quarter</label>
          <select value={quarter} onChange={e => setQuarter(parseInt(e.target.value, 10) as 1|2|3|4)} className={formElementClasses}>
            <option value={1}>Q1</option>
            <option value={2}>Q2</option>
            <option value={3}>Q3</option>
            <option value={4}>Q4</option>
          </select>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex justify-end pt-4 border-t">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">
          {isEditing ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
};
export default QuarterForm;
