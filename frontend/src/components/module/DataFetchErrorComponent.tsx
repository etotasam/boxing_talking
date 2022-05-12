export const DataFetchErrorComponent = () => {
  return (
    <div className="flex justify-center items-center w-full min-h-[100vh]">
      <div className="flex flex-col items-center justify-center px-10 py-3 rounded bg-green-600 text-white text-xl">
        <span>データの取得に失敗しました</span>
        <span>再度データの取得をする為に画面を更新してください</span>
      </div>
    </div>
  );
};
