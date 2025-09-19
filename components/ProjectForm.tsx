import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types.ts';

type FormSubmitCallback = (project: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => void;

interface ProjectFormProps {
  onSubmit: FormSubmitCallback;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        status: ProjectStatus.NotStarted,
      });
      setName('');
    }
  };
  
  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="projectName" className={labelClasses}>Project Name</label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={formElementClasses}
          placeholder="e.g., Q4 Marketing Campaign"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Create Project
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;