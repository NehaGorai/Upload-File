import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { FaUpload } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const App = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadUrl, setUploadUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(selectedFile);
            setUploadUrl(previewUrl);
        } else {
            setUploadUrl('');
        }
    };

    const uploadFile = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        setSuccess(false);

        const filePath = `${file.name}`;

        try {
            const { data, error: uploadError } = await supabase.storage
                .from('image_uploader')
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Upload error: ${uploadError.message}`);
            }

            const { data: publicData, error: publicError } = await supabase.storage
                .from('image_uploader')
                .getPublicUrl(filePath);

            if (publicError) {
                throw new Error(`Public URL error: ${publicError.message}`);
            }

            setUploadUrl(publicData.publicURL);
            setSuccess(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1578320339911-5e7974b2720a?q=80&w=2789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.9,
        }} className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white bg-opacity-80 border border-gray-400 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h1 className="text-2xl font-bold my-4 text-center text-gray-800">Upload Your File</h1>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                        <label className="cursor-pointer flex items-center justify-center w-full md:w-auto">
                            <div className="flex items-center justify-center p-4 bg-gray-100 bg-opacity-70 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200">
                                <FaUpload className="text-gray-800 text-xl mr-2" />
                                <span className="text-gray-600 text-sm font-semibold">Choose File</span>
                            </div>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={uploadFile}
                            disabled={uploading}
                            className={`w-full md:w-auto py-3 px-6 rounded-lg text-white transition-all duration-200 ease-in-out ${uploading ? 'bg-green-600' : 'bg-green-600 hover:bg-green-500'
                                }`}
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>

                    {uploadUrl && file && (
                        <div className="mb-4 mt-6">
                            <img
                                src={uploadUrl}
                                alt="Selected file"
                                className="max-w-xs rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="text-red-500 text-center mt-4">{error}</p>
                    )}
                    {uploadUrl && !uploading && success && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-700 mb-2">Access your file <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">here</a>.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
