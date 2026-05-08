import { BLOOD_TYPES } from '../../../constants';
import type { BloodType } from '../../../types/common';
import type { EnrichedDonor } from './eligibilityConstants';

interface BloodTypeBarProps {
  enriched: EnrichedDonor[];
  filterBlood: BloodType | 'all';
  onToggle: (type: BloodType | 'all') => void;
}

export default function BloodTypeBar({ enriched, filterBlood, onToggle }: BloodTypeBarProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h3 className="text-gray-700 mb-4" style={{ fontSize: '14px', fontWeight: 700 }}>
        المؤهلون حسب الفصيلة
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {BLOOD_TYPES.map((type) => {
          const typeElig = enriched.filter(
            (d) => d.bloodType === type && d.elig.status === 'eligible',
          ).length;
          const typeTotal = enriched.filter((d) => d.bloodType === type).length;
          return (
            <button
              key={type}
              onClick={() => onToggle(filterBlood === type ? 'all' : type)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${filterBlood === type ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-green-200'}`}
            >
              <span
                className="block px-1.5 py-0.5 bg-red-50 text-red-600 rounded mb-1 mx-auto w-fit"
                style={{ fontSize: '12px', fontWeight: 800 }}
              >
                {type}
              </span>
              <span className="text-green-600" style={{ fontSize: '18px', fontWeight: 800 }}>
                {typeElig}
              </span>
              <span className="block text-gray-400" style={{ fontSize: '10px' }}>
                / {typeTotal}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
