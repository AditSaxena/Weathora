import { useState, useEffect, useRef } from "react";

import logo1 from "./assets/images/logo1.png";

function App() {
  const [value, setValue] = useState("");
  const [weatherObj, setWeatherObj] = useState({
    temp: "--",
    location: "--",
    date: "--",
    time: "--",
    condition: "--",
    icon: null,
  });

  function getBackgroundClass(condition) {
    const text = condition.toLowerCase();

    if (text.includes("sun") || text.includes("clear")) {
      return "bg-gradient-to-b from-yellow-200 to-yellow-400"; // Softer yellow
    } else if (text.includes("cloud") || text.includes("overcast")) {
      return "bg-gradient-to-b from-gray-300 to-gray-600";
    } else if (text.includes("rain") || text.includes("drizzle")) {
      return "bg-gradient-to-b from-blue-300 to-blue-700";
    } else if (text.includes("snow")) {
      return "bg-gradient-to-b from-blue-100 to-gray-100";
    } else if (text.includes("thunder") || text.includes("storm")) {
      return "bg-gradient-to-b from-gray-700 to-black";
    } else {
      return "bg-[rgb(0,34,65)]"; // Default
    }
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocationAndSetValue = () => {
    setError(null); // clear any previous errors

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const url = `https://api.weatherapi.com/v1/search.json?key=23caacac9bfd42e7ba2222053251703&q=${latitude},${longitude}`;
          const response = await fetch(url);
          const json = await response.json();

          if (json.length > 0) {
            setValue(json[0].name); // set city in input field
          } else {
            setError("Could not detect your city.");
          }
        } catch (err) {
          setError("Error fetching location.");
          console.error(err);
        }
      },
      (err) => {
        setError("Location access denied.");
        console.warn(err);
      }
    );
  };

  async function fetchWeather(location) {
    const url = `https://api.weatherapi.com/v1/current.json?key=23caacac9bfd42e7ba2222053251703&q=${location}&aqi=no`;
    // fetch -> inbuilt function to get http response from a server
    try {
      const response = await fetch(url);
      if (response.status === 400) {
        return null; // let caller handle the error
      } else if (response.status === 200) {
        const json = await response.json();
        return json;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Network error:", error);
      return null;
    }
  }

  const handleClick = async () => {
    setError(null);
    if (value.trim() === "") {
      setError("Location can't be empty.");
      return;
    }
    setLoading(true); // start spinner
    try {
      const start = Date.now();
      // you need to make the request
      const data = await fetchWeather(value);

      const elapsed = Date.now() - start;
      const delay = Math.max(0, 1500 - elapsed);
      setTimeout(() => {
        setLoading(false); // stop spinner
        if (data == null) {
          setError("Could not fetch weather for the given location.");
          return;
        }
        // after getting the data -> data extract
        const temp = data.current.temp_c;
        const location = data.location.name;
        const timeData = data.location.localtime;
        const [date, time] = timeData.split(" ");
        const iconLink = data.current.condition.icon;
        const condition = data.current.condition.text;
        // update the state
        let newobj = {
          temp: temp,
          location: location,
          date: date,
          time: time,
          condition: condition,
          icon: iconLink,
        };
        setWeatherObj(newobj);
        setValue(""); // clear input
      }, delay);
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
      console.error("Fetch failed:", err);
    }
  };
  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      console.log("Input field focused");
    }
  }, []);

  return (
    <>
      <header className="bg-[lavender] dark:bg-gray-900 flex flex-col md:flex-row items-center px-4 py-4 gap-4 md:gap-8">
        {/* Left: Logo */}
        <div className="h-[60px] md:h-[100px] w-auto flex items-center">
          <img
            src={logo1}
            alt="Weathora Logo"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Right: Input, Button & Error Message */}
        <div className="flex flex-col gap-2 flex-grow items-center justify-center">
          {/* Input + Locate + Search */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-[500px]">
            <div className="relative w-full sm:w-[250px]">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter Location"
                className="w-full bg-white text-black placeholder:text-gray-500 border border-gray-300 outline-none p-4 pr-12 text-[18px] rounded-[20px] shadow-sm"
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleClick();
                  }
                }}
                value={value}
              />
              <button
                onClick={getLocationAndSetValue}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition"
                title="Use Current Location"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <button
              className="w-full sm:w-auto px-[30px] py-[14px] bg-[#ff5945] hover:bg-[#e94a39] text-white text-[16px] font-medium rounded-[40px] shadow-md"
              onClick={handleClick}
            >
              Search
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded-md shadow w-full max-w-[300px] text-center">
              ⚠️ {error}
            </div>
          )}
        </div>
      </header>

      <main
        className={`min-h-[calc(100vh-120px)] px-4 py-6 md:px-10 flex items-center justify-center text-black transition-all duration-700 ${getBackgroundClass(
          weatherObj.condition
        )}`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-white border-t-[#ff5945] rounded-full animate-spin"></div>
            <div className="text-lg text-white">Fetching weather...</div>
          </div>
        ) : (
          <div className="flex gap-8 text-[20px] leading-[40px]">
            <div className="text-[30px] text-[orange]">
              {weatherObj.temp} &deg;C
            </div>
            <div className="location-date">
              <div className="text-[30px] text-[yellowgreen]">
                {weatherObj.location}
              </div>
              <span className="time">{weatherObj.time}</span>
              &nbsp; &nbsp;
              <span className="date">{weatherObj.date}</span>
            </div>
            <div className="weather-state">
              <div className="w-[80px] h-[80px] flex flex-col items-center justify-center">
                {weatherObj.icon ? (
                  <img
                    src={weatherObj.icon}
                    alt={weatherObj.condition}
                    className="w-[60px] md:w-[80px]"
                  />
                ) : (
                  <span className="text-gray-400 text-3xl">--</span>
                )}
              </div>
              <div className="condition">{weatherObj.condition}</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
