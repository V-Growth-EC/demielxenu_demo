'use client';

import Header from '../../components/Header';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      
      <div className="is-guidance-wrap">
        <main className="is-page-main is-guidance-main">
          <section className="is-kv is-kv-lower is-kv-lower-guidance">
            <div className="ttl-primary">
              <h2>
                <span className="jp">プライバシーポリシー</span>
                <span className="en"><i>PRIVACY POLICY</i></span>
              </h2>
            </div>
          </section>
          
          <section className="is-guidance-inner">
            <div className="is-guidance-box">
              <h3>はじめに</h3>
              <p>株式会社[貴社名]（以下「当社」）は、ユーザーの個人情報の保護を重要視し、個人情報を適切に取り扱うことをお約束します。このプライバシーポリシーは、当社が収集する個人情報の種類、収集方法、利用目的、保護対策、共有先、ユーザーの権利などに関する情報を記載しています。当社のサービスをご利用いただく際は、以下の内容をご確認のうえ、同意いただいたものとみなされます。</p>
            </div>

            <div className="is-guidance-box">
              <h3>収集する個人情報</h3>
              <p>当社は、以下の情報を収集することがあります。</p>
              <ul className="bullets">
                <li className="bullets_item">氏名、住所、メールアドレス、電話番号など、ユーザーが提供する個人情報</li>
                <li className="bullets_item">IPアドレス、ブラウザの種類、アクセス日時など、ユーザーのアクセス情報</li>
                <li className="bullets_item">支払い情報（必要に応じて）</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>個人情報の利用目的</h3>
              <p>当社は、収集した個人情報を以下の目的で利用いたします。</p>
              <ul className="bullets">
                <li className="bullets_item">サービスの提供・運営</li>
                <li className="bullets_item">ユーザーからのお問い合わせ対応</li>
                <li className="bullets_item">ご利用のサービスに関する情報やお知らせの送信</li>
                <li className="bullets_item">ユーザーからの同意を得た場合のプロモーション活動</li>
                <li className="bullets_item">サービス向上のための分析・改善</li>
                <li className="bullets_item">法令に基づく対応</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>個人情報の保護</h3>
              <p>当社は、ユーザーの個人情報を適切に保護するために、以下の対策を講じています。</p>
              <ul className="bullets">
                <li className="bullets_item">情報セキュリティ: 暗号化やファイアウォールの使用など、情報の漏洩や改ざんを防ぐための技術的措置を実施しています。</li>
                <li className="bullets_item">アクセス制限: 個人情報にアクセスできる者を最小限にし、管理者による厳格な監視を行っています。</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>個人情報の第三者提供</h3>
              <p>当社は、以下の場合を除き、収集した個人情報を第三者に提供することはありません。</p>
              <ul className="bullets">
                <li className="bullets_item">ユーザーの同意を得た場合</li>
                <li className="bullets_item">法令に基づく開示が必要な場合</li>
                <li className="bullets_item">事業譲渡等による会社の変更がある場合</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>クッキー（Cookie）の使用</h3>
              <p>当社は、サービスの提供や利用状況の分析、広告配信などを目的として、クッキー（Cookie）を使用しています。クッキーは、ユーザーのデバイスに保存される小さなデータであり、ユーザーの閲覧履歴を記録するために利用されます。ブラウザの設定でクッキーの使用を制限することができますが、その場合、当社のサービスの一部が正しく機能しない場合があります。</p>
            </div>

            <div className="is-guidance-box">
              <h3>ユーザーの権利</h3>
              <p>ユーザーは、当社が保有する個人情報に対して、以下の権利を行使することができます。</p>
              <ul className="bullets">
                <li className="bullets_item">情報の開示: 自分の個人情報が当社に保管されているか、またその内容について開示を求めることができます。</li>
                <li className="bullets_item">訂正・削除: 不正確な情報の訂正や、不要な情報の削除を求めることができます。</li>
                <li className="bullets_item">利用停止・拒否: 自分の個人情報の利用を停止または拒否することができます。</li>
              </ul>
            </div>

            <div className="is-guidance-box">
              <h3>個人情報の管理</h3>
              <p>当社は、ユーザーの個人情報を適切に管理し、一定期間を過ぎた個人情報や不要になった個人情報は、安全に破棄いたします。</p>
            </div>

            <div className="is-guidance-box">
              <h3>プライバシーポリシーの変更</h3>
              <p>本プライバシーポリシーは、法令の変更やサービスの改善に伴い、予告なく変更されることがあります。変更があった場合は、当社のウェブサイトにて新しいポリシーを公開いたします。重要な変更がある場合は、事前に通知することがあります。</p>
            </div>

            <div className="is-guidance-box">
              <h3>お問い合わせ</h3>
              <p id="contact">
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
