'use client';

import Header from '../../components/Header';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      
      <div className="is-guidance-wrap">
        <main className="is-page-main is-guidance-main">
          <section className="is-kv is-kv-lower is-kv-lower-guidance">
            <div className="ttl-primary">
              <h2>
                <span className="jp">利用規約</span>
                <span className="en"><i>TERMS OF SERVICE</i></span>
              </h2>
            </div>
          </section>
          
          <section className="is-guidance-inner">
            <div className="is-guidance-box">
              <p>このオンラインショップ利用規約（以下「本規約」といいます）は、[貴社名]（以下「当社」といいます）が提供するオンラインショップ（以下「本ショップ」といいます）の利用に関する条件を定めたものです。本ショップをご利用いただく前に、以下の内容をよくお読みいただき、同意の上でご利用ください。</p>
            </div>

            <div className="is-guidance-box">
              <h3>目的</h3>
              <p>本規約は、当社が運営するオンラインショップにおいて、学校や塾向けに販売されるIoT製品（以下「本製品」といいます）の購入、返品、配送、支払いに関する条件を定めることを目的としています。</p>
            </div>

            {/* 会員登録は現在非表示 */}
            {/* <div className="is-guidance-box">
              <h3>会員登録</h3>
              <ul className="bullets">
                <li className="bullets_item">本ショップをご利用いただくためには、会員登録が必要です。会員登録は、当社所定の手続きに従って行ってください。</li>
                <li className="bullets_item">会員登録時に提供された情報は、正確かつ最新の情報を提供するものとし、登録情報に変更があった場合は速やかに更新してください。</li>
              </ul>
            </div> */}

            <div className="is-guidance-box">
              <h3>商品の購入</h3>
              <ul className="bullets">
                <li className="bullets_item">本ショップにおける商品の購入は、当社が指定する手順に従って行っていただきます。購入手続きが完了した時点で、売買契約が成立したものとみなします。</li>
                {/* 会員登録は現在非表示 */}
                {/* <li className="bullets_item">会員登録時に提供された情報は、正確かつ最新の情報を提供するものとし、登録情報に変更があった場合は速やかに更新してください。</li> */}
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>支払い</h3>
              <ul className="bullets">
                <li className="bullets_item">商品の代金は、注文時に選択した支払い方法でお支払いいただきます。</li>
                <li className="bullets_item">支払い方法には、クレジットカード、銀行振込、その他当社が指定する方法が含まれます。詳細は本ショップの決済ページをご確認ください。</li>
                <li className="bullets_item">支払いが完了した後に商品が出荷されます。支払いが確認できない場合、注文がキャンセルされることがあります。</li>
              </ul>
            </div>

            <div className="is-guidance-box" id="shipping">
              <h3>送料と配送</h3>
              <ul className="bullets">
                <li className="bullets_item">送料は、注文時に表示される金額に基づいて計算されます。配送先や配送方法によって異なる場合がありますので、注文時に確認してください。</li>
                <li className="bullets_item">配送は、当社指定の配送業者を利用し、通常の配送手続きを行います。配送に関する詳細な情報は、本ショップの配送ページをご確認ください。</li>
                <li className="bullets_item">配送が完了した時点で、商品が指定の住所に届くことを確認する責任が、お客様にあることをご了承ください。</li>
              </ul>
            </div>

            <div className="is-guidance-box" id="returns">
              <h3>返品・交換</h3>
              <ul className="bullets">
                <li className="bullets_item">商品に不具合があった場合、または注文した商品と異なる場合は、商品到着後[一定期間]以内にご連絡ください。適切な対応を行い、返品または交換を受け付けます。</li>
                <li className="bullets_item">商品の状態によっては、返品や交換ができない場合があります。詳細は本ショップの返品ポリシーをご確認ください。</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>知的財産権</h3>
              <p>本ショップ内のすべてのコンテンツ、製品画像、ロゴ、商標、テキスト、グラフィックなどは、当社またはそのライセンサーの所有物です。無断での複製、転載、配布は禁じられています。</p>
            </div>

            <div className="is-guidance-box">
              <h3>禁止事項</h3>
              <p>お客様は、本ショップを利用するにあたり、以下の行為を行ってはならないものとします。</p>
              <ul className="bullets">
                <li className="bullets_item">法令に違反する行為</li>
                <li className="bullets_item">当社または第三者の知的財産権を侵害する行為</li>
                <li className="bullets_item">他のお客様や当社に対する誹謗中傷、嫌がらせ、または不正アクセス行為</li>
                <li className="bullets_item">その他、当社が不適切と判断する行為</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>免責事項</h3>
              <ul className="bullets">
                <li className="bullets_item">当社は、本ショップに掲載された情報の正確性を保証するものではありません。万が一、情報に誤りがあった場合でも、当社は責任を負いません。</li>
                <li className="bullets_item">本ショップの利用に関連して発生したいかなる損害についても、当社は責任を負いません。</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>個人情報の取り扱い</h3>
              <p>お客様の個人情報は、当社のプライバシーポリシーに基づき適切に管理されます。詳細については、プライバシーポリシーをご確認ください。</p>
            </div>

            <div className="is-guidance-box">
              <h3>規約の変更</h3>
              <p>本規約は、予告なく変更されることがあります。変更後の規約は、本ショップのページに掲載された時点で効力を生じます。</p>
            </div>

            <div className="is-guidance-box">
              <h3>準拠法と裁判管轄</h3>
              <ul className="bullets">
                <li className="bullets_item">本規約は、日本の法令に基づき解釈されます。</li>
                <li className="bullets_item">本ショップに関連する紛争については、当社の所在地を管轄する裁判所を第一審の裁判所とします。</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>お問い合わせ</h3>
              <p>
                本プライバシーポリシーに関するご質問や、ご自身の個人情報に関するお問い合わせは、下記の連絡先までご連絡ください。<br />
                法人名: 株式会社V-Growth<br />
                所在地: 〒105-0011 東京都港区芝公園2-10-1 住友不動産芝園ビル 8F<br />
                電話番号: 03-6777-5120<br />
                メールアドレス: edu-ict@v-growth.co.jp
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
