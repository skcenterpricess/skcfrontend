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
    <section className="space-y-8 pb-4">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-accent-200/70 bg-gradient-to-br from-accent-50 via-white to-accent-100/80 px-6 py-10 shadow-[0_22px_70px_rgba(180,83,9,0.18)] sm:px-8 lg:px-10">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-200/60 blur-2xl" />
        <div className="absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-accent-400/25 blur-2xl" />
        <div className="relative max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-accent-700">
            SKC Enterprises
          </p>
          <h1 className="text-4xl font-black leading-tight text-surface-900 sm:text-5xl">
            Disclaimer, Pricing Policy, and Order Terms
          </h1>
          <p className="text-base leading-8 text-surface-700 sm:text-lg">
            Review the official SKC commercial terms below. Open each section to quickly read what applies to stock, prices, taxes, orders, dispatch, and claims.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-700">
          Interactive Policy Sections
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
  )
}
