import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="relative h-[420px]">
          <img
            src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc"
            alt="Hardware Door Fittings"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">
                SKC ENTERPRISES
              </p>

              <h1 className="mt-4 text-4xl sm:text-5xl font-black text-white">
                Manufacturing & Supply of
                <br />
                Hardware Door Fittings
              </h1>

              <p className="mt-4 text-lg text-white/90 max-w-3xl mx-auto">
                Premium quality padlocks, handles, door fittings, hardware
                accessories & industrial solutions built with trust and strength.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-8 rounded-[2rem] bg-white border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
            About Us
          </p>

          <h2 className="mt-3 text-4xl font-black text-slate-900">
            Welcome to SKC Enterprises
          </h2>

          <p className="mt-6 text-lg leading-9 text-slate-600 max-w-5xl mx-auto">
            SKC Enterprises is a trusted name in the hardware industry based in
            Mumbai. We specialize in manufacturing and supplying high-quality
            door fittings, padlocks, handles, locks, and hardware accessories
            for residential, commercial, and industrial use.
          </p>

          <p className="mt-4 text-lg leading-9 text-slate-600 max-w-5xl mx-auto">
            Our mission is to deliver durable, reliable, and modern hardware
            solutions that ensure safety, strength, and long-lasting
            performance. With strong customer trust and quality commitment, we
            continue building excellence every day.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 rounded-[2rem] bg-[#fafafa] border border-slate-200 p-8 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "1500+", label: "Products" },
            { value: "10K+", label: "Clients" },
            { value: "15+", label: "Years Experience" },
            { value: "100%", label: "Quality" },
          ].map((item, index) => (
            <div key={index}>
              <h3 className="text-5xl font-black text-orange-600">
                {item.value}
              </h3>
              <p className="mt-3 text-slate-700 font-medium text-lg">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Image Cards */}
      <section className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952"
            alt="Industrial Hardware"
            className="w-full h-[320px] object-cover"
          />
        </div>

        <div className="rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122"
            alt="Door Fittings"
            className="w-full h-[320px] object-cover"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mt-8 rounded-[2rem] bg-white border border-slate-200 p-8 sm:p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-700">
          Why Choose Us
        </p>

        <h2 className="mt-3 text-3xl font-black text-slate-900">
          Trusted Quality. Strong Service.
        </h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Premium Hardware",
              desc: "Strong, durable and modern hardware products built for long-lasting use.",
            },
            {
              title: "Customer Trust",
              desc: "We focus on long-term relationships through reliable service and support.",
            },
            {
              title: "Fast Supply",
              desc: "Quick product availability and smooth delivery for every customer need.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <h3 className="text-xl font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-3 text-slate-600 leading-8">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8 rounded-[2rem] bg-orange-700 text-white p-8 sm:p-10 text-center shadow-sm">
        <h2 className="text-3xl font-black">
          Let’s Build Something Strong
        </h2>

        <p className="mt-4 text-white/90 max-w-3xl mx-auto leading-8">
          Explore our trusted range of hardware products designed for safety,
          durability, and long-term performance.
        </p>

        <div className="mt-8">
          <Link
            to="/projects"
            className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 hover:bg-slate-100 transition"
          >
            View Our Products
          </Link>
        </div>
      </section>
    </>
  );
}