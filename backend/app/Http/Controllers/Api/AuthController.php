<?php

namespace App\Http\Controllers\Api;


use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Exceptions\CustomErrorCodes;
use App\Models\Administrator;
use App\Services\UserService;
use App\Services\PreUserService;
use App\Services\GuestUserService;
use App\Http\Requests\PreCreateAuthRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Firebase\JWT\ExpiredException;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Auth\AuthenticationException;
use UnexpectedValueException;

class AuthController extends ApiController
{

    protected $userService;
    protected $preUserService;
    protected $guestService;
    public function __construct(
        UserService $userService,
        PreUserService $preUserService,
        GuestUserService $guestService,
    ) {
        $this->userService = $userService;
        $this->preUserService = $preUserService;
        $this->guestService = $guestService;
    }

    /**
     * guest_login
     *
     * @return JsonResponse
     */
    public function guestLogin(Request $request)
    {
        try {
            $this->guestService->loginGuest($request);
        } catch (Exception $e) {
            //フロントエンドでエラーコードを使用するのでcodeも返してあげる
            if ($e->getCode() === CustomErrorCodes::UNABLE_TO_GENERATE_GUEST_TODAY) {
                return $this->responseAccessDenied($e->getMessage(), $e->getCode());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed guest login");
        }

        return $this->responseSuccessful("Success guest login");
    }


    /**
     * guest_logout
     *
     * @return JsonResponse
     */
    public function guestLogout()
    {
        try {
            $this->guestService->logoutGuest();
            return $this->responseSuccessful("Success guest logout");
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed guest logout");
        }
    }


    /**
     * 仮ユーザー作成と本登録用のメールをqueueにセット
     * @param string $name
     * @param string $email
     * @param string $password
     * @return JsonResponse
     */
    public function preCreate(PreCreateAuthRequest $request)
    {
        try {
            $this->preUserService->createPreUserAndSendEmail($request->name, $request->email, $request->password);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed pre_user create");
        }

        return $this->responseSuccessful("Successful pre signup");
    }

    /**
     * create
     * @errorCode - 1050 tokenが期限切れ フロントで使うコード
     * @errorCode - 1051 tokenが不正 フロントで使うコード
     * @param string $name
     * @param string $email
     * @param string $password
     * @return JsonResponse
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->only('token'), [
            "token" => 'required'
        ]);
        if ($validator->fails()) {
            return $this->responseBadRequest($validator->errors());
        }

        try {
            $this->userService->createUserExecute($request->token);
            return $this->responseSuccessful("Successful signup");
            //? tokenが期限切れ
        } catch (ExpiredException $e) {
            return $this->responseUnauthorized("Expired token", 1050);
            //? tokenが不正
        } catch (UnexpectedValueException $e) {
            return $this->responseBadRequest("Invalid token", 1051);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage());
        }
    }

    /**
     * user
     *
     * @return UserResource|null
     */
    public function fetch(Request $request)
    {
        if (Auth::check()) {
            return new UserResource($request->user());
        } else {
            return null;
        }
    }


    /**
     * login
     *
     * @param string $email
     * @param string $password
     * @return UserResource|JsonResponse
     */
    public function login(LoginRequest $request)
    {
        $email = $request->email;
        $password = $request->password;
        try {
            $loggedInUser = $this->userService->loginUserExecute($email, $password);
            $request->session()->regenerate(); // セッションIDの再発行
            if (Auth::guard('guest')->check()) {
                $this->guestService->logoutGuest();
            }
        } catch (AuthenticationException $e) {
            return $this->responseUnauthorized($e->getMessage());
        } catch (Exception $e) {
            return $this->responseInvalidQuery("Failed user login");
        }

        return new UserResource($loggedInUser);
    }

    /**
     * logout
     *
     * @return JsonResponse
     */
    public function logout()
    {
        if (!Auth::check()) {
            return $this->responseBadRequest("Cna not logout no auth");
        }
        $this->userService->logoutUserExecute();
        return $this->responseSuccessful("Success user logout");
    }


    /**
     * admin check
     *
     * @return bool|JsonResponse
     */
    public function admin()
    {
        if (!Auth::check()) {
            return false;
        }
        $isAdmin = Administrator::where("user_id", Auth::id())->exists();
        return $isAdmin;
    }
}
