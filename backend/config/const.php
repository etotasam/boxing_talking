<?php


$jwtPrivateKeyPath = storage_path('app/private/jwt-private.key');

return [
  'front_app_url' => env('FRONT_APP_URL'),
  'jwt_secret_key' => file_get_contents($jwtPrivateKeyPath),
];
