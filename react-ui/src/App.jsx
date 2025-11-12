import { useState } from 'react';
import GenerationForm from './components/GenerationForm';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

function App() {
  // State for managing results
  const [finalImageURL, setFinalImageURL] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle successful image generation
  const handleSuccess = (imageURL) => {
    setFinalImageURL(imageURL);
    setErrorMessage(null);
    setIsLoading(false);
  };

  // Handle generation errors
  const handleError = (error) => {
    setErrorMessage(error);
    setFinalImageURL(null);
    setIsLoading(false);
  };

  // Handle loading state changes
  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
    if (loading) {
      // Clear previous results when starting new generation
      setFinalImageURL(null);
      setErrorMessage(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Product Image Generator</h1>
        <p>Create stunning product photography with AI</p>
      </header>

      <main className="app-main">
        <div className="app-container">
          <div className="form-section">
            <GenerationForm
              onSuccess={handleSuccess}
              onError={handleError}
              onLoadingChange={handleLoadingChange}
            />
          </div>

          <div className="result-section">
            <ResultDisplay
              imageURL={finalImageURL}
              errorMessage={errorMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
