import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';

export const BoxerResume = (props: {
  resume: { win: number; ko: number; draw: number; lose: number };
  setBoxerFieldData: LocalDataEntryType;
}) => {
  const { resume, setBoxerFieldData } = props;
  return (
    <div className="flex w-full">
      <div className="mt-3 flex p-1">
        <label htmlFor="win">win</label>
        <input
          className="w-full"
          value={resume.win}
          onChange={(e) => setBoxerFieldData('win', Number(e.target.value))}
          type="number"
          min="0"
          id="win"
        />
      </div>

      <div className="mt-3 flex p-1">
        <label htmlFor="ko">ko</label>
        <input
          className="w-full"
          value={resume.ko}
          onChange={(e) => setBoxerFieldData('ko', Number(e.target.value))}
          type="number"
          min="0"
          id="ko"
        />
      </div>

      <div className="mt-3 flex p-1">
        <label htmlFor="draw">draw</label>
        <input
          className="w-full"
          value={resume.draw}
          onChange={(e) => setBoxerFieldData('draw', Number(e.target.value))}
          type="number"
          min="0"
          id="draw"
        />
      </div>

      <div className="mt-3 flex p-1">
        <label htmlFor="lose">lose</label>
        <input
          className="w-full"
          value={resume.lose}
          onChange={(e) => setBoxerFieldData('lose', Number(e.target.value))}
          type="number"
          min="0"
          id="lose"
        />
      </div>
    </div>
  );
};
