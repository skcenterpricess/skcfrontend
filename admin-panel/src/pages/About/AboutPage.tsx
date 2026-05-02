export default function AboutPage() {
  return (
    <section className="w-full">

      {/* 🔥 HERO SECTION */}
      <div
        className="h-[60vh] flex items-center justify-center text-white text-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc')",
        }}
      >
        <div className="bg-black/60 p-10 rounded-xl">
          <h1 className="text-5xl font-bold">SKC ENTERPRISES</h1>
          <p className="mt-4 text-lg">
            Manufacturing & Supply of Hardware Door Fittings & Padlocks
          </p>
        </div>
      </div>

      {/* 🔹 ABOUT CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">About Us</h2>

        <p className="text-gray-600 leading-7">
          SKC Enterprises is a trusted name in the hardware industry based in Mumbai.
          We specialize in manufacturing and supplying high-quality door fittings,
          padlocks, and hardware accessories for residential, commercial, and
          industrial use.
        </p>

        <p className="text-gray-600 mt-4 leading-7">
          Our mission is to deliver durable, reliable, and modern hardware solutions
          that ensure safety, strength, and long-lasting performance.
        </p>
      </div>

      {/* 🔹 STATS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center py-10 bg-gray-100">
        <div>
          <h3 className="text-4xl font-bold text-red-500">50+</h3>
          <p className="text-gray-600">Products</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-red-500">100+</h3>
          <p className="text-gray-600">Clients</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-red-500">5+</h3>
          <p className="text-gray-600">Years Experience</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-red-500">100%</h3>
          <p className="text-gray-600">Quality</p>
        </div>
      </div>

      {/* 🔹 IMAGE SECTION */}
      <div className="py-12 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <img
          src="https://images.unsplash.com/photo-1621905251918-48416bd8575a"
          className="rounded-xl shadow-lg"
        />
        <img
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
          className="rounded-xl shadow-lg"
        />
      </div>

      {/* 🔹 CONTACT SECTION */}
      <div className="bg-black text-white text-center py-10">
        <h3 className="text-2xl font-semibold">Contact Us</h3>
        <p className="mt-3">📍 Marine Lines, Mumbai</p>
        <p>📞 +91 9082202523</p>
        <p>📧 skc.entprsg@gmail.com</p>
      </div>

    </section>
  );
}