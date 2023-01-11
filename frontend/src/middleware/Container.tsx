import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastModal } from "@/components/modal/ToastModal";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "react-query";
//! hooks
import { useFetchMatches } from "@/libs/hooks/useMatches";
import { useAuth } from "@/libs/hooks/useAuth";
import { useToastModal } from "@/libs/hooks/useToastModal";
import { queryKeys } from "@/libs/queryKeys";
//! component
import { LoadingModal } from "@/components/modal/LoadingModal";

const Container = React.memo(() => {
  const queryClient = useQueryClient();
  const { clearToastModaleMessage, isOpenToastModal, message } = useToastModal();
  const [waitId, setWaitId] = React.useState<NodeJS.Timeout>();
  //? メッセージモーダルのタイマーセット
  useEffect(() => {
    if (!isOpenToastModal) return;
    (async () => {
      if (waitId) clearTimeout(waitId);
      await wait(5000);
      clearToastModaleMessage();
    })();
  }, [isOpenToastModal, message]);

  const wait = (ms: number) => {
    return new Promise((resolve) => {
      const id: NodeJS.Timeout = setTimeout(resolve, ms);
      setWaitId(id);
    });
  };

  const { isLoading: isCheckingAuth, isError } = useAuth();
  const { isLoading: isFetchingMatches } = useFetchMatches();

  //? cookieでログインチェック。なければfalseを入れる
  useEffect(() => {
    if (!isError) return;
    queryClient.setQueryData(queryKeys.auth, false);
  }, [isError]);

  return (
    <>
      {/* <Header /> */}
      <Outlet />
      {/* 以下 modal */}
      <AnimatePresence>
        {isOpenToastModal && (
          <motion.div>
            <ToastModal />
          </motion.div>
        )}
      </AnimatePresence>
      {(isCheckingAuth || isFetchingMatches) && <LoadingModal />}
    </>
  );
});

export default Container;
