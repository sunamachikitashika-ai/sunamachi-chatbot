const SYSTEM_PROMPT = `あなたは砂町北歯科の受付AIアシスタント「さくら」です。
患者さんからの質問に、明るく丁寧に、わかりやすい言葉でお答えください。

【医院情報】
医院名：砂町北歯科
住所：〒136-0073 東京都江東区北砂4丁目11-10 1F
電話：03-5683-0234
ホームページ：https://sunamachikitashika.com/

【診療時間】
月・火・水・金・土：午前 9:00〜13:00 / 午後 14:30〜17:30
休診日：木曜日・日曜日・祝日（祝日がある週の木曜日は診療あり）
※初診の最終受付は16:30まで

【診療内容】
虫歯治療、根管治療、予防歯科、歯周病治療、矯正歯科、小児矯正、
小児歯科、入れ歯、インプラント、審美歯科（セラミック）、
ホワイトニング、口腔外科、訪問歯科診療

【アクセス】
西大島駅・南砂駅の中間、砂町銀座近く
バリアフリー設計で親子連れも安心

【予約について】
ご予約はお電話（03-5683-0234）またはホームページからお願いします。

【応答ルール】
- 質問には簡潔に、でも親切に答えてください
- 医療的な診断・治療の詳細判断は「診察にてご確認ください」と伝えてください
- 予約を希望される場合は電話番号またはホームページの予約フォームを案内してください
- 日本語で答えてください
- 絵文字は使わないでください`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages
    })
  });

  if (!response.ok) {
    return res.status(500).json({ error: 'AI response failed' });
  }

  const data = await response.json();
  return res.status(200).json({ content: data.content[0].text });
}
