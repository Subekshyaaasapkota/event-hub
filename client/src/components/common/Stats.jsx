import React from "react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const Stats = () => {
  const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.3,
  });

  const stats = [
  { number: 120, suffix: "+", label: "Events Hosted" },
  { number: 3500, suffix: "+", label: "Students Registered" },
  { number: 45, suffix: "+", label: "Active Organizers" },
  { number: 12, suffix: "+", label: "Departments" },
  ];

  return (
  <section className="py-20 bg-white border-t border-gray-200">
  <div ref={ref} className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
  {stats.map((stat, index) => (
  <div key={index}>
  <h3 className="text-3xl md:text-4xl font-semibold text-[#4F46E5]">
  {inView && <CountUp end={stat.number} duration={2} suffix={stat.suffix} />}
  </h3>
  <p className="mt-2 text-sm text-[#475569] tracking-wide">{stat.label}</p>
  </div>
  ))}
  </div>
  </section>
  );
};

export default Stats;
