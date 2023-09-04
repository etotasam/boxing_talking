import React, { useEffect, useState } from "react";

export const TestModule = () => {
  const ORGANIZATIONS = {
    WBA: "WBA",
    WBC: "WBC",
    WBO: "WBO",
    IBF: "IBF",
  } as const;

  const WEIGHT_CLASS = {
    Heavy: "ヘビー級",
    Curiser: "クルーザー",
    Light_Heavy: "ライトヘビー",
    Super_Middle: "Sミドル",
    Middle: "ミドル",
    Super_Welter: "Sウェルター",
    Welter: "ウェルター",
    Super_Light: "Sライト",
    Light: "ライト",
    Super_Feather: "Sフェザー",
    Feather: "フェザー",
    Super_Bantam: "Sバンタム",
    Bantam: "バンタム",
    Super_Fly: "Sフライ",
    Fly: "フライ",
    Light_Fly: "Lフライ",
    Minimum: "ミニマム",
  } as const;

  // ? タイトル保持かどうか
  const [hasBelt, setHasBelt] = useState(false);

  // ? タイトル保持のチェックボックスの値
  const [countHasBelt, setCountHasBelt] = useState(1);

  type TitleType = {
    organization:
      | (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS]
      | undefined;
    weightClass: (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS] | undefined;
  };

  // ! 保持タイトルState
  const [titles, setTitles] = useState<TitleType[]>([]);
  console.log(titles);

  // ? 団体と階級を選択した場合入力欄を追加
  useEffect(() => {
    const lastIndex = titles.length - 1;
    if (!titles[lastIndex]?.weightClass) return;
    setCountHasBelt(titles.length + 1);
  }, [titles]);

  // ? タイトル保持のチェックボックがoffの時、タイトル情報の配列をリセット
  useEffect(() => {
    if (!hasBelt) {
      setTitles([]);
    }
  }, [hasBelt]);

  return (
    <>
      <section className="bg-gray-400">
        {/* //? 保持タイトル */}
        <div className="mt-3">
          <label>
            <input
              className="mr-2"
              type="checkbox"
              checked={hasBelt}
              onChange={(e) => setHasBelt(e.target.checked)}
            />
            タイトル保持
          </label>
        </div>
        {hasBelt &&
          Array.from({ length: countHasBelt }, (_, index) => index).map(
            (key, i) => (
              <div key={key} className="flex">
                {/* //? 団体選択 */}
                <div className="mt-3 flex p-1">
                  <select
                    value={titles[i] ? titles[i].organization : ""}
                    onChange={(e) =>
                      setTitles((curr) => {
                        const copyTitles = [...curr];
                        if (!e.target.value) {
                          delete copyTitles[i];
                          return copyTitles.filter((obj) => obj !== undefined);
                        }
                        copyTitles[i] = {
                          ...copyTitles[i],
                          organization: e.target
                            .value as (typeof ORGANIZATIONS)[keyof typeof ORGANIZATIONS],
                        };
                        return copyTitles;
                      })
                    }
                    // name="boxing-style"
                    // id="organzation"
                  >
                    <option value=""></option>
                    {(
                      Object.keys(ORGANIZATIONS) as Array<
                        keyof typeof ORGANIZATIONS
                      >
                    ).map((key) => (
                      <option key={key} value={ORGANIZATIONS[key]}>
                        {ORGANIZATIONS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                {/* //? 階級選択 */}
                {titles[i] && titles[i].organization && (
                  <div className="mt-3 flex p-1">
                    <select
                      value={titles[i].weightClass}
                      onChange={(e) =>
                        setTitles((curr) => {
                          const copyTitles = [...curr];
                          if (!e.target.value) {
                            delete copyTitles[i].weightClass;
                            return copyTitles;
                          }
                          copyTitles[i] = {
                            ...copyTitles[i],
                            weightClass: e.target
                              .value as (typeof WEIGHT_CLASS)[keyof typeof WEIGHT_CLASS],
                          };
                          return copyTitles;
                        })
                      }
                      // name="aaaaaaaa"
                      // id="class"
                    >
                      <option value=""></option>
                      {(
                        Object.keys(WEIGHT_CLASS) as Array<
                          keyof typeof WEIGHT_CLASS
                        >
                      ).map((key) => (
                        <option key={key} value={WEIGHT_CLASS[key]}>
                          {WEIGHT_CLASS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          )}
      </section>
    </>
  );
};
