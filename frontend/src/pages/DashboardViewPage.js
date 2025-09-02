import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import useAuth from '../hooks/useAuth';

const DashboardViewPage = () => {
    const { slug } = useParams(); // This is the metabaseDashboardId
    const [iframeUrl, setIframeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inputMerchant, setInputMerchant] = useState('');
    const [filterMerchant, setFilterMerchant] = useState(''); 
    const [inputMerchantProvince, setInputMerchantProvince] = useState('');
    const [filterMerchantProvince, setFilterMerchantProvince] = useState('');  
    const { user } = useAuth();

    useEffect(() => {
        const fetchEmbedUrl = async () => {
            setLoading(true);
            setError('');
            try {
                const { data } = await API.get(`/dashboards/embed/${slug}`, {
                    params: 
                        { 
                            merchant: filterMerchant,
                            merchantProvince : filterMerchantProvince
                        }
                });
                setIframeUrl(data.iframeUrl);
            } catch (err) {
                setError('Could not load dashboard. You may not have permission.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmbedUrl();
    }, [slug, filterMerchant, filterMerchantProvince]);

    const handleFilterSubmit = (e) => {
        e.preventDefault(); // Prevents the default form submission behavior
        setFilterMerchant(inputMerchant); // Set the submitted value to the filterMerchant state
        setFilterMerchantProvince(inputMerchantProvince)
    };

    return (
        <div className="dashboard-view-container">
            {user.role !== 'merchant' && (
                <div className="filter-container">
                    <form classname = "horizontal-filter-form" onSubmit={handleFilterSubmit}>
                        <input
                            id="dashboard-filter"
                            className="filter-input" // This className is now available from App.css
                            type="text"
                            value={inputMerchant}
                            onChange={(e) => setInputMerchant(e.target.value)}
                            placeholder="Enter merchant name"
                        />
                        <input
                            id="dashboard-filter"
                            className="filter-input" // This className is now available from App.css
                            type="text"
                            value={inputMerchantProvince}
                            onChange={(e) => setInputMerchantProvince(e.target.value)}
                            placeholder="Enter merchant province"
                        />
                        <button
                            type="submit"
                            className="apply-filter-button" // This className is also available
                        >
                            Apply Filter
                        </button>
                    </form>
                </div>
            )}
            {loading && <p>Loading Dashboard...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {iframeUrl && !loading && (
                <iframe
                    title="Metabase Dashboard"
                    src={iframeUrl}
                    allowTransparency
                ></iframe>
            )}
        </div>
    );
};

export default DashboardViewPage;