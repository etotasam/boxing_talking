import React, { useEffect, useState } from "react";

export const TestModule = () => {
  const word = "?name=inoue&country=Japan&page=2";

  console.log(word.slice(1).split("&"));

  return (
    <>
      <h1>test</h1>
    </>
  );
};
