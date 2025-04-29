import React, { useState, useEffect, useCallback } from 'react';
import {
    FiRefreshCw, FiCheck, FiX, FiUser, FiTruck, FiFileText,
    FiCalendar, FiDollarSign, FiEye, FiMail, FiCheckCircle,
    FiAlertCircle, FiDownload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Components ---
const LoadingSpinner = ({ message = "Loading requests..." }) => (
    <div className="flex justify-center items-center p-10 text-gray-600">
        <FiRefreshCw className="animate-spin h-6 w-6 mr-3 text-blue-600" />
        <span>{message}</span>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="flex flex-col items-center text-center p-6 md:p-10 text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <FiAlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="font-semibold text-lg mb-2">Request Failed</p>
        <p className="text-sm text-red-600 mb-4 max-w-md">{message || "An unknown error occurred."}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors"
            >
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Try Again
            </button>
        )}
    </div>
);

const EmptyMessage = ({ message }) => (
    <div className="text-center p-10 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
        {message}
    </div>
);

const RequestTable = ({ headers, data, renderRow, caption }) => {
    if (!data || data.length === 0) {
        return <EmptyMessage message={`No ${caption ? caption.toLowerCase() : 'data'} available.`} />;
    }
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                {caption && (
                    <caption className="p-4 text-lg font-semibold text-left text-gray-800 bg-gray-50 border-b border-gray-200">
                        {caption}
                    </caption>
                )}
                <thead className="bg-gray-100">
                    <tr>
                        {headers.map((header) => (
                            <th key={header} scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => renderRow(item, index))}
                </tbody>
            </table>
        </div>
    );
};

// --- Main Component ---
const AdminRequestsView = () => {
    const [requests, setRequests] = useState({
        graduation: [], academic: [], delivery: [], studentInfo: [],
    });
    const [loading, setLoading] = useState({
        graduation: true, academic: true, delivery: true, studentInfo: true, global: true
    });
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('graduation'); // Default tab
    const [isDownloading, setIsDownloading] = useState({});

    // Use Vite env variable prefix VITE_
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    // --- Fetching Function ---
    const fetchData = useCallback(async (showGlobalLoading = true) => {
        if (showGlobalLoading) {
            setLoading({ graduation: true, academic: true, delivery: true, studentInfo: true, global: true });
        } else {
            setLoading(prev => ({...prev, global: true })); // Show global spinner briefly
        }
        setError(null);
        const token = localStorage.getItem('adminToken'); // Ensure this key is correct

        if (!token) {
            setError("Admin authentication token not found. Please log in.");
            setLoading({ graduation: false, academic: false, delivery: false, studentInfo: false, global: false });
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Specific endpoints for each request type
        const requestEndpoints = {
            graduation: `${API_BASE_URL}/admin/requests/graduation`,
            academic: `${API_BASE_URL}/admin/requests/academic`,
            delivery: `${API_BASE_URL}/admin/requests/delivery`,
            studentInfo: `${API_BASE_URL}/admin/requests/student-info`
        };

        try {
            // Fetch all data concurrently, handling individual failures
            const results = await Promise.allSettled(
                Object.entries(requestEndpoints).map(([key, url]) =>
                    fetch(url, { headers }).then(async (res) => {
                        if (!res.ok) {
                            const errorText = await res.text();
                            let errorMessage = `Failed to fetch ${key} requests (${res.status})`;
                            try { const parsedError = JSON.parse(errorText); errorMessage = parsedError.message || errorMessage; } catch (e) { /* Ignore parsing error */ }
                            throw new Error(errorMessage);
                        }
                        return res.json();
                    })
                )
            );

            const newRequests = { graduation: [], academic: [], delivery: [], studentInfo: [] };
            let fetchError = null;

            // Process results
            results.forEach((result, index) => {
                const key = Object.keys(requestEndpoints)[index];
                if (result.status === 'fulfilled') {
                    newRequests[key] = result.value?.data || []; // Assign data or empty array
                } else {
                    console.error(`Error fetching ${key}:`, result.reason);
                    if (!fetchError) { fetchError = result.reason?.message || `Failed to load ${key} requests.`; }
                }
            });

            setRequests(newRequests);
            if (fetchError) { setError(fetchError); } // Show the first error

        } catch (err) { // Catch global errors
            console.error("Global fetch error:", err);
            setError(err.message || "An unexpected network error occurred.");
        } finally {
            setLoading({ graduation: false, academic: false, delivery: false, studentInfo: false, global: false }); // Reset all loading states
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchData(); // Fetch data when component mounts
    }, [fetchData]);

    // --- Action Handlers ---
    const handleVerificationUpdate = async (id, verifiedStatus) => {
        const token = localStorage.getItem('adminToken'); if (!token) { alert("Authentication error."); return; }
        const originalRequests = [...requests.graduation];
        setRequests(prev => ({ ...prev, graduation: prev.graduation.map(req => req._id === id ? { ...req, verifiedByAdmin: verifiedStatus, isUpdating: true } : req ) }));
        try {
            // Use the SPECIFIC endpoint for graduation verification
            const response = await fetch(`${API_BASE_URL}/admin/requests/graduation/${id}/verify`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ verified: verifiedStatus }),
            });
            const responseData = await response.json(); if (!response.ok) { throw new Error(responseData.message || `Failed to update status (${response.status})`); }
            setRequests(prev => ({ ...prev, graduation: prev.graduation.map(req => req._id === id ? { ...responseData.data, isUpdating: false } : req ) }));
        } catch (err) {
            console.error("Error updating verification status:", err); alert(`Error: ${err.message}`);
            setRequests(prev => ({ ...prev, graduation: originalRequests })); // Rollback
            setRequests(prev => ({ ...prev, graduation: prev.graduation.map(req => req._id === id ? { ...req, isUpdating: false } : req ) })); // Reset flag
        }
    };

    const handleDownloadDocument = async (requestId, documentType = 'requested_document') => {
        const token = localStorage.getItem('adminToken'); if (!token) { alert("Authentication error."); return; }
        setIsDownloading(prev => ({ ...prev, [requestId]: true }));
        try {
            // Use the SPECIFIC endpoint for academic document download
            // !!! IMPORTANT: Adjust this URL if your backend endpoint is different !!!
            const downloadUrl = `${API_BASE_URL}/admin/requests/academic/${requestId}/download`;
            const response = await fetch(downloadUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) { const errorData = await response.json().catch(() => ({ message: `Download failed (${response.status})` })); throw new Error(errorData.message || `Download failed (${response.status})`); }
            const disposition = response.headers.get('content-disposition'); let filename = `${documentType}_${requestId}.pdf`; if (disposition?.includes('attachment')) { const filenameMatch = disposition.match(/filename\*?=['"]?([^'";]+)['"]?/); if (filenameMatch?.[1]) { filename = decodeURIComponent(filenameMatch[1]); } }
            const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = filename; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); a.remove();
        } catch (err) { console.error("Error downloading document:", err); alert(`Download Error: ${err.message}`);
        } finally { setIsDownloading(prev => ({ ...prev, [requestId]: false })); }
    };

    // --- Modal State & Handler (Placeholder) ---
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
    const handleViewDetails = (request, type) => {
        console.log("View Details:", type, request); setSelectedRequestDetails({ ...request, type }); setShowDetailsModal(true);
        // TODO: Replace alert with your actual Modal component implementation
        alert(`Details for ${type} request ID: ${request._id}\n(Implement Details Modal)`);
    };


     // --- Rendering Logic for Rows ---
    const renderGraduationRow = (req) => (
        <tr key={req._id} className={`transition-opacity duration-300 ${req.isUpdating ? 'opacity-50 bg-gray-50' : 'opacity-100'}`}>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.candidateName}</td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{req.universityName}</td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{req.departmentName}</td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.graduationDate).toLocaleDateString()}</td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-center"> {req.verifiedByAdmin ? <span title="Verified by Admin" className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span> : <span title="Awaiting Verification" className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1 sm:space-x-2">
                 {!req.verifiedByAdmin && ( <button onClick={() => handleVerificationUpdate(req._id, true)} disabled={req.isUpdating} className="text-green-600 hover:text-green-900 disabled:opacity-50 p-1 rounded hover:bg-green-100 transition-colors" title="Verify Request"> {req.isUpdating ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiCheck className="h-4 w-4" />} </button> )}
                 {req.verifiedByAdmin && ( <button onClick={() => handleVerificationUpdate(req._id, false)} disabled={req.isUpdating} className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded hover:bg-red-100 transition-colors" title="Mark as Pending"> {req.isUpdating ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiX className="h-4 w-4" />} </button> )}
                  <button onClick={() => handleViewDetails(req, 'Graduation')} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors" title="View Details"> <FiEye className="h-4 w-4" /> </button>
             </td>
        </tr>
     );

    const renderAcademicRow = (req) => (
        <tr key={req._id}>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {/* User Info */} <div className="flex items-center"> <FiUser className="mr-2 text-gray-400 flex-shrink-0 h-5 w-5"/> <div> <div className="font-medium" title={req.userId?.name}>{req.userId?.name || 'N/A'}</div> <div className="text-xs text-gray-500" title={req.userId?.email}>{req.userId?.email || 'N/A'}</div> </div> </div> </td>
             <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs lg:max-w-sm xl:max-w-md" title={(req.selectedItems || []).join(', ')}> {/* Requested Items */} <ul className="list-disc list-inside space-y-1"> {(req.selectedItems || []).map(item => <li key={item} className="truncate">{item}</li>)} </ul> </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell"> {/* Fee */} <FiDollarSign className="inline mr-1 text-gray-400"/>{req.totalFee} Birr </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell"> {/* Date */} <FiCalendar className="inline mr-1 text-gray-400"/>{new Date(req.createdAt).toLocaleString()} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1 sm:space-x-2"> {/* Actions */}
                 <button onClick={() => handleDownloadDocument(req._id, 'academic_record')} disabled={isDownloading[req._id]} className="text-purple-600 hover:text-purple-900 disabled:opacity-50 p-1 rounded hover:bg-purple-100 transition-colors" title="Download Document(s)"> {isDownloading[req._id] ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiDownload className="h-4 w-4" />} </button>
                 <button onClick={() => handleViewDetails(req, 'Academic')} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors" title="View Details"> <FiEye className="h-4 w-4" /> </button>
             </td>
        </tr>
     );

    const renderDeliveryRow = (req) => (
         <tr key={req._id}>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {/* User Info */} <div className="flex items-center"> <FiUser className="mr-2 text-gray-400 flex-shrink-0 h-5 w-5"/> <div> <div className="font-medium" title={req.userId?.name}>{req.userId?.name || 'N/A'}</div> <div className="text-xs text-gray-500" title={req.userId?.email}>{req.userId?.email || 'N/A'}</div> </div> </div> </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize"> {/* Method */} <FiTruck className="inline mr-1 text-gray-400"/>{req.deliveryMethod} </td>
             <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden md:table-cell" title={req.deliveryMethod === 'post' ? `${req.address?.street || ''}, ${req.address?.city || ''}, ${req.address?.postalCode || ''}, ${req.address?.country || ''}`.trim().replace(/, $/, '') || 'N/A' : ''}> {/* Address */} {req.deliveryMethod === 'post' ? (`${req.address?.street || ''}, ${req.address?.city || ''}...`) : (<span className='text-gray-400 italic'>Appointment</span>)} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{req.confirmationInfo?.name}</td> {/* Conf Name */}
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell"> {/* Date */} <FiCalendar className="inline mr-1 text-gray-400"/>{new Date(req.createdAt).toLocaleString()} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> {/* Actions */} <button onClick={() => handleViewDetails(req, 'Delivery')} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors" title="View Details"> <FiEye className="h-4 w-4" /> </button> </td>
         </tr>
     );

    const renderStudentInfoRow = (req) => (
        <tr key={req._id}>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"> {/* User Info */} <div className="flex items-center"> <FiUser className="mr-2 text-gray-400 flex-shrink-0 h-5 w-5"/> <div> <div className="font-medium" title={req.fullName}>{req.fullName}</div> <div className="text-xs text-gray-500" title={req.userId?.email}>{req.userId?.email || 'N/A'}</div> </div> </div> </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{req.idNo}</td> {/* ID */}
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{req.program}</td> {/* Program */}
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">{req.department}</td> {/* Dept */}
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"> {/* Enrolled? */} {req.isEnrolled ? <span title="Enrolled" className="text-green-600 inline-block"><FiCheckCircle/></span> : <span title="Not Enrolled" className="text-red-500 inline-block"><FiX/></span>} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell"> {/* Date */} <FiCalendar className="inline mr-1 text-gray-400"/>{new Date(req.createdAt).toLocaleString()} </td>
             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> {/* Actions */} <button onClick={() => handleViewDetails(req, 'Student Info')} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors" title="View Details"> <FiEye className="h-4 w-4" /> </button> </td>
         </tr>
     );

    // Define Tabs configuration
    const tabs = [
        { id: 'graduation', label: 'Graduation Verification', icon: FiCheck, count: requests.graduation.length, data: requests.graduation, loading: loading.graduation, headers: ['Candidate', 'University', 'Department', 'Grad Date', 'Status', 'Actions'], renderRow: renderGraduationRow },
        { id: 'academic', label: 'Academic Records', icon: FiFileText, count: requests.academic.length, data: requests.academic, loading: loading.academic, headers: ['Submitted By', 'Requested Items', 'Fee', 'Date', 'Actions'], renderRow: renderAcademicRow },
        { id: 'delivery', label: 'Delivery Info', icon: FiTruck, count: requests.delivery.length, data: requests.delivery, loading: loading.delivery, headers: ['Submitted By', 'Method', 'Address (Post)', 'Conf. Name', 'Submitted At', 'Actions'], renderRow: renderDeliveryRow },
        { id: 'studentInfo', label: 'Student Information', icon: FiUser, count: requests.studentInfo.length, data: requests.studentInfo, loading: loading.studentInfo, headers: ['Full Name', 'ID No', 'Program', 'Department', 'Enrolled?', 'Submitted At', 'Actions'], renderRow: renderStudentInfoRow },
    ];

    const isGloballyLoading = loading.global;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">Alumni Service Requests</h1>
                <button onClick={() => fetchData(false)} disabled={isGloballyLoading} className="..." >
                    <FiRefreshCw className={`mr-2 h-4 w-4 ${isGloballyLoading ? 'animate-spin' : ''}`} /> Refresh All
                </button>
            </div>

            {/* Display Global Error or Loading Spinner First */}
            {error && <ErrorMessage message={error} onRetry={() => fetchData(true)} />}
            {isGloballyLoading && <LoadingSpinner message="Loading all requests..."/>}

            {/* Tabs and Tables Section */}
            {!error && !isGloballyLoading && (
                <>
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`shrink-0 whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded-t-md transition-colors duration-150 ease-in-out ${ activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`} >
                                    <tab.icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                    {!tab.loading && tab.count > 0 && ( <span className={`ml-1.5 py-0.5 px-2 rounded-full text-xs font-medium ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}> {tab.count} </span> )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content Area */}
                    <div className="mt-4">
                        <AnimatePresence mode="wait">
                            {tabs.filter(tab => tab.id === activeTab).map(tab => (
                                <motion.div key={tab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} >
                                    <RequestTable headers={tab.headers} data={tab.data} renderRow={tab.renderRow} caption={tab.label} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </>
            )}

             {/* TODO: Implement Details Modal Component Here */}
             {/* <AnimatePresence> {showDetailsModal && selectedRequestDetails && (<YourModalComponent data={selectedRequestDetails} onClose={() => setShowDetailsModal(false)} />)} </AnimatePresence> */}

        </motion.div>
    );
};

export default AdminRequestsView; // Exporting with the requested name