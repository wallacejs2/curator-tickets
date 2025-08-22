import React, { useState } from 'react';
import Modal from './common/Modal.tsx';
import { useLocalStorage } from '../hooks/useLocalStorage.ts';

interface GoogleSheetSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (clientId: string, sheetId: string) => void;
}

export const GoogleSheetSetup: React.FC<GoogleSheetSetupProps> = ({ isOpen, onClose, onSave }) => {
    const [localClientId, setLocalClientId] = useLocalStorage<string>('googleApiClientId', '');
    const [localSheetId, setLocalSheetId] = useLocalStorage<string>('googleSheetId', '');
    const [clientId, setClientId] = useState(localClientId);
    const [sheetId, setSheetId] = useState(localSheetId);

    const handleSave = () => {
        if (clientId.trim() && sheetId.trim()) {
            onSave(clientId.trim(), sheetId.trim());
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal title="Google Sheets Integration Setup" onClose={onClose}>
            <div className="space-y-6 text-gray-700">
                <p>
                    To use this app, you need to connect it to a Google Sheet. Please provide your Google API Client ID and the ID of the Google Sheet you want to use.
                </p>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                    <h4 className="font-semibold">Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                        <li>Create a project in the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.</li>
                        <li>Enable the "Google Sheets API".</li>
                        <li>Create an "OAuth client ID" credential for a "Web application".</li>
                        <li>Add your app's URL to the "Authorized JavaScript origins".</li>
                        <li>Copy the generated Client ID below.</li>
                        <li>Create a new Google Sheet and copy its ID from the URL.</li>
                    </ol>
                </div>

                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-800">
                        Google API Client ID
                    </label>
                    <input
                        id="clientId"
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Enter your Google API Client ID"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="sheetId" className="block text-sm font-medium text-gray-800">
                        Google Sheet ID
                    </label>
                    <input
                        id="sheetId"
                        type="text"
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        placeholder="Enter your Google Sheet ID"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!clientId.trim() || !sheetId.trim()}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Save and Continue
                    </button>
                </div>
            </div>
        </Modal>
    );
};
