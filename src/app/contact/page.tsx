import Link from "next/link";

export default async function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors -ml-76"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                CONTACT US
              </h1>
            </div>
            <div className="lg:col-span-1">
              <p className="text-white/60 leading-relaxed">
                If you have any questions, please feel free to get in touch with us
                via phone, text, email, the form below, or even on social media!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">GET IN TOUCH</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your name*"
                      required
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-white/80 mb-2"
                    >
                      PHONE NUMBER
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="countryCode"
                        name="countryCode"
                        required
                        className="px-2 py-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        style={{ width: "85px", flexShrink: 0 }}
                      >
                        <option value="+1">🇺🇸 (+1)</option>
                        <option value="+49">🇩🇪 (+49)</option>
                        <option value="+91">🇮🇳 (+91)</option>
                        <option value="+1">🇨🇦 (+1)</option>
                        <option value="+61">🇦🇺 (+61)</option>
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Enter phone number*"
                        required
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className="flex-1 min-w-0 px-4 py-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email*"
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white/80 mb-2"
                  >
                    YOUR MESSAGE
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    placeholder="Enter your message"
                    required
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>


            <div className="space-y-6">

              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  CONTACT INFORMATION
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 text-red-500 mt-1 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-white/80 mb-1">
                        PHONE
                      </div>
                      <div className="text-white">890-477-9446</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 text-red-500 mt-1 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-white/80 mb-1">
                        ADDRESS
                      </div>
                      <div className="text-white">
                        1 Market Plaza, Fl 9, San Francisco, CA 94105
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg
                      className="w-5 h-5 text-red-500 mt-1 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-white/80 mb-1">
                        EMAIL
                      </div>
                      <a
                        href="mailto:parbhat@parbhat.dev"
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        parbhat@parbhat.dev
                      </a>
                    </div>
                  </div>
                </div>
              </div>


              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  BUSINESS HOURS
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="text-white/80 font-medium">MONDAY - FRIDAY</div>
                    <div className="text-white">9:00 am - 8:00 pm</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="text-white/80 font-medium">SATURDAY</div>
                    <div className="text-white">9:00 am - 6:00 pm</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-white/80 font-medium">SUNDAY</div>
                    <div className="text-white">9:00 am - 5:00 pm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.185124035647!2d-122.3947!3d37.7878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2s1%20Market%20Plaza%2C%20San%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
