export interface Restaurant {
  restaurantName: string;
  category: string;
  tabelogRating: number;
  tabelogUrl: string;
  address: string;
  googleMapsUrl: string;
  featuredDishImage: string;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}
