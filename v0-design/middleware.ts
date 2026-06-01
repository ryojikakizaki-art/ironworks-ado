import { NextRequest, NextResponse } from 'next/server';

/**
 * /admin/* と /api/admin/* を Basic 認証で守る。
 *
 * 受注一覧・納品書ページは顧客名・住所・金額を含むため
 * 公開してはいけない。蠣﨑さん専用の管理画面。
 *
 * 認証情報:
 *   user: admin
 *   pass: env ORDER_ENTRY_SECRET（受注記帳系と共有のシークレット）
 *
 * ブラウザで一度入力すれば同タブ内では保持される（Basic 認証の標準動作）。
 * 蠣﨑さんは普段 Chrome なので、Keychain に保存して以降ノークリックで開ける。
 */
export function middleware(request: NextRequest) {
  // 開発環境では認証スキップ（ローカルでブラウザの Basic ダイアログを毎回触らずに済むよう）。
  // production では env がなければ 503、間違っていれば 401 を返す。
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const secret = process.env.ORDER_ENTRY_SECRET;
  if (!secret) {
    // env 未設定なら 503（手動 401 にすると本番デプロイ後の env 抜けに気付きにくい）
    return new NextResponse('admin auth not configured', { status: 503 });
  }

  const auth = request.headers.get('authorization') || '';
  const expected = `Basic ${Buffer.from(`admin:${secret}`).toString('base64')}`;
  if (auth !== expected) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="ironworks ado admin", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Next.js middleware matcher は正規表現でなくパスマッチング
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
