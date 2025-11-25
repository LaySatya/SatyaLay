"use client";

import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState, useEffect } from "react";
import {
	collection,
	getDocs,
	addDoc,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";


export default function AdminContactPage() {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);

	// Form state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [viewMsg, setViewMsg] = useState(null);

		// Fetch messages from Firestore
		useEffect(() => {
			async function fetchMessages() {
				setLoading(true);
				try {
					const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
					const snap = await getDocs(q);
					const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
					setMessages(list);
				} catch (e) {
					setError("Failed to fetch messages.");
				} finally {
					setTimeout(() => setLoading(false), 300);
				}
			}
			fetchMessages();
		}, []);

		// Send message to Firestore
		const handleSubmit = async (e) => {
			e.preventDefault();
			setSending(true);
			setSuccess("");
			setError("");
			try {
				await addDoc(collection(db, "contactMessages"), {
					name,
					email,
					subject,
					message,
					createdAt: serverTimestamp(),
				});
				setSuccess("Message sent successfully!");
				setName("");
				setEmail("");
				setSubject("");
				setMessage("");
				setModalOpen(false);
				// Refresh messages
				const q = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"));
				const snap = await getDocs(q);
				const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				setMessages(list);
			} catch (e) {
				setError("Failed to send message.");
			} finally {
				setSending(false);
			}
		};

	return (
		<ProtectedRoute>
			<AdminLayout>
						<div className="p-0 md:p-8 min-h-screen">
							<div className="flex justify-between items-center mb-6">
								<h1 className="text-2xl font-bold">Contact Messages</h1>
								<button className="btn btn-info" onClick={() => setModalOpen(true)}>
									Send Message
								</button>
							</div>

							{/* Message List */}
							{loading ? (
								<div className="flex justify-center items-center py-12">
									<span className="loading loading-spinner loading-lg"></span>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{messages.length === 0 && (
										<div className="col-span-full text-center py-12">No messages yet.</div>
									)}
									{messages.map((msg) => (
										<div key={msg.id} className="card p-6 shadow-md flex flex-col gap-2 border border-base-200">
											<div className="flex justify-between items-center mb-2">
												<h2 className="font-bold text-lg">{msg.subject}</h2>
												<button className="btn btn-sm btn-outline" onClick={() => setViewMsg(msg)}>
													View
												</button>
											</div>
											<div className="text-sm mb-1">From: <span className="font-medium">{msg.name}</span> &lt;{msg.email}&gt;</div>
											<div className="text-xs mb-1">Received: {msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate().toLocaleString() : "—"}</div>
											<div className="line-clamp-2 text-sm mb-2">{msg.message}</div>
											<div className="flex gap-2 mt-2">
												<span className="badge badge-outline">{msg.subject}</span>
											</div>
										</div>
									))}
								</div>
							)}

								{/* Modal for send message */}
								{modalOpen && (
									<div className="modal modal-open">
										<div className="modal-box relative max-w-2xl w-full mx-4 sm:mx-auto">
											<h3 className="text-2xl font-bold mb-6">Send a Message</h3>
											<button
												className="btn btn-sm btn-circle absolute right-2 top-2"
												onClick={() => setModalOpen(false)}
											>
												✕
											</button>
											<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
												<div>
													<label className="label">Name</label>
													<input
														type="text"
														className="input input-bordered w-full"
														value={name}
														onChange={(e) => setName(e.target.value)}
														placeholder="Your name"
														required
													/>
												</div>
												<div>
													<label className="label">Email</label>
													<input
														type="email"
														className="input input-bordered w-full"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														placeholder="you@email.com"
														required
													/>
												</div>
												<div>
													<label className="label">Subject</label>
													<input
														type="text"
														className="input input-bordered w-full"
														value={subject}
														onChange={(e) => setSubject(e.target.value)}
														placeholder="Subject"
														required
													/>
												</div>
												<div>
													<label className="label">Message</label>
													<textarea
														className="textarea textarea-bordered w-full min-h-[100px]"
														value={message}
														onChange={(e) => setMessage(e.target.value)}
														placeholder="Type your message..."
														required
													/>
												</div>
												<div className="flex gap-3 mt-2">
													<button
														type="submit"
														className={`btn btn-primary ${sending ? "loading" : ""}`}
														disabled={sending}
													>
														{sending ? "Sending..." : "Send Message"}
													</button>
													<button
														type="button"
														className="btn"
														onClick={() => {
															setName("");
															setEmail("");
															setSubject("");
															setMessage("");
															setSuccess("");
															setError("");
														}}
														disabled={sending}
													>
														Reset
													</button>
												</div>
												{success && <div className="text-success mt-2">{success}</div>}
												{error && <div className="text-error mt-2">{error}</div>}
											</form>
										</div>
									</div>
								)}

								{/* Modal for view message */}
								{viewMsg && (
									<div className="modal modal-open">
										<div className="modal-box relative max-w-lg w-full mx-4 sm:mx-auto">
											<h3 className="text-xl font-bold mb-2">{viewMsg.subject}</h3>
											<button
												className="btn btn-sm btn-circle absolute right-2 top-2"
												onClick={() => setViewMsg(null)}
											>
												✕
											</button>
											<div className="mb-2 text-sm">From: <span className="font-medium">{viewMsg.name}</span> &lt;{viewMsg.email}&gt;</div>
											<div className="mb-2 text-xs">Received: {viewMsg.createdAt && viewMsg.createdAt.toDate ? viewMsg.createdAt.toDate().toLocaleString() : "—"}</div>
											<div className="mb-4 text-base">{viewMsg.message}</div>
											<div className="modal-action">
												<button className="btn" onClick={() => setViewMsg(null)}>Close</button>
											</div>
										</div>
									</div>
								)}
				</div>
			</AdminLayout>
		</ProtectedRoute>
	);
}
