import { BLOOD_TYPES } from '../../../constants';
import type { BloodType } from '../../../types/common';
import type { EnrichedDonor } from './eligibilityConstants';
import type { EligibilityStats } from '../../../types/donor';

interface BloodTypeBarProps {
  enriched?: EnrichedDonor[];
  stats?: EligibilityStats;
  filterBlood: BloodType | 'all';
  onToggle: (type: BloodType | 'all') => void;
}

export default function BloodTypeBar({ enriched = [], stats, filterBlood, onToggle }: BloodTypeBarProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <h3 className="text-foreground mb-4" style={{ fontSize: '14px', fontWeight: 700 }}>
        المؤهلون حسب الفصيلة
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {BLOOD_TYPES.map((type) => {
          let typeElig = 0;
          let typeTotal = 0;

          if (stats?.bloodTypeCounts?.[type]) {
            typeElig = stats.bloodTypeCounts[type].eligible;
            typeTotal = stats.bloodTypeCounts[type].total;
          } else {
            typeElig = enriched.filter(
              (d) => d.bloodType === type && d.eligibility?.status === 'eligible',
            ).length;
            typeTotal = enriched.filter((d) => d.bloodType === type).length;
          }

          return (
            <button
              key={type}
              onClick={() => onToggle(filterBlood === type ? 'all' : type)}
              className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ease-in-out cursor-pointer ${
                filterBlood === type
                  ? 'border-green-400 bg-green-50 dark:border-green-500 dark:bg-green-950/25 ring-2 ring-green-400/20'
                  : 'border-border bg-muted/40 dark:bg-muted/5 hover:border-green-400 dark:hover:border-green-400 hover:bg-green-50/20 dark:hover:bg-green-950/20 hover:shadow-md dark:hover:shadow-[0_0_12px_rgba(77,158,120,0.25)] hover:scale-102'
              }`}
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
              <span className="block text-muted-foreground" style={{ fontSize: '10px' }}>
                / {typeTotal}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
