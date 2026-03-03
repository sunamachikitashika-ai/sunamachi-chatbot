/**
 * 砂町北歯科チャットボット - 質問ログ記録スクリプト
 * Google Apps Script に貼り付けて使用してください
 *
 * 設置手順:
 * 1. Googleスプレッドシートを新規作成
 * 2. メニュー「拡張機能」→「Apps Script」を開く
 * 3. このコードを貼り付けて保存
 * 4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 * 5. 実行ユーザー:「自分」/ アクセスできるユーザー:「全員」に設定
 * 6. デプロイしてURLをコピー
 * 7. VercelのEnvironment Variablesに GOOGLE_SCRIPT_URL として追加
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ヘッダーがなければ1行目に追加
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['日時', '質問', '回答']);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 300);
      sheet.setColumnWidth(3, 400);
    }

    sheet.appendRow([data.timestamp, data.question, data.answer]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
