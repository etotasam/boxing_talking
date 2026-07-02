import clsx from 'clsx';
import { WEIGHT_CLASS } from '@/constants/boxerData';
import type { TitlesStateType, WeightClassType } from '@/types';
import type { BoxerSide } from './helper/boxerRecord';

type BoxerTitlesProps = {
  boxerName: string;
  side: BoxerSide;
  titles: TitlesStateType[];
};

const titlePresentation = {
  new: {
    label: 'New',
    className: 'border-amber-400/60 bg-stone-900/90 text-amber-200',
  },
  still: {
    label: null,
    className: 'border-amber-400/60 bg-stone-900/90 text-amber-200',
  },
  fall: {
    label: null,
    className: 'border-stone-600 bg-stone-800/70 text-stone-500',
  },
  hold: {
    label: null,
    className: 'border-amber-400/60 bg-stone-900/90 text-amber-200',
  },
} as const;

const groupTitlesByWeight = (titles: TitlesStateType[]) => {
  const groupedTitles = titles.reduce<Map<WeightClassType, TitlesStateType[]>>((groups, title) => {
    const list = groups.get(title.weight);
    if (list) {
      list.push(title);
    } else {
      groups.set(title.weight, [title]);
    }
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

  const TITLE_TEXT_SIZE = 'text-[clamp(12px,2.5vw,14px)]';

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
            <h3 className="mb-1.5 text-[clamp(11px,2.3vw,13px)] font-medium text-stone-400">
              {weight}級
            </h3>
            <ul
              className={clsx(
                'flex max-w-full flex-wrap gap-x-2 gap-y-3 pt-1',
                isRedSide ? 'justify-start' : 'justify-end'
              )}
              aria-label={`${weight}級のタイトル団体`}
            >
              {titlesInWeight.map((title) => {
                const state = title.state ?? 'hold';
                const presentation = titlePresentation[state];

                return (
                  <li
                    key={`${title.weight}-${title.organization}`}
                    className={clsx(
                      'relative inline-flex items-center rounded-md border-[2px] px-2.5 py-1.5 font-black leading-none',
                      TITLE_TEXT_SIZE,
                      presentation.className
                    )}
                  >
                    <span>{title.organization}</span>
                    {presentation.label && (
                      <span className="absolute -right-1.5 -top-2 rounded-full border border-yellow-200 bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black leading-none text-stone-950 shadow-md no-underline">
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
