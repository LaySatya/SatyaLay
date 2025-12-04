"use client";

import { useEffect, useState } from "react";
import {
  CalendarIcon,
  CakeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import MainLayout from "../components/MainLayout";
import Image from "next/image";

const USD_QR = "/home/dollar_qr.png";
const KHR_QR = "/home/riel_qr.png";

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
  const [showUsd, setShowUsd] = useState(true);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex gap-4">
            <CakeIcon className="w-10 h-10 text-cyan-500" />
            Birthday Countdown
          </h1>
          <hr className="border-t border-2  border-cyan-500 grow w-10 md:translate-0 -translate-y-10" />
          <p className="text-lg opacity-75 mt-4">
            Countdown to my birthday and a special way to celebrate!
          </p>
        </div>

        <div className="card p-8 flex flex-col items-center">
          {/* <h2 className="text-3xl font-bold mb-6 text-cyan-500">My Birthday</h2> */}

          <div className="flex md:gap-12 gap-4 mb-6">
            <div>
              <span className="countdown font-mono md:text-8xl text-6xl">
                <span style={{ "--value": countdown.days }}>
                  {countdown.days}
                </span>
              </span>
              <div className="text-sm mt-2">days</div>
            </div>

            <div>
              <span className="countdown font-mono md:text-8xl text-6xl">
                <span style={{ "--value": countdown.hours }}>
                  {countdown.hours}
                </span>
              </span>
              <div className="text-sm mt-2">hours</div>
            </div>

            <div>
              <span className="countdown font-mono md:text-8xl text-6xl">
                <span style={{ "--value": countdown.minutes }}>
                  {countdown.minutes}
                </span>
              </span>
              <div className="text-sm mt-2">minutes</div>
            </div>

            <div>
              <span className="countdown font-mono md:text-8xl text-6xl">
                <span style={{ "--value": countdown.seconds }}>
                  {countdown.seconds}
                </span>
              </span>
              <div className="text-sm mt-2">seconds</div>
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
  <dialog open className="modal">
    <div className="modal-box relative">

      {/* CLOSE BUTTON */}
      <button
        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onClick={() => setShowImage(false)}
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-xl font-bold mb-4 text-center">Pay me coffee!</h2>

      {/* TOGGLE BUTTONS */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          className={`btn ${showUsd ? 'btn-active bg-cyan-500 text-white' : ''}`}
          onClick={() => setShowUsd(true)}
        >
          Dollar (USD)
        </button>

        <button
          className={`btn ${!showUsd ? 'btn-active bg-cyan-500 text-white' : ''}`}
          onClick={() => setShowUsd(false)}
        >
          Riel (KHR)
        </button>
      </div>

      {/* QR IMAGE */}
      <div className="h-72 w-72 relative mx-auto">
        <Image
          src={showUsd ? USD_QR : KHR_QR}
          alt="QR Code"
          fill
          className="object-cover rounded-xl"
        />
      </div>
    </div>

    {/* BACKDROP CLICK TO CLOSE */}
    <form method="dialog" className="modal-backdrop">
      <button onClick={() => setShowImage(false)}>close</button>
    </form>
  </dialog>
)}

      </div>
    </MainLayout>
  );
}
