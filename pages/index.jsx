'use client';
import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";

const gsaData = {
  "Dallas, TX": { housing: 910, meals: 430 },
  "New York, NY": { housing: 1200, meals: 550 },
  "Los Angeles, CA": { housing: 1050, meals: 510 },
  "Chicago, IL": { housing: 980, meals: 480 },
  // Add more destinations here as needed...
};

export default function RecruiterMarginCalc() {
  const resultRef = useRef(null);
  const [destination, setDestination] = useState("Dallas, TX");
  const [school, setSchool] = useState("Christa McAuliffe");
  const [clientRate, setClientRate] = useState(78);
  const [margin, setMargin] = useState(0.27);
  const [hoursPerWeek, setHoursPerWeek] = useState(35);
  const [weeksPerYear, setWeeksPerYear] = useState(46);
  const [housing, setHousing] = useState(910);
  const [meals, setMeals] = useState(430);
  const [bonus, setBonus] = useState(0);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const match = gsaData[destination];
    if (match) {
      setHousing(match.housing);
      setMeals(match.meals);
    } else {
      setHousing(0);
      setMeals(0);
    }
  }, [destination]);

  const grossWeekly = clientRate * (1 - margin) * hoursPerWeek;
  const requiredTaxableTotal = 20 * hoursPerWeek;
  const originalStipends = housing + meals;

  const needsAdjustment = grossWeekly - originalStipends < requiredTaxableTotal;
  const scale = needsAdjustment ? Math.max(0, (grossWeekly - requiredTaxableTotal) / originalStipends) : 1;

  const adjustedHousing = parseFloat((housing * scale).toFixed(2));
  const adjustedMeals = parseFloat((meals * scale).toFixed(2));
  const adjustedTaxableHourly = parseFloat(
    ((grossWeekly - adjustedHousing - adjustedMeals) / hoursPerWeek).toFixed(2)
  );

  const taxableWeekly = adjustedTaxableHourly * hoursPerWeek;
  const totalWeekly = taxableWeekly + adjustedHousing + adjustedMeals;
  const weeklyTotalWithBonus = totalWeekly + (bonus + travel) / weeksPerYear;
  const annualIncome = weeklyTotalWithBonus * weeksPerYear;

  const handleDownloadPDF = () => {
    if (resultRef.current) {
      html2pdf()
        .from(resultRef.current)
        .set({ margin: 0.5, filename: 'Recruiter_Margin_Calc.pdf', html2canvas: { scale: 2 } })
        .save();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Recruiter Margin Calculator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Destination <span className="text-gray-500">(City for assignment)</span></label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-2 border rounded">
            {Object.keys(gsaData).map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">School <span className="text-gray-500">(Client name or facility)</span></label>
          <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Charged to Client / Hour <span className="text-gray-500">(Bill rate)</span></label>
          <input type="number" value={clientRate} onChange={(e) => setClientRate(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Margin (%) <span className="text-gray-500">(e.g. 0.27 = 27%)</span></label>
          <input type="number" value={margin} onChange={(e) => setMargin(parseFloat(e.target.value))} step="0.01" className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Hours / Week <span className="text-gray-500">(Typically 35)</span></label>
          <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Weeks / Year <span className="text-gray-500">(Typically 46)</span></label>
          <input type="number" value={weeksPerYear} onChange={(e) => setWeeksPerYear(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Housing / Week (GSA)</label>
          <input type="number" value={housing} disabled className="w-full p-2 border bg-gray-100 rounded" />
        </div>
        <div>
          <label className="block font-medium">Meals / Week (GSA)</label>
          <input type="number" value={meals} disabled className="w-full p-2 border bg-gray-100 rounded" />
        </div>
        <div>
          <label className="block font-medium">Bonus <span className="text-gray-500">(Total bonus over full assignment)</span></label>
          <input type="number" value={bonus} onChange={(e) => setBonus(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block font-medium">Travel <span className="text-gray-500">(Total travel reimbursement)</span></label>
          <input type="number" value={travel} onChange={(e) => setTravel(parseFloat(e.target.value))} className="w-full p-2 border rounded" />
        </div>
      </div>

      <div className="mt-10 border-t pt-6" ref={resultRef}>
        <h3 className="text-xl font-semibold mb-2">Results</h3>
        <div className="space-y-1 text-gray-800">
          <div>Gross Weekly Income: <strong>${grossWeekly.toFixed(2)}</strong></div>
          <div>Adjusted Housing: <strong>${adjustedHousing}</strong></div>
          <div>Adjusted Meals: <strong>${adjustedMeals}</strong></div>
          <div>Adjusted Taxable Hourly: <strong>${adjustedTaxableHourly}</strong></div>
          <div>Weekly Taxable Wages: <strong>${taxableWeekly.toFixed(2)}</strong></div>
          <div>Total Weekly Comp (No Bonus): <strong>${totalWeekly.toFixed(2)}</strong></div>
          <div>Bonus + Travel Spread Weekly: <strong>${((bonus + travel) / weeksPerYear).toFixed(2)}</strong></div>
          <div className="text-lg">Total Weekly Comp (With Bonus): <strong>${weeklyTotalWithBonus.toFixed(2)}</strong></div>
          <div className="text-lg">Annualized Income: <strong>${annualIncome.toFixed(2)}</strong></div>
          {needsAdjustment && (
            <div className="text-sm text-red-600">* GSA stipends were scaled down to ensure minimum taxable hourly of $20</div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save as PDF
        </button>
      </div>
    </div>
  );
}
