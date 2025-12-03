"use client";

import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      await addDoc(collection(db, "contacts"), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: Timestamp.now(),
      });
      setStatus("Thank you for contacting me!");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form submit error:", error);
      setStatus("Failed to send. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-4 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex gap-4">
              <EnvelopeIcon className="w-10 h-10 text-cyan-500" />
              Contact Me
            </h1>
            <hr className="border-t border-2  border-cyan-500 grow w-10" />
            <p className="text-lg opacity-75 mt-4">
              Feel free to reach out to me using the form below. I look forward to hearing from you!
            </p>
          </div>
          {/* Form Card */}
          <div className="rounded-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              <div className="form-control">
                <label className="label font-semibold">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-semibold">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-semibold">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full min-h-[150px]"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn bg-cyan-500 text-white w-full text-md">
                Send Message
              </button>

              {status && (
                <p className="text-center text-success font-semibold mt-2">
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
