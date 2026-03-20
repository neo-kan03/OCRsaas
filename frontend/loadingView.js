function LoadingView() {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <div className="loading-text">{window.t('loading_app')}</div>
        </div>
    );
}