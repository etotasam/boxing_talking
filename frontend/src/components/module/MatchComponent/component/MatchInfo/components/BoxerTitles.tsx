import clsx from 'clsx';
import { WEIGHT_CLASS } from '@/constants/boxerData';
import type { TitlesStateType, WeightClassType } from '@/types';
import type { BoxerSide } from './helper/boxerRecord';

type BoxerTitlesProps = {
  boxerName: string;
  side: BoxerSide;
  titles: TitlesStateType[];
};

const titleStatePresentation = {
  new: {
    label: '獲得',
    className: 'border-yellow-400 text-yellow-200',
  },
  still: {
    label: '防衛',
    className: 'border-blue-400 text-blue-200',
  },
  fall: {
    label: '失冠',
    className: 'border-stone-600 text-stone-500',
  },
  hold: {
    label: null,
    className: 'border-amber-400/60 text-amber-200',
  },
} as const;

const groupTitlesByWeight = (titles: TitlesStateType[]) => {
  const groupedTitles = titles.reduce<Map<WeightClassType, TitlesStateType[]>>((groups, title) => {
    const titlesInWeight = groups.get(title.weight) ?? [];
    groups.set(title.weight, [...titlesInWeight, title]);
    return groups;
  }, new Map());

  return Object.values(WEIGHT_CLASS).flatMap((weight) => {
    const titlesInWeight = groupedTitles.get(weight);
    return titlesInWeight ? [{ weight, titles: titlesInWeight }] : [];
  });
};

export const BoxerTitles = ({ boxerName, side, titles }: BoxerTitlesProps) => {
  if (titles.length === 0) return null;

  const isRedSide = side === 'red';
  const titleGroups = groupTitlesByWeight(titles);

  return (
    <section
      className={clsx(
        'mt-3 flex max-w-full flex-col gap-2',
        isRedSide ? 'items-start' : 'items-end'
      )}
      aria-label={`${boxerName}の保持タイトル`}
    >
      {titleGroups.map(({ weight, titles: titlesInWeight }) => {
        return (
          <div key={weight} className={clsx('max-w-full', !isRedSide && 'text-right')}>
            <h3 className="mb-1 text-[clamp(9px,2.2vw,11px)] font-medium text-stone-400">
              {weight}級
            </h3>
            <ul
              className={clsx(
                'flex max-w-full flex-wrap gap-1',
                isRedSide ? 'justify-start' : 'justify-end'
              )}
              aria-label={`${weight}級のタイトル団体`}
            >
              {titlesInWeight.map((title) => {
                const presentation = titleStatePresentation[title.state ?? 'hold'];

                return (
                  <li
                    key={title.organization}
                    className={clsx(
                      'inline-flex items-center gap-1 rounded border px-1.5 py-0.5',
                      'text-[clamp(9px,2.2vw,11px)] font-black leading-none',
                      presentation.className
                    )}
                  >
                    <span className={clsx(title.state === 'fall' && 'line-through')}>
                      {title.organization}
                    </span>
                    {presentation.label && (
                      <span className="text-[0.72em] font-bold no-underline">
                        {presentation.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
};
