import React, { useState, useCallback } from 'react';
import { fetchRestaurants, getCountryFromCoords } from './services/geminiService';
import type { Restaurant, GeolocationCoordinates } from './types';
import RestaurantCard from './components/RestaurantCard';
import LocationIcon from './components/icons/LocationIcon';

const PAGE_SIZE = 9;

const App: React.FC = () => {
  const [locationQuery, setLocationQuery] = useState<string>('Tokyo Station');
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [displayedCount, setDisplayedCount] = useState<number>(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const executeSearch = useCallback(async (
    query: string, 
    searchCoords: GeolocationCoordinates | null
  ) => {
    if (!query.trim()) {
      setError('Please enter a location.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearched(true);
    setRestaurants([]);
    setDisplayedCount(PAGE_SIZE);

    try {
      const results = await fetchRestaurants(query, searchCoords);
      const sortedResults = results.sort((a, b) => b.tabelogRating - a.tabelogRating);
      setRestaurants(sortedResults);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = () => {
    executeSearch(locationQuery, coords);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        try {
          const country = await getCountryFromCoords(newCoords);
          if (country.toLowerCase().trim() !== 'japan') {
            setError('To use your current location, you must be in Japan.');
            setIsLoading(false);
            return;
          }
          // Location is valid, update state and perform search
          setLocationQuery('My Current Location');
          setCoords(newCoords);
          await executeSearch('My Current Location', newCoords);
        } catch (e) {
          if (e instanceof Error) {
              setError(e.message);
          } else {
              setError('An unknown error occurred while verifying location.');
          }
          setIsLoading(false);
        }
      },
      (error) => {
        let message = 'Unable to retrieve your location. Please enter a location manually.';
        if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission denied. Please enable it in your browser settings to use this feature.';
        } else if (error.code === error.TIMEOUT) {
            message = 'Could not get your location in time. Please try again or enter a location manually.';
        }
        setError(message);
        setIsLoading(false);
      },
      { timeout: 10000 } // 10-second timeout
    );
  };
  
  const handleLoadMore = () => {
    setDisplayedCount(prevCount => prevCount + PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
            Tabelog Restaurant Finder
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Discover Japan's best eats, powered by Gemini.
          </p>
        </header>

        <div className="sticky top-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-grow w-full">
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value)
                  if(e.target.value !== "My Current Location") {
                    setCoords(null);
                  }
                }}
                placeholder="e.g., Shinjuku Gyoen, a hotel name, or an address"
                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleLocateMe}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Use my current location"
              >
                <LocationIcon className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-center sm:text-left">{error}</p>}
        </div>

        <div>
          {isLoading && (
            <div className="flex justify-center items-center mt-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
            </div>
          )}

          {!isLoading && searched && restaurants.length === 0 && (
            <div className="text-center mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-2">No Restaurants Found</h2>
                <p className="text-gray-600 dark:text-gray-400">We couldn't find any restaurants for that location on Tabelog. Please try a different location.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.slice(0, displayedCount).map((resto, index) => (
              <RestaurantCard key={`${resto.tabelogUrl}-${index}`} restaurant={resto} />
            ))}
          </div>

          {!isLoading && restaurants.length > displayedCount && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 disabled:bg-gray-500 transition-colors duration-300"
              >
                Load More
              </button>
            </div>
          )}

           {!isLoading && !searched && (
             <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
                <p>Enter a location to start your search!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;