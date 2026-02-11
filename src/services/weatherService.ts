// Weather Service - OpenWeatherMap Integration
// API Documentation: https://openweathermap.org/api

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
    main: string;
}

export interface ForecastDay {
    date: string;
    tempMax: number;
    tempMin: number;
    description: string;
    precipitation: number;
    icon: string;
}

export interface WeatherDetails {
    current: WeatherData;
    forecast: ForecastDay[];
    alerts: string[];
    farmingSuggestions: string[];
}

export class WeatherService {

    static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
        if (!API_KEY) {
            console.warn('Weather API key not configured');
            return null;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) throw new Error('Weather fetch failed');

            const data = await response.json();

            return {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                main: data.weather[0].main
            };
        } catch (error) {
            console.error('Weather API error:', error);
            return null;
        }
    }

    static async getForecast(lat: number, lon: number): Promise<ForecastDay[]> {
        if (!API_KEY) return [];

        try {
            const response = await fetch(
                `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) throw new Error('Forecast fetch failed');

            const data = await response.json();

            // Group by day and take one forecast per day (noon)
            const dailyForecasts: ForecastDay[] = [];
            const processedDates = new Set<string>();

            data.list.forEach((item: any) => {
                const date = new Date(item.dt * 1000).toLocaleDateString();
                const hour = new Date(item.dt * 1000).getHours();

                // Take midday forecast for each day
                if (hour >= 11 && hour <= 13 && !processedDates.has(date)) {
                    processedDates.add(date);
                    dailyForecasts.push({
                        date: date,
                        tempMax: Math.round(item.main.temp_max),
                        tempMin: Math.round(item.main.temp_min),
                        description: item.weather[0].description,
                        precipitation: item.pop * 100, // Probability of precipitation
                        icon: item.weather[0].icon
                    });
                }
            });

            return dailyForecasts.slice(0, 7); // 7-day forecast
        } catch (error) {
            console.error('Forecast API error:', error);
            return [];
        }
    }

    static async getWeatherDetails(lat: number, lon: number): Promise<WeatherDetails | null> {
        const current = await this.getCurrentWeather(lat, lon);
        const forecast = await this.getForecast(lat, lon);

        if (!current) return null;

        // Generate alerts based on weather conditions
        const alerts: string[] = [];
        if (current.temperature > 35) {
            alerts.push('⚠️ High temperature alert - Stay hydrated');
        }
        if (current.windSpeed > 10) {
            alerts.push('💨 High wind alert - Secure loose items');
        }

        // Check for rain in forecast
        const heavyRainDays = forecast.filter(day => day.precipitation > 70);
        if (heavyRainDays.length > 0) {
            alerts.push(`🌧️ Heavy rain expected in next ${heavyRainDays.length} days`);
        }

        // Generate farming suggestions
        const suggestions = this.generateFarmingSuggestions(current, forecast);

        return {
            current,
            forecast,
            alerts,
            farmingSuggestions: suggestions
        };
    }

    private static generateFarmingSuggestions(
        current: WeatherData,
        forecast: ForecastDay[]
    ): string[] {
        const suggestions: string[] = [];

        // Temperature-based suggestions
        if (current.temperature > 30) {
            suggestions.push('🌾 Consider irrigation for crops due to high temperature');
            suggestions.push('🕐 Plan fieldwork for early morning or evening');
        }

        // Humidity-based suggestions
        if (current.humidity > 80) {
            suggestions.push('🍄 High humidity - Monitor for fungal diseases');
            suggestions.push('💧 Reduce irrigation frequency');
        }

        // Wind-based suggestions
        if (current.windSpeed > 8) {
            suggestions.push('🌬️ Delay pesticide spraying due to strong winds');
        }

        // Rain prediction suggestions
        const upcomingRain = forecast.slice(0, 3).some(day => day.precipitation > 50);
        if (upcomingRain) {
            suggestions.push('☔ Rain expected - Postpone fertilizer application');
            suggestions.push('📋 Prepare drainage systems');
        } else if (current.temperature > 35) {
            suggestions.push('☀️ No rain expected - Ensure adequate water supply');
        }

        // Monsoon prediction (based on consistent rain pattern)
        const rainyDays = forecast.filter(day => day.precipitation > 40).length;
        if (rainyDays >= 4) {
            suggestions.push('🌧️ Monsoon pattern detected - Prepare for wet season');
            suggestions.push('🌱 Good time for transplanting');
        }

        return suggestions;
    }

    // Mock data fallback when API key is not available
    static getMockWeather(): WeatherDetails {
        return {
            current: {
                temperature: 28,
                feelsLike: 30,
                humidity: 65,
                windSpeed: 5.2,
                description: 'Partly cloudy',
                icon: '02d',
                main: 'Clouds'
            },
            forecast: [
                { date: 'Tomorrow', tempMax: 30, tempMin: 22, description: 'Sunny', precipitation: 10, icon: '01d' },
                { date: 'Day 2', tempMax: 31, tempMin: 23, description: 'Partly cloudy', precipitation: 20, icon: '02d' },
                { date: 'Day 3', tempMax: 29, tempMin: 21, description: 'Rain', precipitation: 80, icon: '10d' },
            ],
            alerts: [],
            farmingSuggestions: [
                '🌾 Good weather for field activities',
                '💧 Moderate irrigation recommended'
            ]
        };
    }
}
