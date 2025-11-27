"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, CakeIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import Image from "next/image";

const IMAGE_URL = "/home/birthday.jpg"; // Use correct public path

// Calculate countdown based on a target date
function getCountdown(targetDate) {
  const now = new Date();
  let diff = targetDate - now;

  // If passed, set next year
  if (diff < 0) {
    targetDate = new Date(
      targetDate.getFullYear() + 1,
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0
    );
    diff = targetDate - now;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

// Get next birthday
function getNextBirthday(month, day) {
  const now = new Date();
  let year = now.getFullYear();

  const birthdayThisYear = new Date(year, month - 1, day, 0, 0, 0);

  if (birthdayThisYear < now) {
    year++;
  }

  return new Date(year, month - 1, day, 0, 0, 0);
}

export default function Birthday() {
  const [showImage, setShowImage] = useState(false);

  // Static birthday (month, day)
  const month = 10; // October
  const day = 8; // 8th

  const [countdown, setCountdown] = useState(
    getCountdown(getNextBirthday(month, day))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(getNextBirthday(month, day)));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-4">
        <h1 className="text-4xl font-bold mb-8 flex gap-4">
          <CakeIcon className="w-10 h-10" />
          Birthday 
        </h1>

        <div className="card border border-cyan-500 shadow-sm p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6 text-cyan-500">My Birthday</h2>

          <div className="flex gap-5 mb-6">
            <div>
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": countdown.days }}>
                  {countdown.days}
                </span>
              </span>
              <div className="text-sm mt-2">days</div>
            </div>

            <div>
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": countdown.hours }}>
                  {countdown.hours}
                </span>
              </span>
              <div className="text-sm mt-2">hours</div>
            </div>

            <div>
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": countdown.minutes }}>
                  {countdown.minutes}
                </span>
              </span>
              <div className="text-sm mt-2">min</div>
            </div>

            <div>
              <span className="countdown font-mono text-5xl">
                <span style={{ "--value": countdown.seconds }}>
                  {countdown.seconds}
                </span>
              </span>
              <div className="text-sm mt-2">sec</div>
            </div>
          </div>

          <button
            className="btn bg-cyan-500 text-white mt-4"
            onClick={() => setShowImage(true)}
          >
            <QrCodeIcon className="w-6 h-6" /> Pay me coffee
          </button>
        </div>

        {showImage && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl p-8 shadow-xl relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowImage(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-4 text-center">Pay me coffee!</h2>

              <div className="h-64 w-64 relative">
                <Image
                  src={IMAGE_URL}
                  alt="Birthday"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
