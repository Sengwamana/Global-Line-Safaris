const timeline = [
  {
    year: "2015",
    title: "Humble Beginnings",
    description:
      "Raymond Shumbusho begins his journey in tourism as a driver, developing a deep passion for Rwanda's natural beauty and cultural heritage.",
  },
  {
    year: "2017",
    title: "Professional Guide",
    description:
      "After extensive training and hands-on experience, Raymond becomes a professional tourist driver-guide, leading tours across Rwanda and into Uganda.",
  },
  {
    year: "2019",
    title: "Training & Mentorship",
    description:
      "Raymond begins sharing his knowledge through professional tourism training, internships and industrial attachments — helping the next generation of tourism professionals build practical skills.",
  },
  {
    year: "2021",
    title: "Global Line Safaris Founded",
    description:
      "Global Line Safaris is officially established as a full travel company, combining carefully designed safari and tour experiences with professional tourism training and skills development.",
  },
  {
    year: "2023",
    title: "Accredited Training Center",
    description:
      "The company's tourism training center becomes accredited to offer short courses related to tourism through the Rwanda TVET Board, expanding its educational impact.",
  },
  {
    year: "Today",
    title: "Growing Across East Africa",
    description:
      "Global Line Safaris continues to grow as a trusted travel company, serving travellers across Rwanda and East Africa while developing the region's tourism workforce.",
  },
];

export function CompanyTimeline() {
  return (
    <section className="safari-section section-bg-cream">
      <div className="safari-container">
        <div className="editorial-heading">
          <div>
            <div className="safari-eyebrow">
              <span className="safari-eyebrow-line" />
              <span>Our Journey</span>
            </div>
            <h2>How We Got Here</h2>
          </div>
          <p>
            From a single driver with a passion for tourism to a full travel
            company and accredited training center — this is our story.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {timeline.map((item) => (
            <div
              key={item.year}
              className="flex gap-6 border-b border-slate-900/10 py-8 last:border-b-0"
            >
              <div className="w-20 shrink-0 text-right">
                <span className="font-serif text-2xl font-light text-accent">
                  {item.year}
                </span>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-0 top-2 h-full w-px bg-accent/30" />
                <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent" />
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
