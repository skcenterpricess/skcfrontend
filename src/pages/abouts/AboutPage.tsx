import { Link } from "react-router-dom";
const policySections = [
  {
    title: 'Disclaimer',
    points: [
      'SKC reserves the right to discontinue or add any product, finish, or design without prior notice.',
      'The sketches, drawings, and images appearing in this price list are for guidance only. They are not true to scale and do not represent any precise or binding product design.',
      'SKC is a registered trademark under the Trademarks Act. Copying or duplicating products is strictly prohibited.',
      'Only authorized resellers, franchise partners, and distributors appointed by the company are permitted to possess, trade, or sell products offered by SKC. Illegal possession of goods may result in prosecution.',
    ],
  },
  {
    title: 'Availability',
    points: [
      'SKC endeavors to maintain sufficient stock of the products mentioned in this price list.',
      'Orders above average quantity that are not in stock will be communicated and supplied in due course as specified or agreed by the customer in writing.',
      'Customers are requested to reconfirm stock position before making commitments to their own customers.',
    ],
  },
  {
    title: 'Prices',
    points: [
      'All previous prices are superseded by this list price, including prior price agreements with any party.',
      'All prices are subject to change without notice.',
      'All prices mentioned are Maximum Retail Prices (M.R.P.), inclusive of applicable taxes for the end user.',
      'All prices are ex-works and in Indian Rupees (INR) only.',
      'The validity period of this price list also applies to products not explicitly included in the list.',
      'All information is subject to typographical and printing errors, for which no liability will be accepted.',
    ],
  },
  {
    title: 'Tax & Freight',
    points: [
      'Packing, forwarding, and bardan charges must be borne by the buyer.',
      'CGST + SGST for Maharashtra and IGST for other states apply after the standard discount on MRP.',
      'Additional freight charges for urgent deliveries by air, courier, or flight must be borne by the buyer, along with required forms.',
      'Tax rates are subject to change as per government notifications.',
    ],
  },
  {
    title: 'Orders',
    points: [
      'Receipt or possession of this price list does not grant approval to quote or purchase SKC products.',
      'All orders are fulfilled subject to SKC acceptance of quantity and prevailing SKC price at the time of order.',
      'SKC accepts orders via phone, email, fax, SMS, or courier.',
      'SKC reserves the right to decline orders where price or quantity is not satisfactory.',
      'Any modification to standard product configuration is treated as a special order. Special-order pricing may vary and no credits are issued for returned special orders unless authorized by SKC directors.',
      'Delivery period for special orders is based on manufacturing process timelines.',
      'Accuracy of phone orders is confirmed by receipt of a written sales order form and acceptance of the same. The order reference on the form will be used for tracking.',
    ],
  },
  {
    title: 'Invoice',
    points: [
      'The final dispatch invoice will be sent for confirmation just before dispatch, and written confirmation is required from the buyer.',
      'Any correction in quantity, price, or product details must be made immediately. Goods will leave the warehouse only after confirmation.',
      'No changes will be accepted later.',
    ],
  },
  {
    title: 'Cancellations & Minimum Charge',
    points: [
      'Orders cannot be cancelled after written or oral confirmation.',
      'For handling an order below INR 5,000, a minimum charge of INR 300 per invoice applies.',
    ],
  },
  {
    title: 'Delivery',
    points: [
      'SKC endeavors to ship orders promptly, but is not responsible for loss or damage caused by delays due to causes beyond control, including delayed receipt of materials.',
      'Responsibility ceases once goods leave the warehouse.',
      'Goods in transit remain at the buyer\'s risk.',
    ],
  },
  {
    title: 'Claims',
    points: [
      'All claims due to errors or defects must be submitted in writing within 15 days of receipt of goods.',
      'If SKC is responsible, appropriate adjustments will be made and decisions regarding goods will be taken only after written approval from SKC.',
    ],
  },
]


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
        <section className="space-y-8 pb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-700">
          Terms & Conditions
        </p>

      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-700">
          FAQ
        </p>

        <div className="space-y-3">
          {policySections.map((section, index) => (
            <details
              key={section.title}
              className="group rounded-[1.25rem] border border-surface-200 bg-white shadow-sm open:border-accent-300 open:shadow-[0_10px_28px_rgba(180,83,9,0.14)]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-800">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-lg font-bold text-surface-900">{section.title}</span>
                </div>
                <span className="text-accent-700 transition-transform group-open:rotate-180">⌄</span>
              </summary>

              <div className="border-t border-surface-100 px-5 py-4">
                <ul className="space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm leading-7 text-surface-700 sm:text-base">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>
    </section>
      
    </>
  );
}
// testing git