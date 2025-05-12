import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

// Assistant type message - Text only
export const mockMessageWithTextOnlyForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content:
        'Hello! I am your AI assistant, pleased to be of help. How may I assist you today?',
    },
  ],
  attachments: [],
};

// User type message - Text only
export const mockMessageWithTextOnlyForUser: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'user',
  parts: [
    {
      type: 'text',
      content:
        "Could you check the recent weather forecast for me? I'd like to know if the weekend is suitable for outdoor activities.",
    },
  ],
  attachments: [],
};

// Assistant type message - With table
export const mockMessageWithTableForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content: `Here is this week's weather forecast:

| Date | Weather | Temperature | Suitable for outdoor activities |
|:------:|:---------:|:-------------:|:--------------------------------:|
| Saturday | Sunny | 22°C-28°C | Very suitable ✅ |
| Sunday | Partly cloudy | 20°C-25°C | Suitable ✅ |
| Monday | Overcast | 18°C-23°C | Average ⚠️ |
| Tuesday | Light rain | 16°C-21°C | Not suitable ❌ |

The weekend weather is quite good, very suitable for outdoor activities. I recommend bringing sun protection and staying hydrated.`,
    },
  ],
  attachments: [],
};

// User type message - With table
export const mockMessageWithTableForUser: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'user',
  parts: [
    {
      type: 'text',
      content: `Here is my planned activity schedule. Do you think it's reasonable?

| Time | Activity | Location | Items to prepare |
|:------:|:----------:|:----------:|:----------------:|
| Morning 9:00-11:00 | Hiking | City park | Water, hat, sunscreen |
| Noon 12:00-14:00 | Picnic | Lakeside lawn | Food, drinks, mat |
| Afternoon 15:00-17:00 | Cycling | Suburban bike path | Bicycle, helmet, water |
| Evening 18:00-20:00 | Barbecue | Campsite | Ingredients, charcoal, BBQ tools |`,
    },
  ],
  attachments: [],
};

// Assistant type message - Text + attachments
export const mockMessageWithAttachmentsForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content:
        'I have prepared two route maps for you, one for park hiking and the other for suburban cycling. Both routes have been carefully designed, with beautiful scenery and are suitable for beginners. You can choose a suitable route based on your physical condition and available time.',
    },
  ],
  attachments: [
    {
      id: `attachment-${uuidv4()}`,
      name: `hiking_route.jpg`,
      contentType: 'image/png',
      url: `https://oss.orz2.online/BiteMakerChrome/AYAKA/imgAyakaLogoBiteGithub.png`,
    },
    {
      id: `attachment-${uuidv4()}`,
      name: `cycling_route.jpg`,
      contentType: 'image/png',
      url: `https://oss.orz2.online/BiteMakerChrome/AYAKA/imgAyakaLogoBiteJira.png`,
    },
  ],
};

// User type message - Text + attachments
export const mockMessageWithAttachmentsForUser: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'user',
  parts: [
    {
      type: 'text',
      content:
        'I took some photos during my outdoor activities. Could you help me identify what species these plants are?',
    },
  ],
  attachments: [
    {
      id: `attachment-${uuidv4()}`,
      name: `plant1.jpg`,
      contentType: 'image/png',
      url: `https://oss.orz2.online/BiteMakerChrome/AYAKA/imgAyakaLogoBiteGithub.png`,
    },
    {
      id: `attachment-${uuidv4()}`,
      name: `plant2.jpg`,
      contentType: 'image/png',
      url: `https://oss.orz2.online/BiteMakerChrome/AYAKA/imgAyakaLogoBiteJira.png`,
    },
  ],
};

// Assistant type message - Long text
export const mockMessageWithLongTextForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content: `Outdoor Activity Safety Guide:

1. Weather check: Check the weather forecast before departure, avoid extreme weather.
2. Inform others: Let friends and family know your itinerary and expected return time.
3. Carry essentials: Water, food, first aid kit, map, compass, torch, etc.
4. Stay connected: Ensure your mobile phone is fully charged, consider carrying a backup power source.
5. Appropriate clothing: Choose suitable clothing and footwear based on weather and activity type.
6. Know the route: Research the route in advance, understand the difficulty and potential hazards.
7. Protect the environment: Leave no rubbish, do not damage the natural environment.
8. Respect wildlife: Maintain a safe distance, do not feed.
9. Know your limits: Choose appropriate activity intensity based on your physical condition.
10. Sun and insect protection: Carry sunscreen and insect repellent.

Enjoy your outdoor activities! Should you have any other questions, feel free to ask me.`,
    },
  ],
  attachments: [],
};

// User type message - Code example
export const mockMessageWithCodeForUser: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'user',
  parts: [
    {
      type: 'text',
      content: `I'm writing a weather query function, but I've encountered some issues. Here's my code:

\`\`\`javascript
async function getWeatherData(location) {
  try {
    const response = await fetch(\`https://api.weather.com/forecast?location=\${location}\`);
    const data = await response.json();
    
    if (data.error) {
      console.error('Failed to get weather data:', data.error);
      return null;
    }
    
    return {
      current: data.current,
      forecast: data.forecast.slice(0, 5) // Only get 5-day forecast
    };
  } catch (error) {
    console.error('API request exception:', error);
    return null;
  }
}

// How to use this function in a component?
\`\`\`

Could you help me improve this code and show how to use it in a React component?`,
    },
  ],
  attachments: [],
};

// Assistant type message - Code example
export const mockMessageWithCodeForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content: `Here's the improved code, showing how to use it in a React component:

\`\`\`javascript
// weatherService.js
async function getWeatherData(location) {
  try {
    const API_KEY = process.env.WEATHER_API_KEY; // Get API key from environment variable
    const response = await fetch(\`https://api.weather.com/forecast?location=\${encodeURIComponent(location)}&apiKey=\${API_KEY}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Failed to get weather data:', data.error);
      return null;
    }
    
    return {
      current: data.current,
      forecast: data.forecast.slice(0, 5) // Only get 5-day forecast
    };
  } catch (error) {
    console.error('API request exception:', error);
    return null;
  }
}

export { getWeatherData };
\`\`\`

\`\`\`jsx
// WeatherComponent.jsx
import React, { useState, useEffect } from 'react';
import { getWeatherData } from './weatherService';

const WeatherComponent = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const data = await getWeatherData(location);
        if (data) {
          setWeather(data);
          setError(null);
        } else {
          setError('Unable to get weather data');
        }
      } catch (err) {
        setError('Error getting weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weather) return <div>No data</div>;

  return (
    <div className="weather-container">
      <h2>Current weather: {location}</h2>
      <div className="current-weather">
        <p>Temperature: {weather.current.temperature}°C</p>
        <p>Weather: {weather.current.condition}</p>
        <p>Humidity: {weather.current.humidity}%</p>
      </div>
      
      <h3>Five-day forecast</h3>
      <div className="forecast">
        {weather.forecast.map((day, index) => (
          <div key={index} className="forecast-day">
            <p>Date: {day.date}</p>
            <p>Maximum temp: {day.maxTemp}°C</p>
            <p>Minimum temp: {day.minTemp}°C</p>
            <p>Weather: {day.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherComponent;
\`\`\`

Usage method:
\`\`\`jsx
import WeatherComponent from './WeatherComponent';

function App() {
  return (
    <div className="App">
      <h1>Weather Application</h1>
      <WeatherComponent location="Beijing" />
    </div>
  );
}
\`\`\`

Main improvements:
1. Added error handling and HTTP status checking
2. Used encodeURIComponent to process location parameter
3. Added API key retrieval from environment variables
4. Created a complete React component with loading status and error handling
5. Used useEffect to monitor location changes to fetch new data`,
    },
  ],
  attachments: [],
};

// User type message - With sheet
export const mockMessageWithSheetForUser: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'user',
  parts: [
    {
      type: 'sheet',
      title: 'Occupation Analysis',
      content: `Name,Age,Occupation,Location
John,32,Engineer,New York
Sarah,28,Designer,San Francisco
Michael,45,Manager,Chicago
Emily,36,Doctor,Boston
David,29,Developer,Seattle`,
    },
  ],
  attachments: [],
};

// Assistant type message - With sheet
export const mockMessageWithSheetForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'text',
      content:
        "Based on the data you provided, I've created an analysis table showing the average age and distribution across different occupations:",
    },
    {
      type: 'sheet',
      title: 'Occupation Analysis',
      content: `Occupation,Average Age,Count,Percentage,Salary Range,Education Level,Experience Years,Skill Level,Department Size
Engineer,32,1,20%,$85k-$95k,Bachelor's,4-5,Intermediate,Medium
Designer,28,1,20%,$70k-$75k,Master's,3,Intermediate,Small
Manager,45,1,20%,$120k+,MBA,15,Expert,Large
Doctor,36,1,20%,$150k+,MD,8,Expert,Medium
Developer,29,1,20%,$90k-$100k,Bachelor's,4,Intermediate,Medium`,
    },
    {
      type: 'text',
      content:
        'From the table, we can see that the Manager has the highest age at 45, while the Designer has the lowest at 28. All occupations have an equal sample size, each accounting for 20% of the total.',
    },
  ],
  attachments: [],
};

// Assistant type message - With card
export const mockMessageWithCardForAssistant: ChatMessage = {
  id: `message-${uuidv4()}`,
  role: 'assistant',
  parts: [
    {
      type: 'card',
      content: `[{"title":"card1","description":"description1","phone":"1234567890"},{"title":"card2","description":"description1","phone":"17766084295"}]`,
    },
  ],
};
