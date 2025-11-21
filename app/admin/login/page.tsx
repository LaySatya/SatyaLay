export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="w-5xl bg-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="hidden md:block">
                    <img src="/admin/admin-login.jpg" alt="Admin Login" className="h-full w-full object-cover rounded-r-lg" />
                </div>
                <div className="p-8">
                    <h2 className="text-2xl mb-6 font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>

                        Admin Login
                    </h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
                            <input type="email" id="email" className="input focus:border-cyan-500 outline-cyan-500 w-full" placeholder="Enter your email" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
                            <input type="password" id="password" className="input focus:border-cyan-500 outline-cyan-500 w-full" placeholder="Enter your password" />
                        </div>
                        <button type="submit" className="btn bg-cyan-500 w-full text-white">Login</button>
                    </form>
                </div>
                
            </div>
        </div>
    </div>
  );
}
