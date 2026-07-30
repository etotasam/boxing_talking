import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { GiBodyHeight, GiHighPunch } from 'react-icons/gi';
import { ImAccessibility } from 'react-icons/im';
import { MdPermContactCalendar } from 'react-icons/md';
import { BOXER_STANCE_LABELS } from '@/constants/boxerData';
import type { BoxerType, MatchDataType } from '@/types';

type TaleOfTheTapeProps = Pick<MatchDataType, 'redBoxer' | 'blueBoxer' | 'matchDate'>;

type ComparisonRow = {
  icon: ReactNode;
  label: string;
  red: string;
  blue: string;
};

const getAge = (birth: BoxerType['birth'], matchDate: MatchDataType['matchDate']) => {
  const currentDate = dayjs();
  const fightDate = dayjs(matchDate);
  const targetDate = currentDate.isBefore(fightDate) ? currentDate : fightDate;

  return targetDate.diff(dayjs(birth), 'year').toString();
};

const formatCentimeters = (value: number) => (value ? `${value}cm` : '-');

export const TaleOfTheTape = ({ redBoxer, blueBoxer, matchDate }: TaleOfTheTapeProps) => {
  const comparisonRows: ComparisonRow[] = [
    {
      icon: <MdPermContactCalendar className="text-base pc:text-xl" aria-hidden="true" />,
      label: '年齢',
      red: getAge(redBoxer.birth, matchDate),
      blue: getAge(blueBoxer.birth, matchDate),
    },
    {
      icon: <GiBodyHeight className="text-base pc:text-xl" aria-hidden="true" />,
      label: '身長',
      red: formatCentimeters(redBoxer.height),
      blue: formatCentimeters(blueBoxer.height),
    },
    {
      icon: <ImAccessibility className="text-base pc:text-xl" aria-hidden="true" />,
      label: 'リーチ',
      red: formatCentimeters(redBoxer.reach),
      blue: formatCentimeters(blueBoxer.reach),
    },
    {
      icon: <GiHighPunch className="text-base pc:text-xl" aria-hidden="true" />,
      label: 'スタイル',
      red: BOXER_STANCE_LABELS[redBoxer.style],
      blue: BOXER_STANCE_LABELS[blueBoxer.style],
    },
  ];

  return (
    <section className="mt-5 w-full text-white" aria-labelledby="tale-of-the-tape-title">
      <div className="mt-2 overflow-hidden rounded-lg border border-stone-600 bg-stone-500/10">
        <div className="flex items-center gap-3 px-4 border-b border-stone-600 py-3">
          <span className="h-[2px] flex-1 bg-stone-400" aria-hidden="true" />
          <h2 id="tale-of-the-tape-title" className="shrink-0 text-base font-bold pc:text-xl">
            Tale of the Tape
          </h2>
          <span className="h-[2px] flex-1 bg-stone-400" aria-hidden="true" />
        </div>
        <table className="w-full table-fixed border-collapse text-center">
          <tbody>
            {comparisonRows.map(({ icon, label, red, blue }) => (
              <tr key={label} className="border-b border-stone-600 last:border-b-0">
                <td className="w-[34%] px-1 py-2 text-sm font-bold text-red-400 pc:text-lg">
                  {red}
                </td>
                <th
                  scope="row"
                  className="w-[32%] border-x border-stone-600 px-1 py-2 text-xs font-medium text-stone-200 pc:text-base"
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    {icon}
                    {label}
                  </span>
                </th>
                <td className="w-[34%] px-1 py-2 text-sm font-bold text-blue-400 pc:text-lg">
                  {blue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
