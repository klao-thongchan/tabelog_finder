import React from 'react';
import type { Restaurant } from '../types';
import StarIcon from './icons/StarIcon';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      {restaurant.featuredDishImage && (
        <img 
          src={restaurant.featuredDishImage} 
          alt={`Featured dish from ${restaurant.restaurantName}`}
          className="w-full h-48 object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 pr-4">{restaurant.restaurantName}</h3>
            <div className="flex items-center flex-shrink-0 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                <StarIcon className="w-4 h-4 mr-1.5" />
                <span>{restaurant.tabelogRating.toFixed(2)}</span>
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{restaurant.category}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{restaurant.address}</p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <a
              href={restaurant.tabelogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              View on Tabelog
            </a>
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Open in Maps
            </a>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
