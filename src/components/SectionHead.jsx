export default function SectionHead({ num, story, eyebrow, heading, className = "mb-12" }) {
  return (
    <div className={className}>
      {story && <p className="reveal story-line">{story}</p>}
      <div className="reveal flex items-center gap-3 mb-4">
        <span className="chip-num">{num}</span>
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2 className="fade-words text-[clamp(2.2rem,5vw,3.6rem)] font-medium max-w-3xl">{heading}</h2>
    </div>
  );
}
