import { useState } from "react";

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

  async function fetchWeather(location) {
    const url = `http://api.weatherapi.com/v1/current.json?key=23caacac9bfd42e7ba2222053251703&q=${location}&aqi=no`;
    // fetch -> inbuilt function to get http response from a server
    const response = await fetch(url);
    if (response.status == 400) {
      alert("Location not found");
      return null;
    } else if (response.status == 200) {
      const json = await response.json();
      return json;
    }
  }

  const handleClick = async () => {
    // get the value of the location
    if (value != "") {
      // you need to make the request
      const data = await fetchWeather(value);
      if (data == null) {
        alert("Wrong location");
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
      setValue("");
    } else {
      alert("Location can't be empty");
    }
  };
  const handleInput = (e) => {
    setValue(e.target.value);
  };
  return (
    <>
      <header className="h-[100px] bg-[lavender] flex justify-center items-center">
        <div className="input-container">
          <input
            type="text"
            name=""
            id=""
            placeholder="Enter Location"
            className="bg-transparent border-none outline-none p-4 text-[20px] rounded-[20px]"
            onChange={handleInput}
            value={value}
          />
          <button
            id="search"
            className="border-none outline-none px-[50px] py-4 bg-[#ff5945] text-white text-[16px] cursor-pointer rounded-[40px]"
            onClick={handleClick}
          >
            Search
          </button>
        </div>
      </header>
      <main className="h-[calc(100vh-100px)] bg-[rgb(0,34,65)] flex items-center justify-center text-white">
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
            <div>
              <img src={weatherObj.icon} alt="icon" className="w-[80px]" />
            </div>
            <div className="condition">{weatherObj.condition}</div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
