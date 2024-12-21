import { Helmet } from 'react-helmet-async';
//! layout
import TermsLayout from '@/layout/TermsLayout';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;
export const Terms = () => {
  return (
    <TermsLayout>
      <Helmet>
        <title>利用規約 | {siteTitle}</title>
      </Helmet>
      <div className="text-stone-800 w-full flex justify-center items-center">
        <div className="max-w-[1000px] md:w-[80%] w-[90%] my-10">
          <h1 className="text-center text-[26px]">利用規約</h1>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第1条 定義</h2>

            <p className="mb-2">
              本規約において、次の各号に定める用語は、それぞれ当該各号に定める意味を有するものとします。
            </p>
            <ul>
              <li className="mt-1">
                1.
                「本サービス」とは当ウェブサイト上で提供するサービスを意味します。
              </li>
              <li className="mt-1">
                2. 「ユーザー」とは、本サービスを利用する者を意味します。
              </li>
              <li className="mt-1">
                3.
                「アカウント」とは、本サービスを利用するために必要な識別情報を意味します。
              </li>
            </ul>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第2条 利用開始</h2>

            <p className="mb-2">
              ユーザーは、本サービスを利用するために、アカウント(ゲストアカウント含む)を作成する必要があります。
            </p>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第3条 利用制限</h2>

            <p className="mb-2">
              本サービスは、ユーザーが以下の各号に該当する場合、利用を制限または停止することがあります。
            </p>
            <ul>
              <li className="mt-1">1. 本規約に違反した場合</li>
              <li className="mt-1">
                2. 本サービスのシステムに支障を与える行為をした場合
              </li>
              <li className="mt-1">
                3. 本サービスの運営を妨害する行為をした場合
              </li>
              <li className="mt-1">
                4.
                本サービスの利用を通じて、他のユーザーまたは第三者に損害を与える行為をした場合
              </li>
              <li className="mt-1">
                5. その他、本サービスの利用を適当でないと判断した場合
              </li>
            </ul>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第4条 禁止事項</h2>

            <p className="mb-2">
              ユーザーは、本サービスを利用するにあたり、以下の各号に定める行為を行ってはなりません。
            </p>
            <ul>
              <li className="mt-1">1. 本サービスの利用規約に違反する行為</li>
              <li className="mt-1">
                2.
                本サービスのシステムまたはサーバーへの不正アクセスまたは侵入を試みる行為
              </li>
              <li className="mt-1">
                3.
                本サービスのソフトウェアまたはコンテンツを改変または複製する行為
              </li>
              <li className="mt-1">
                4.
                本サービスの利用を通じて、他のユーザーまたは第三者に不利益または損害を与える行為
              </li>
              <li className="mt-1">
                5.
                本サービスの利用を通じて、公序良俗に反する行為または法令に違反する行為
              </li>
              <li className="mt-1">6. その他、不適切と判断する行為</li>
            </ul>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第5条 免責事項</h2>

            <p className="mb-2">
              本サービスの利用に起因してユーザーまたは第三者が被った損害について、一切の責任を負わないものとします。
              <br />
              ただし、当社の故意または重大な過失による損害については、この限りではありません。
            </p>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">
              第6条 個人情報の取り扱い
            </h2>

            <p className="mb-2">
              ユーザーの個人情報を、本サービスの提供および運営のために必要な範囲内で利用します。当社は、ユーザーの個人情報を第三者に提供または開示することはありません。
              <br />
              ただし、法令に基づき開示を求められた場合、または当社の権利利益を保護するために必要であると判断した場合は、この限りではありません。
            </p>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">第7条 変更・終了</h2>

            <p className="mb-2">
              当社は、本規約を随時変更することができるものとします。変更後の本規約は、本サイトに掲載された日から効力を生じるものとします。
            </p>
          </div>
          <div className="mt-10">
            <h2 className="font-bold text-[18px] mb-3">
              第8条 準拠法・管轄裁判所
            </h2>
          </div>
          <p className="mb-2">
            本規約の解釈および適用は、日本法に準拠するものとします。本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </div>
      </div>
    </TermsLayout>
  );
};
