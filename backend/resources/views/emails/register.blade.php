@component('mail::message')
# アカウント作成のご案内

{{ config('app.name') }}にご登録いただき誠にありがとうございます。
仮登録を受付いたしました。

引き続きボタンのクリックにてご本人確認を完了しアカウントが作成されます。

名前： {{ $name }} でアカウントが作成されます。


@component('mail::button', ['url' => 'http://localhost:3000/identification?signup='.  $token])
アカウント作成
@endcomponent


{{ config('app.name') }}
@endcomponent