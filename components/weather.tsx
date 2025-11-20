"use client";

import cx from "classnames";
import { format, isWithinInterval } from "date-fns";
import { useEffect, useState } from "react";

const SunIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MoonIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79z" fill="currentColor" />
  </svg>
);

const CloudIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

type WeatherAtLocation = {
  update_time :string;
  cityName :string;
  tem1 :string;
  tem2 :string;
  sunrise :string;
  sunset :string;
  date :string;
  tem :string;
  hours :{hours:string, tem:string}[];
};



function n(num: number): number {
  return Math.ceil(num);
}

export function Weather({
  weatherAtLocation,
}: {
  weatherAtLocation: WeatherAtLocation;
}) {
  const isDay = isWithinInterval(new Date(weatherAtLocation.update_time), {
    start: new Date(weatherAtLocation?.sunrise),
    end: new Date(weatherAtLocation.sunset),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window?.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 8;

  return (
    <div
      className={cx(
        "relative flex w-full flex-col gap-6 rounded-3xl p-6 shadow-lg overflow-hidden backdrop-blur-sm",
        {
          "bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600": isDay,
        },
        {
          "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900": !isDay,
        }
      )}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/80 text-sm font-medium">
            {weatherAtLocation?.cityName}
          </div>
          <div className="text-white/60 text-xs">
           {weatherAtLocation?.date} {weatherAtLocation?.update_time}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cx("text-white/90", { "text-yellow-200": isDay, "text-blue-200": !isDay })}>
              {isDay ? <SunIcon size={48} /> : <MoonIcon size={48} />}
            </div>
            <div className="text-white text-5xl font-light">
              {weatherAtLocation?.tem}
              <span className="text-2xl text-white/80">
              °C
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col">
            <div className="text-white/70 text-sm flex justify-between">
            <span>最高温度：</span>
            <span>{weatherAtLocation?.tem1}°C</span>
            </div>
            <div className="text-white/70 text-sm flex justify-between">
             <span>最低温度：</span>
            <span>{weatherAtLocation?.tem2}°C</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="text-white/80 text-sm mb-3 font-medium">
            每小时预报
          </div>
          <div className="flex justify-between flex-wrap overflow-x-auto">
            {weatherAtLocation?.hours?.slice(0,hoursToShow).map((item, index) => {
              return (
                <div 
                  className={cx(
                    "flex flex-col items-center gap-2 py-2 px-1 rounded-lg min-w-0 flex-1",
                    {
                      "bg-white/20":  index === 0,
                    }
                  )} 
                  key={index}
                >
                  <div className="text-white/70 text-xs font-medium">
                    {index === 0 ? "现在" : item?.hours}
                  </div>
                  
                  <div className={cx("text-white/60", { "text-yellow-200": isDay, "text-blue-200": !isDay })}>
                    <CloudIcon size={20} />
                  </div>
                  
                  <div className="text-white text-sm font-medium">
                    {item?.tem}°C
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between text-white/60 text-xs mt-4">
          <div>日出: {weatherAtLocation?.sunrise}</div>
          <div>日落: {weatherAtLocation?.sunset}</div>
        </div>
      </div>
    </div>
  );
}
