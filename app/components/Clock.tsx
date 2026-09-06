import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function Clock() {
  const [time, setTime] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0,
    day: 0,
    dayName: 0,
    month: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      setTime({
        seconds: date.getSeconds(),
        minutes: date.getMinutes(),
        hours: date.getHours(),
        day: date.getDate(),
        dayName: date.getDay() === 0 ? 7 : date.getDay(),
        month: date.getMonth() + 1,
      });
    };

    updateClock();
    setTimeout(() => setMounted(true), 100);
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const secondsRotation = time.seconds * 6;
  const minutesRotation = time.minutes * 6;
  const hoursRotation = (time.hours % 12) * 30 + time.minutes / 2;

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const range = 270;

  const getDayNameRotation = () => {
    const sectionWidth = range / 7;
    const initialRotation = 135 - sectionWidth / 2;
    return initialRotation - sectionWidth * (time.dayName - 1);
  };

  const getMonthRotation = () => {
    const sectionWidth = range / 12;
    const initialRotation = 135 - sectionWidth / 2;
    return initialRotation - sectionWidth * (time.month - 1);
  };

  const getDayRotation = () => {
    const sectionWidth = range / 31;
    const initialRotation = 135 - sectionWidth / 2;
    return initialRotation - sectionWidth * (time.day - 1);
  };

  return null;
}
